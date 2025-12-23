export interface ICompanies {
  id?: number;
  name: string;
}

export interface companiesResponse {
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  items: ICompanies[];
}

export interface ICreateCompany {
  id?: number;
  name: string;
  industeryId: number;
  companySizeId: number;
  companyStageId: number;
  ownershipId: number;
  cityId: number;
  counteryId: number;
  addressLine: string;
  email: string;
  phoneNumber: string;
}

// ================================= get all company with filter =====================
export interface ICompanyFilter {
  // Filter parameters (for request)
  searchKeyword?: string | number;
  countryName?: string;
  cityName?: string;
  pageIndex?: number;
  pageSize?: number;
  // Company data (for response - optional)
  id?: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  industeryName?: string;
  addressLine?: string | null;
}

// ================================= response for getAllCompanyWithFilter =====================
export interface ICompanyFilterResponse {
  items: ICompanyFilter[];
  totalCount: number;
  pageIndex?: number;
  pageSize?: number;
}
