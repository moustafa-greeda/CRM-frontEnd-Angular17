import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IPayment, PaymentMethod } from '../../../core/Models/invoices/Invoice';
import { PaymentService } from '../../pages-accountant/invoices/payment-dialog/payment.service';

@Injectable({
  providedIn: 'root',
})
export class InvoicesPaymentService {
  // Signals for reactive state management
  private payments = signal<IPayment[]>([]);
  private currentInvoiceId = signal<number | null>(null);
  private showPayments = signal<boolean>(false);

  // Public readonly signals
  readonly payments$ = this.payments.asReadonly();
  readonly currentInvoiceId$ = this.currentInvoiceId.asReadonly();
  readonly showPayments$ = this.showPayments.asReadonly();

  constructor(private paymentService: PaymentService) {}

  /**
   * Load payments by invoice ID
   */
  loadPaymentsByInvoiceId(invoiceId: number): Observable<IPayment[]> {
    this.currentInvoiceId.set(invoiceId);

    return this.paymentService.getPaymentByInvoiceId(invoiceId).pipe(
      map((response) => {
        const payments = (response?.data ?? []).map((payment) => ({
          ...payment,
          invoiceId: payment.invoiceId || invoiceId,
        }));
        this.payments.set(payments);
        return payments;
      }),
      catchError((error) => {
        console.error('Error loading payments:', error);
        this.payments.set([]);
        return of([]);
      })
    );
  }

  /**
   * Show payments table
   */
  showPaymentsTable(invoiceId: number): void {
    this.currentInvoiceId.set(invoiceId);
    this.showPayments.set(true);
    this.loadPaymentsByInvoiceId(invoiceId).subscribe();
  }

  /**
   * Hide payments table
   */
  hidePaymentsTable(): void {
    this.showPayments.set(false);
    this.currentInvoiceId.set(null);
    this.payments.set([]);
  }

  /**
   * Get current payments
   */
  getCurrentPayments(): IPayment[] {
    return this.payments();
  }

  /**
   * Helper to get payment method value
   */
  private getPaymentMethodValue(payment: IPayment): number {
    const method = payment.paymentMethod as any;
    if (typeof method === 'number') {
      return method;
    }
    if (typeof method === 'string') {
      const lower = method.toLowerCase();
      if (lower === 'cash') return 0;
      if (lower === 'banktransfer' || lower === 'bank transfer') return 1;
      if (lower === 'visa') return 2;
    }
    return method as number;
  }

  /**
   * Get cash payments
   */
  getCashPayments(): IPayment[] {
    const invoiceId = this.currentInvoiceId();
    return this.payments()
      .filter(
        (payment) => this.getPaymentMethodValue(payment) === PaymentMethod.Cash
      )
      .map((payment) => ({
        ...payment,
        invoiceId: payment.invoiceId || invoiceId || undefined,
      }));
  }

  /**
   * Get bank transfer payments
   */
  getBankTransferPayments(): IPayment[] {
    const invoiceId = this.currentInvoiceId();
    return this.payments()
      .filter(
        (payment) =>
          this.getPaymentMethodValue(payment) === PaymentMethod.BankTransfer
      )
      .map((payment) => ({
        ...payment,
        invoiceId: payment.invoiceId || invoiceId || undefined,
      }));
  }

  /**
   * Get visa payments
   */
  getVisaPayments(): IPayment[] {
    const invoiceId = this.currentInvoiceId();
    return this.payments()
      .filter(
        (payment) => this.getPaymentMethodValue(payment) === PaymentMethod.Visa
      )
      .map((payment) => ({
        ...payment,
        invoiceId: payment.invoiceId || invoiceId || undefined,
      }));
  }

  /**
   * Check if has cash payments
   */
  hasCashPayments(): boolean {
    return this.getCashPayments().length > 0;
  }

  /**
   * Check if has bank transfer payments
   */
  hasBankTransferPayments(): boolean {
    return this.getBankTransferPayments().length > 0;
  }

  /**
   * Check if has visa payments
   */
  hasVisaPayments(): boolean {
    return this.getVisaPayments().length > 0;
  }
}
