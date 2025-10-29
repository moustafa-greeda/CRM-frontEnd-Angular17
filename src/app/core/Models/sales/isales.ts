export interface ISales {
  id?: number;
  leadId: number;
  contactName: string;
  assignDate: string;
  leadStatus: string;
  city: string;
  country: string;
  budget: number;
  currencyName: string;
  notes: string;
  pageIndex?: number;
  pageSize?: number;
}
