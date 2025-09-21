import { Component, ElementRef, inject, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { FilterService } from '../../core/services/filter.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboardnew',
  templateUrl: './dashboardnew.component.html',
  styleUrl: './dashboardnew.component.css'
})
export class DashboardnewComponent implements OnInit, OnDestroy, AfterViewInit {

  private readonly _FilterService = inject(FilterService);

  UnGetCompany?: Subscription;
  UnGetLead?: Subscription;

  // ===== Charts configs =====
  lineChartOptions = {
    animationEnabled: true,
    backgroundColor: "rgba(17, 24, 31, 0.9)",
    title: { text: "تطور المبيعات", fontColor: "#FFF", fontSize: 18 },
    axisY: { title: "المبيعات", titleFontColor: "#FFF", labelFontColor: "#FFF", gridThickness: 0 },
    axisX: { labelFontColor: "#FFF", gridThickness: 0 },
    data: [{
      type: "area",
      color: "#76EAFF",
      markerSize: 6,
      dataPoints: [
        { x: new Date(2025, 0, 1), y: 500 },
        { x: new Date(2025, 1, 1), y: 800 },
        { x: new Date(2025, 2, 1), y: 600 },
        { x: new Date(2025, 3, 1), y: 1200 },
        { x: new Date(2025, 4, 1), y: 1500 }
      ]
    }]
  };

  doughnutOptions = {
    animationEnabled: true,
    backgroundColor: "rgba(17, 24, 31, 0.9)",
    title: { text: "توزيع الصناعات", fontColor: "#FFF", fontSize: 18 },
    data: [{
      type: "doughnut",
      dataPoints: [
        { label: "تجارة", y: 40, color: "#FF5F00" },
        { label: "خدمات", y: 25, color: "#058197" },
        { label: "صناعة", y: 20, color: "#46E3FF" },
        { label: "زراعة", y: 15, color: "#76EAFF" }
      ]
    }]
  };

  lineOptions = {
    animationEnabled: true,
    backgroundColor: "rgba(17, 24, 31, 0.9)",
    title: { text: "عدد العملاء السنوي", fontColor: "#FFF", fontSize: 18 },
    data: [{
      type: "line",
      color: "#FF9C61",
      markerSize: 6,
      dataPoints: [
        { label: "2021", y: 120 },
        { label: "2022", y: 180 },
        { label: "2023", y: 250 },
        { label: "2024", y: 310 },
        { label: "2025", y: 400 }
      ]
    }]
  };

  columnChartOptions = {
    animationEnabled: true,
    backgroundColor: "rgba(17, 24, 31, 0.9)",
    title: { text: "أكثر مجال يمتلك عملاء", fontColor: "#FFF", fontSize: 18 },
    axisY: { title: "عدد العملاء", titleFontColor: "#FFF", labelFontColor: "#FFF", gridThickness: 0 },
    axisX: { labelFontColor: "#FFF", gridThickness: 0 },
    data: [{
      type: "column",
      color: "#FF5F00",
      dataPoints: [
        { label: "تجارة", y: 50 },
        { label: "صناعة", y: 30 },
        { label: "خدمات", y: 40 },
        { label: "زراعة", y: 20 },
        { label: "نقل", y: 28 },
        { label: "صيانة", y: 18 },
        { label: "مطاعم", y: 35 },
        { label: "تعليم", y: 22 }
      ]
    }]
  };

  extraChartOptions1 = {
    animationEnabled: true,
    backgroundColor: "rgba(17, 24, 31, 0.9)",
    title: { text: "نسبة العملاء حسب الدولة", fontColor: "#FFF", fontSize: 18 },
    data: [{
      type: "pie",
      indexLabel: "{label}: {y}%",
      toolTipContent: "{label}: {y}%",
      dataPoints: [
        { label: "مصر", y: 30, color: "#FF5F00" },
        { label: "السعودية", y: 25, color: "#058197" },
        { label: "الإمارات", y: 20, color: "#46E3FF" },
        { label: "قطر", y: 15, color: "#FF9C61" },
        { label: "الكويت", y: 10, color: "#76EAFF" }
      ]
    }]
  };

