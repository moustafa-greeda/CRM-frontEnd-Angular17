import { Component } from '@angular/core';
import { AuthService } from '../../../../Auth/auth.service';
import { FormControl, FormGroup } from '@angular/forms';
import { FormUiComponent } from '../../../../shared/components/form-ui/form-ui.component';
import { MatDialog } from '@angular/material/dialog';
import { formUiConfig } from '../../../../shared/interfaces/formUi.interface';
import { ContractService } from './contract.service';
import { CONTRACT_FORM_CONFIG } from '../../../../shared/configs/contract-form.config';
import { IContractStatus } from '../../../../core/Models/common/IContractStatus';
import { IGetAllContract } from '../../../../core/Models/contract/Icontract.model';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.css', '../../../sharedStyleDashboard.css'],
})
export class ContractComponent {
  constructor(
    private _authService: AuthService,
    private dialog: MatDialog,
    private _contractService: ContractService
  ) {}
  userInfo: any = { name: this._authService.getUsername() || 'المستخدم' };

  listContracts: IGetAllContract[] = [];
  contractStatusList: any[] = [];
  contractStatusListForForm: any[] = []; // قائمة الحالات للفورم مع id و name
  selectedContractStatus: any = null;
  pageSize: number = 10;
  currentPage: number = 1;
  totalCount: number = 0;
  searchKeyword: string = '';
  filterForm: FormGroup = new FormGroup({
    contractStatus: new FormControl(''),
  });
  selectedRows: any[] = [];
  // page title and breadcrumb
  pageTitle: string = 'العقود';
  breadcrumb: any[] = [
    { label: 'الرئيسية', link: '/dashboard/legal' },
    { label: 'العقود', link: '/dashboard/legal/contracts' },
  ];
  actionTitles: any = {
    add: 'إضافة عقد جديد',
    edit: 'تعديل بيانات العقد',
  };
  contractFormConfig: formUiConfig = { ...CONTRACT_FORM_CONFIG };
  // Options passed to the shared dropdown component (string labels)
  contractStates: string[] = [];
  hasNoData: boolean = false;

  // =================================== ngOnInit ======================================
  ngOnInit(): void {
    this.getContractStatusList();
    this.getAllContracts();
    this.setupFormStatusOptions();
  }
  columns: any[] = [
    { key: 'contactName', header: 'الاسم' },
    { key: 'contractAmount', header: 'مبلغ العقد' },
    // { key: 'contactPhone', header: 'رقم الهاتف' },
    // { key: 'contractStatus', header: 'حالة العقد' },
    { key: 'contactPhone', header: 'رقم الهاتف' },
    { key: 'contractAmount', header: 'مبلغ العقد' },
    // { key: 'contractType', header: 'نوع العقد' },
    { key: 'actions', header: 'الإجراءات' },
  ];

  // =================================== getContractStatusList =============================
  getContractStatusList(): void {
    this.contractStatusListForForm = IContractStatus;

    // Map contract status list to display names for the filter dropdown options
    this.contractStatusList = [
      { Active: null, label: 'جميع الحالات' },
      ...this.contractStatusListForForm,
    ].map((s) => s.label);
  }

