export interface ILeads {
  id: number;
  name: string;
  jobTitle: string | null;
  email: string | null;
  phone: string;
  companyName: string | null;
  industeryName: string; // Note: API uses 'industeryName' not 'industryName'
  locationName: string;
  webSiteUrl: string; // Note: API uses 'webSiteUrl' not 'websiteUrl'
  isHaveSoialMedia: boolean; // Note: API uses 'isHaveSoialMedia' not 'isHaveSocialMedia'
  socialMediaLink: string;
}

export interface ILeadsResponse {
  succeeded: boolean;
  data: {
    totalCount: number;
    items: ILeads[];
  };
  warningErrors: any;
  validationErrors: any[];
}

export interface ILeadsSearchParams {
  name?: string;
  phone?: string;
  companyName?: string;
  email?: string;
  jobTitle?: string;
  id?: number;
  isLeadContact?: boolean;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  pageIndex?: number;
  pageSize?: number;
  searchKeyword?: string;
}

export interface IcovertcontactToLead {
  contactId: number;
  leadStatusLookupId: number;
}

export interface ILeadsTeleSalse {
  id: number;
  name: string;
  phone: string;
  companyName: string | null;
  campaignName: string | null;
  leadSourceName: string | null;
  leadStatusName: string;
  assignedTo: string;
  createdAt: string;
}

export interface ILeadsWithFiltersResponse {
  succeeded: boolean;
  data: {
    totalCount: number;
    items: ILeadsTeleSalse[];
  };
  warningErrors: any;
  validationErrors: any[];
}
