import { Component, OnInit, Inject } from '@angular/core';
import { BaseStepComponent } from '../base-step.component';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.css', '../shared-styles.css']
})
export class Step3Component extends BaseStepComponent implements OnInit {

  constructor(@Inject(ErrorHandlerService) errorHandler: ErrorHandlerService) {
    super(errorHandler);
  }

  override ngOnInit(): void {
  }
}
