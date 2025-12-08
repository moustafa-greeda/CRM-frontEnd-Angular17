import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import {
  IAccountAssignment,
  IAddInvoiceRequest,
  Iinvoice,
} from '../../../../../core/Models/invoices/Invoice';
import { PakegsService } from '../../../../../core/services/common/pakegs.service';
import { InvoicesWorkOrdersService } from '../invoicesWorkOrders.service';
import { NotifyDialogService } from '../../../../../shared/components/notify-dialog-host/notify-dialog.service';
import {
  PdfPreviewDialogComponent,
  PdfPreviewDialogData,
} from '../../../../../shared/components/pdf-preview-dialog/pdf-preview-dialog.component';

export interface InvoiceService {
  id: number;
  serviceName: string;
  price: number;
  description?: string;
  quantity: number;
  total: number;
}

export interface PacketOption {
  id: number;
  name: string;
  price: number;
  description?: string;
}

export interface InvoiceDialogData {
  invoice?: Iinvoice;
  isEdit?: boolean;
  assignmentId?: number;
}

@Component({
  selector: 'app-invoice-dialog',
  templateUrl: './invoice-work-orders-dialog.component.html',
  styleUrls: ['./invoice-work-orders-dialog.component.css'],
})
export class InvoiceWorkOrdersDialogComponent implements OnInit {
  invoiceForm!: FormGroup;
  services: InvoiceService[] = [];
  formSubmitted: boolean = false;

  allPackets: PacketOption[] = [];
  accountAssignments: IAccountAssignment[] = [];
  selectedAccountAssignment: IAccountAssignment | null = null;

  get paymnetNames(): string[] {
    return ['كاش', 'قسط'];
  }

  get selectedPaymentMethod(): string {
    const value = this.invoiceForm.get('paymentMethod')?.value;
    if (!value || value === '') {
      return '';
    }
    return value === '1' ? 'قسط' : 'كاش';
  }

  constructor(
    private fb: FormBuilder,
    private _pakegsService: PakegsService,
    private InvoicesWorkOrdersService: InvoicesWorkOrdersService,
    public dialogRef: MatDialogRef<InvoiceWorkOrdersDialogComponent>,
    private notify: NotifyDialogService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: InvoiceDialogData
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadAllPackets();
    this.loadAccountAssignments();

    if (this.data?.invoice && this.data.isEdit) {
      this.loadInvoiceData(this.data.invoice);
    } else {
      // Set default invoice number and date for new invoice
      const today = new Date().toISOString().split('T')[0];

      // Load account assignment data will populate clientName and clientEmail
      this.invoiceForm.patchValue({
        date: today,
        clientAddress: '',
        isSameShippingAddress: true,
        countryCode: '+20',
        clientPhone: '',
        paymentMethod: '',
        notes: '',
      });
      // Add fake services data
      this.addFakeServices();
    }
  }

  private initializeForm(): void {
    this.invoiceForm = this.fb.group({
      date: ['', Validators.required],
      clientName: ['', Validators.required],
      clientAddress: [''],
      isSameShippingAddress: [false],
      clientEmail: [''],
      countryCode: ['+20', Validators.required],
      clientPhone: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      notes: [''],
      pacekts: [''], // Read-only field from API (enabled for updates, readonly in template)
    });
  }

  //========================================= load all packets ===========================================
  loadAllPackets(): void {
    // Subscribe to the packets observable
    this._pakegsService.packets$.subscribe((packets) => {
      this.allPackets = packets;

      // If assignment is already selected and packets are loaded, add packet to services
      if (this.selectedAccountAssignment?.name && packets.length > 0) {
        this.addPacketToServices(this.selectedAccountAssignment.name);
      }
    });
  }

