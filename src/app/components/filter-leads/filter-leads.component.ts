import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FilterLeadsService } from './filter-leads.service';
import { PersonalData, CompanyData } from './model/interfaces';


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
    this.initializeCompanyData();
  }

  private initializeCompanyData() {
    // Initialize with sample company data matching the design
    this.companyData = [
      {
        id: '1',
        digitalTransactions: 'تعتمد على التقنية',
        branches: 3,
        ownership: 'عامة',
        location: 'قطر - الدوحة',
        companyStage: 'مستقرة',
        size: 'متوسطة',
        industry: 'تجزئة',
        companyName: 'خدمات المدى للتجارة'
      },
      {
        id: '2',
        digitalTransactions: 'متقدمة تقنيا',
        branches: 1,
        ownership: 'خاصة',
        location: 'السعودية - جدة',
        companyStage: 'مستقرة',
        size: 'صغيرة',
        industry: 'نقل لوجستيات',
        companyName: 'شركة سنك للخدمات نقل لوجستيات'
      },
      {
        id: '3',
        digitalTransactions: 'بنية تحتية قوية',
        branches: 5,
        ownership: 'خاصة',
        location: 'السعودية - جدة',
        companyStage: 'مستقرة',
        size: 'كبيرة',
        industry: 'عقارات',
        companyName: 'شركة الدرع للتجزئة'
      },
      {
        id: '4',
        digitalTransactions: 'متوسط',
        branches: 2,
        ownership: 'خاصة',
        location: 'الكويت - الكويت',
        companyStage: 'مستقرة',
        size: 'صغيرة-متوسطة',
        industry: 'عقارات',
        companyName: 'شركة الرؤية للتسويق'
      },
      {
        id: '5',
        digitalTransactions: 'متوسط',
        branches: 1,
        ownership: 'خاصة',
        location: 'مصر - الإسكندرية',
        companyStage: 'مستقرة',
        size: 'صغيرة',
        industry: 'صحة طبي',
        companyName: 'خدمات المدى للعقارات صحة طبي'
      }
    ];
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
