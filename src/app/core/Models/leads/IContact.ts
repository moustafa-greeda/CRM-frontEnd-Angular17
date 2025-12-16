export interface IContact {
  id?: number;
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  age: number;
  industeryId: number;
  locationId: number;
  companyId?: number;
  prefaredLanguage: string;
  jobLevelLookupId: number;
  leadSourceLookupId?: number;
  notes: string;
  isHaveSoialMedia: boolean;
  socialMediaLink: string;
  webSiteUrl: string;
  gender: number;
  cityId: number;
  countryId: number;
  postalCode: string;
  addressLine: string;
}
