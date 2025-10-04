import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { FilterService } from '../../../core/services/filter.service';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-chart-feedback',
  templateUrl: './chart-feedback.component.html',
  styleUrl: './chart-feedback.component.css',
})
export class ChartFeedbackComponent implements OnInit {
  private readonly _FilterService = inject(FilterService);

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  public map: any;
  public mapError: boolean = false;
  private markers: any[] = [];
  private L: any;

  UnGetLead?: Subscription;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  ngOnInit() {
    this.calculatePercentage();
  }

  // ========================================== Custom Funnel Data ==========================================
  funnelStages = [
    { label: 'Applications', y: 4871, width: 100 },
    { label: 'Screened', y: 2996, width: 95 },
    { label: 'Qualified', y: 1298, width: 85 },
    { label: 'Interviewed', y: 918, width: 75 },
    { label: 'Offers Extended', y: 251, width: 60 },
    { label: 'Filled', y: 181, width: 45 },
  ];

  // ========================================== Funnel Chart ==========================================
  chartFunnel = {
    animationEnabled: true,
    backgroundColor: '#11181F', // خلفية داكنة
    title: {
      text: 'Funnel Analysis',
      fontColor: '#FFF',
      fontSize: 18,
    },
    data: [
      {
        type: 'funnel',
        indexLabel: '{label} - {y}',
        toolTipContent: '{label}: {y} ({percentage}%)',
        neckWidth: 0,
        neckHeight: 0,
        valueRepresents: 'area',
        gapRatio: 0.4,
        showInLegend: false,
        click: null,
        indexLabelFontColor: '#FFF',
        indexLabelFontSize: 14,
        dataPoints: [] as any[],
      },
    ],
    interactivityEnabled: false,
  };

  // ========================================== Percentage Calculation ==========================================
  calculatePercentage = () => {
    let total = this.funnelStages[0].y;
    this.chartFunnel.data[0].dataPoints = this.funnelStages.map((stage, i) => {
      const percentage = i === 0 ? 100 : ((stage.y / total) * 100).toFixed(2);
      return {
        ...stage,
        percentage,
        color: '#FF5F00',
      };
    });
  };

  // Industry data for legend
  industryData = [
    {
      name: 'تقنية وإتصالات',
      percentage: 25,
      color: '#FF5F00',
      isHighlighted: false,
    },
    {
      name: 'التعليم والتدريب',
      percentage: 20,
      color: '#8B0000',
      isHighlighted: false,
    },
    {
      name: 'صحة وجمال',
      percentage: 17,
      color: '#9CF0FF',
      isHighlighted: false,
    },
    {
      name: 'أغذية ومشروبات',
      percentage: 15,
      color: '#46E3FF',
      isHighlighted: false,
    },
    {
      name: 'أزياء وموضة',
      percentage: 13,
      color: '#1E40AF',
      isHighlighted: false,
    },
    {
      name: 'منزل وديكور',
      percentage: 10,
      color: '#E0F2FE',
      isHighlighted: false,
    },
  ];

  doughnutOptions = {
    animationEnabled: true,
    backgroundColor: '#11181F',
    title: {
      text: 'Distribution Of Industries',
      fontColor: '#FFF',
      fontSize: 18,
      padding: '5',
    },

    data: [
      {
        type: 'doughnut',
        indexLabelFontColor: '#FFF',
        indexLabelFontSize: 16,
        dataPoints: [
          { label: 'تجارة', y: 40, color: '#FF5F00' },
          { label: 'خدمات', y: 25, color: 'rgba(156, 240, 255, 1)' }, // أزرق
          { label: 'صناعة', y: 20, color: 'rgba(70, 227, 255, 1)' }, // أخضر
          { label: 'زراعة', y: 15, color: 'rgba(255, 156, 97, 1)' }, // ذهبي
        ],
      },
    ],
  };

