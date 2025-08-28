export interface ILeads {
  id: number;
  sourceCompany: string;
  clientName: string;
  clientPhone: string;
  additionPhone: string | null;
  clientEmail: string | null;
  clientWebsite: string | null;
  socialMediaLinks: string | null; // raw string from API (JSON string)
  clientCategory: string | null;
  clientLocation: string | null;
  entryText: string | null;
  entryChannel: string | null;
  entryCampaign: string | null;
  gender: string | null;
  requestType: string | null;
  clientMainDomain: string | null;
  clientSubDomain: string | null;
  region: string | null;
  createdAt: string; // ISO
}

// helper for parsed social links (optional)
export type SocialLinks = Partial<{
  twitter: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  snapchat: string;
  whatsapp: string;
  telegram: string;
  appstore: string;
  googlestore: string;
}>;

// export interface LeadsQuery {
//   PageIndex?: number;
//   PageSize?: number;
//   SortField?: string;
//   SortDirection?: 'asc' | 'desc' | '';
//   SearchKeyword?: string;

//   SourceCompany?: string;
//   ClientName?: string;
//   ClientPhone?: string;
//   AdditionPhone?: string;
//   ClientEmail?: string;
//   ClientWebsite?: string;
//   SocialMediaLinks?: string;
//   ClientCategory?: string;
//   ClientLocation?: string;
//   EntryText?: string;
//   EntryChannel?: string;
//   EntryCampaign?: string;
//   Gender?: string;
//   RequestType?: string;
//   ClientMainDomain?: string;
//   ClientSubDomain?: string;
//   Region?: string;
//   CreatedAtFrom?: Date | string;
//   CreatedAtTo?: Date | string;
//   Id?: number;
// }

export interface LeadsQuery {
  PageIndex?: number;
  PageSize?: number;
  SortField?: string;
  SortDirection?: 'asc' | 'desc' | '';
  SearchKeyword?: string;

  SourceCompany?: string;
  ClientName?: string;
  ClientPhone?: string;
  AdditionPhone?: string;
  ClientEmail?: string;
  ClientWebsite?: string;
  SocialMediaLinks?: string;
  ClientCategory?: string;
  ClientLocation?: string; // country
  EntryText?: string;
  EntryChannel?: string;
  EntryCampaign?: string;
  Gender?: string;
  RequestType?: string;
  ClientMainDomain?: string;
  ClientSubDomain?: string;
  Region?: string; // city
  CreatedAtFrom?: Date | string;
  CreatedAtTo?: Date | string;
  Id?: number;
}
