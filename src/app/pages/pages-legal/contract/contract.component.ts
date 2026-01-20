import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../Auth/auth.service';
import { FormUiComponent } from '../../../shared/components/form-ui/form-ui.component';
import { formUiConfig } from '../../../shared/interfaces/formUi.interface';
import { ContractService } from './contract.service';
import { CONTRACT_FORM_CONFIG } from '../../../shared/configs/contract-form.config';
import { IContractStatus } from '../../../core/Models/common/IContractStatus';
import { IGetAllContract } from '../../../core/Models/contract/Icontract.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { TableComponent } from '../../../shared/components/table/table.component';

@Component({
  selector: 'app-contract',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    PageHeaderComponent,
    SearchInputComponent,
    TableComponent,
  ],
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.css', '../../../dashboard/sharedStyleDashboard.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractComponent implements OnInit {
  // ========================================
  // 🔧 Dependency Injection
  // ========================================
  private readonly _authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly _contractService = inject(ContractService);

  // ========================================
  // 📊 State Signals
  // ========================================
  readonly listContracts = signal<IGetAllContract[]>([]);
  readonly pageSize = signal<number>(10);
  readonly currentPage = signal<number>(1);
  readonly totalCount = signal<number>(0);
  readonly searchKeyword = signal<string>('');
  readonly selectedRows = signal<any[]>([]);
  readonly selectedContractStatus = signal<any>(null);
  readonly hasNoData = signal<boolean>(false);

  // ========================================
  // 📑 Static Data
  // ========================================
  readonly userInfo = computed(() => ({
    name: this._authService.getUsername() || 'المستخدم',
  }));

  contractStatusList: any[] = [];
  contractStatusListForForm: any[] = []; // قائمة الحالات للفورم مع id و name

  filterForm: FormGroup = new FormGroup({
    contractStatus: new FormControl(''),
  });
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

  // =================================== ngOnInit ======================================
  ngOnInit(): void {
    this.getContractStatusList();
    this.getAllContracts();
    this.setupFormStatusOptions();
  }
  readonly columns: {
    key: string;
    header: string;
    width?: string;
    formatter?: 'date' | 'datetime' | 'booleanYesNo';
  }[] = [
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
      pageIndex: this.currentPage(),
      pageSize: this.pageSize(),
      searchKeyword: this.searchKeyword() || undefined,
    };
    this._contractService.getAllContracts(filters).subscribe({
      next: (res) => {
        if (res && res.succeeded && res.data) {
          this.listContracts.set(res.data.items);
          this.totalCount.set(
            (res.data as any).totalCount || res.data.items.length
          );
          this.hasNoData.set(res.data.items.length === 0);
        } else {
          this.listContracts.set([]);
          this.totalCount.set(0);
          this.hasNoData.set(true);
        }
      },
      error: (err) => {
        console.error('Error fetching contracts:', err);
        this.listContracts.set([]);
        this.totalCount.set(0);
        this.hasNoData.set(true);
      },
    });
  }
  // =================================== onContractStatusChange ===========================
  onContractStatusChange(event: any): void {
    this.selectedContractStatus.set(event);
  }
  // =================================== onPageChange ======================================
  onPageChange(event: any): void {
    this.currentPage.set(event.pageIndex + 1);
    this.getAllContracts();
  }
  // =================================== onPageSizeChange =================================
  onPageSizeChange(event: any): void {
    this.pageSize.set(event);
    this.currentPage.set(1); // Reset to first page when page size changes
    this.getAllContracts();
  }
  // =================================== onFilterSubmit ======================================
  onFilterSubmit(): void {
    this.currentPage.set(1);
    this.getAllContracts();
  }
  // =================================== onSearch ======================================
  onSearch(event: string): void {
    this.searchKeyword.set(event || '');
    this.currentPage.set(1); // Reset to first page on search
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
          this.listContracts.set([newContract, ...this.listContracts()]);

          // ----------- update total count --------------
          this.totalCount.set(this.listContracts().length);
          this.hasNoData.set(false);
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
