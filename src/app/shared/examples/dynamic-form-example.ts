import { formUiConfig } from '../interfaces/formUi.interface';
import { IDepartment } from '../../core/Models/common/idepartment';

// Example showing how to create dynamic form configurations with API data
export class DynamicFormExample {
  formConfig: formUiConfig = {
    title: 'نموذج ديناميكي',
    submitText: 'حفظ',
    cancelText: 'إلغاء',
    fields: [
      {
        name: 'name',
        label: 'الاسم',
        type: 'text',
        placeholder: 'ادخل الاسم',
        required: true,
        colSpan: 1,
      },
      {
        name: 'department',
        label: 'القسم',
        type: 'select',
        placeholder: 'اختر القسم',
        required: true,
        colSpan: 1,
        options: [], // Will be populated from API
      },
      {
        name: 'status',
        label: 'الحالة',
        type: 'select',
        placeholder: 'اختر الحالة',
        required: true,
        colSpan: 1,
        options: [], // Will be populated from API
      },
    ],
  };

  departmentsList: IDepartment[] = [];
  statusList: any[] = [];

  // Method to update department options from API data
  updateDepartmentOptions(): void {
    const departmentField = this.formConfig.fields.find(
      (field) => field.name === 'department'
    );
    if (departmentField && this.departmentsList.length > 0) {
      departmentField.options = this.departmentsList.map((dept) => ({
        value: dept.id,
        label: dept.name,
      }));
      console.log('Department options updated:', departmentField.options);
    }
  }

  // Method to update status options from API data
  updateStatusOptions(): void {
    const statusField = this.formConfig.fields.find(
      (field) => field.name === 'status'
    );
    if (statusField && this.statusList.length > 0) {
      statusField.options = this.statusList.map((status) => ({
        value: status.id,
        label: status.name,
      }));
      console.log('Status options updated:', statusField.options);
    }
  }

  // Method to update all dynamic options
  updateAllDynamicOptions(): void {
    this.updateDepartmentOptions();
    this.updateStatusOptions();
  }

  // Method to get field options by name
  getFieldOptions(fieldName: string): { value: any; label: string }[] {
    const field = this.formConfig.fields.find((f) => f.name === fieldName);
    return field?.options || [];
  }

  // Method to add new option to a field
  addFieldOption(fieldName: string, value: any, label: string): void {
    const field = this.formConfig.fields.find((f) => f.name === fieldName);
    if (field) {
      if (!field.options) {
        field.options = [];
      }
      field.options.push({ value, label });
    }
  }

  // Method to clear field options
  clearFieldOptions(fieldName: string): void {
    const field = this.formConfig.fields.find((f) => f.name === fieldName);
    if (field) {
      field.options = [];
    }
  }
}
