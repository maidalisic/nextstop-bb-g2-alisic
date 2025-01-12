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
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  startDate = new Date('2024-01-01');
  endDate = new Date('2026-12-31');
  routeId?: number;
  stats: RouteStatistics[] = [];
  displayedColumns: string[] = [
    'routeId',
    'averageDelaySeconds',
    'onTimePercent',
    'lightlyDelayedPercent',
    'delayedPercent',
    'heavilyDelayedPercent',
  ];
  chart: Chart | null = null;

  constructor(private statsService: StatisticsService) {}

  ngAfterViewInit(): void {
    this.initChart();
  }

  loadStats() {
    const params = {
      startDate: this.formatDate(this.startDate), // Datum formatieren
      endDate: this.formatDate(this.endDate),    // Datum formatieren
      routeId: this.routeId ? this.routeId : undefined,
    };

    this.statsService.getStatistics(params).subscribe({
      next: (data) => {
        this.stats = data;
        this.updateChart();
        console.log('Statistics loaded:', data);
      },
      error: (err) => console.error('Error loading stats:', err),
    });
  }

  // Funktion zur Formatierung des Datums
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Monate 0-basiert
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  initChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Pünktlich (%)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            data: [],
          },
          {
            label: 'Leicht verspätet (%)',
            backgroundColor: 'rgba(255, 206, 86, 0.5)',
            data: [],
          },
          {
            label: 'Verspätet (%)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            data: [],
          },
          {
            label: 'Stark verspätet (%)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            data: [],
          },
        ],
      },
    });
  }

  updateChart() {
    if (!this.chart) return;

    const labels = this.stats.map((stat) => `Route ${stat.routeId}`);
    const onTimeData = this.stats.map((stat) => stat.onTimePercent);
    const lightlyLateData = this.stats.map((stat) => stat.lightlyDelayedPercent);
    const lateData = this.stats.map((stat) => stat.delayedPercent);
    const heavilyLateData = this.stats.map((stat) => stat.heavilyDelayedPercent);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = onTimeData;
    this.chart.data.datasets[1].data = lightlyLateData;
    this.chart.data.datasets[2].data = lateData;
    this.chart.data.datasets[3].data = heavilyLateData;

    this.chart.update();
  }
}
