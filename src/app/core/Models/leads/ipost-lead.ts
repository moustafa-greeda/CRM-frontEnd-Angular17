export interface IPostLead {
  id?: number;
  name: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  age?: number;
  industryId?: number;
  locationId?: number;
  companyId?: number;
  preferredLanguage?: string;
  jobLevelLookupId?: number;
  notes?: string;
  isHaveSocialMedia?: boolean;
  socialMediaLink?: string;
  webSiteUrl?: string;
  gender?: string;
  cityId: number;
  countryId: number;
  postalCode?: string;
  addressLine?: string;
}
