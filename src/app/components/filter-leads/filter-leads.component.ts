import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FilterLeadsService } from './filter-leads.service';
import { PersonalData, CompanyData } from './shared/interfaces';


@Component({
  selector: 'app-filter-leads',
  templateUrl: './filter-leads.component.html',
  styleUrls: ['./filter-leads.component.css']
})
export class FilterLeadsComponent implements OnInit {

  // Tab navigation
  activeTab: 'personal' | 'company' | 'all' = 'personal';

  // Table data
  personalData: PersonalData[] = [];
  companyData: CompanyData[] = [];
  personalDataFiltered: PersonalData[] = [];
  companyDataFiltered: CompanyData[] = [];
  selectedPersonalData: PersonalData[] = [];
  selectedCompanyData: CompanyData[] = [];


  constructor(
    private _FilterLeadsService: FilterLeadsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // البيانات ستأتي من API في personal-data-table component
  }
  


  // Table event handlers
  onPersonalDataFiltered(data: PersonalData[]) {
    this.personalDataFiltered = data;
  }

  onPersonalDataSelected(data: PersonalData[]) {
    this.selectedPersonalData = data;
  }

  onCompanyDataFiltered(data: CompanyData[]) {
    this.companyDataFiltered = data;
  }

  onCompanyDataSelected(data: CompanyData[]) {
    this.selectedCompanyData = data;
  }

  // Tab navigation methods
  setActiveTab(tab: 'personal' | 'company' | 'all') {
    this.activeTab = tab;
  }


}
