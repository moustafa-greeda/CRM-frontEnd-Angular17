import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

import { ReportAiComponent } from './components/report-ai/report-ai.component';
import { ActiviteisComponent } from './components/activiteis/activiteis.component';
import { NotesComponent } from './components/notes/notes.component';
import { CallsComponent } from './components/calls/calls.component';
import { FilesComponent } from './components/files/files.component';
import { MailsComponent } from './components/mails/mails.component';

@NgModule({
  declarations: [
    ReportAiComponent,
    ActiviteisComponent,
    NotesComponent,
    CallsComponent,
    FilesComponent,
    MailsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SharedComponentsModule,
  ],
})
export class FollowUpTeleModule {}
