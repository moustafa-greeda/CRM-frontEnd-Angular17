
export interface PersonalData {
  id?: number;
  name?: string;
  jobTitle?: string;
  prefaredLanguage?: string;
  email?: string;
  phone?: string;
  // Fields for backward compatibility
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
  comapnySize?: string;
  entryChanel?: string;
}

export interface CompanyData {
  id: string;
  digitalTransactions: string;
  branches: number;
  ownership: string;
  location: string;
  companyStage: string;
  size: string;
  industry: string;
  companyName: string;
}
