import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  

  private readonly _HttpClient = inject(HttpClient) ; 




  getCompanyStage():Observable<any> {
    return this._HttpClient.get(`${environment.apiUrl}/Filter/GetCompanyStage`)
  }


  getLeadStatus():Observable<any> {
    return this._HttpClient.get(`${environment.apiUrl}/Filter/GetLeadStatus`)
  }





}