  extraChartOptions2 = {
    animationEnabled: true,
    backgroundColor: "rgba(17, 24, 31, 0.9)",
    title: { text: "تطور الأرباح", fontColor: "#FFF", fontSize: 18 },
    axisY: { title: "الأرباح", titleFontColor: "#FFF", labelFontColor: "#FFF", gridThickness: 0 },
    axisX: { labelFontColor: "#FFF", gridThickness: 0 },
    data: [{
      type: "splineArea",
      color: "#058197",
      markerSize: 6,
      dataPoints: [
        { x: new Date(2025, 0, 1), y: 100 },
        { x: new Date(2025, 1, 1), y: 300 },
        { x: new Date(2025, 2, 1), y: 200 },
        { x: new Date(2025, 3, 1), y: 500 },
        { x: new Date(2025, 4, 1), y: 700 }
      ]
    }]
  };

  // ===== Table Data =====
  tableData = [
    { name: "أحمد علي", email: "ahmed@mail.com", phone: "0112345678", country: "مصر", city: "القاهرة", company: "شركة أكس", field: "تجارة", industry: "تكنولوجيا" },
    { name: "محمد علي", email: "Mohamed@mail.com", phone: "0112345679", country: "مصر", city: "دمياط", company: "شركة النور", field: "خدمات", industry: "صناعة" },
    { name: "فاطمة محمد", email: "Fatma@mail.com", phone: "0123456789", country: "مصر", city: "الإسكندرية", company: "ديجيتال برو", field: "تسويق", industry: "تجارة" },
    { name: "يوسف حسن", email: "Yousef@mail.com", phone: "0112233445", country: "الإمارات", city: "دبي", company: "غلف تك", field: "تكنولوجيا", industry: "خدمات" },
    { name: "سارة كريم", email: "Sara@mail.com", phone: "0101122334", country: "السعودية", city: "الرياض", company: "سعودي سوفت", field: "برمجيات", industry: "خدمات" }
  ];

  // ===== Form & Progress =====
  dasBoardForm!: FormGroup;
  stepsCount = 7;       // عدد الدواير
  currentStep = 1;      // البداية من أول دايرة

  constructor(private el: ElementRef, private fb: FormBuilder) {}

  ngOnInit(): void {
    // API Calls
    this.UnGetCompany = this._FilterService.getCompanyStage().subscribe({
      next: (res) => console.log("one end point", res),
      error: (err: HttpErrorResponse) => console.log(err)
    });

    this.UnGetLead = this._FilterService.getLeadStatus().subscribe({
      next: (res) => console.log("end point two", res),
      error: (err: HttpErrorResponse) => console.log(err)
    });

    // Create Form
    this.dasBoardForm = this.fb.group({
      name: [null, [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      mobilePhone: [null, [Validators.required, Validators.pattern(/^(?:01[0125]\d{8}|\+201[0125]\d{8})$/)]],
      age: [null, [Validators.required, Validators.min(18), Validators.max(70)]],
      birthday: [null, [Validators.required]],
      customerType: [null, [Validators.required]],
      country: [null, [Validators.required]],
      city: [null, [Validators.required]]
    });

    this.dasBoardForm.valueChanges.subscribe(() => this.updateProgress());
  }

  ngAfterViewInit(): void {
    const steps = Array.from(this.el.nativeElement.querySelectorAll('.step')) as HTMLElement[];
    const lines = Array.from(this.el.nativeElement.querySelectorAll('.line')) as HTMLElement[];
    const duck = this.el.nativeElement.querySelector('#duck') as HTMLElement;

    // أول دايرة active
    steps[0].classList.add('active');

    // خلي البطة تبدأ فوق أول رقم
    this.moveDuck(duck, steps[0]);
  }

  ngOnDestroy(): void {
    this.UnGetCompany?.unsubscribe();
    this.UnGetLead?.unsubscribe();
  }

  private moveDuck(duck: HTMLElement, targetStep: HTMLElement) {
    const stepRect = targetStep.getBoundingClientRect();
    const barRect = targetStep.parentElement!.getBoundingClientRect();

    const centerX = stepRect.left - barRect.left + stepRect.width / 2 - duck.offsetWidth / 2;
    duck.style.left = `${centerX}px`;

    duck.classList.add('jump');
    setTimeout(() => duck.classList.remove('jump'), 700);
  }

  updateProgress(): void {
    const controls: AbstractControl[] = Object.values(this.dasBoardForm.controls);
    let filled = 0;

    controls.forEach(control => {
      if (control.value && control.value.toString().trim() !== '') {
        filled++;
      }
    });

    this.currentStep = Math.min(filled + 1, this.stepsCount);
    this.jumpDuck();
  }

  jumpDuck(): void {
    const duck = document.getElementById('duck');
    if (duck) {
      duck.classList.add('jump');
      setTimeout(() => duck.classList.remove('jump'), 600);
    }
  }
}