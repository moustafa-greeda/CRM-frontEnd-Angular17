export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'number';
  required?: boolean;
}
