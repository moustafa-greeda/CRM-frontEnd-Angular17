import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ChartAgeRangeResponse,
  ChartClientByCountryResponse,
  ChartCompanyStageResponse,
  ChartdateAddResponse,
  ChartIndustryResponse,
  ChartJobTitleResponse,
  ChartownershipResponse,
} from '../../../core/Models/main-chart/ichart';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MainChartService {
  Base_Url = environment.apiUrl;
  constructor(private http: HttpClient) {}

  //============================== GetTopTenIndustries ================================
  GetTopIndustries(): Observable<ChartIndustryResponse> {
    return this.http.get<ChartIndustryResponse>(
      `${this.Base_Url}/Filter/charts/gettoptenindustries`
    );
  }

  //============================== GetClientByCountry ================================
  GetClientByCountry(): Observable<ChartClientByCountryResponse> {
    return this.http.get<ChartClientByCountryResponse>(
      `${this.Base_Url}/Filter/Charts/GetClientCountByCountery`
    );
  }
  //==================================GetCompanyStageCount ============================
  GetCompanyStageCount(): Observable<ChartCompanyStageResponse> {
    return this.http.get<ChartCompanyStageResponse>(
      `${this.Base_Url}/Filter/Charts/GetCompanyStageCount`
    );
  }
  //=========================GetJobTitleHaveTheLargestClients ==========================
  GetJobTitleChart(): Observable<ChartJobTitleResponse> {
    return this.http.get<ChartJobTitleResponse>(
      `${this.Base_Url}/Filter/Charts/GetJobtitleCount`
    );
  }

  //================================== GetAgeRange ====================================
  GetAgeRange(): Observable<ChartAgeRangeResponse> {
    return this.http.get<ChartAgeRangeResponse>(
      `${this.Base_Url}/Filter/Charts/GetAgeRange`
    );
  }
  //================================== GetOwnerShip ====================================
  GetOwnerShip(): Observable<ChartownershipResponse> {
    return this.http.get<ChartownershipResponse>(
      `${this.Base_Url}/Filter/Charts/GetOwnerShip`
    );
  }
  //================================== GetDateAdd ====================================
  GetDateAdd(): Observable<ChartdateAddResponse> {
    return this.http.get<ChartdateAddResponse>(
      `${this.Base_Url}/Filter/Charts/GetClientByQuarter`
    );
  }
}
