import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormUiComponent } from '../../../shared/components/form-ui/form-ui.component';
import { COMPANY_FORM_CONFIG } from '../../../shared/configs';
import { ICompanyFilter } from '../../../core/Models/common/icompanies';
import { IIndustry } from '../../../core/Models/common/iIndustry';

export interface FormConfig {
  fields: any[];
  title?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyFormHandler {
  private companyFormConfig: FormConfig = { ...COMPANY_FORM_CONFIG };

  constructor(private dialog: MatDialog) {}

  openForm(
    company: ICompanyFilter | null,
    data: {
      industries: IIndustry[];
      companySizes: any[];
      companyStages: any[];
      ownerships: any[];
      countries: any[];
      cityList: any[];
      countryPrefixMap: Map<number, string>;
    },
    callbacks: {
      onLoadCities: (countryId: number) => void;
      onSubmit: (formData: any, isEdit: boolean, companyId?: number) => void;
    }
  ): MatDialogRef<FormUiComponent> {
    const isEditMode = !!company && !!company.id;

    // Update form config with options
    this.updateFormOptions(data);

    const formConfig = {
      ...this.companyFormConfig,
      title: isEditMode ? 'تعديل شركة' : 'إضافة شركة جديدة',
    };

    let initialData: Record<string, any> | undefined;

    if (isEditMode && company) {
      initialData = this.mapCompanyToFormData(company, data);
      if (initialData['counteryId']) {
        callbacks.onLoadCities(initialData['counteryId']);
      }
    } else {
      this.disableCityField(formConfig, true);
    }

    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '80vw',
      maxWidth: '1000px',
      height: 'auto',
      maxHeight: '90vh',
      data: {
        config: formConfig,
        ...(initialData && { initialData }),
      },
      disableClose: true,
      panelClass: 'agreement-dialog',
      backdropClass: 'agreement-dialog-backdrop',
    });

    // Handle form submission
    const componentInstance = dialogRef.componentInstance;
    componentInstance.formSubmit.subscribe((formData: any) => {
      callbacks.onSubmit(formData, isEditMode, company?.id);
    });

    // Setup form watchers
    this.setupFormWatchers(
      componentInstance,
      isEditMode,
      initialData,
      data.countryPrefixMap,
      callbacks.onLoadCities
    );

    return dialogRef;
  }

  private updateFormOptions(data: {
    industries: IIndustry[];
    companySizes: any[];
    companyStages: any[];
    ownerships: any[];
    countries: any[];
  }): void {
    this.updateFieldOptions(
      'industeryId',
      data.industries.map((industry) => ({
        value: industry.id,
        label: industry.name,
      }))
    );
    this.updateFieldOptions(
      'companySizeId',
      data.companySizes.map((size) => ({
        value: size.id,
        label: size.sizeName,
      }))
    );
    this.updateFieldOptions(
      'companyStageId',
      data.companyStages.map((stage) => ({
        value: stage.id,
        label: stage.name,
      }))
    );
    this.updateFieldOptions(
      'ownershipId',
      data.ownerships.map((ownership) => ({
        value: ownership.id,
        label: ownership.type,
      }))
    );
    this.updateFieldOptions(
      'counteryId',
      data.countries.map((country) => ({
        value: country.id,
        label: country.name,
      }))
    );
  }

  private updateFieldOptions(fieldName: string, options: any[]): void {
    const field = this.companyFormConfig.fields.find(
      (f) => f.name === fieldName
    );
    if (field) {
      field.options = options;
    }
  }

  updateCityOptions(cities: any[]): void {
    const cityField = this.companyFormConfig.fields.find(
      (f) => f.name === 'cityId'
    );
    if (cityField) {
      cityField.options = cities.map((city) => ({
        value: city.id,
        label: city.name,
      }));
      cityField.disabled = cities.length === 0;
      cityField.placeholder =
        cities.length === 0 ? 'يجب اختيار الدولة أولاً' : 'إختر المدينة';
    }
  }

  private disableCityField(config: FormConfig, disable: boolean): void {
    const cityField = config.fields.find((f) => f.name === 'cityId');
    if (cityField) {
      cityField.disabled = disable;
      cityField.placeholder = disable
        ? 'يجب اختيار الدولة أولاً'
        : 'إختر المدينة';
    }
  }

  private mapCompanyToFormData(
    company: ICompanyFilter,
    data: {
      industries: IIndustry[];
      countries: any[];
      cityList: any[];
      countryPrefixMap: Map<number, string>;
    }
  ): Record<string, any> {
    let phonePrefix = '';
    let phoneNumber = '';

    if (company.phoneNumber) {
      const phoneMatch = company.phoneNumber.match(/^(\+\d+)\s*(.+)$/);
      if (phoneMatch) {
        phonePrefix = phoneMatch[1];
        phoneNumber = phoneMatch[2];
      } else {
        phoneNumber = company.phoneNumber;
      }
    }

    const industry = data.industries.find(
      (ind) => ind.name === company.industeryName
    );
    const country = data.countries.find((c) => c.name === company.countryName);

    if (!phonePrefix && country?.id) {
      const countryPrefix = data.countryPrefixMap.get(country.id);
      if (countryPrefix) {
        phonePrefix = countryPrefix.startsWith('+')
          ? countryPrefix
          : `+${countryPrefix}`;
      }
    }

    let cityId = 0;
    if (company.cityName && country?.id) {
      const city = data.cityList.find((c) => c.name === company.cityName);
      cityId = city?.id || 0;
    }

    return {
      companyName: company.name || '',
      email: company.email || '',
      phonePrefix: phonePrefix,
      phoneNumber: phoneNumber,
      industeryId: industry?.id || 0,
      companySizeId: 0,
      companyStageId: 0,
      ownershipId: 0,
      counteryId: country?.id || 0,
      cityId: cityId,
      addressLine: company.addressLine || '',
    };
  }

  private setupFormWatchers(
    componentInstance: any,
    isEditMode: boolean,
    initialData: any,
    countryPrefixMap: Map<number, string>,
    onLoadCities: (countryId: number) => void
  ): void {
    setTimeout(() => {
      const form = componentInstance.form;
      if (!form) return;

      if (!isEditMode || !initialData?.['counteryId']) {
        form.get('cityId')?.disable();
      }

      form.get('phonePrefix')?.disable();

      const currentCountryId = form.get('counteryId')?.value;
      if (currentCountryId) {
        this.setPhonePrefix(Number(currentCountryId), form, countryPrefixMap);
      }

      form.get('counteryId')?.valueChanges.subscribe((countryId: any) => {
        if (countryId) {
          onLoadCities(Number(countryId));
          form.get('cityId')?.setValue('', { emitEvent: false });
          form.get('cityId')?.enable();
          this.setPhonePrefix(Number(countryId), form, countryPrefixMap);
        } else {
          onLoadCities(0);
          form.get('cityId')?.setValue('', { emitEvent: false });
          form.get('cityId')?.disable();
          this.clearPhonePrefix(form);
        }
      });
    }, 200);
  }

  private setPhonePrefix(
    countryId: number,
    form: any,
    countryPrefixMap: Map<number, string>
  ): void {
    const prefix = countryPrefixMap.get(countryId);
    if (prefix) {
      const prefixField = form.get('phonePrefix');
      if (prefixField) {
        const formattedPrefix = prefix.startsWith('+') ? prefix : `+${prefix}`;
        prefixField.setValue(formattedPrefix, { emitEvent: false });
      }
    }
  }

  private clearPhonePrefix(form: any): void {
    form.get('phonePrefix')?.setValue('', { emitEvent: false });
  }
}
