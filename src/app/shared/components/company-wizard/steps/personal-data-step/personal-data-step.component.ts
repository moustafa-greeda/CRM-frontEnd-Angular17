import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-personal-data-step',
  templateUrl: './personal-data-step.component.html',
  styleUrls: ['./personal-data-step.component.css'],
})
export class PersonalDataStepComponent implements OnInit {
  @Input() form!: FormGroup;
  @Output() stepValid = new EventEmitter<boolean>();

  ngOnInit(): void {
    // Watch for form changes to validate step
    this.form.valueChanges.subscribe(() => {
      this.validateStep();
    });

    // Initial validation
    this.validateStep();
  }

  private validateStep(): void {
    const isValid =
      (this.form.get('companyName')?.valid ?? false) &&
      (this.form.get('email')?.valid ?? false) &&
      (this.form.get('phoneNumber')?.valid ?? false) &&
      (this.form.get('industry')?.valid ?? false) &&
      (this.form.get('rating')?.valid ?? false) &&
      (this.form.get('responsibleEmployee')?.valid ?? false) &&
      (this.form.get('source')?.valid ?? false);

    this.stepValid.emit(isValid);
  }
}
