export interface DeptQuery {
  PageIndex?: number;
  PageSize?: number;
  SortField?: string;
  SortDirection?: 'asc' | 'desc';
  Name?: string;
  Description?: string;
  SearchKeyword?: string;
  Id?: number;
}
