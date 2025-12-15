import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  IGetAllInvoiceDataItem,
  IPayment,
  PaymentMethod,
} from '../../../../../core/Models/invoices/Invoice';
import { PaymentService } from './payment.service';
import { NotifyDialogService } from '../../../../../shared/components/notify-dialog-host/notify-dialog.service';
import { AuthService } from '../../../../../Auth/auth.service';

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

  // Get original remaining amount from invoice
  get originalRemainingAmount(): number {
    if (!this.data?.invoice) return 0;
    const total = this.data.invoice.totalprices || 0;
    const paid = this.data.invoice.paidAmount || 0;
    const remaining = Math.max(0, total - paid);
    return Math.round(remaining * 100) / 100;
  }

  // Calculate remaining amount
  get remainingAmount(): number {
    const total = this.paymentForm?.get('totalAmount')?.value || 0;
    const paid = this.paymentForm?.get('paidAmount')?.value || '';
    const paidValue = paid === '' || paid === null ? 0 : Number(paid);
    const remaining = Math.max(0, total - paidValue);
    return Math.round(remaining * 100) / 100; // Round to 2 decimal places
  }

  constructor(
    private _authService: AuthService,
    private fb: FormBuilder,
    private _paymentService: PaymentService,
    private notify: NotifyDialogService,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.data?.invoice) {
      // Round totalAmount to 2 decimal places
      const totalAmount = this.data.invoice.totalprices || 0;
      const roundedTotal = Math.round(totalAmount * 100) / 100;

      this.paymentForm.patchValue({
        invoiceNumber: this.data.invoice.id || '',
        paidAmount: this.data.invoice.paidAmount || '',
        totalAmount: roundedTotal,
        paymentMethod: this.data.invoice.paymentMethod || 'تحويل بنكي',
      });

      // Round values when they change
      this.paymentForm.get('totalAmount')?.valueChanges.subscribe((value) => {
        if (value !== null && value !== undefined) {
          const rounded = Math.round(Number(value) * 100) / 100;
          if (rounded !== value) {
            this.paymentForm
              .get('totalAmount')
              ?.setValue(rounded, { emitEvent: false });
          }
        }
      });

      this.paymentForm.get('paidAmount')?.valueChanges.subscribe((value) => {
        if (value !== null && value !== undefined && value !== '') {
          const rounded = Math.round(Number(value) * 100) / 100;
          if (rounded !== value) {
            this.paymentForm
              .get('paidAmount')
              ?.setValue(rounded, { emitEvent: false });
          }
        }
      });

      this.selectedPaymentMethod =
        this.data.invoice.paymentMethod || 'تحويل بنكي';
      this.showCreditCard = this.selectedPaymentMethod === 'بطاقة ائتمان';

      // Set validators based on initial payment method
      this.updatePaymentMethodValidators(this.selectedPaymentMethod);
    }

    // Listen to payment method changes
    this.paymentForm.get('paymentMethod')?.valueChanges.subscribe((method) => {
      this.updatePaymentMethodValidators(method);
    });
  }

  private initializeForm(): void {
    this.paymentForm = this.fb.group({
      invoiceNumber: ['', Validators.required],
      paidAmount: ['', [Validators.required, Validators.min(0)]],
      totalAmount: [0, [Validators.required, Validators.min(0)]],
      paymentMethod: ['تحويل بنكي', Validators.required],
      // Bank transfer fields
      bankName: [''],
      accountName: [''],
      accountNumber: [''],
      swiftCode: [''],
      transferReceiptNumber: [''],
      // Credit card fields
      visaCardNumber: [''],
      visaOwnerName: [''],
      cvv: [''],
      // Cash fields
      cashReceiptNumber: [''],
      cashReceivedBy: [''],
    });
  }

  onPaymentMethodChange(method: string): void {
    this.selectedPaymentMethod = method;
    this.showCreditCard = method === 'بطاقة ائتمان';
    this.paymentForm.patchValue({ paymentMethod: method });
    this.updatePaymentMethodValidators(method);
  }

  /**
   * Custom validator for SWIFT code (8 or 11 characters)
   */
  private swiftCodeValidator(control: any): { [key: string]: any } | null {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }
    const value = control.value.toString().trim();
    if (value.length === 8 || value.length === 11) {
      return null; // Valid
    }
    return { swiftCodeLength: true }; // Invalid length
  }

  /**
   * Custom validator to check if paid amount doesn't exceed remaining amount
   */
  private paidAmountMaxValidator = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const paidAmount = control.value;
    if (paidAmount === null || paidAmount === undefined || paidAmount === '') {
      return null; // Required validator will handle this
    }

    const paidValue = Number(paidAmount);
    const remaining = this.originalRemainingAmount;

    if (paidValue > remaining) {
      return { maxExceeded: { max: remaining, actual: paidValue } };
    }

    return null;
  };

  /**
   * Update validators based on payment method
   */
  private updatePaymentMethodValidators(method: string): void {
    const paymentMethodEnum = this.convertPaymentMethodToEnum(method);

    // Get all payment method specific controls
    // Bank transfer fields
    const bankNameControl = this.paymentForm.get('bankName');
    const accountNameControl = this.paymentForm.get('accountName');
    const accountNumberControl = this.paymentForm.get('accountNumber');
    const swiftCodeControl = this.paymentForm.get('swiftCode');
    const transferReceiptNumberControl = this.paymentForm.get(
      'transferReceiptNumber'
    );
    const paidAmountControl = this.paymentForm.get('paidAmount');

    // Credit card fields
    const visaCardNumberControl = this.paymentForm.get('visaCardNumber');
    const visaOwnerNameControl = this.paymentForm.get('visaOwnerName');
    const authorizationCodeControl = this.paymentForm.get('authorizationCode');

    // Cash fields
    const cashReceiptNumberControl = this.paymentForm.get('cashReceiptNumber');

    // Remove all validators first
    bankNameControl?.clearValidators();
    accountNameControl?.clearValidators();
    accountNumberControl?.clearValidators();
    swiftCodeControl?.clearValidators();
    transferReceiptNumberControl?.clearValidators();
    paidAmountControl?.clearValidators();
    visaCardNumberControl?.clearValidators();
    visaOwnerNameControl?.clearValidators();
    authorizationCodeControl?.clearValidators();
    cashReceiptNumberControl?.clearValidators();

    // Add required validators based on payment method
    if (paymentMethodEnum === PaymentMethod.Cash) {
      // Cash fields required
      // cashReceiptNumberControl?.setValidators([Validators.required]);
      // paidAmount not required for Cash (will be set to totalAmount automatically)
      paidAmountControl?.setValidators([
        Validators.min(0),
        this.paidAmountMaxValidator.bind(this),
      ]);
    } else if (paymentMethodEnum === PaymentMethod.BankTransfer) {
      // Bank transfer fields required
      paidAmountControl?.setValidators([
        Validators.required,
        Validators.min(0),
        this.paidAmountMaxValidator.bind(this),
      ]);
      bankNameControl?.setValidators([Validators.required]);
      accountNameControl?.setValidators([Validators.required]);
      accountNumberControl?.setValidators([Validators.required]);
      swiftCodeControl?.setValidators([
        Validators.required,
        this.swiftCodeValidator.bind(this),
      ]);
      transferReceiptNumberControl?.setValidators([Validators.required]);
    } else if (paymentMethodEnum === PaymentMethod.Visa) {
      // Credit card fields required
      paidAmountControl?.setValidators([
        Validators.required,
        Validators.min(0),
        this.paidAmountMaxValidator.bind(this),
      ]);
      visaCardNumberControl?.setValidators([
        Validators.required,
        Validators.minLength(16),
        Validators.maxLength(16),
        Validators.pattern(/^\d+$/), // Only digits
      ]);
      visaOwnerNameControl?.setValidators([Validators.required]);
      authorizationCodeControl?.setValidators([Validators.required]);
    }

    // Update validity for all controls
    paidAmountControl?.updateValueAndValidity({ emitEvent: false });
    bankNameControl?.updateValueAndValidity({ emitEvent: false });
    accountNameControl?.updateValueAndValidity({ emitEvent: false });
    accountNumberControl?.updateValueAndValidity({ emitEvent: false });
    swiftCodeControl?.updateValueAndValidity({ emitEvent: false });
    transferReceiptNumberControl?.updateValueAndValidity({ emitEvent: false });
    visaCardNumberControl?.updateValueAndValidity({ emitEvent: false });
    visaOwnerNameControl?.updateValueAndValidity({ emitEvent: false });
    authorizationCodeControl?.updateValueAndValidity({ emitEvent: false });
    cashReceiptNumberControl?.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Convert payment method string to PaymentMethod enum
   */
  private convertPaymentMethodToEnum(method: string): PaymentMethod {
    const methodLower = method.toLowerCase();
    if (methodLower === 'cash' || methodLower === 'كاش') {
      return PaymentMethod.Cash;
    } else if (
      methodLower === 'تحويل بنكي' ||
      methodLower === 'banktransfer' ||
      methodLower === 'bank'
    ) {
      return PaymentMethod.BankTransfer;
    } else if (
      methodLower === 'بطاقة ائتمان' ||
      methodLower === 'visa' ||
      methodLower === 'creditcard' ||
      methodLower === 'credit'
    ) {
      return PaymentMethod.Visa;
    }
    // Default to BankTransfer
    return PaymentMethod.BankTransfer;
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    if (this.paymentForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (this.paymentForm.valid) {
      const formValue = this.paymentForm.value;
      // Convert invoiceId to number if it's a string
      const invoiceId =
        typeof this.data.invoice.id === 'string'
          ? Number(this.data.invoice.id)
          : this.data.invoice.id;

      // Convert payment method to enum
      const paymentMethodEnum = this.convertPaymentMethodToEnum(
        formValue.paymentMethod
      );

      // If payment method is Cash (0), set amountPaid = totalAmount
      const amountPaid =
        paymentMethodEnum === PaymentMethod.Cash
          ? formValue.totalAmount
          : formValue.paidAmount;

      // Round amounts to 2 decimal places
      const roundedAmountPaid = Math.round(Number(amountPaid) * 100) / 100;
      const roundedTotalAmount =
        Math.round(Number(formValue.totalAmount) * 100) / 100;

      const paymentData: IPayment = {
        invoiceId: invoiceId ? Number(invoiceId) : undefined,
        amountPaid: roundedAmountPaid,
        cashReceivedBy: this._authService.getUsername() || undefined,

        bankName: formValue.bankName,
        swiftCode: formValue.swiftCode,
        transferReceiptNumber: formValue.transferReceiptNumber,
        visaCardNumber: formValue.visaCardNumber,
        authorizationCode: formValue.authorizationCode,
        visaOwnerName: formValue.visaOwnerName,
        customerName: this.data.invoice.clientName,
        totalAmount: roundedTotalAmount,
        paymentMethod: paymentMethodEnum,
        isPaid: true,
      };
      this._paymentService.createPayment(paymentData).subscribe({
        next: (response) => {
          if (response.status === 200 && response.body) {
            // Extract filename from Content-Disposition header
            const contentDisposition = response.headers.get(
              'content-disposition'
            );
            let filename = 'Receipt.pdf';

            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(
                /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
              );
              if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
                // Handle UTF-8 encoded filename
                if (filename.includes("UTF-8''")) {
                  filename = decodeURIComponent(filename.split("UTF-8''")[1]);
                }
              }
            }

            // Create blob and download PDF
            const blob = new Blob([response.body], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            this.notify.open({
              type: 'success',
              title: 'تم الدفع بنجاح',
              description: 'تم الدفع بنجاح وتم تحميل الإيصال',
            });
            this.dialogRef.close(paymentData);
          }
        },
        error: (error) => {
          console.error('Error creating payment:', error);
          this.notify.open({
            type: 'error',
            title: 'فشل الدفع',
            description: error?.message || 'تعذر إتمام عملية الدفع',
          });
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Format card number input to only allow digits and limit to 16 characters
   */
  onCardNumberInput(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    this.paymentForm.patchValue(
      { visaCardNumber: value },
      { emitEvent: false }
    );
  }

  /**
   * Mark all form controls as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.paymentForm.controls).forEach((key) => {
      const control = this.paymentForm.get(key);
      control?.markAsTouched();
    });
  }
}
