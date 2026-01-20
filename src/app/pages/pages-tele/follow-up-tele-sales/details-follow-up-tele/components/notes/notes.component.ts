import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';

interface Note {
  id: number;
  note: string;
  dateTime: string;
}

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css',
})
export class NotesComponent implements OnInit {
  noteForm!: FormGroup;
  notesList: Note[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.loadNotes();
  }

  initForm(): void {
    this.noteForm = this.fb.group({
      note: ['', [Validators.required]],
      dateTime: [new Date().toISOString().slice(0, 16)],
    });
  }

  onNoteSubmit(): void {
    if (this.noteForm.valid) {
      const newNote: Note = {
        id: Date.now(), // Temporary ID, replace with actual ID from API
        note: this.noteForm.value.note,
        dateTime: this.noteForm.value.dateTime,
      };
      this.notesList.unshift(newNote); // Add to beginning of array
      this.noteForm.reset({
        dateTime: new Date().toISOString().slice(0, 16),
      });
      // TODO: Call API to save note
    }
  }

  loadNotes(): void {
    // TODO: Load notes from API
    this.notesList = [
      {
        id: 1,
        note: 'الملاحظة 1 هذه الملاحظة هي لاختبار الملاحظات الملاحظة 1 هذه الملاحظة هي لاختبار الملاحظات',
        dateTime: '2024-01-01 10:00',
      },
      {
        id: 2,
        note: 'الملاحظة 2 هذه الملاحظة هي لاختبار الملاحظات الملاحظة 2 هذه الملاحظة هي لاختبار الملاحظات',
        dateTime: '2024-01-01 11:00',
      },
      {
        id: 3,
        note: 'الملاحظة 3',
        dateTime: '2024-01-01 12:00',
      },
      {
        id: 4,
        note: 'الملاحظة 4',
        dateTime: '2024-01-01 13:00',
      },
      {
        id: 5,
        note: 'الملاحظة 5',
        dateTime: '2024-01-01 14:00',
      },
    ];
  }

  trackByNoteId(index: number, note: Note): number {
    return note.id;
  }
  // ============================== on submit note ===============================
  onSubmitNote(): void {
    if (this.noteForm.valid) {
      const note = this.noteForm.value;
      console.log(note);
    }
  }

  // =============================== on edit note ================================
  onEditNote(noteId: number): void {
    const note = this.notesList.find((note) => note.id === noteId);
    if (note) {
      this.noteForm.patchValue({
        note: note.note,
        dateTime: note.dateTime,
      });
    }
    this.noteForm.enable();
  }
}
