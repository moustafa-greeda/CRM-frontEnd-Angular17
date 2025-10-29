import { Component, OnInit, OnChanges, Inject, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BaseStepComponent } from '../base-step.component';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ICountry } from '../../../../core/Models/common/icountry';
import { ICity } from '../../../../core/Models/common/country-city.models';
import { CountryCityService } from '../../../../core/services/common/country-city.service';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.css', '../shared-styles.css'],
})
export class Step2Component
  extends BaseStepComponent
  implements OnInit, OnChanges
{
  @Input() override wizardComponent?: any;
  @Input() countries: any[] = []; // Countries from wizard component
  @Input() cities: any[] = []; // Cities from wizard component
  countryList: ICountry[] = [];
  cityList: ICity[] = [];

  constructor(
    @Inject(ErrorHandlerService) errorHandler: ErrorHandlerService,
    private _CountryCityService: CountryCityService,
    private fb: FormBuilder
  ) {
    super(errorHandler);
    this.initializeForm();
  }

  override ngOnInit(): void {
    console.log('Step2 ngOnInit called', {
      wizardComponent: this.wizardComponent,
      countries: this.countries,
      form: this.form,
    });

    // Register this step component with the wizard
    if (this.wizardComponent) {
      this.wizardComponent.registerStepComponent(1, this);
      console.log('Step2 registered with wizard');
    } else {
      console.log('No wizard component available for Step2');
    }

    // Check if countries are already available
    if (this.countries && this.countries.length > 0) {
      this.countryList = this.countries;
      console.log(
        'Step2: Countries already available in ngOnInit:',
        this.countryList
      );
    }
  }

  // Update countries when input changes
  ngOnChanges(): void {
    console.log('Step2 ngOnChanges called', {
      countries: this.countries,
      countriesLength: this.countries?.length,
      countryListLength: this.countryList?.length,
    });
    if (this.countries && this.countries.length > 0) {
      this.countryList = this.countries;
      console.log('Step2 countries updated in ngOnChanges:', this.countryList);
    } else {
      console.log('Step2: No countries available in ngOnChanges');
    }
  }

  // Method to update cities when loaded from wizard
  updateCities(cities: any[]): void {
    this.cityList = cities;
  }

  // Method to update countries when loaded from wizard
  updateCountries(countries: any[]): void {
    this.countryList = countries;
    this.countries = countries; // Also update the input property
    console.log(
      'Step2: Countries updated via updateCountries method:',
      this.countryList
    );
    console.log('Step2: Countries input property updated:', this.countries);
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      country: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      addressLine: ['', Validators.required],
    });
    console.log('Step2 form initialized:', {
      form: this.form,
      valid: this.form.valid,
      status: this.form.status,
    });
  }
  getCountryList() {
    this._CountryCityService.getAllCountries().subscribe((res) => {
      this.countryList = res.data;
      console.log('countryList', res.data);
    });
  }
  // get city list by country id
  getCityList(countryId: number) {
    this._CountryCityService
      .getCitiesByCountryId(countryId)
      .subscribe((res) => {
        this.cityList = res.data;
        console.log('cityList', res.data);
      });
  }

  // Handle country selection change
  onCountryChange(event: any) {
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

  // Method to get form data
  getFormData() {
    if (!this.form) {
      console.log('Step2 form not initialized yet in getFormData');
      return {};
    }
    return this.form.value;
  }

  // Method to check if form is valid
  isFormValid(): boolean {
    if (!this.form) {
      console.log('Step2 form not initialized yet');
      return false;
    }

    const isValid = this.form.valid;
    console.log('Step2 form validation:', {
      valid: isValid,
      formValue: this.form.value,
      formErrors: this.getFormErrors(),
      formStatus: this.form.status,
      formTouched: this.form.touched,
      formDirty: this.form.dirty,
      controlsStatus: this.getControlsStatus(),
    });
    return isValid;
  }

  // Helper method to get controls status
  private getControlsStatus(): any {
    const status: any = {};
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      if (control) {
        status[key] = {
          valid: control.valid,
          invalid: control.invalid,
          touched: control.touched,
          dirty: control.dirty,
          value: control.value,
          errors: control.errors,
        };
      }
    });
    return status;
  }

  // Helper method to get form errors
  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  // Method to mark all fields as touched for validation display
  markAllFieldsAsTouched(): void {
    if (!this.form) {
      console.log('Step2 form not initialized yet in markAllFieldsAsTouched');
      return;
    }
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  // Method to reset form
  resetForm(): void {
    if (!this.form) {
      console.log('Step2 form not initialized yet in resetForm');
      return;
    }
    this.form.reset();
  }
}
