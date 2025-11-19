import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-customization-step',
  templateUrl: './customization-step.component.html',
  styleUrls: ['./customization-step.component.css'],
})
export class CustomizationStepComponent implements OnInit {
  @Input() form!: FormGroup;
  @Output() stepValid = new EventEmitter<boolean>();

  people = [
    { id: 'ahmed', name: 'احمد محسن', selected: false },
    { id: 'mazen', name: 'مازن محمد', selected: false },
    { id: 'omar', name: 'عمر إبراهيم', selected: false },
    { id: 'ibrahim', name: 'إبراهيم محمد', selected: false },
    { id: 'salwa', name: 'سلوي عثمان', selected: false },
    { id: 'tia', name: 'تيا سالم', selected: false },
    { id: 'majed', name: 'ماجد سلمان', selected: false },
    { id: 'marwan', name: 'مروان عمرو', selected: false },
  ];

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => {
      this.validateStep();
    });

    this.validateStep();
  }

  togglePerson(person: any): void {
    person.selected = !person.selected;
    this.updateSelectedPeople();
  }

  private updateSelectedPeople(): void {
    const selectedPeople = this.people
      .filter((p) => p.selected)
      .map((p) => p.id);
    this.form.patchValue({ selectedPeople });
  }

  private validateStep(): void {
    // Customization fields are optional, so always valid
    this.stepValid.emit(true);
  }
}
