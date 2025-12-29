import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FollowUpTableTeleSalseService } from './follow-up-table-tele-salse.service';

@Component({
  selector: 'app-follow-up-table-tele-sales',
  templateUrl: './follow-up-table-tele-sales.component.html',
  styleUrl: './follow-up-table-tele-sales.component.css',
})
export class FollowUpTeleSalesComponent {
  pageTitle = 'المتابعة';
  breadcrumb = [
    { label: 'الرئيسية', link: '/dashboard/telesales' },
    { label: 'المتابعة', link: '/dashboard/telesales/follow-up-tele' },
  ];
  leadsList: any[] = [];
  pageSize: number = 10;
  currentPage: number = 1;
  totalCount: number = 0;
  isLoading: boolean = false;
  dateFilter: string = '';
  searchTerm: string = '';
  hasActiveSearchTerm: boolean = false;
  hasNoLeads: boolean = false;

  constructor(
    private leadsService: FollowUpTableTeleSalseService,
    private router: Router
  ) {}

  // =============================== load leads ===============================
  loadLeads(): void {
    this.isLoading = true;
    // this.leadsService
    //   .getLeads(this.searchTerm, this.currentPage, this.pageSize)
    //   .subscribe((res: any) => {
    //     this.leadsList = res.data;
    //   });
  }
  // =============================== on dropdown change ===============================
  onDropdownChange(event: any): void {
    this.dateFilter = event.target?.value || event;
    this.currentPage = 1;
    this.loadLeads();
  }
  // =============================== on search ===============================
  onSearch(event: any): void {
    this.searchTerm = event.target?.value || event;
    this.currentPage = 1;
    this.loadLeads();
  }

  // =============================== on page size change ===============================
  onPageSizeChange(event: any): void {
    this.pageSize = event.target?.value || event;
    this.currentPage = 1;
    this.loadLeads();
  }

  // =============================== on page change ===============================
  onPageChange(event: any): void {
    this.currentPage = event.target?.value || event;
    this.loadLeads();
  }
  // =============================== reset filters ===============================
  resetFilters(): void {
    this.dateFilter = '';
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadLeads();
  }
  // =============================== columns table ================================
  columns: any[] = [
    { key: 'name', header: 'الاسم' },
    { key: 'typeFollowUp', header: 'نوع المتابعه' },
    { key: 'dateFollowUp', header: 'تاريخ المتابعة' },
    { key: 'lastAction', header: 'اخر عمليه تمت' },
    { key: 'actions', header: 'الاجراءات' },
  ];
  // =============================== on view ================================
  onView(event: any): void {
    this.router.navigate([
      '/dashboard/telesales/follow-up-tele/view',
      event.id,
    ]);
  }
  // =============================== on edit ================================
}
