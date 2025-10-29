export interface GetTeleSalesTableDataRequest {
  contactName: string;
  assigndate: string;
  leadStatus: string;
  city: string;
  lastActionTime: string;
  actionNote: string;
  pageIndex?: number;
  pageSize?: number;
}