  //========================================= load account assignments ===========================================
  loadAccountAssignments(): void {
    this.InvoicesWorkOrdersService.getAllAccountAssignments().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.accountAssignments = response.data;
          const preferredId = this.data?.assignmentId;
          if (preferredId) {
            const preferredAssignment = this.accountAssignments.find(
              (assignment) => assignment.id === preferredId
            );
            if (preferredAssignment) {
              this.setSelectedAssignment(preferredAssignment);
              return;
            }
          }
          // Auto-select first assignment if available and not editing
          if (this.accountAssignments.length > 0 && !this.data?.isEdit) {
            this.setSelectedAssignment(this.accountAssignments[0]);
          }
        }
      },
      error: (error) => {
        console.error('Error loading account assignments:', error);
      },
    });
  }

  private setSelectedAssignment(assignment: IAccountAssignment): void {
    this.selectedAccountAssignment = assignment;
    // Populate form with account assignment data
    this.invoiceForm.patchValue({
      clientName: assignment.contactName,
      clientEmail: assignment.contactEmail || '',
      clientPhone: assignment.contactPhone || '',
      pacekts: assignment.name,
    });

    // Add the packet to services table if it exists in allPackets
    if (assignment.name && this.allPackets.length > 0) {
      this.addPacketToServices(assignment.name);
    }
  }

  private loadInvoiceData(invoice: Iinvoice): void {
    this.invoiceForm.patchValue({
      date: invoice.issueDate,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail || '',
      clientPhone: invoice.clientPhone,
    });
  }

  addService(): void {
    // Open service selection dialog or add default service
    const newService: InvoiceService = {
      id:
        this.services.length > 0
          ? Math.max(...this.services.map((s) => s.id)) + 1
          : 1,
      serviceName: 'خدمة جديدة',
      price: 0,
      description: '',
      quantity: 1,
      total: 0,
    };
    this.services.push(newService);
  }

  // Add fake services data on initialization
  addFakeServices(): void {
    const fakeServices: InvoiceService[] = [];
    this.services = fakeServices;
  }

  removeService(index: number): void {
    this.services.splice(index, 1);
  }

  onServiceChange(index: number, field: string, value: any): void {
    if (this.services[index]) {
      // Check if this service is a packet (bundle)
      const isPacket = this.isServiceAPacket(this.services[index].serviceName);

      // Don't allow editing name or price for packets
      if ((field === 'price' || field === 'serviceName') && isPacket) {
        return;
      }

      (this.services[index] as any)[field] = value;

      // Calculate total based on price and quantity
      if (field === 'price' || field === 'quantity') {
        const price = Number(this.services[index].price) || 0;
        const quantity = Number(this.services[index].quantity) || 1;
        this.services[index].total = price * quantity;
      }
    }
  }

  // Check if a service is a packet (bundle)
  isServiceAPacket(serviceName: string): boolean {
    return this.allPackets.some((p) => p.name === serviceName);
  }

  getSubtotal(): number {
    return this.services.reduce(
      (sum, service) => sum + (service.total || 0),
      0
    );
  }

  getDiscount(): number {
    return 0; // Can be added later
  }

  getVAT(): number {
    return 0; // Can be calculated based on subtotal
  }

  getTotalAmount(): number {
    return this.getSubtotal() - this.getDiscount() + this.getVAT();
  }
  // ========================================== add invoice ===========================================
  onSubmit(): void {
    // Mark form as submitted first
    this.formSubmitted = true;

    // Force validation check
    this.markFormGroupTouched();

    // Force change detection to update the view
    this.cdr.detectChanges();

    // Check validity after marking as touched
    if (this.invoiceForm.valid) {
      const addInvoiceRequest: IAddInvoiceRequest = {
        amount: this.selectedAccountAssignment?.targetProductId || 0,
        clientId: this.selectedAccountAssignment?.leadId || 0,
        clientName: this.invoiceForm.value.clientName,
        clientPhone: this.invoiceForm.value.clientPhone,
        clientEmail: this.invoiceForm.value.clientEmail || '',
        clientCity: '-',
        totalprices: this.getTotalAmount(),
        leadDataId: this.selectedAccountAssignment?.leadId || 0,
        pamentmethod: Number(this.invoiceForm.value.paymentMethod),
        details: this.services.map((s) => ({
          pakageName: s.serviceName,
          description: s.description || '',
          unitPrice: s.price,
          quantity: s.quantity,
        })),
      };
      this.InvoicesWorkOrdersService.addInvoice(addInvoiceRequest).subscribe({
        next: (response) => {
          this.notify.open({
            type: 'success',
            title: 'تم الحفظ',
            description: response?.message || 'تم تسجيل الفاتورة بنجاح',
          });

          // Open PDF preview dialog if pdfPath exists
          const pdfPath = response?.data?.pdfPath;
          if (pdfPath) {
            this.openPdfPreview(pdfPath);
          }

          // Step 1: Update work order status first
          this.InvoicesWorkOrdersService.updateIsWorkOrder().subscribe({
            next: () => {
              // Step 2: After updateIsWorkOrder completes successfully, reload account assignments
              this.loadAccountAssignments();
            },
            error: (error) => {
              console.error('Error updating work order:', error);
            },
            complete: () => {
              // Close dialog after all operations complete and return true to trigger refresh in parent
              this.dialogRef.close({ success: true, refresh: true });
            },
          });
        },
        error: (error) => {
          console.error('Error adding invoice:', error);
        },
      });
    }
  }

  // ========================================== cancel invoice ===========================================
  onCancel(): void {
    this.dialogRef.close();
  }

  // ========================================== package selected ===========================================
  onPackageSelected(packetName: string): void {
    // Find the selected packet object
    const selectedPacket = this.allPackets.find((p) => p.name === packetName);
    if (selectedPacket) {
      // Update form with selected package
      this.invoiceForm.patchValue({
        selectedPackage: packetName,
      });

      // Add packet as a service in the table
      const newService: InvoiceService = {
        id:
          this.services.length > 0
            ? Math.max(...this.services.map((s) => s.id)) + 1
            : 1,
        serviceName: selectedPacket.name,
        price: selectedPacket.price || 0,
        description: selectedPacket.description || '',
        quantity: 1,
        total: selectedPacket.price || 0,
      };

      // Check if this packet is already in the services table
      const existingService = this.services.find(
        (s) => s.serviceName === selectedPacket.name
      );

      if (!existingService) {
        // Add new service if it doesn't exist
        this.services.push(newService);
      } else {
        // Update existing service price and recalculate total
        existingService.price = selectedPacket.price || 0;
        const quantity = existingService.quantity || 1;
        existingService.total = (selectedPacket.price || 0) * quantity;
      }
    }
  }

  // ========================================== payment method selected ===========================================
  onPaymentMethodSelected(option: string): void {
    const paymentValue = option === 'قسط' ? '1' : '0';
    const control = this.invoiceForm.get('paymentMethod');
    if (control) {
      control.setValue(paymentValue);
      control.markAsTouched();
      control.markAsDirty();
      control.updateValueAndValidity();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.invoiceForm.controls).forEach((key) => {
      const control = this.invoiceForm.get(key);
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
        control.updateValueAndValidity({ emitEvent: true });
      }
    });
    this.invoiceForm.updateValueAndValidity({ emitEvent: true });
  }

  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.invoiceForm.controls).forEach((key) => {
      const control = this.invoiceForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  shouldShowError(controlName: string): boolean {
    const control = this.invoiceForm.get(controlName);
    if (!control) return false;
    const shouldShow =
      control.invalid &&
      (this.formSubmitted || control.touched || control.dirty);
    return shouldShow;
  }

  // ========================================== Add Packet to Services ===========================================
  private addPacketToServices(packetName: string): void {
    // Check if packet already exists in services
    const existingService = this.services.find(
      (s) => s.serviceName === packetName
    );

    if (existingService) {
      // Packet already exists, no need to add again
      return;
    }

    // Find the packet in allPackets
    const packet = this.allPackets.find((p) => p.name === packetName);
    if (packet) {
      // Add packet as a service in the table
      const newService: InvoiceService = {
        id:
          this.services.length > 0
            ? Math.max(...this.services.map((s) => s.id)) + 1
            : 1,
        serviceName: packet.name,
        price: packet.price || 0,
        description: packet.description || '',
        quantity: 1,
        total: packet.price || 0,
      };

      this.services.push(newService);
    }
  }

  // ========================================== Open PDF Preview ===========================================
  private openPdfPreview(pdfPath: string): void {
    const dialogData: PdfPreviewDialogData = {
      pdfPath: pdfPath,
      title: 'معاينة الفاتورة',
    };

    this.dialog.open(PdfPreviewDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      data: dialogData,
      panelClass: 'pdf-preview-dialog-container',
    });
  }
}
