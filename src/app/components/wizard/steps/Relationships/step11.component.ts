import { Component, OnInit, Inject } from '@angular/core';
import { BaseStepComponent } from '../base-step.component';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-step11',
  templateUrl: './step11.component.html',
  styleUrls: ['./step11.component.css', '../shared-styles.css']
})
export class Step11Component extends BaseStepComponent implements OnInit {

  constructor(@Inject(ErrorHandlerService) errorHandler: ErrorHandlerService) {
    super(errorHandler);
  }

  override ngOnInit(): void {
  }
}
