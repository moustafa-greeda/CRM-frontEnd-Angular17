import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-address-step',
  templateUrl: './address-step.component.html',
  styleUrls: ['./address-step.component.css'],
})
export class AddressStepComponent implements OnInit {
  @Input() form!: FormGroup;
  @Output() stepValid = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => {
      this.validateStep();
    });

    this.validateStep();
  }

  private validateStep(): void {
    const isValid =
      (this.form.get('address')?.valid ?? false) &&
      (this.form.get('city')?.valid ?? false) &&
      (this.form.get('country')?.valid ?? false);

    this.stepValid.emit(isValid);
  }
}
