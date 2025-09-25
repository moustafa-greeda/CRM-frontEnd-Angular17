export interface PersonalData {
  id?: string | number;
  name?: string;
  jobTitle?: string;
  prefaredLanguage?: string;
  email?: string;
  phone?: string;
  personality?: string;
  customerLevel?: string;
  customerType?: string;
  language?: string;
  department?: string;
  city?: string;
  country?: string;
  age?: number;
  jobLevel?: string; 
  industry?: string;
  industryName?: string;
  comapnySize?: string;
  entryChanel?: string;
}

export interface CompanyData {
  id: string | number;
  name?: string;
  companyName?: string;
  digitalTransactions?: string;
  branches?: number;
  ownership?: string;
  location?: string;
  companyStage?: string;
  size?: string;
  industry?: string;
  country?: string;
  city?: string;
  [key: string]: any;
}
