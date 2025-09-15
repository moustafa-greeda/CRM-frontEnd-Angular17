import { Component, OnInit, Inject } from '@angular/core';
import { BaseStepComponent } from '../base-step.component';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-step10',
  templateUrl: './step10.component.html',
  styleUrls: ['./step10.component.css', '../shared-styles.css']
})
export class Step10Component extends BaseStepComponent implements OnInit {

  constructor(@Inject(ErrorHandlerService) errorHandler: ErrorHandlerService) {
    super(errorHandler);
  }

  override ngOnInit(): void {
  }
}
