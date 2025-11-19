import { Component } from '@angular/core';
import { FormUiComponent } from '../../shared/components/form-ui/form-ui.component';
import { CompanyWizardComponent } from '../../shared/components/company-wizard/company-wizard.component';
import { MatDialog } from '@angular/material/dialog';
import { ActionButton } from '../../shared/interfaces/action-button.interface';
import { COMPANY_FORM_CONFIG } from '../../shared/configs';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrl: './company.component.css',
})
export class CompanyComponent {
  constructor(private dialog: MatDialog) {}

  employeeFormConfig = { ...COMPANY_FORM_CONFIG };

  pageTitle = 'ادارة الشركات';
  breadcrumb = [
    { label: 'الرئيسية', path: '/dashboard/admin' },
    { label: 'الشركات', path: '/dashboard/admin/company' },
  ];
  selectedCompanies: Set<number> = new Set();
  isAllSelected = false;
  companyList$ = new BehaviorSubject<any[]>([
    {
      id: 1,
      name: 'شركة التقنية المتقدمة',
      departmentName: 'تكنولوجيا المعلومات',
      empCode: 'COMP001',
      rating: 4.5,
      email: 'info@tech-advanced.com',
      location: 'الرياض',
      phone: '+966501234567',
    },
    {
      id: 2,
      name: 'مؤسسة البناء الحديث',
      departmentName: 'البناء والتشييد',
      empCode: 'COMP002',
      rating: 4.2,
      email: 'contact@modern-building.com',
      location: 'جدة',
      phone: '+966502345678',
    },
    {
      id: 3,
      name: 'شركة الخدمات التجارية',
      departmentName: 'التجارة',
      empCode: 'COMP003',
      rating: 3.8,
      email: 'sales@commercial-services.com',
      location: 'الدمام',
      phone: '+966503456789',
    },
    {
      id: 1,
      name: 'شركة التقنية المتقدمة',
      departmentName: 'تكنولوجيا المعلومات',
      empCode: 'COMP001',
      rating: 4.5,
      email: 'info@tech-advanced.com',
      location: 'الرياض',
      phone: '+966501234567',
    },
    {
      id: 2,
      name: 'مؤسسة البناء الحديث',
      departmentName: 'البناء والتشييد',
      empCode: 'COMP002',
      rating: 4.2,
      email: 'contact@modern-building.com',
      location: 'جدة',
      phone: '+966502345678',
    },
    {
      id: 3,
      name: 'شركة الخدمات التجارية',
      departmentName: 'التجارة',
      empCode: 'COMP003',
      rating: 3.8,
      email: 'sales@commercial-services.com',
      location: 'الدمام',
      phone: '+966503456789',
    },
    {
      id: 4,
      name: 'شركة الخدمات التجارية',
      departmentName: 'التجارة',
      empCode: 'COMP003',
      rating: 3.8,
      email: 'sales@commercial-services.com',
      location: 'الدمام',
      phone: '+966503456789',
    },
    {
      id: 5,
      name: 'شركة الخدمات التجارية',
      departmentName: 'التجارة',
      empCode: 'COMP003',
      rating: 3.8,
      email: 'sales@commercial-services.com',
      location: 'الدمام',
      phone: '+966503456789',
    },
  ]);
  filterDropdowns: any[] = [
    {
      label: 'نوع الشركة',
      selected: '',
      open: false,
      options: [
        'جميع الأنواع',
        'شركة محدودة',
        'شركة مساهمة',
        'مؤسسة فردية',
        'شركة تضامن',
      ],
    },
    {
      label: 'حالة الشركة',
      selected: '',
      open: false,
      options: ['جميع الحالات', 'نشطة', 'غير نشطة', 'معلقة', 'محذوفة'],
    },
    {
      label: 'المدينة',
      selected: '',
      open: false,
      options: [
        'جميع المدن',
        'الرياض',
        'جدة',
        'مكة المكرمة',
        'المدينة المنورة',
        'الدمام',
        'الخبر',
        'الظهران',
      ],
    },
    {
      label: 'حجم الشركة',
      selected: '',
      open: false,
      options: [
        'جميع الأحجام',
        'صغيرة (1-10)',
        'متوسطة (11-50)',
        'كبيرة (51-200)',
        'كبيرة جداً (200+)',
      ],
    },
  ];
  /** Action Buttons */
  actionButtons: ActionButton[] = [
    {
      label: 'إضافة شركة',
      iconClass: 'bi bi-plus',
      click: () => this.onAddCompany(),
    },
    {
      iconClass: 'bi bi-box-arrow-in-up',
      click: () => console.log('Upload'),
      tooltip: 'Upload',
    },
    {
      iconClass: 'bi bi-box-arrow-right',
      click: () => console.log('Download'),
      tooltip: 'Download',
    },
  ];

