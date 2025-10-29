export interface IApiResponse {
  succeeded: boolean;
  data: {
    totalCount: number;
    items: ILeadStatus[];
  };
  warningErrors: any;
  validationErrors: any[];
}

export interface ILeadStatus {
  id?: number;
  name: string;
}
