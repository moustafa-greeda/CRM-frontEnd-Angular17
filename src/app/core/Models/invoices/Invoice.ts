export interface Iinvoice {
  id?: string | number;
  invoiceNumber?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  issueDate?: string;
  budget: number;
  name?: string;
  pakect?: string; // Package name for table display
  currncy: string;
  amountDisplay?: string;
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
}
