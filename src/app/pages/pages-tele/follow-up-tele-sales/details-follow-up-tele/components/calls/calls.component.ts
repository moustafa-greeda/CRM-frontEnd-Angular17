import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ICall } from '../../../interfaces/ICall';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calls',
  templateUrl: './calls.component.html',
  styleUrls: ['./calls.component.css', '../notes/notes.component.css'],
   standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],

})
export class CallsComponent implements OnInit {
  callList: ICall[] = [];
  isLoading: boolean = false;
  callForm!: FormGroup;
  constructor(private _fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCalls();
  }
  initForm(): void {
    this.callForm = this._fb.group({
      note: ['', [Validators.required]],
      dateTime: ['', [Validators.required]],
    });
  }
  loadCalls(): void {
    this.isLoading = true;
    this.callList = [
      {
        id: 1,
        note: 'المكالمة 1',
        dateTime: '2024-01-01 10:00',
        status: 'منتهية',
      },
      {
        id: 2,
        note: 'المكالمة 2',
        dateTime: '2024-01-01 11:00',
        status: 'منتهية',
      },
      {
        id: 3,
        note: 'المكالمة 3',
        dateTime: '2024-01-01 12:00',
        status: 'مؤجلة',
      },
      {
        id: 4,
        note: 'المكالمة 4',
        dateTime: '2024-01-01 13:00',
        status: 'منتهية',
      },
      {
        id: 5,
        note: 'المكالمة 5',
        dateTime: '2024-01-01 14:00',
        status: 'مؤجلة',
      },
    ];
  }
  // ============================== track by call id ===============================
  trackByCallId(index: number, call: ICall): number {
    return call.id;
  }
  // ============================== on submit call ===============================

  // ============================== on edit call ===============================
  onEditCall(callId: number): void {
    console.log(callId);
  }
}
