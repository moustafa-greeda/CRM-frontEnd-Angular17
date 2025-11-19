// ===================================== Industry Chart ===============================
export interface ITopIndustrychart {
  industry: string;
  persntage: number;
}

export interface ChartIndustryResponse {
  succeeded: boolean;
  data: ITopIndustrychart[];
  warningErrors: string | null;
  validationErrors: string[];
}

// ===================================== client by country Chart ===============================
export interface IrevenueChart {
  days: string;
  values: number;
}

export interface ChartClientByCountryResponse {
  succeeded: boolean;
  data: IrevenueChart[];
  warningErrors: string | null;
  validationErrors: string[];
}

// ===================================== company stage chart ===============================
export interface ICompanyStageChart {
  stage: string;
  stageCount: number;
}

export interface ChartCompanyStageResponse {
  succeeded: boolean;
  data: ICompanyStageChart[];
  warningErrors: string | null;
  validationErrors: string[];
}

// ===================================== job title have the largest clients =================
export interface IJobTitleChart {
  jobTitle: string;
  jobTitleCount: number;
  converted?: number;
}

export interface ChartJobTitleResponse {
  succeeded: boolean;
  data: IJobTitleChart[];
  warningErrors: string | null;
  validationErrors: string[];
}
// ============================================ age range chart ===============================
export interface IAgeRangeChart {
  ageRange: string;
  count: number;
}

export interface ChartAgeRangeResponse {
  succeeded: boolean;
  data: IAgeRangeChart[];
  warningErrors: string | null;
  validationErrors: string[];
}
// ============================================ ownership chart ===============================
export interface IownershipChart {
  ownerShip: string;
  persntage: number;
}

export interface ChartownershipResponse {
  succeeded: boolean;
  data: IownershipChart[];
  warningErrors: string | null;
  validationErrors: string[];
}

// ============================================ date add chart ===============================
export interface IdateAddChart {
  quarter: string;
  clientCount: number;
}

export interface ChartdateAddResponse {
  succeeded: boolean;
  data: IdateAddChart | IdateAddChart[];
  warningErrors: string | null;
  validationErrors: string[];
}
