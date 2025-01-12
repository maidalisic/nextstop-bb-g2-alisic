import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { StatisticsService, RouteStatistics } from '../statistics.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-statistics-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './statistics-list.component.html',
  styleUrls: [],
})
export class StatisticsListComponent implements AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  startDate: Date | null = new Date('2024-01-01');
  endDate: Date | null = new Date('2026-12-31');
  routeId?: number;
  stats: RouteStatistics[] = [];
  displayedColumns: string[] = [
    'routeId',
    'averageDelay',
    'onTimePercentage',
    'slightlyLatePercentage',
    'latePercentage',
    'significantlyLatePercentage',
  ];
  chart: Chart | null = null;

  constructor(private statsService: StatisticsService) {}

  ngAfterViewInit(): void {
    console.log('View initialized');
  }

  loadStats() {
    const params: any = {};
    if (this.startDate) {
      params.startDate = this.formatDate(this.startDate);
    }
    if (this.endDate) {
      params.endDate = this.formatDate(this.endDate);
    }
    if (this.routeId) {
      params.routeId = this.routeId;
    }

    this.statsService.getStatistics(params).subscribe({
      next: (data) => {
        this.stats = data;
        console.log('Statistics loaded:', this.stats);

        this.ensureChartInitialized();
        this.updateChart();
      },
      error: (err) => console.error('Error loading stats:', err),
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00`;
  }

  private ensureChartInitialized() {
    if (!this.chart && this.chartCanvas?.nativeElement) {
      console.log('Initializing chart...');
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: [],
            datasets: [
              { label: 'Pünktlich (%)', backgroundColor: 'rgba(75, 192, 192, 0.5)', data: [] },
              { label: 'Leicht verspätet (%)', backgroundColor: 'rgba(255, 206, 86, 0.5)', data: [] },
              { label: 'Verspätet (%)', backgroundColor: 'rgba(54, 162, 235, 0.5)', data: [] },
              { label: 'Stark verspätet (%)', backgroundColor: 'rgba(255, 99, 132, 0.5)', data: [] },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
            },
          },
        });
      } else {
        console.error('Failed to get 2D context for canvas.');
      }
    }
  }

  private updateChart() {
    if (!this.chart || this.stats.length === 0) {
      console.warn('Chart is not initialized or no stats available.');
      return;
    }

    const labels = this.stats.map((stat) => `Route ${stat.route.routeNumber}`);
    const onTimeData = this.stats.map((stat) => stat.statistics.onTimePercentage);
    const lightlyLateData = this.stats.map((stat) => stat.statistics.slightlyLatePercentage);
    const lateData = this.stats.map((stat) => stat.statistics.latePercentage);
    const heavilyLateData = this.stats.map((stat) => stat.statistics.significantlyLatePercentage);

    console.log('Updating chart with labels:', labels);
    console.log('On-time data:', onTimeData);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = onTimeData;
    this.chart.data.datasets[1].data = lightlyLateData;
    this.chart.data.datasets[2].data = lateData;
    this.chart.data.datasets[3].data = heavilyLateData;

    this.chart.update();
  }
}
