export interface ApiResponse<T> {
  succeeded: boolean;
  data: T;
  message?: string;
  errors?: any;
  warningErrors?: any[];
  validationErrors?: any[];
}
