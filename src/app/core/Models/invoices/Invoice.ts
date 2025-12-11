export interface Iinvoice {
  id?: string | number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  issueDate?: string;
  budget: number;
  name?: string;
  currncy: string;
  status?: 'مدفوعة' | 'متأخرة' | 'قيد المراجعة' | 'غير مدفوعة' | 'ملغاة';
}

// ------------------------ Interface for Account Assignment response
export interface IAccountAssignment {
  id: number;
  leadId: number;
  budget: number;
  currncy: string;
  name: string;
  isInWorkOrder: boolean;
  targetProductId?: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
}

// ------------------------ Interface for add invoice response
export interface IAddInvoiceRequest {
  amount: number;
  clientId: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientCity: string;
  totalprices: number;
  leadDataId: number;
  pamentmethod: number;
  details: Array<{
    pakageName: string;
    description: string;
    unitPrice: number;
    quantity: number;
  }>;
}

// ------------------------ Interface for GetAllInvoiceData
export interface IGetAllInvoiceData {
  totalCount: number;
  items: IGetAllInvoiceDataItem[];
}
export interface IGetAllInvoiceDataItem {
  id?: string | number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  totalprices: number;
  paymentMethod: string;
  paidAmount: number;
  remaining: number;
  paymentStatus: string;
  createdAt: string;
}

// ------------------------ Interface for Add Invoice Response ------------------------------
export interface IAddInvoiceResponse {
  id: number;
  total: number;
  pdfPath: string;
  message: string;
}

// ------------------------ Interface for Payment ------------------------------
export enum PaymentMethod {
  Cash = 0,
  BankTransfer = 1,
  Visa = 2,
}

export interface IPayment {
  id?: number;
  invoiceId?: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  // Cash
  cashReceiptNumber?: string;
  cashReceivedBy?: string;
  // Bank Transfer
  bankName?: string;
  swiftCode?: string;
  transferReceiptNumber?: string;
  // Credit Card
  visaCardNumber?: string;
  authorizationCode?: string;
  visaOwnerName?: string;
  // Customer Info
  customerName?: string;
  // General
  totalAmount: number;
}

// ------------------------ Interface for Get All Expenses Response ------------------------------
export interface IGetAllExpenses {
  id?: string | number;
  expenseName: string;
  expenseDate: number;
  amount: string;
  totalAmount: string;
}

// ------------------------ Interface for GetAllExpensesData-------------------------------------
export interface IGetAllExpensesData {
  totalCount: number;
  items: IGetAllExpenses[];
}
// ----------------------------------- interface for search expenses -------------------------------------
export interface ExpensesQueryParams {
  expenseName?: string;
  fromDate?: string;
  toDate?: string;
  amount?: string | number;
  dayFilter?: string;
  weekFilter?: string;
  monthFilter?: string;
  pageIndex?: number;
  pageSize?: number;
}
// ------------------------ Interface for Add Expenses ------------------------------
export interface IAddExpenses {
  expenseName: string;
  expenseDate: string;
  amount: number;
}
