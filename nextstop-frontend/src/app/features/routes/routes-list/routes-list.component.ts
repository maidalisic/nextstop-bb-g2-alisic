import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoutesService, RouteWithStop } from '../routes.service';

@Component({
  selector: 'wea5-routes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './routes-list.component.html',
  styleUrls: []
})
export class RoutesListComponent implements OnInit {

  routes: RouteWithStop[] = [];

  // Felder fürs Anlegen einer neuen Route:
  newRouteNumber = '';
  newValidFrom = '2025-01-01T00:00:00';
  newValidTo = '2025-12-31T23:59:59';
  newIsWeekend = false;

  constructor(private routesService: RoutesService) {}

  ngOnInit(): void {
    this.loadRoutes();
  }

  /**
   * Alle Routen laden
   */
  loadRoutes() {
    this.routesService.getAllRoutes().subscribe({
      next: (data) => {
        this.routes = data;
        console.log('Loaded routes:', data);
      },
      error: (err) => console.error('Error loading routes', err)
    });
  }

  /**
   * Neue Route anlegen
   */
  createRoute() {
    const r: RouteWithStop = {
      routenumber: this.newRouteNumber,
      validfrom: this.newValidFrom,
      validto: this.newValidTo,
      isweekend: this.newIsWeekend,
      // stops, schedules könnten wir hier optional mitgeben
      stops: [],
      schedules: []
    };

    this.routesService.createRoute(r).subscribe({
      next: (created) => {
        console.log('Created route:', created);
        this.loadRoutes();
      },
      error: (err) => console.error('Error creating route', err)
    });
  }
}
