import { Component, OnInit, Inject } from '@angular/core';
import { BaseStepComponent } from '../base-step.component';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-step5',
  templateUrl: './step5.component.html',
  styleUrls: ['./step5.component.css', '../shared-styles.css']
})
export class Step5Component extends BaseStepComponent implements OnInit {

  constructor(@Inject(ErrorHandlerService) errorHandler: ErrorHandlerService) {
    super(errorHandler);
  }

  override ngOnInit(): void {
  }
}