  // =============================== form company ===================
  onAddCompany() {
    const dialogRef = this.dialog.open(CompanyWizardComponent, {
      width: '70vw',
      maxWidth: '70vw',
      height: '90vh',
      maxHeight: '90vh',
      disableClose: true,
      panelClass: 'agreement-dialog',
    });

    // Listen to submit event from CompanyWizardComponent
    const componentInstance = dialogRef.componentInstance;
    componentInstance.wizardSubmit.subscribe((result: any) => {
      this.createCompany(result, dialogRef);
    });

    // Listen to cancel event
    componentInstance.wizardCancel.subscribe(() => {
      dialogRef.close();
    });

    // Keep afterClosed in case user cancels
    dialogRef.afterClosed().subscribe(() => {});
  }
  // =============================== create company ===================
  createCompany(formData: any, dialogRef?: any): void {
    console.log('Form data received:', formData);

    // Create new company object
    const newCompany = {
      id: Date.now(), // Simple ID generation
      name: formData.companyName || formData.name || 'شركة جديدة',
      departmentName:
        formData.industry || formData.departmentName || 'غير محدد',
      empCode: formData.companyCode || `COMP${Date.now()}`,
      rating: parseFloat(formData.rating) || 0,
      email: formData.email || '',
      location: formData.location || formData.address || 'غير محدد',
      phone: formData.phoneNumber || formData.phone || '',
    };

    // Add to the list immediately (simulating API success)
    const currentList = this.companyList$.value;
    this.companyList$.next([newCompany, ...currentList]);

    // Update select all state after adding new company
    this.updateSelectAllState();

    // Show success message
    console.log('Company added successfully:', newCompany);

    // Close the dialog
    dialogRef?.close();
  }

  toggleDropdown(dropdown: any): void {
    dropdown.open = !dropdown.open;
  }

  selectOption(dropdown: any, option: any): void {
    dropdown.selected = option;
    dropdown.open = false;
  }

  trackByCompanyId(index: number, company: any): any {
    return company?.id || index;
  }

  // =============================== Selection Methods ===================
  onSelectAllChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isAllSelected = isChecked;

    if (isChecked) {
      // Select all companies
      this.companyList$.value.forEach((company) => {
        this.selectedCompanies.add(company.id);
      });
    } else {
      // Deselect all companies
      this.selectedCompanies.clear();
    }
  }

  onCardSelectionChange(company: any, isSelected: boolean): void {
    if (isSelected) {
      this.selectedCompanies.add(company.id);
    } else {
      this.selectedCompanies.delete(company.id);
    }

    // Update select all checkbox state
    this.updateSelectAllState();
  }

  isCompanySelected(company: any): boolean {
    return this.selectedCompanies.has(company.id);
  }

  private updateSelectAllState(): void {
    const companyList = this.companyList$.value;
    this.isAllSelected =
      companyList.length > 0 &&
      companyList.every((company) => this.selectedCompanies.has(company.id));
  }
}
