import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface Msg {
  role: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.css'],
})
export class ChatDialogComponent {
  input = '';
  sending = false;
  msgs: Msg[] = [
    { role: 'bot', text: 'أهلًا بك 👋! أنا مساعد النظام، كيف أقدر أساعدك؟' },
  ];

  constructor(
    private dialogRef: MatDialogRef<ChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close() {
    this.dialogRef.close();
  }

  send() {
    const text = this.input.trim();
    if (!text) return;

    // أضف رسالة المستخدم
    this.msgs.push({ role: 'user', text });
    this.input = '';
    this.sending = true;

    // رد بوت تجريبي (بدلًا من API)
    setTimeout(() => {
      this.msgs.push({
        role: 'bot',
        text: `لقد قلت: "${text}". (رد تجريبي 🤖)`,
      });
      this.sending = false;

      // scroll لآخر رسالة
      setTimeout(() => {
        const el = document.querySelector('.chat-messages');
        el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      });
    }, 800);
  }

  onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }
}
