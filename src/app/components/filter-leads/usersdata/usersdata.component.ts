








import { Component, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-usersdata',
  templateUrl: './usersdata.component.html',
  styleUrls: ['./usersdata.component.css']
})
export class UsersdataComponent implements AfterViewInit {
  @ViewChildren('stepRef') stepRefs!: QueryList<ElementRef>;

  steps = Array.from({ length: 15 }, (_, i) => i + 1);

  currentStep = 0;
  markerLeft = 0;

  showFilters = false;
  filterOptions = [' الاشخاص', ' الشركات', ' بيانات تقنية', 'السلوك' , 'القدرة الشرائية' , 'نوايا شرائية' , 'البعد النفسي'];

  ngAfterViewInit() {
    this.moveMarkerToStep(this.currentStep);
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  selectOption(i: number) {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.moveMarkerToStep(this.currentStep);
    }
  }

moveMarkerToStep(index: number) {
  const stepElements = this.stepRefs.toArray();
  const targetRef = stepElements[index];
  if (!targetRef) return;

  const targetEl = targetRef.nativeElement as HTMLElement;
  const swords = targetEl.querySelector('.swords') as HTMLElement;
  if (!swords) return;

  const containerRect = targetEl.parentElement?.getBoundingClientRect() as DOMRect;
  const swordRect = swords.getBoundingClientRect();

  // مركز السيف
  const centerX = swordRect.left + swordRect.width / 2;
  const markerWidth = 60;
  this.markerLeft = centerX - containerRect.left - markerWidth / 2;

  // نضيف كلاس "jump" ونشيله بعد الأنيميشن
  const markerEl = document.querySelector('.marker') as HTMLElement;
  if (markerEl) {
    markerEl.classList.add('jump');
    setTimeout(() => markerEl.classList.remove('jump'), 400); // نفس زمن الأنيميشن
  }
}
}




