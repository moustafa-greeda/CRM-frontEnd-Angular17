export interface IGetAllContract {
  contactId: number;
  contactName: string;
  contactPhone: string;
  assignedAt: string;
  contractAmount: number;
  pageSize?: number;
  pageIndex?: number;
  searchKeyword?: string | number;
}
