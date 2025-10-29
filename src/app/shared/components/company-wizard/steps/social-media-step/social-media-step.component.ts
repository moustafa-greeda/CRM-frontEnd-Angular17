import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-social-media-step',
  templateUrl: './social-media-step.component.html',
  styleUrls: ['./social-media-step.component.css'],
})
export class SocialMediaStepComponent implements OnInit {
  @Input() form!: FormGroup;
  @Output() stepValid = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => {
      this.validateStep();
    });

    this.validateStep();
  }

  private validateStep(): void {
    // Social media fields are optional, so always valid
    this.stepValid.emit(true);
  }
}
