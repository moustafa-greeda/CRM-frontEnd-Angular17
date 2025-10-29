# Company Wizard Steps

This directory contains all the step components for the company wizard form.

## Structure

Each step is organized in its own folder with the following files:
- `{step-name}.component.ts` - Component logic
- `{step-name}.component.html` - Template
- `{step-name}.component.css` - Styles
- `index.ts` - Export file for clean imports

## Steps

### 1. Personal Data Step (`personal-data-step/`)
- Company name, email, phone
- Rating, industry, responsible employee
- Source selection, notes
- All required fields with validation

### 2. Address Step (`address-step/`)
- Address, city, country fields
- Required validation for all fields
- Single column layout

### 3. Social Media Step (`social-media-step/`)
- Facebook, LinkedIn, Twitter, Instagram
- Snapchat, Skype, WhatsApp, TikTok
- Website URL field
- All optional fields

### 4. Customization Step (`customization-step/`)
- First name input
- Access level radio buttons (General/Private/Select Person)
- People selection with checkboxes
- Interactive person selection grid

## Usage

Import steps from the main index:
```typescript
import { 
  PersonalDataStepComponent,
  AddressStepComponent,
  SocialMediaStepComponent,
  CustomizationStepComponent
} from './steps';
```

Or import individual steps:
```typescript
import { PersonalDataStepComponent } from './steps/personal-data-step';
```
