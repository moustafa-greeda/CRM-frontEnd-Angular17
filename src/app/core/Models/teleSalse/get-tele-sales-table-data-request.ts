export interface GetTeleSalesTableDataRequest {
  contactName: string;
  searchKeyword?: string;
  assigndate: string;
  leadStatus: string;
  country?: string;
  city: string;
  lastActionTime: string;
  actionNote: string;
  actionDateFilter?: number; // 0 = Today, 1 = This Week, 2 = This Month
  pageIndex?: number;
  pageSize?: number;
}
