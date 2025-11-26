import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  IAccountAssignment,
  IAddInvoiceRequest,
  Iinvoice,
} from '../../../../../core/Models/invoices/Invoice';
import { PakegsService } from '../../../../../core/services/common/pakegs.service';
import { InvoicesWorkOrdersService } from '../invoicesWorkOrders.service';
import { NotifyDialogService } from '../../../../../shared/components/notify-dialog-host/notify-dialog.service';

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

  allPackets: PacketOption[] = [];
  accountAssignments: IAccountAssignment[] = [];
  selectedAccountAssignment: IAccountAssignment | null = null;
  isSameAddress = false;

  // Getter to transform packets to string array for dropdown
  // Exclude already selected packets
  get packetNames(): string[] {
    const selectedPacketNames = this.services
      .map((s) => s.serviceName)
      .filter((name) => this.allPackets.some((p) => p.name === name));
    return this.allPackets
      .map((p) => p.name)
      .filter((name) => !selectedPacketNames.includes(name));
  }

  // Getter to transform account assignments to string array for dropdown
  get accountAssignmentNames(): string[] {
    return this.accountAssignments.map((a) => a.contactName);
  }

  get paymnetNames(): string[] {
    return ['كاش', 'قسط'];
  }

  constructor(
    private fb: FormBuilder,
    private _pakegsService: PakegsService,
    private InvoicesWorkOrdersService: InvoicesWorkOrdersService,
    public dialogRef: MatDialogRef<InvoiceWorkOrdersDialogComponent>,
    private notify: NotifyDialogService,

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
        selectedPackage: '',
        paymentMethod: '0',
        notes: '',
      });
      this.isSameAddress = true;
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
      clientEmail: ['', [Validators.required, Validators.email]],
      countryCode: ['+20', Validators.required],
      clientPhone: ['', Validators.required],
      selectedPackage: ['', Validators.required],
      paymentMethod: ['0', Validators.required],
      notes: [''],
    });
  }

  //========================================= load all packets ===========================================
  loadAllPackets(): void {
    // Subscribe to the packets observable
    this._pakegsService.packets$.subscribe((packets) => {
      this.allPackets = packets;
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

  onAccountAssignmentSelected(contactName: string): void {
    const assignment = this.accountAssignments.find(
      (a) => a.contactName === contactName
    );
    if (assignment) {
      this.setSelectedAssignment(assignment);
    }
  }

  private setSelectedAssignment(assignment: IAccountAssignment): void {
    this.selectedAccountAssignment = assignment;
    // Populate form with account assignment data
    this.invoiceForm.patchValue({
      clientName: assignment.contactName,
      clientEmail: assignment.contactEmail,
      clientPhone: assignment.contactPhone || '',
    });
  }

  private loadInvoiceData(invoice: Iinvoice): void {
    this.invoiceForm.patchValue({
      date: invoice.issueDate,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientPhone: invoice.clientPhone,
    });
  }

  onSameAddressChange(event: any): void {
    this.isSameAddress = event.target.checked;
    this.invoiceForm.patchValue({
      isSameShippingAddress: event.target.checked,
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
    this.calculateTotals();
  }

  // Add fake services data on initialization
  addFakeServices(): void {
    const fakeServices: InvoiceService[] = [];
    this.services = fakeServices;
    this.calculateTotals();
  }

  removeService(index: number): void {
    this.services.splice(index, 1);
    this.calculateTotals();
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

      this.calculateTotals();
    }
  }

  // Check if a service is a packet (bundle)
  isServiceAPacket(serviceName: string): boolean {
    return this.allPackets.some((p) => p.name === serviceName);
  }

  calculateTotals(): void {
    // Calculate totals will be handled in the template
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
    if (this.invoiceForm.valid) {
      const addInvoiceRequest: IAddInvoiceRequest = {
        // amount: this.selectedAccountAssignment?.budget || 0,
        amount: this.getTotalAmount(),
        clientId: this.selectedAccountAssignment?.leadId || 0,
        clientName: this.invoiceForm.value.clientName,
        clientPhone: this.invoiceForm.value.clientPhone,
        clientEmail: this.invoiceForm.value.clientEmail,
        // clientCity: this.invoiceForm.value.clientCity,
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
        },
        error: (error) => {
          console.error('Error adding invoice:', error);
          this.notify.open({
            type: 'error',
            title: 'خطأ',
            description: error?.message || 'تعذر حفظ الفاتورة',
          });
        },
      });
      this.dialogRef.close();
    } else {
      this.markFormGroupTouched();
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
        this.calculateTotals();
      } else {
        // Update existing service price and recalculate total
        existingService.price = selectedPacket.price || 0;
        const quantity = existingService.quantity || 1;
        existingService.total = (selectedPacket.price || 0) * quantity;
        this.calculateTotals();
      }
    }
  }

  // ========================================== payment method selected ===========================================
  onPaymentMethodSelected(option: string): void {
    const paymentValue = option === 'قسط' ? '1' : '0';
    this.invoiceForm.patchValue({ paymentMethod: paymentValue });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.invoiceForm.controls).forEach((key) => {
      const control = this.invoiceForm.get(key);
      control?.markAsTouched();
    });
  }
}
