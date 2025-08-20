export interface ITableColumn<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
}
