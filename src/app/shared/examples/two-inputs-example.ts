import { formUiConfig } from '../interfaces/formUi.interface';

// Example configuration showing how to use two-inputs field type
export const twoInputsExampleConfig: formUiConfig = {
  title: 'مثال على حقلين في مساحة واحدة',
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
      name: 'email',
      label: 'البريد الإلكتروني',
      type: 'email',
      placeholder: 'ادخل البريد الإلكتروني',
      required: true,
      colSpan: 1,
    },
    {
      name: 'phoneAndAge',
      label: 'الهاتف والعمر',
      type: 'two-inputs',
      colSpan: 2,
      input1: {
        name: 'phone',
        label: 'رقم الهاتف',
        type: 'text',
        placeholder: 'ادخل رقم الهاتف',
        required: true,
      },
      input2: {
        name: 'age',
        label: 'العمر',
        type: 'number',
        placeholder: 'ادخل العمر',
        required: true,
      },
    },
    {
      name: 'salaryAndStatus',
      label: 'المرتب والحالة',
      type: 'two-inputs',
      colSpan: 2,
      input1: {
        name: 'salary',
        label: 'المرتب',
        type: 'text',
        placeholder: 'ادخل المرتب',
        required: true,
      },
      input2: {
        name: 'status',
        label: 'الحالة',
        type: 'select',
        placeholder: 'اختر الحالة',
        required: true,
        options: [
          { value: 'active', label: 'نشط' },
          { value: 'inactive', label: 'غير نشط' },
        ],
      },
    },
    {
      name: 'address',
      label: 'العنوان',
      type: 'textarea',
      placeholder: 'ادخل العنوان',
      colSpan: 3,
      required: true,
    },
  ],
};

// Example of how to use the form in a component
export class TwoInputsExampleUsage {
  formConfig = twoInputsExampleConfig;

  onFormSubmit(formData: any): void {
    console.log('Form submitted with data:', formData);

    // Handle individual field data
    console.log('Name:', formData.name);
    console.log('Email:', formData.email);
    console.log('Phone:', formData.phone);
    console.log('Age:', formData.age);
    console.log('Salary:', formData.salary);
    console.log('Status:', formData.status);
    console.log('Address:', formData.address);
  }
}
