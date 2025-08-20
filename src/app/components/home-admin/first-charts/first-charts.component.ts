import { Component } from '@angular/core';

@Component({
  selector: 'app-first-charts',
  templateUrl: './first-charts.component.html',
  styleUrls: ['./first-charts.component.css'],
})
export class FirstChartsComponent {
  chartOptions1 = {
    animationEnabled: true,
    theme: 'dark2',
    title: { text: 'Sales Overview' },
    data: [
      {
        type: 'column',
        dataPoints: [
          { label: 'Jan', y: 12000 },
          { label: 'Feb', y: 15000 },
          { label: 'Mar', y: 18000 },
          { label: 'Apr', y: 22000 },
        ],
      },
    ],
  };

  chartOptions2 = {
    animationEnabled: true,
    theme: 'dark2',
    title: { text: 'Expenses Breakdown' },
    data: [
      {
        type: 'pie',
        indexLabel: '{name}: {y}%',
        dataPoints: [
          { name: 'Rent', y: 40 },
          { name: 'Salaries', y: 35 },
          { name: 'Utilities', y: 15 },
          { name: 'Others', y: 10 },
        ],
      },
    ],
  };

  chartOptions3 = {
    animationEnabled: true,
    theme: 'dark2',
    title: { text: 'Revenue Trend' },
    data: [
      {
        type: 'line',
        dataPoints: [
          { label: 'Week 1', y: 5000 },
          { label: 'Week 2', y: 7000 },
          { label: 'Week 3', y: 6500 },
          { label: 'Week 4', y: 9000 },
        ],
      },
    ],
  };
}
