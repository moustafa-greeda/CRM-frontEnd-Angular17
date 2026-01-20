import { Component, OnDestroy, OnInit, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { timer } from 'rxjs';
import { NotifyDialogData, NotifyDialogService } from './notify-dialog.service';

@Component({
  selector: 'app-notify-dialog-host',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './notify-dialog-host.component.html',
  styleUrls: ['./notify-dialog-host.component.css'],
})
export class NotifyDialogHostComponent implements OnInit, OnDestroy {
  data: NotifyDialogData | null = null;
  private readonly destroyRef = inject(DestroyRef);

  constructor(private notify: NotifyDialogService) {}

  ngOnInit(): void {
    this.notify.state$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((d) => {
        if (!d) {
          this.data = null;
          return;
        }

        const autoCloseMs = d.autoCloseMs ?? 6000;
        // Ensure imageUrl is set
        const dataWithImage = {
          ...d,
          autoCloseMs,
          imageUrl: d.imageUrl || 'assets/logo.svg',
        };
        this.data = dataWithImage;

        if (autoCloseMs && autoCloseMs > 0) {
          timer(autoCloseMs)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.close());
        }
      });
  }

  ngOnDestroy(): void {
    // Cleanup is handled automatically by takeUntilDestroyed
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
      ? 'bi bi-check-circle-fill'
      : 'bi bi-x-circle-fill';
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
