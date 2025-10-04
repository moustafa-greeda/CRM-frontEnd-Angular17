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

  ngOnInit(): void {
    forkJoin({
      companies: this._countCardService.getCountCompanies(),
      contacts: this._countCardService.getCountContacts(),
      clients: this._countCardService.getCountClients(),
      leads: this._countCardService.getCountLeads(),
      countries: this._countCardService.getCountCountries(),
      industries: this._countCardService.getCountIndustries(),
    }).subscribe((res) => {
      this.stats = [
        {
          title: 'Total Companies',
          count: res.companies.data,
          icon: 'bi-buildings',
        },
        {
          title: 'Total Contacts',
          count: res.contacts.data,
          icon: 'bi-person-lines-fill',
        },
        { title: 'Total Clients', count: res.clients.data, icon: 'bi-person' },
        {
          title: 'Total Leads',
          count: res.leads.data,
          icon: 'bi-person-fill-add',
        },
        {
          title: 'Total Source Countries',
          count: res.countries.data.countryCount,
          icon: 'bi-globe-americas',
        },
        {
          title: 'Total Industries',
          count: res.industries.data,
          icon: 'bi-building',
        },
      ];
    });
  }
}
