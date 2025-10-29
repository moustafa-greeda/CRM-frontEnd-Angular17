import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseStepComponent } from '../base-step.component';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { IEntryChanel } from '../../../../core/Models/common/entry-chanel';
import { IndustryService } from './../../../../core/services/common/industry.service';
import { EntryChanelService } from './../../../../core/services/common/entry-chanel.service';
import { IIndustry } from '../../../../core/Models/common/iIndustry';
import { ICompanies } from '../../../../core/Models/common/icompanies';
import { GetAllCompaniseService } from '../../../../core/services/common/get-all-companise.service';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.css', '../shared-styles.css'],
})
export class Step1Component extends BaseStepComponent implements OnInit {
  industryList: IIndustry[] = [];
  entryChanelList: IEntryChanel[] = [];
  companyList: ICompanies[] = [];
  @Input() override wizardComponent?: any;
  @Input() jobLevels: any[] = []; // Job levels from wizard component

  constructor(
    @Inject(ErrorHandlerService) errorHandler: ErrorHandlerService,
    private industryService: IndustryService,
    private entryChanelService: EntryChanelService,
    private companyService: GetAllCompaniseService,
    private fb: FormBuilder
  ) {
    super(errorHandler);
    this.initializeForm();
  }

  override ngOnInit(): void {
    this.getIndustryList();
    this.getEntryChanelList();
    this.getCompanyList();

    // Register this step component with the wizard
    if (this.wizardComponent) {
      this.wizardComponent.registerStepComponent(0, this);
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      email: ['', [Validators.required, Validators.email]],
      source: ['', [Validators.required]],
      industry: ['', [Validators.required]],
      deal: [''],
      companyName: [''],
      jobTitle: ['', [Validators.required]],
      jobLevel: ['', [Validators.required]],
      // employee: ['', [Validators.required]],
      language: ['', [Validators.required]], // prefaredLanguage
      gender: ['', [Validators.required]], // gender field
    });
  }

  // ============================= Get Industry List =============================
  getIndustryList() {
    this.industryService.getAllIndustries().subscribe((res) => {
      this.industryList = res.message || [];
    });
  }

  // ============================= Get Entry Chanel List =============================
  getEntryChanelList() {
    this.entryChanelService.getAllEntryChanel().subscribe((res) => {
      this.entryChanelList = res.data || [];
    });
  }

  // ============================= Get Company List =============================
  getCompanyList() {
    this.companyService.getAllCompanise().subscribe((res) => {
      this.companyList = res.data || [];
    });
  }

  // Method to get form data
  getFormData() {
    return this.form.value;
  }

  // Method to check if form is valid
  isFormValid(): boolean {
    return this.form.valid;
  }

  // Method to mark all fields as touched for validation display
  markAllFieldsAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  // Method to reset form
  resetForm(): void {
    this.form.reset();
  }

  // Method to set form values (useful for editing)
  setFormValues(data: any): void {
    this.form.patchValue(data);
  }

  // Method to get specific field value
  getFieldValue(fieldName: string): any {
    return this.form.get(fieldName)?.value;
  }

  // Method to check if specific field is valid
  isFieldValid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.valid : false;
  }

  // Method to check if specific field has been touched
  isFieldTouched(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.touched : false;
  }
}