  lineOptions = {
    animationEnabled: true,
    backgroundColor: '#11181F',
    title: {
      text: 'Which locations have the highest number of clients?',
      fontColor: '#FFF',
      fontSize: 18,
      padding: '5',
    },
    axisX: {
      title: 'عدد العملاء',
      titleFontColor: '#FFF',
      labelFontColor: '#FFF',
    },
    axisY: {
      title: 'موقع العملاء',
      titleFontColor: '#FFF',
      labelFontColor: '#FFF',
    },

    data: [
      {
        type: 'line',
        color: '#5fe5ff',
        markerSize: 6,
        dataPoints: [
          { label: '2021', y: 120, color: '#FF5F00' },
          { label: '2022', y: 180 },
          { label: '2023', y: 250 },
          { label: '2024', y: 310 },
          { label: '2025', y: 400 },
        ],
      },
    ],
  };

  columnChartOptions = {
    animationEnabled: true,
    backgroundColor: '#11181F',
    title: {
      text: 'Which Job title have the largest number of clients?',
      fontColor: '#FFF',
      fontSize: 18,
    },
    axisX: {
      title: 'عدد العملاء',
      titleFontColor: '#FFF',
      labelFontColor: '#FFF',
      gridThickness: 0,
      interval: 5,
    },
    axisY: {
      labelFontColor: '#FFF',
      gridThickness: 0,
    },
    data: [
      {
        type: 'bar', // change from "column" to "bar"
        color: '#FF5F00',
        dataPointWidth: 20,
        dataPoints: [
          { label: 'تجارة', y: 50, color: '#FF5F00' },
          { label: 'صناعة', y: 30, color: 'rgba(156, 240, 255, 1)' },
          { label: 'خدمات', y: 40, color: 'rgba(70, 227, 255, 1)' },
          { label: 'زراعة', y: 20, color: 'rgba(255, 156, 97, 1)' },
          { label: 'نقل', y: 28 },
          { label: 'صيانة', y: 18 },
          { label: 'مطاعم', y: 35 },
          { label: 'تعليم', y: 22 },
        ],
      },
    ],
  };

  extraChartOptions1 = {
    animationEnabled: true,
    backgroundColor: '#11181F',
    title: { text: 'Distribution Of Clients', fontColor: '#FFF', fontSize: 18 },
    data: [
      {
        type: 'pie',
        indexLabelFontColor: '#FFF',
        indexLabel: '{label}: {y}%',
        toolTipContent: '{label}: {y}%',
        dataPoints: [
          { label: 'مصر', y: 30, color: '#FF5F00' },
          { label: 'السعودية', y: 25, color: '#058197' },
          { label: 'الإمارات', y: 20, color: '#46E3FF' },
          { label: 'قطر', y: 15, color: '#FF9C61' },
          { label: 'الكويت', y: 10, color: '#76EAFF' },
        ],
      },
    ],
  };
  // ===== Charts configs =====
  lineChartOptions = {
    animationEnabled: true,
    backgroundColor: '#11181F',
    title: {
      text: 'Count of Clients by Year, Quarter, Month and Day',
      fontColor: '#FFF',
      fontSize: 18,
      horizontalAlign: 'center',
      padding: '20',
    },
    axisY: {
      title: 'المبيعات',
      titleFontColor: '#FFF',
      labelFontColor: '#FFF',
      gridThickness: 0,
    },
    axisX: { labelFontColor: '#FFF', gridThickness: 0 },
    data: [
      {
        type: 'area',
        color: '#76EAFF',
        markerSize: 6,
        dataPoints: [
          { x: new Date(2025, 0, 1), y: 500 },
          { x: new Date(2025, 1, 1), y: 800 },
          { x: new Date(2025, 2, 1), y: 600 },
          { x: new Date(2025, 3, 1), y: 1200 },
          { x: new Date(2025, 4, 1), y: 1500 },
        ],
      },
    ],
  };

