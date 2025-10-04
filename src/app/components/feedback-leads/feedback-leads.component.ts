import { Component } from '@angular/core';

@Component({
  selector: 'app-feedback-leads',
  templateUrl: './feedback-leads.component.html',
  styleUrl: './feedback-leads.component.css',
})
export class FeedbackLeadsComponent {
  pageTitle = 'Deals Overview';
  countCompanies: number = 0;
  countContacts: number = 0;
  countClients: number = 0;
  countLeads: number = 0;
  countCountries: number = 0;
  countIndustries: number = 0;
  stats: any[] = [];
  ngOnInit(): void {
    this.stats = [
      {
        title: 'Sum Of Deals',
        // count: res.companies.data,
        count: 0,
        icon: 'bi-person-add',
      },
      {
        title: 'Sum Of Deals',
        // count: res.contacts.data,
        count: 0,

        icon: 'bi-person-lines-fill',
      },
      {
        title: 'Total Company Received',
        // count: res.clients.data,
        count: 0,

        icon: 'bi-person',
      },
      {
        title: 'Total Revenue',
        // count: res.leads.data,
        count: 0,

        icon: 'bi-person-fill-add',
      },
      {
        title: 'Avg. Period Of client',
        // count: res.countries.data.countryCount,
        count: 0,

        icon: 'bi-globe-americas',
      },
    ];
    // });
  }
}
