import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActionButton } from '../../../shared/interfaces/action-button.interface';
import { BreadcrumbItem } from '../../../shared/interfaces/breadcrumb-item.interface';
import { formUiConfig } from '../../../shared/interfaces/formUi.interface';
import { FormUiComponent } from '../../../shared/components/form-ui/form-ui.component';
import { FORM_UI_CONFIG } from '../../../shared/configs/agreement-form.config';

@Component({
  selector: 'app-tabel-deals',
  templateUrl: './tabel-deals.component.html',
  styleUrl: './tabel-deals.component.css',
})
export class TabelDealsComponent implements OnInit {
  stats: any[] = [];
  selectedRows: any[] = [];
  pageSize = 10;
  currentPage = 0;
  totalCount = 0;

  pageTitle = 'إدارة الاتفاقيات';
  agreementFormConfig: formUiConfig = FORM_UI_CONFIG;

  constructor(private dialog: MatDialog) {}

  /** Breadcrumb items */
  breadcrumb: BreadcrumbItem[] = [
    { label: 'الرئيسية' },
    { label: 'الاتفاقيات', active: true },
  ];

  /** Action Buttons */
  actionButtons: ActionButton[] = [
    {
      label: 'إضافة اتفاقية',
      iconClass: 'bi bi-plus',
      click: () => this.onAddAgreement(),
    },
    {
      iconClass: 'bi bi-box-arrow-in-up',
      click: () => this.onUpload(),
      tooltip: 'Upload',
    },
    {
      iconClass: 'bi bi-box-arrow-right',
      click: () => this.onDownload(),
      tooltip: 'Download',
    },
  ];

  ngOnInit(): void {
    this.totalCount = this.companyData.length;

    this.stats = [
      {
        title: 'المفقودة',
        count: 10,
        icon: 'bi-exclamation-triangle-fill',
      },
      {
        title: 'المثبتة',
        count: 0,
        icon: 'bi-pin-angle-fill ',
      },
      {
        title: 'قيد الجذب',
        count: 0,
        icon: 'bi-magnet-fill',
      },
      {
        title: 'اجمالي الاتفاقيات',
        count: 0,
        icon: 'bi-hand-thumbs-up-fill',
      },
    ];
  }
  // Parent Component
  companyColumns = [
    { key: 'name', header: 'إسم العميل' },
    { key: 'stage', header: 'المرحلة' },
    { key: 'status', header: 'الحالة' },
    { key: 'value', header: 'القيمة' },
    { key: 'periorety', header: 'الاولوية' },
    { key: 'date', header: 'تاريخ الاستحقاق' },
    { key: 'actions', header: 'الإجراءات' },
  ];

