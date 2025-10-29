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
    | 'radio'
    | 'checkbox'
    | 'file'
    | 'two-inputs';
  required?: boolean;
  placeholder?: string;
  options?: { value: any; label: string }[];
  colSpan?: number; // For grid layout (1-3)
  accept?: string; // For file input (e.g., 'image/*', '.pdf')
  input1?: {
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    options?: { value: any; label: string }[];
  };
  input2?: {
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    options?: { value: any; label: string }[];
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