  ngAfterViewInit() {
    // Initialize map only in browser
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initMap();
      }, 500);
    }
  }

  // Initialize Leaflet map
  private async initMap(): Promise<void> {
    if (this.mapContainer && isPlatformBrowser(this.platformId)) {
      try {
        // Dynamically import Leaflet only in browser
        const L = await import('leaflet');
        this.L = L.default;

        // Fix for default markers in Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Create map centered on Middle East
        this.map = L.map(this.mapContainer.nativeElement, {
          center: [25.0, 45.0], // Center on Middle East
          zoom: 4,
          zoomControl: true,
          attributionControl: false,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(this.map);

        // Add markers for each country in the table data
        this.addMarkersToMap();

        // Force map to resize after a short delay
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        }, 100);
      } catch (error) {
        this.mapError = true;
      }
    }
  }

  // Add markers based on table data
  private addMarkersToMap(): void {
    if (!this.map || !this.L) return;

    // Country coordinates mapping
    const countryCoordinates: { [key: string]: [number, number] } = {
      مصر: [26.8206, 30.8025],
      السعودية: [23.8859, 45.0792],
      الإمارات: [23.4241, 53.8478],
      قطر: [25.3548, 51.1839],
      الكويت: [29.3117, 47.4818],
    };

    // Clear existing markers
    this.markers.forEach((marker) => this.map?.removeLayer(marker));
    this.markers = [];

    // Add markers for each unique country
    const uniqueCountries = [
      ...new Set(this.tableData.map((item) => item.country)),
    ];

    uniqueCountries.forEach((country) => {
      const coords = countryCoordinates[country];
      if (coords) {
        const marker = this.L.marker(coords, {
          icon: this.L.icon({
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            iconUrl:
              'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl:
              'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          }),
        });

        // Count clients in this country
        const clientCount = this.tableData.filter(
          (item) => item.country === country
        ).length;

        marker.bindPopup(`
          <div style="text-align: center; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${country}</h3>
            <p style="margin: 0; color: #666;">عدد العملاء: <strong>${clientCount}</strong></p>
          </div>
        `);

        if (this.map) {
          marker.addTo(this.map);
          this.markers.push(marker);
        }
      }
    });
  }

  // أي Resize يحصل للويندو → نعمل Resize للـ Chart
  @HostListener('window:resize')
  onResize() {
    // CanvasJS charts handle resize automatically
    // Only need to handle map resize
    if (this.map && isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 100);
    }
  }

  // ===== Table Data =====
  tableData = [
    {
      name: 'أحمد علي',
      email: 'ahmed@mail.com',
      phone: '0112345678',
      country: 'مصر',
      city: 'القاهرة',
      company: 'شركة أكس',
      field: 'تجارة',
      industry: 'تكنولوجيا',
    },
    {
      name: 'محمد علي',
      email: 'Mohamed@mail.com',
      phone: '0112345679',
      country: 'مصر',
      city: 'دمياط',
      company: 'شركة النور',
      field: 'خدمات',
      industry: 'صناعة',
    },
    {
      name: 'فاطمة محمد',
      email: 'Fatma@mail.com',
      phone: '0123456789',
      country: 'مصر',
      city: 'الإسكندرية',
      company: 'ديجيتال برو',
      field: 'تسويق',
      industry: 'تجارة',
    },
    {
      name: 'يوسف حسن',
      email: 'Yousef@mail.com',
      phone: '0112233445',
      country: 'الإمارات',
      city: 'دبي',
      company: 'غلف تك',
      field: 'تكنولوجيا',
      industry: 'خدمات',
    },
    {
      name: 'سارة كريم',
      email: 'Sara@mail.com',
      phone: '0101122334',
      country: 'السعودية',
      city: 'الرياض',
      company: 'سعودي سوفت',
      field: 'برمجيات',
      industry: 'خدمات',
    },
  ];

  // Method to toggle industry highlight
  toggleIndustryHighlight(industry: any) {
    industry.isHighlighted = !industry.isHighlighted;
  }
}
