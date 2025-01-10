import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatisticsService, RouteStatistics } from '../statistics.service';

@Component({
  selector: 'wea5-statistics-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics-list.component.html',
  styleUrls: [],
})
export class StatisticsListComponent {
  startDate = '2024-01-01T00:00:00';
  endDate = '2024-12-31T23:59:59';
  routeId?: number;
  stats: RouteStatistics[] = [];

  constructor(private statsService: StatisticsService) {}

  loadStats() {
    const params = {
      startDate: this.startDate,
      endDate: this.endDate,
      routeId: this.routeId ? this.routeId : undefined,
    };

    this.statsService.getStatistics(params).subscribe({
      next: (data) => {
        this.stats = data;
        console.log('Statistics loaded:', data);
      },
      error: (err) => console.error('Error loading stats:', err),
    });
  }
}
