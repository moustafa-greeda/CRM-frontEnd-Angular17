import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  NgZone,
} from '@angular/core';

@Directive({ 
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  @Output() appClickOutside = new EventEmitter<Event>();

  constructor(
    private host: ElementRef<HTMLElement>,
    private ngZone: NgZone
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Use requestAnimationFrame to defer the check and improve INP
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const target = event.target as HTMLElement | null;
        if (!target) return;
        if (!this.host.nativeElement.contains(target)) {
          this.ngZone.run(() => {
            this.appClickOutside.emit(event);
          });
        }
      });
    });
  }
}
