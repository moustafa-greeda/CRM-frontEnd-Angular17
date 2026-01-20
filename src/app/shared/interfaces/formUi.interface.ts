export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'number'
    | 'textarea'
    | 'select'
    | 'date'
    | 'datetime-local'
    | 'radio'
    | 'checkbox'
    | 'file'
    | 'two-inputs';
  required?: boolean;
  placeholder?: string;
  options?: { value: any; label: string }[];
  colSpan?: number; // For grid layout (1-3)
  accept?: string; // For file input (e.g., 'image/*', '.pdf')
  hidden?: boolean; // Hide field from form
  disabled?: boolean; // Disable field
  pattern?: string | RegExp;
  minLength?: number;
  maxLength?: number;
  patternErrorMessage?: string;
  input1?: {
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    options?: { value: any; label: string }[];
    pattern?: string | RegExp;
    minLength?: number;
    maxLength?: number;
    patternErrorMessage?: string;
  };
  input2?: {
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    options?: { value: any; label: string }[];
    pattern?: string | RegExp;
    minLength?: number;
    maxLength?: number;
    patternErrorMessage?: string;
  };
}

export interface formUiConfig {
  title: string;
  subtitle?: string;
  fields: FormField[];
  submitText?: string;
  cancelText?: string;
}

// Backwards-compatible alias used by components expecting AgreementFormConfig
// export type AgreementFormConfig = formUiConfig;