  companyData: any[] = [
    {
      name: 'شركة التقنية المتقدمة',
      stage: 'مفاوضات',
      status: 'نشط',
      value: '2,500,000 ريال',
      periorety: 'عالي',
      date: '2024-03-15',
    },
    {
      name: 'مؤسسة البناء الحديث',
      stage: 'عرض أولي',
      status: 'معلق',
      value: '1,800,000 ريال',
      periorety: 'متوسط',
      date: '2024-02-28',
    },
    {
      name: 'شركة الخدمات المالية',
      stage: 'إغلاق',
      status: 'مكتمل',
      value: '5,200,000 ريال',
      periorety: 'عالي',
      date: '2024-01-20',
    },
    {
      name: 'مؤسسة التجارة الدولية',
      stage: 'تأهيل',
      status: 'نشط',
      value: '950,000 ريال',
      periorety: 'منخفض',
      date: '2024-04-10',
    },
    {
      name: 'شركة الطاقة المتجددة',
      stage: 'عرض مفصل',
      status: 'نشط',
      value: '3,100,000 ريال',
      periorety: 'عالي',
      date: '2024-03-30',
    },
    {
      name: 'مجموعة الاستثمار الخليجية',
      stage: 'مفاوضات',
      status: 'نشط',
      value: '4,500,000 ريال',
      periorety: 'عالي',
      date: '2024-04-05',
    },
    {
      name: 'شركة النقل واللوجستيات',
      stage: 'عرض أولي',
      status: 'معلق',
      value: '1,200,000 ريال',
      periorety: 'متوسط',
      date: '2024-02-15',
    },
    {
      name: 'مؤسسة الرعاية الصحية',
      stage: 'إغلاق',
      status: 'مكتمل',
      value: '6,800,000 ريال',
      periorety: 'عالي',
      date: '2024-01-10',
    },
    {
      name: 'شركة التصنيع المتقدم',
      stage: 'تأهيل',
      status: 'نشط',
      value: '2,100,000 ريال',
      periorety: 'متوسط',
      date: '2024-04-20',
    },
    {
      name: 'مجموعة العقارات الكبرى',
      stage: 'عرض مفصل',
      status: 'نشط',
      value: '8,500,000 ريال',
      periorety: 'عالي',
      date: '2024-05-01',
    },
    {
      name: 'شركة الطاقة المتجددة',
      stage: 'عرض مفصل',
      status: 'نشط',
      value: '3,100,000 ريال',
      periorety: 'عالي',
      date: '2024-03-30',
    },
    {
      name: 'مجموعة الاستثمار الخليجية',
      stage: 'مفاوضات',
      status: 'نشط',
      value: '4,500,000 ريال',
      periorety: 'عالي',
      date: '2024-04-05',
    },
    {
      name: 'شركة النقل واللوجستيات',
      stage: 'عرض أولي',
      status: 'معلق',
      value: '1,200,000 ريال',
      periorety: 'متوسط',
      date: '2024-02-15',
    },
    {
      name: 'مؤسسة الرعاية الصحية',
      stage: 'إغلاق',
      status: 'مكتمل',
      value: '6,800,000 ريال',
      periorety: 'عالي',
      date: '2024-01-10',
    },
    {
      name: 'شركة التصنيع المتقدم',
      stage: 'تأهيل',
      status: 'نشط',
      value: '2,100,000 ريال',
      periorety: 'متوسط',
      date: '2024-04-20',
    },
    {
      name: 'مجموعة العقارات الكبرى',
      stage: 'عرض مفصل',
      status: 'نشط',
      value: '8,500,000 ريال',
      periorety: 'عالي',
      date: '2024-05-01',
    },
  ];

  onUpload() {
    console.log('Upload clicked');
    // add your upload logic here
  }

  onAddClient() {
    console.log('Add client clicked');
  }

  onAddAgreement() {
    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '80vw',
      maxWidth: '1000px',
      height: 'auto',
      maxHeight: '90vh',
      data: {
        config: this.agreementFormConfig,
      },
      disableClose: true,
      panelClass: 'agreement-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Form submitted:', result);
        // Add the new agreement to the data
        const newAgreement = {
          name: result.clientName,
          stage: result.stage,
          status: result.status,
          value: `${result.contractValue?.toLocaleString()} ريال`,
          periorety: result.priority,
          date: result.dueDate,
        };

        this.companyData.unshift(newAgreement);
        this.totalCount = this.companyData.length;
      }
    });
  }

  onDownload() {
    console.log('Download clicked');
  }

  onRowSelectionChange(event: { row: any; selected: boolean }): void {
    if (event.selected) {
      this.selectedRows.push(event.row);
    } else {
      this.selectedRows = this.selectedRows.filter((row) => row !== event.row);
    }
  }

  onSelectAllChange(selectAll: boolean): void {
    if (selectAll) {
      this.selectedRows = [...this.companyData];
    } else {
      this.selectedRows = [];
    }
  }

  onEditDeal(deal: any): void {
    console.log('Edit deal:', deal);
    // Add your edit logic here
  }

  onDeleteDeal(deal: any): void {
    console.log('Delete deal:', deal);
    // Add your delete logic here
  }

  onViewDeal(deal: any): void {
    console.log('View deal:', deal);
    // Add your view logic here
  }
}
