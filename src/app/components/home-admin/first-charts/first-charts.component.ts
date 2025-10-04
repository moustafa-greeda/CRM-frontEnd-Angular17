import {
  Component,
  HostListener,
  inject,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FilterService } from '../../../core/services/filter.service';
import { isPlatformBrowser } from '@angular/common';
import { MainChartService } from './main-chart.service';
import {
  IAgeRangeChart,
  IClientByCountryChart,
  ICompanyStageChart,
  IdateAddChart,
  IJobTitleChart,
  IownershipChart,
  ITopIndustrychart,
} from '../../../core/Models/main-chart/ichart';

@Component({
  selector: 'app-first-charts',
  templateUrl: './first-charts.component.html',
  styleUrls: ['./first-charts.component.css'],
})
export class FirstChartsComponent implements AfterViewInit {
  private readonly _FilterService = inject(FilterService);

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  public map: any;
  public mapError: boolean = false;
  private markers: any[] = [];
  private L: any;

  UnGetCompany?: Subscription;
  UnGetLead?: Subscription;
  // ===================  variables  api charts====================
  topIndustries: ITopIndustrychart[] = [];
  clientByCountry: IClientByCountryChart[] = [];
  companyStageCount: ICompanyStageChart[] = [];
  jobTitleChart: IJobTitleChart[] = [];
  ageRangeChart: IAgeRangeChart[] = [];
  ownershipChart: IownershipChart[] = [];
  dateAddChart: IdateAddChart[] = [];
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _MainChartService: MainChartService
  ) {}

  ngOnInit(): void {
    // =======================================  function top industries ====================
    this._MainChartService.GetTopIndustries().subscribe((res) => {
      this.topIndustries = res.data || [];
      this.topIndustryChart();
    });

    // ====================================  function client by country ====================
    this._MainChartService.GetClientByCountry().subscribe((res) => {
      this.clientByCountry = res.data || [];
      this.countryClientChart();

      // Update map markers with new data
      if (this.map) {
        this.addMarkersToMap();
      }
    });
    // ===================  function job title have the largest clients ====================
    this._MainChartService.GetJobTitleChart().subscribe((res) => {
      this.jobTitleChart = res.data || [];
      this.updatejobTitleChart();
    });
    // =========================  function company stage count =============================
    this._MainChartService.GetCompanyStageCount().subscribe((res) => {
      this.companyStageCount = res.data || [];
      this.updateCompanyStageChart();
    });
    // ====================================  function age range ============================
    this._MainChartService.GetAgeRange().subscribe((res) => {
      this.ageRangeChart = res.data || [];
      this.updateAgeRangeChart();
    });
    // ====================================  function ownership ============================
    this._MainChartService.GetOwnerShip().subscribe((res) => {
      this.ownershipChart = res.data || [];
      this.GetOwnerShipOption();
    });
    // ====================================  function date add ============================
    this._MainChartService.GetDateAdd().subscribe((res) => {
      // Handle both single object and array responses
      this.dateAddChart = Array.isArray(res.data) ? res.data : [res.data];
      this.GetDateAdd();
    });
  }
  // ===================================== first chart top industries ===============================
  private topIndustryChart(): void {
    // Calculate total count first
    const totalCount = this.topIndustries.reduce(
      (sum, item) => sum + (item.persntage || 0),
      0
    );
    const colors = [
      '#FF5E00', // Orange
      '#FF7E33',
      '#FF9E66',
      '#FFBE99',
      '#FFDFCC',
      '#00687A', // blue
      '#33E0FF', //
      '#66E8FF', //
      '#99F0FF', //
      '#CCF7FF', //
    ];

    this.topIndustryChartOption = {
      animationEnabled: true,
      // backgroundColor: '#11181F',
      backgroundColor: 'transparent',
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
          indexLabelLineThickness: 2,
          indexLabelPadding: 9,
          indexLabelLineColor: '#FFF',
          indexLabelPlacement: 'outside',
          dataPoints: this.topIndustries.map((item, index) => ({
            label: item.industry + ' (' + item.persntage + '%)',
            y:
              totalCount > 0
                ? Math.round((item.persntage / totalCount) * 100 * 100) / 100
                : 0, // Convert to percentage
            color: colors[index % colors.length],
          })),
        },
      ],
    };
  }

  topIndustryChartOption: any = {};
  // ===============================  chart client by country ==============================
  private countryClientChart(): void {
    this.countryClientChartOption = {
      animationEnabled: true,
      backgroundColor: 'transparent',
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
          dataPoints: this.clientByCountry.map((item) => ({
            label: item.country,
            y: item.clientCount,
            color: '#FF5F00',
          })),
        },
      ],
    };
  }
  countryClientChartOption: any = {};
  // ===============================  Job title have the largest clients ==============================
  private updatejobTitleChart(): void {
    this.jobTitleChartOptions = {
      animationEnabled: true,
      backgroundColor: 'transparent',
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
          dataPoints: this.jobTitleChart.map((item) => ({
            label: item.jobTitle,
            y: item.jobTitleCount,
            color: '#FF5F00',
          })),
        },
      ],
    };
  }
  jobTitleChartOptions: any = {};
  // ===============================  function company stage chart ==============================
  private updateCompanyStageChart(): void {
    const colors = [
      '#FF5E00', // Orange
      '#FF7E33',
      '#FF9E66',
      '#FFBE99',
      '#FFDFCC',
      '#00687A', // blue
      '#33E0FF', //
      '#66E8FF', //
      '#99F0FF', //
      '#CCF7FF', //
    ];

    // Calculate total count first
    const totalCount = this.companyStageCount.reduce(
      (sum, item) => sum + (item.stageCount || 0),
      0
    );

    this.companyStageChart = {
      animationEnabled: true,
      backgroundColor: 'transparent',
      title: {
        text: 'Distribution Of Company Stage',
        fontColor: '#FFF',
        fontSize: 18,
      },
      data: [
        {
          type: 'pie',
          indexLabelFontColor: '#FFF',
          indexLabel: '{label}: {y}%',
          toolTipContent: '{label}: {y}%',
          dataPoints: this.companyStageCount.map((item, idx) => ({
            label: item.stage,
            y:
              totalCount > 0
                ? Math.round((item.stageCount / totalCount) * 100 * 100) / 100
                : 0, // Convert to percentage
            color: colors[idx % colors.length],
          })),
        },
      ],
    };
  }
  companyStageChart: any = {};

  // ========================================== age range chart ==============================
  private updateAgeRangeChart(): void {
    this.ageRangeOptions = {
      animationEnabled: true,
      backgroundColor: 'transparent',
      title: {
        text: 'Age Group Of Clients',
        fontColor: '#FFF',
        fontSize: 18,
        horizontalAlign: 'center',
        padding: '20',
      },
      axisY: {
        title: 'count of age',
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
          dataPoints: this.ageRangeChart.map((item) => ({
            label: item.ageRange,
            y: item.count,
            color: '#FF5F00',
          })),
        },
      ],
    };
  }
  ageRangeOptions: any = {};

  // ===============================  chart date add  ==============================
  private GetDateAdd(): void {
    console.log('Creating date add chart with data:', this.dateAddChart);
    this.dateAddOption = {
      animationEnabled: true,
      backgroundColor: 'transparent',
      title: {
        text: 'Client Registration by Quarter',
        fontColor: '#FFF',
        fontSize: 18,
        padding: '5',
      },
      axisX: {
        title: 'Quarter',
        titleFontColor: '#FFF',
        labelFontColor: '#FFF',
      },
      axisY: {
        title: 'count',
        titleFontColor: '#FFF',
        labelFontColor: '#FFF',
      },

      data: [
        {
          type: 'line',
          color: '#5fe5ff',
          markerSize: 6,
          dataPoints: this.dateAddChart.map((item) => ({
            label: this.formatQuarterDate(item.quarter),
            y: item.clientCount,
            color: '#FF5F00',
          })),
        },
      ],
    };
  }
  dateAddOption: any = {};

  // Format quarter date to display only the date part
  private formatQuarterDate(quarter: string): string {
    try {
      const date = new Date(quarter);
      // Format as YYYY-MM-DD
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting quarter date:', error);
      return quarter; // Return original if formatting fails
    }
  }

  // ======================================== chart map  =======================================

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

  // Load country coordinates from JSON file
  private async loadCountryCoordinates(): Promise<{
    [key: string]: [number, number];
  }> {
    try {
      const response = await fetch('/assets/json/country-coordinates.json');
      const data = await response.json();
      const coordinates: { [key: string]: [number, number] } = {};

      Object.keys(data.countries).forEach((countryKey) => {
        coordinates[countryKey] = data.countries[countryKey].coordinates;
      });

      return coordinates;
    } catch (error) {
      console.error('Error loading country coordinates:', error);
      // Fallback to basic coordinates
      return {
        مصر: [26.8206, 30.8025],
        السعودية: [23.8859, 45.0792],
        الإمارات: [23.4241, 53.8478],
        قطر: [25.3548, 51.1839],
        الكويت: [29.3117, 47.4818],
      };
    }
  }

  // Add markers based on API data from GetClientByCountry
  private addMarkersToMap(): void {
    if (!this.map || !this.L) return;

    // Clear existing markers
    this.markers.forEach((marker) => this.map?.removeLayer(marker));
    this.markers = [];

    // Add markers for each country from API data
    this.clientByCountry.forEach((countryData) => {
      // Try to find coordinates for the country from API
      this.findCountryCoordinates(countryData.country).then((coords) => {
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

          // Use client count from API data
          const clientCount = countryData.clientCount;

          marker.bindPopup(`
            <div style="text-align: center; font-family: Arial, sans-serif;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${countryData.country}</h3>
              <p style="margin: 0; color: #666;">عدد العملاء: <strong>${clientCount}</strong></p>
            </div>
          `);

          if (this.map) {
            marker.addTo(this.map);
            this.markers.push(marker);
          }
        } else {
          console.warn(
            `Coordinates not found for country: ${countryData.country}`
          );
        }
      });
    });
  }

  // Find coordinates for a specific country from the JSON file
  private async findCountryCoordinates(
    countryName: string
  ): Promise<[number, number] | null> {
    try {
      const response = await fetch('/assets/json/country-coordinates.json');
      const data = await response.json();

      // Clean the country name
      const cleanName = countryName.trim().toLowerCase();

      // Search for the country by name (case-insensitive)
      const countryKey = Object.keys(data.countries).find((key) => {
        const keyLower = key.toLowerCase();
        const nameLower = data.countries[key].name.toLowerCase();

        const exactMatch = keyLower === cleanName || nameLower === cleanName;
        const partialMatch =
          keyLower.includes(cleanName) || nameLower.includes(cleanName);

        // Special cases for common countries
        const saudiMatch =
          (cleanName.includes('سعود') || cleanName.includes('saudi')) &&
          (keyLower.includes('سعود') || nameLower.includes('saudi'));
        const emiratesMatch =
          (cleanName.includes('إمارات') || cleanName.includes('emirates')) &&
          (keyLower.includes('إمارات') || nameLower.includes('emirates'));

        return exactMatch || partialMatch || saudiMatch || emiratesMatch;
      });

      if (countryKey) {
        return data.countries[countryKey].coordinates;
      }

      console.warn(`No coordinates found for: "${countryName}"`);
      return null;
    } catch (error) {
      console.error('Error finding country coordinates:', error);
      return null;
    }
  }

  @HostListener('window:resize')
  onResize() {
    // CanvasJS charts handle resize automatically
    if (this.map && isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 100);
    }
  }
  // ==========================================  ownership chart ==================================
  private GetOwnerShipOption(): void {
    // Calculate total count first
    const totalCount = this.ownershipChart.reduce(
      (sum, item) => sum + (item.persntage || 0),
      0
    );
    const colors = [
      '#FF5E00', // Orange
      '#FF7E33',
      '#FF9E66',
      '#FFBE99',
      '#FFDFCC',
      '#00687A', // blue
      '#33E0FF', //
      '#66E8FF', //
      '#99F0FF', //
      '#CCF7FF', //
    ];

    this.OwnerShipOption = {
      animationEnabled: true,
      backgroundColor: 'transparent',
      title: {
        text: 'Distribution Of Ownership',
        fontColor: '#FFF',
        fontSize: 18,
        padding: '5',
      },
      data: [
        {
          type: 'doughnut',
          indexLabelFontColor: '#FFF',
          indexLabelFontSize: 16,
          indexLabelLineThickness: 2,
          indexLabelPadding: 9,
          indexLabelLineColor: '#FFF',
          indexLabelPlacement: 'outside',
          dataPoints: this.ownershipChart.map((item, index) => ({
            label: item.ownerShip + ' (' + item.persntage + '%)',
            y:
              totalCount > 0
                ? Math.round((item.persntage / totalCount) * 100 * 100) / 100
                : 0, // Convert to percentage
            color: colors[index % colors.length],
          })),
        },
      ],
    };
  }

  OwnerShipOption: any = {};
  // ================================================== Table Data =======================================
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
