export interface IApiResponse {
    succeeded: boolean;
    data: {
      totalCount: number;
      items: ICountry[];
    };
    warningErrors: any;
    validationErrors: any[];
  }

export interface ICountry {
    id?: number;
    keyCode?: string | null;
    name: string;
    iso_3?: string;
    iso_2?: string;
    iso_numeric?: string;
    emoj?: string;
    flag?: string;
}
