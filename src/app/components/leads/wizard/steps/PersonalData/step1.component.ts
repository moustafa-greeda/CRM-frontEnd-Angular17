import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseStepComponent } from '../base-step.component';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { IEntryChanel } from '../../../../../core/Models/common/entry-chanel';
import { IndustryService } from '../../../../../core/services/common/industry.service';
import { EntryChanelService } from '../../../../../core/services/common/entry-chanel.service';
import { IIndustry } from '../../../../../core/Models/common/iIndustry';
import { Subscription } from 'rxjs';
import { LeadStatusService } from '../../../../../core/services/common/lead-status.service';
import { IClientSource } from '../../../../../core/Models/common/iclient-source';
import { MatDialog } from '@angular/material/dialog';
import {
  CompanyLookupDialogComponent,
  CompanyLookupRecord,
} from './company-lookup-dialog/company-lookup-dialog.component';
import { CountryCityService } from '../../../../../core/services/common/country-city.service';

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrls: ['./step1.component.css', '../shared-styles.css'],
})
export class Step1Component
  extends BaseStepComponent
  implements OnInit, OnDestroy
{
  industryList: IIndustry[] = [];
  entryChanelList: IEntryChanel[] = [];
  clientSourceList: IClientSource[] = [];
  @Input() override wizardComponent?: any;
  @Input() jobLevels: any[] = []; // Job levels from wizard component
  @Input() countries: any[] = []; // Countries from wizard component
  @Input() cities: any[] = []; // Cities from wizard component

  avatarImage: string = 'assets/img/avatar-male.svg';
  selectedCompanyName: string = '';
  countryList: any[] = [];
  cityList: any[] = [];

  private genderSubscription?: Subscription;

  constructor(
    @Inject(ErrorHandlerService) errorHandler: ErrorHandlerService,
    private industryService: IndustryService,
    private entryChanelService: EntryChanelService,
    private leadStatusService: LeadStatusService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private countryCityService: CountryCityService
  ) {
    super(errorHandler);
    this.initializeForm();
  }

  override ngOnInit(): void {
    this.getIndustryList();
    this.getClientSourceList();
    this.getEntryChanelList();
    // this.getCompanyList();

    // Register this step component with the wizard
    if (this.wizardComponent) {
      this.wizardComponent.registerStepComponent(0, this);
    }

    // Initialize countries and cities
    if (this.countries && this.countries.length > 0) {
      this.countryList = this.countries;
    }
    if (this.cities && this.cities.length > 0) {
      this.cityList = this.cities;
    }

    // Subscribe to gender changes to update avatar
    this.genderSubscription = this.form
      .get('gender')
      ?.valueChanges.subscribe((gender) => {
        this.updateAvatarImage(gender);
      });

    this.syncSelectedCompanyFromControl();

    // Set initial avatar based on current gender value
    const initialGender = this.form.get('gender')?.value;
    this.updateAvatarImage(initialGender);
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.genderSubscription) {
      this.genderSubscription.unsubscribe();
    }
  }

  // Update avatar image based on gender
  private updateAvatarImage(gender: string): void {
    if (gender === 'female') {
      this.avatarImage = 'assets/img/avatar-female.svg';
    } else {
      this.avatarImage = 'assets/img/avatar-male.svg';
    }
    this.cdr.detectChanges();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      email: ['', [Validators.required, Validators.email]],
      source: ['', [Validators.required]],
      clientSource: ['', [Validators.required]],
      industry: ['', [Validators.required]],
      companyName: [''],
      jobTitle: ['', [Validators.required]],
      jobLevel: ['', [Validators.required]],
      language: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      // Step2 fields (Address)
      country: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: [''], // Optional field (commented out in HTML)
      addressLine: ['', Validators.required],
      notes: [''],
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

  // ============================= Get Client Source List =============================
  getClientSourceList() {
    this.leadStatusService.getAllClientSource().subscribe((res) => {
      this.clientSourceList = res.data || [];
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
    this.selectedCompanyName = '';
  }

  // Method to set form values (useful for editing)
  setFormValues(data: any): void {
    this.form.patchValue(data);
    this.syncSelectedCompanyFromControl();
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

  // Get avatar image based on gender (getter for template)
  getAvatarImage(): string {
    return this.avatarImage;
  }

  openCompanyLookup(): void {
    const currentCompanyId =
      Number(this.form.get('companyName')?.value) || null;
    this.wizardComponent?.setOutsideCloseEnabled(false);
    const dialogRef = this.dialog.open(CompanyLookupDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        selectedCompanyId: currentCompanyId,
      },
      panelClass: 'agreement-dialog-panel',
    });

    dialogRef.afterClosed().subscribe((company: CompanyLookupRecord | null) => {
      this.wizardComponent?.setOutsideCloseEnabled(true);
      if (company) {
        this.form.patchValue({ companyName: company.id });
        this.selectedCompanyName = company.name;
        this.onFieldChange('companyName');
        this.cdr.detectChanges();
      }
    });
  }

  private syncSelectedCompanyFromControl(): void {
    const controlValue = this.form.get('companyName')?.value;
    if (!controlValue) {
      this.selectedCompanyName = '';
      return;
    }

    const companyId = Number(controlValue);
    if (!isNaN(companyId)) {
      // Company name will be set when company is selected from dialog
      // If we need to fetch it, we would need to call the API here
      // For now, if it's just an ID, we'll leave it empty until selected
      if (!this.selectedCompanyName) {
        this.selectedCompanyName = '';
      }
    } else if (typeof controlValue === 'string') {
      this.selectedCompanyName = controlValue;
    } else {
      this.selectedCompanyName = '';
    }
  }

  // Step2 methods (Address)
  onCountryChange(event: any): void {
    const countryId = event.target.value;
    if (countryId) {
      // Use wizard's city loading method
      if (this.wizardComponent) {
        this.wizardComponent.loadCitiesByCountryId(Number(countryId));
      }
      // Clear city selection when country changes
      this.form.get('city')?.setValue('');
    } else {
      // Clear city list when no country is selected
      this.cityList = [];
      this.form.get('city')?.setValue('');
    }
    // Call the base class method for form handling
    this.onFieldChange('country');
  }

  // Method to update cities when loaded from wizard
  updateCities(cities: any[]): void {
    this.cityList = cities;
  }

  // Method to update countries when loaded from wizard
  updateCountries(countries: any[]): void {
    this.countryList = countries;
    this.countries = countries; // Also update the input property
  }
}
