import { formUiConfig } from '../interfaces/formUi.interface';

// Example configuration showing how to use radio and checkbox fields
export const exampleFormConfig: formUiConfig = {
  title: 'مثال على النموذج مع Radio و Checkbox',
  subtitle: 'هذا مثال يوضح كيفية استخدام الحقول الجديدة',
  fields: [
    {
      name: 'name',
      label: 'الاسم',
      type: 'text',
      required: true,
      placeholder: 'أدخل اسمك',
      colSpan: 2,
    },
    {
      name: 'email',
      label: 'البريد الإلكتروني',
      type: 'email',
      required: true,
      placeholder: 'أدخل بريدك الإلكتروني',
      colSpan: 1,
    },
    {
      name: 'gender',
      label: 'الجنس',
      type: 'radio',
      required: true,
      options: [
        { value: 'male', label: 'ذكر' },
        { value: 'female', label: 'أنثى' },
        { value: 'other', label: 'آخر' },
      ],
      colSpan: 3,
    },
    {
      name: 'interests',
      label: 'الاهتمامات',
      type: 'checkbox',
      required: false,
      options: [
        { value: 'sports', label: 'الرياضة' },
        { value: 'music', label: 'الموسيقى' },
        { value: 'reading', label: 'القراءة' },
        { value: 'travel', label: 'السفر' },
        { value: 'cooking', label: 'الطبخ' },
        { value: 'technology', label: 'التكنولوجيا' },
      ],
      colSpan: 3,
    },
    {
      name: 'country',
      label: 'البلد',
      type: 'select',
      required: true,
      placeholder: 'اختر البلد',
      options: [
        { value: 'sa', label: 'السعودية' },
        { value: 'ae', label: 'الإمارات' },
        { value: 'kw', label: 'الكويت' },
        { value: 'qa', label: 'قطر' },
        { value: 'bh', label: 'البحرين' },
        { value: 'om', label: 'عمان' },
      ],
      colSpan: 2,
    },
    {
      name: 'birthDate',
      label: 'تاريخ الميلاد',
      type: 'date',
      required: true,
      colSpan: 1,
    },
    {
      name: 'comments',
      label: 'تعليقات إضافية',
      type: 'textarea',
      required: false,
      placeholder: 'اكتب أي تعليقات إضافية هنا...',
      colSpan: 3,
    },
    {
      name: 'profileImage',
      label: 'صورة الملف الشخصي',
      type: 'file',
      accept: 'image/*',
      colSpan: 2,
      required: false,
    },
    {
      name: 'isActive',
      label: 'الحالة',
      type: 'radio',
      required: true,
      colSpan: 3,
      options: [
        { value: true, label: 'نشط' },
        { value: false, label: 'غير نشط' },
      ],
    },
  ],
  submitText: 'حفظ البيانات',
  cancelText: 'إلغاء',
};

// Example of how to use the form in a component
export class FormExampleUsage {
  formConfig = exampleFormConfig;

  onFormSubmit(formData: any): void {
    console.log('Form submitted with data:', formData);

    // Handle radio button data
    console.log('Selected gender:', formData.gender);

    // Handle checkbox data - this will be an array of boolean values
    // You need to map it back to the actual values
    const selectedInterests = this.getSelectedCheckboxValues(
      formData.interests
    );
    console.log('Selected interests:', selectedInterests);

    // Handle file data
    if (formData.profileImage) {
      console.log('Profile image file:', formData.profileImage);
      console.log('File name:', formData.profileImage.name);
      console.log('File size:', formData.profileImage.size);
      console.log('File type:', formData.profileImage.type);
    }

    // Handle radio button data
    console.log('Is active:', formData.isActive);
  }

  private getSelectedCheckboxValues(checkboxArray: boolean[]): string[] {
    const selectedValues: string[] = [];
    const interestsField = this.formConfig.fields.find(
      (f) => f.name === 'interests'
    );

    if (interestsField?.options) {
      checkboxArray.forEach((isChecked, index) => {
        if (isChecked && interestsField.options![index]) {
          selectedValues.push(interestsField.options![index].value);
        }
      });
    }

    return selectedValues;
  }
}
