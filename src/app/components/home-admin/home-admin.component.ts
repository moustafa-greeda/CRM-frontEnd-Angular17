import { Component } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CountCardService } from './count-card.service';

@Component({
  selector: 'app-home-admin',
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.css',
})
export class HomeAdminComponent {
  pageTitle = 'Overview';
  countCompanies: number = 0;
  countContacts: number = 0;
  countClients: number = 0;
  countLeads: number = 0;
  countCountries: number = 0;
  countIndustries: number = 0;
  stats: any[] = [];

  constructor(private _countCardService: CountCardService) {}
}
