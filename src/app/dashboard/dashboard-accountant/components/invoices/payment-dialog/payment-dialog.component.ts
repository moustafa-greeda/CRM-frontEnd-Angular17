import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IGetAllInvoiceDataItem } from '../../../../../core/Models/invoices/Invoice';

export interface PaymentDialogData {
  invoice: IGetAllInvoiceDataItem;
}

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.css'],
})
export class PaymentDialogComponent implements OnInit {
  paymentForm!: FormGroup;
  selectedPaymentMethod: string = 'تحويل بنكي';
  showCreditCard: boolean = false;

  // Calculate remaining amount
  get remainingAmount(): number {
    const total = this.paymentForm?.get('totalAmount')?.value || 0;
    const paid = this.paymentForm?.get('paidAmount')?.value || 0;
    return Math.max(0, total - paid);
  }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.data?.invoice) {
      this.paymentForm.patchValue({
        invoiceNumber: this.data.invoice.id || '',
        paidAmount: this.data.invoice.paidAmount || 0,
        totalAmount: this.data.invoice.totalprices || 0,
        paymentMethod: this.data.invoice.paymentMethod || 'تحويل بنكي',
      });
      this.selectedPaymentMethod =
        this.data.invoice.paymentMethod || 'تحويل بنكي';
      this.showCreditCard = this.selectedPaymentMethod === 'بطاقة ائتمان';
    }
  }

  private initializeForm(): void {
    this.paymentForm = this.fb.group({
      invoiceNumber: ['', Validators.required],
      paidAmount: [0, [Validators.required, Validators.min(0)]],
      totalAmount: [0, [Validators.required, Validators.min(0)]],
      paymentMethod: ['تحويل بنكي', Validators.required],
      // Bank transfer fields
      bankName: [''],
      accountName: [''],
      accountNumber: [''],
      swiftCode: [''],
      // Credit card fields
      cardNumber: [''],
      cardHolderName: [''],
      expiryDate: [''],
      cvv: [''],
    });
  }

  onPaymentMethodChange(method: string): void {
    this.selectedPaymentMethod = method;
    this.showCreditCard = method === 'بطاقة ائتمان';
    this.paymentForm.patchValue({ paymentMethod: method });
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      const formValue = this.paymentForm.value;
      const paymentData = {
        invoiceId: this.data.invoice.id,
        invoiceNumber: formValue.invoiceNumber,
        paidAmount: formValue.paidAmount,
        totalAmount: formValue.totalAmount,
        paymentMethod: formValue.paymentMethod,
        remaining: this.remainingAmount,
        ...(this.selectedPaymentMethod === 'تحويل بنكي' && {
          bankName: formValue.bankName,
          accountName: formValue.accountName,
          accountNumber: formValue.accountNumber,
          swiftCode: formValue.swiftCode,
        }),
        ...(this.showCreditCard && {
          cardNumber: formValue.cardNumber,
          cardHolderName: formValue.cardHolderName,
          expiryDate: formValue.expiryDate,
          cvv: formValue.cvv,
        }),
      };
      this.dialogRef.close(paymentData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
