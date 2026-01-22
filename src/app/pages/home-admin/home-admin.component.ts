import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CountCardService } from './count-card.service';
import { CountCardComponent } from '../../shared/components/count-card/count-card.component';
import { ChartsTeleSalesComponent } from '../teleSales/chart/first-charts.component';
import { ChartsSalesComponent } from '../sales/first-charts/first-charts.component';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [CommonModule],
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
