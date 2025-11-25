import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Iinvoice } from '../../../core/Models/invoices/Invoice';

export interface InvoiceService {
  id: number;
  serviceName: string;
  price: number;
  total: number;
}

export interface InvoiceDialogData {
  invoice?: Iinvoice;
  isEdit?: boolean;
}

@Component({
  selector: 'app-invoice-dialog',
  templateUrl: './invoice-dialog.component.html',
  styleUrls: ['./invoice-dialog.component.css'],
})
export class InvoiceDialogComponent implements OnInit {
  invoiceForm!: FormGroup;
  services: InvoiceService[] = [];
  packages: string[] = [
    'باقة السوشيال ميديا',
    'باقة التسويق الرقمي',
    'باقة تصميم المواقع',
    'باقة أخرى',
  ];
  isSameAddress = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<InvoiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InvoiceDialogData
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.data?.invoice && this.data.isEdit) {
      this.loadInvoiceData(this.data.invoice);
    } else {
      // Set default invoice number and date for new invoice
      const today = new Date().toISOString().split('T')[0];
      const invoiceNumber = this.generateInvoiceNumber();
      this.invoiceForm.patchValue({
        invoiceNumber: invoiceNumber,
        date: today,
        // Fake client data
        clientName: 'مال محمود سالم',
        clientAddress: '10 شاري الكتريم المهندسين الحرية قدر',
        isSameShippingAddress: true,
        clientEmail: 'manar03@gmail.com',
        countryCode: '+20',
        clientPhone: '(120) 345 7788',
        selectedPackage: 'باقة السوشيال ميديا',
        notes: 'مقصودة',
      });
      this.isSameAddress = true;
      // Add fake services data
      this.addFakeServices();
    }
  }

  private initializeForm(): void {
    this.invoiceForm = this.fb.group({
      invoiceNumber: ['', Validators.required],
      date: ['', Validators.required],
      clientName: ['', Validators.required],
      clientAddress: ['', Validators.required],
      isSameShippingAddress: [false],
      clientEmail: ['', [Validators.required, Validators.email]],
      countryCode: ['+20', Validators.required],
      clientPhone: ['', Validators.required],
      selectedPackage: ['', Validators.required],
      notes: [''],
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

  private generateInvoiceNumber(): string {
    // Generate invoice number like MZ-00114
    const prefix = 'MZ-';
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(5, '0');
    return `${prefix}${randomNum}`;
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
      total: 0,
    };
    this.services.push(newService);
    this.calculateTotals();
  }

  // Add fake services data on initialization
  addFakeServices(): void {
    const fakeServices: InvoiceService[] = [
      {
        id: 1,
        serviceName: 'إدارة الحسابات',
        price: 2500,
        total: 1800.0,
      },
      {
        id: 2,
        serviceName: 'تصميم المحتوى',
        price: 2500,
        total: 1800.0,
      },
      {
        id: 4,
        serviceName: 'إعلانات ممولة',
        price: 2500,
        total: 1800.0,
      },
      {
        id: 3,
        serviceName: 'تقارير أداء شهري',
        price: 2500,
        total: 1800.0,
      },
    ];
    this.services = fakeServices;
    this.calculateTotals();
  }

  removeService(index: number): void {
    this.services.splice(index, 1);
    this.calculateTotals();
  }

  viewService(service: InvoiceService): void {
    // Open service details dialog
    console.log('View service:', service);
  }

  onServiceChange(index: number, field: string, value: any): void {
    if (this.services[index]) {
      (this.services[index] as any)[field] = value;
      if (field === 'price') {
        this.services[index].total = Number(value) || 0;
      }
      this.calculateTotals();
    }
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

  getShipping(): number {
    return 0; // Can be added later
  }

  getTotalAmount(): number {
    return (
      this.getSubtotal() -
      this.getDiscount() +
      this.getVAT() +
      this.getShipping()
    );
  }

  onSubmit(): void {
    if (this.invoiceForm.valid) {
      const formData = {
        ...this.invoiceForm.value,
        // Combine country code and phone number for full phone number
        fullPhoneNumber: `${this.invoiceForm.value.countryCode} ${this.invoiceForm.value.clientPhone}`,
        services: this.services,
        subtotal: this.getSubtotal(),
        discount: this.getDiscount(),
        vat: this.getVAT(),
        shipping: this.getShipping(),
        totalAmount: this.getTotalAmount(),
      };
      this.dialogRef.close(formData);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.invoiceForm.controls).forEach((key) => {
      const control = this.invoiceForm.get(key);
      control?.markAsTouched();
    });
  }
}
