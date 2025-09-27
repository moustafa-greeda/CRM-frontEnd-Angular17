import { Component } from '@angular/core';
import { CountCardService } from './count-card.service';

@Component({
  selector: 'app-count-cards',
  templateUrl: './count-cards.component.html',
  styleUrl: './count-cards.component.css',
})
export class CountCardsComponent {
  countCompanies: number = 0;
  countContacts: number = 0;
  countClients: number = 0;
  countLeads: number = 0;
  countCountries: number = 0;
  countIndustries: number = 0;
  constructor(private _countCardService: CountCardService) {}

  ngOnInit(): void {
    this._countCardService.getCountCompanies().subscribe((res) => {
      this.countCompanies = res.data;
    });

    this._countCardService.getCountContacts().subscribe((res) => {
      this.countContacts = res.data;
    });

    this._countCardService.getCountClients().subscribe((res) => {
      this.countClients = res.data;
    });

    this._countCardService.getCountLeads().subscribe((res) => {
      this.countLeads = res.data;
    });

    this._countCardService.getCountCountries().subscribe((res) => {
      this.countCountries = res.data.countryCount;
    });

    this._countCardService.getCountIndustries().subscribe((res) => {
      this.countIndustries = res.data;
    });
  }
}
