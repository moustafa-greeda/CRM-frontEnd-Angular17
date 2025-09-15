import { Component, OnInit, Inject } from '@angular/core';
import { BaseStepComponent } from '../base-step.component';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.css', '../shared-styles.css']
})
export class Step2Component extends BaseStepComponent implements OnInit {

  constructor(@Inject(ErrorHandlerService) errorHandler: ErrorHandlerService) {
    super(errorHandler);
  }

  override ngOnInit(): void {
  }
}