  // =================================== setupFormStatusOptions ============================
  setupFormStatusOptions(): void {
    const statusField = this.contractFormConfig.fields.find(
      (field) => field.name === 'status'
    );
    if (statusField) {
      statusField.options = this.contractStatusListForForm.map((status) => ({
        value: status.value,
        label: status.label,
      }));
      statusField.placeholder = 'إختر الحالة';
    }
  }
  // =================================== getAllContracts =================================
  getAllContracts(): void {
    const filters: Partial<IGetAllContract> = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
      searchKeyword: this.searchKeyword || undefined,
    };
    this._contractService.getAllContracts(filters).subscribe({
      next: (res) => {
        if (res && res.succeeded && res.data) {
          this.listContracts = res.data.items;
          this.totalCount =
            (res.data as any).totalCount || res.data.items.length;
        } else {
          this.listContracts = [];
          this.totalCount = 0;
        }
      },
      error: (err) => {
        console.error('Error fetching contracts:', err);
        this.listContracts = [];
        this.totalCount = 0;
      },
    });
  }
  // =================================== onContractStatusChange ===========================
  onContractStatusChange(event: any): void {
    this.selectedContractStatus = event;
  }
  // =================================== onPageChange ======================================
  onPageChange(event: any): void {
    this.currentPage = event;
    this.getAllContracts();
  }
  // =================================== onPageSizeChange =================================
  onPageSizeChange(event: any): void {
    this.pageSize = event;
    this.currentPage = 1; // Reset to first page when page size changes
    this.getAllContracts();
  }
  // =================================== onFilterSubmit ======================================
  onFilterSubmit(): void {
    this.currentPage = 1;
    this.getAllContracts();
  }
  // =================================== onSearch ======================================
  onSearch(event: string): void {
    this.searchKeyword = event || '';
    this.currentPage = 1; // Reset to first page on search
    this.getAllContracts();
  }
  // =================================== onAddContract ======================================
  onAddContract(event: any): void {
    const contactId = event?.contactId || null;
    const contractAmount = event?.contractAmount || null;
    const signedBy = this._authService.getUsername();
    // ----------- initial values --------------
    const initialValues = {
      contactId: contactId,
      totalAmount: contractAmount,
      signedBy: signedBy,
    };

    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '60vw',
      maxWidth: '1000px',
      height: 'auto',
      maxHeight: '90vh',
      data: {
        config: this.contractFormConfig,
        initialData: initialValues,
      },
      disableClose: true,
      panelClass: 'agreement-dialog',
      backdropClass: 'agreement-dialog-backdrop',
    });
    const componentInstance = dialogRef.componentInstance;
    componentInstance.formSubmit.subscribe((formData: any) => {
      const mergedFormData = {
        ...formData,
        contactId: formData.contactId || initialValues.contactId,
        totalAmount: formData.totalAmount || initialValues.totalAmount,
        signedBy: formData.signedBy || initialValues.signedBy,
      };
      this.createContract(mergedFormData, dialogRef);
    });
    dialogRef.afterClosed().subscribe(() => {});
  }

  // =================================== createContract ======================================
  createContract(formData: any, dialogRef?: any): void {
    const formDataToSend = this.prepareFormData(formData);

    this._contractService.createContract(formDataToSend).subscribe({
      next: (res) => {
        // ----------- add new contract to list --------------
        if (res && res.succeeded && res.data) {
          const newContract: IGetAllContract = {
            contactId: formData.contactId || res.data.contactId,
            contactName: res.data.contactName || '',
            contactPhone: res.data.contactPhone || '',
            assignedAt: res.data.assignedAt || new Date().toISOString(),
            contractAmount:
              formData.totalAmount || res.data.contractAmount || 0,
          };

          // ----------- add new contract to list --------------
          this.listContracts = [newContract, ...this.listContracts];

          // ----------- update total count --------------
          this.totalCount = this.listContracts.length;
        } else {
          this.getAllContracts();
        }

        if (dialogRef) {
          dialogRef.close();
        }
      },
      error: (err) => {
        console.error('Error creating contract:', err);
      },
    });
  }

  // =================================== prepareFormData ======================================
  private prepareFormData(formData: any): FormData {
    const fd = new FormData();

    if (formData.contactId !== undefined && formData.contactId !== null) {
      fd.append('contactId', formData.contactId.toString());
    }

    if (formData.status !== undefined && formData.status !== null) {
      fd.append('status', formData.status.toString());
    }

    if (formData.totalAmount !== undefined && formData.totalAmount !== null) {
      fd.append('totalAmount', formData.totalAmount.toString());
    }

    if (formData.signedBy) {
      const username = this._authService.getUsername();
      if (username) {
        fd.append('signedBy', username);
      }
    }

    if (formData.expirationDate) {
      const dateValue =
        formData.expirationDate instanceof Date
          ? formData.expirationDate.toISOString()
          : formData.expirationDate;
      fd.append('expirationDate', dateValue);
    }

    // PdfFileName مطلوب من API ولا يمكن أن يكون NULL
    if (formData.contractWordFile instanceof File) {
      const fileName = formData.contractWordFile.name;
      fd.append('PdfFileName', fileName);

      // إضافة الملف
      fd.append('contractWordFile', formData.contractWordFile, fileName);
    } else {
      fd.append('PdfFileName', '');
    }

    return fd;
  }
}
