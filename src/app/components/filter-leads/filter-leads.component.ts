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
    this.loadMockData();
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


  // Load mock data for demonstration
  private loadMockData() {
    this.personalData = [
      {
        id: '1',
        personality: 'USER',
        customerLevel: 'NEW',
        customerType: 'B2B',
        language: 'العربية',
        department: 'IT',
        city: 'المنصورة',
        country: 'مصر',
        age: 55,
        jobTitle: 'IT_MGR'
      },
      {
        id: '2',
        personality: 'ADMIN',
        customerLevel: 'EXISTING',
        customerType: 'B2C',
        language: 'English',
        department: 'HR',
        city: 'القاهرة',
        country: 'مصر',
        age: 32,
        jobTitle: 'HR_MGR'
      },
      {
        id: '3',
        personality: 'MANAGER',
        customerLevel: 'VIP',
        customerType: 'ENTERPRISE',
        language: 'العربية',
        department: 'Finance',
        city: 'الرياض',
        country: 'السعودية',
        age: 45,
        jobTitle: 'FINANCE_DIR'
      }
    ];

    this.companyData = [
      {
        id: '1',
        digitalTransactions: 'متوسط',
        branches: 7,
        ownership: 'عامة',
        location: 'قطر - الدوحة',
        companyStage: 'مستقرة',
        size: 'متوسطة (51-200)',
        industry: 'تجزئة',
        companyName: 'خدمات المدى للتجارة'
      },
      {
        id: '2',
        digitalTransactions: 'عالي',
        branches: 15,
        ownership: 'خاصة',
        location: 'الإمارات - دبي',
        companyStage: 'متقدمة',
        size: 'كبيرة (201-1000)',
        industry: 'تقنية',
        companyName: 'شركة التقنية المتقدمة'
      },
      {
        id: '3',
        digitalTransactions: 'منخفض',
        branches: 3,
        ownership: 'حكومية',
        location: 'الكويت - الكويت',
        companyStage: 'نامية',
        size: 'صغيرة (1-10)',
        industry: 'تعليم',
        companyName: 'مؤسسة التعليم الحديث'
      }
    ];
  }
}
