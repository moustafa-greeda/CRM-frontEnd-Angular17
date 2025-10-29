# Form Configurations

This folder contains all form configuration files for the application. Each configuration file exports a form configuration object that can be used with the `FormUiComponent`.

## Structure

- `employee-form.config.ts` - Configuration for employee forms
- `agreement-form.config.ts` - Configuration for agreement forms
- `index.ts` - Barrel export file for clean imports

## Usage

### Import a specific configuration:
```typescript
import { EMPLOYEE_FORM_CONFIG } from '../../../shared/configs/employee-form.config';
```

### Import from the barrel file:
```typescript
import { EMPLOYEE_FORM_CONFIG, FORM_UI_CONFIG } from '../../../shared/configs';
```

### Use in component:
```typescript
export class MyComponent {
  formConfig = EMPLOYEE_FORM_CONFIG;
  
  onFormSubmit(formData: any) {
    // Handle form submission
  }
}
```

## Adding New Form Configurations

1. Create a new `.config.ts` file in this folder
2. Import the `formUiConfig` interface
3. Export a constant with your configuration
4. Add the export to `index.ts`
5. Use the configuration in your component

## Configuration Structure

Each configuration follows the `formUiConfig` interface:

```typescript
export const MY_FORM_CONFIG: formUiConfig = {
  title: 'Form Title',
  subtitle: 'Optional subtitle',
  submitText: 'Submit',
  cancelText: 'Cancel',
  fields: [
    {
      name: 'fieldName',
      label: 'Field Label',
      type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'date' | 'radio' | 'checkbox',
      required: true,
      placeholder: 'Placeholder text',
      options: [{ value: 'value', label: 'Label' }], // For select, radio, checkbox
      colSpan: 1 // Grid column span (1-3)
    }
  ]
};
```
