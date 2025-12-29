import { formUiConfig } from '../interfaces/formUi.interface';

export const CONTRACT_FORM_CONFIG: formUiConfig = {
  title: 'إضافة عقد جديد',
  submitText: 'حفظ',
  cancelText: 'إلغاء',
  fields: [
    {
      name: 'status',
      label: 'الحالة',
      type: 'select',
      required: true,
      colSpan: 1,
    },
    {
      name: 'expirationDate',
      label: 'تاريخ الانتهاء',
      type: 'date',
      required: true,
      colSpan: 1,
    },

    {
      name: 'contractWordFile',
      label: 'ملف العقد',
      type: 'file',
      required: true,
      accept: '.docx, .doc, .pdf',
      colSpan: 2,
    },
  ],
};
