import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type DialogType = 'success' | 'error';

export interface NotifyDialogData {
  type: DialogType;
  title?: string;
  description?: string;
  imageUrl?: string;
  soundUrl?: string;
  iconName?: string;
  autoCloseMs?: number;
  disableBackdropClose?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotifyDialogService {
  readonly state$ = new BehaviorSubject<NotifyDialogData | null>(null);

  open(data: NotifyDialogData) {
    this.state$.next(data);
    return { close: () => this.close() };
  }

  close() {
    this.state$.next(null);
  }

  // success(opts: Omit<NotifyDialogData, 'type' | 'title' | 'iconName'>) {
  //   return this.open({
  //     type: 'success',
  //     title: opts.title ?? 'نجاح',
  //     iconName: 'bi:check-circle-fill', // ✅ أيقونة نجاح
  //     imageUrl: opts.imageUrl ?? 'assets/logo_elbatt.png',
  //     soundUrl: opts.soundUrl ?? 'assets/sound/duck.mp3',
  //     disableBackdropClose: opts.disableBackdropClose ?? false,
  //     ...opts,
  //   });
  // }

  // error(opts: Omit<NotifyDialogData, 'type' | 'title' | 'iconName'>) {
  //   return this.open({
  //     type: 'error',
  //     title: opts.title ?? 'خطأ',
  //     iconName: 'bi:x-circle-fill', // ✅ أيقونة خطأ
  //     imageUrl: opts.imageUrl ?? 'assets/logo_elbatt.png',
  //     soundUrl: opts.soundUrl ?? 'assets/sound/duck.mp3',
  //     disableBackdropClose: opts.disableBackdropClose ?? false,
  //     ...opts,
  //   });
  // }

  success(opts: Omit<NotifyDialogData, 'type' | 'iconName'>) {
    return this.open({
      type: 'success',
      title: opts.title ?? 'نجاح',
      iconName: 'bi:check-circle-fill',
      imageUrl: opts.imageUrl ?? 'assets/logo_elbatt.png',
      soundUrl: opts.soundUrl ?? 'assets/sound/duck.mp3',
      disableBackdropClose: opts.disableBackdropClose ?? false,
      ...opts,
      autoCloseMs: opts.autoCloseMs ?? 3000,
    });
  }

  error(opts: Omit<NotifyDialogData, 'type' | 'iconName'>) {
    return this.open({
      type: 'error',
      title: opts.title ?? 'خطأ',
      iconName: 'bi:x-circle-fill',
      imageUrl: opts.imageUrl ?? 'assets/logo_elbatt.png',
      soundUrl: opts.soundUrl ?? 'assets/sound/Failure_Alert.mp3',
      disableBackdropClose: opts.disableBackdropClose ?? false,
      ...opts,
      autoCloseMs: opts.autoCloseMs ?? 3000,
    });
  }
}
