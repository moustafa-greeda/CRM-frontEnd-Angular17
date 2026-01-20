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
// ----------------- liberary for phone number validation -----------------
import {
  parsePhoneNumberFromString,
  isValidPhoneNumber,
  CountryCode,
} from 'libphonenumber-js';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

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
  currentCountryIsoCode?: string;
  currentCountryPhonePrefix?: string;
  // خريطة أطوال أرقام الهاتف المتوقعة لكل دولة (أكملها حسب احتياجك)
  private readonly countryPhoneLengthMap: Record<string, number> = {
    SA: 9, // السعودية: 9 أرقام بعد كود الدولة
    EG: 10, // مصر (مثال)
    AE: 9,
  };

  private genderSubscription?: Subscription;

  constructor(
    @Inject(ErrorHandlerService) errorHandler: ErrorHandlerService,
    private industryService: IndustryService,
    private entryChanelService: EntryChanelService,
    private leadStatusService: LeadStatusService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {
    super(errorHandler);
    this.initializeForm();
  }

  override ngOnInit(): void {
    this.getIndustryList();
    this.getClientSourceList();
    this.getEntryChanelList();

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

  //======================= Method to validate phone number =======================
  // دالة التحقق من رقم الهاتف بناءً على `isoCode`
  phoneNumberValidator(countryCode: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // لا تحقق إذا كانت القيمة فارغة
      }

      const cc = this.toCountryCode(countryCode);
      if (!cc) {
        return { invalidPhoneNumber: true };
      }

      const phoneNumber = parsePhoneNumberFromString(control.value, cc);
      if (phoneNumber && isValidPhoneNumber(control.value, cc)) {
        return null; // رقم الهاتف صالح
      }

      return { invalidPhoneNumber: true }; // رقم الهاتف غير صالح
    };
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
    const data = { ...this.form.value };

    // دمج كود الدولة مع رقم الهاتف قبل الإرسال
    const rawPhone = (data.phone || '').toString().trim();
    const prefix = this.currentCountryPhonePrefix || '';

    if (rawPhone && prefix) {
      const normalizedPrefix = prefix.startsWith('+') ? prefix : `+${prefix}`;

      // لو المستخدم كتب الكود بنفسه ما نكررش
      if (!rawPhone.startsWith(normalizedPrefix)) {
        data.phone = `${normalizedPrefix}${rawPhone}`;
      }
    }

    return data;
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

  override getErrorMessage(fieldName: string): string {
    const baseMessage = super.getErrorMessage(fieldName) || '';

    if (fieldName !== 'phone') {
      return baseMessage;
    }

    const control = this.form.get('phone');
    if (!control || !control.touched || !control.errors) {
      return baseMessage;
    }

    if (control.hasError('required')) {
      return 'رقم الهاتف مطلوب';
    }

    if (control.hasError('pattern')) {
      return 'صيغة رقم الهاتف غير صحيحة';
    }

    if (control.hasError('invalidPhoneNumber')) {
      return 'رقم الهاتف غير صالح بالنسبة للدولة المختارة';
    }

    return baseMessage;
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
      if (!this.selectedCompanyName) {
        this.selectedCompanyName = '';
      }
    } else if (typeof controlValue === 'string') {
      this.selectedCompanyName = controlValue;
    } else {
      this.selectedCompanyName = '';
    }
  }

  onCountryChange(event: any): void {
    const countryId = event.target.value;

    // استخرج الدولة المختارة
    let isoCode: string | undefined;
    let phonePrefix: string | undefined;
    const selectedCountry = this.countryList.find(
      (c: any) => String(c.id) === String(countryId)
    );
    if (selectedCountry) {
      isoCode =
        selectedCountry.iso_2 ||
        selectedCountry.iso_3 ||
        selectedCountry.isoCode ||
        undefined;
      phonePrefix =
        selectedCountry.keyCode || selectedCountry.iso_numeric || undefined;
    }
    this.currentCountryIsoCode = isoCode;
    this.currentCountryPhonePrefix = phonePrefix;

    // تحديث التحقق من رقم الهاتف بناءً على كود الدولة (بدون حقن البادئة في قيمة الحقل)
    const phoneControl = this.form.get('phone');
    if (phoneControl) {
      const validators = [
        Validators.required,
        Validators.pattern(/^[0-9+\-\s()]+$/),
      ] as ValidatorFn[];

      if (isoCode) {
        validators.push(this.phoneNumberValidator(isoCode));
      }

      phoneControl.setValidators(validators);
      phoneControl.updateValueAndValidity();
    }

    // تابع باقي المنطق لتحديث المدن والحقول الأخرى
    if (countryId) {
      if (this.wizardComponent) {
        this.wizardComponent.loadCitiesByCountryId(Number(countryId));
      }
      this.form.get('city')?.setValue('');
    } else {
      this.cityList = [];
      this.form.get('city')?.setValue('');
    }

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

  private toCountryCode(code: string): CountryCode | undefined {
    const normalized = (code || '').trim().toUpperCase();
    // libphonenumber-js CountryCode is ISO-2 (مثل SA, EG, AE)
    if (/^[A-Z]{2}$/.test(normalized)) {
      return normalized as CountryCode;
    }
    return undefined;
  }

  // Return numeric length of the current country's phone prefix (e.g. +966 -> 3)
  getCurrentCountryPhoneLength(): number | null {
    if (!this.currentCountryPhonePrefix) {
      return null;
    }
    const digitsOnly = String(this.currentCountryPhonePrefix).replace(
      /\D/g,
      ''
    );
    return digitsOnly.length || null;
  }

  // Return required national number length for current country (بدون كود الدولة)
  getRequiredNationalPhoneLength(): number | null {
    if (!this.currentCountryIsoCode) {
      return null;
    }
    const iso = this.currentCountryIsoCode.toUpperCase();
    return this.countryPhoneLengthMap[iso] ?? null;
  }
}
