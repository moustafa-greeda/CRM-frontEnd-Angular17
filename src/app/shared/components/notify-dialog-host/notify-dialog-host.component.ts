import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { NotifyDialogData, NotifyDialogService } from './notify-dialog.service';

@Component({
  selector: 'app-notify-dialog-host',
  templateUrl: './notify-dialog-host.component.html',
  styleUrls: ['./notify-dialog-host.component.css'],
})
export class NotifyDialogHostComponent implements OnInit, OnDestroy {
  data: NotifyDialogData | null = null;
  private sub?: Subscription;
  private autoCloseSub?: Subscription;

  constructor(private notify: NotifyDialogService) {}

  ngOnInit(): void {
    this.sub = this.notify.state$.subscribe((d) => {
      if (!d) {
        this.data = null;
        return;
      }

      const autoCloseMs = d.autoCloseMs ?? 2000;
      // Ensure imageUrl is set
      const dataWithImage = {
        ...d,
        autoCloseMs,
        imageUrl: d.imageUrl || 'assets/logo.svg',
      };
      this.data = dataWithImage;

      this.autoCloseSub?.unsubscribe();
      if (autoCloseMs && autoCloseMs > 0) {
        this.autoCloseSub = timer(autoCloseMs).subscribe(() => this.close());
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.autoCloseSub?.unsubscribe();
  }

  close() {
    this.notify.close();
  }

  backdropClick() {
    if (!this.data?.disableBackdropClose) {
      this.close();
    }
  }

  get displayTitle(): string {
    if (!this.data) return '';
    if (this.data.type === 'success') {
      return this.data.title || 'نجاح';
    }
    if (this.data.type === 'error') {
      return this.data.title || 'خطأ';
    }
    return this.data.title ?? '';
  }

  get iconName() {
    return this.data?.type === 'success'
      ? 'bi:check-circle-fill'
      : 'bi:x-circle-fill';
  }

  get autoVars() {
    const ms = this.data?.autoCloseMs ?? 0;
    return ms > 0 ? { '--nd-auto-duration': `${ms}ms` } : {};
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
      console.warn('Failed to load image:', img.src);
    }
  }
}
