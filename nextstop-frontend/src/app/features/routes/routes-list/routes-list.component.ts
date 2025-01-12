import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RoutesService, RouteWithStop, Schedule, Stop } from '../routes.service';

@Component({
  selector: 'app-routes-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './routes-list.component.html',
  styleUrls: [],
})
export class RoutesListComponent implements OnInit {
  routes: RouteWithStop[] = [];
  allStops: Stop[] = [];
  selectedRoute: RouteWithStop | null = null;
  routeIdToSearch: number | null = null;

  newRoute: RouteWithStop = {
    routenumber: '',
    validfrom: '',
    validto: '',
    isweekend: false,
    stops: [],
    schedules: [],
  };

  selectedStop: Stop | null = null;
  newSchedule: Schedule = { stopid: 0, scheduledtime: '', isholiday: false };

  constructor(private routesService: RoutesService) {}

  ngOnInit(): void {
    this.loadAllStops();
  }

  loadAllRoutes() {
    this.routesService.getAllRoutes().subscribe(data => {
      this.routes = data || [];
    });
  }

  loadRouteById() {
    if (this.routeIdToSearch) {
      this.routesService.getRouteById(this.routeIdToSearch).subscribe(data => {
        this.selectedRoute = data || null;
      });
    }
  }

  loadAllStops() {
    this.routesService.getAllStops().subscribe(data => {
      this.allStops = data || [];
    });
  }

  addStop() {
    if (this.selectedStop) {
      const stopOrder = (this.newRoute.stops?.length || 0) + 1;
      this.newRoute.stops?.push({
        stopid: this.selectedStop.id,
        stoporder: stopOrder,
      });
      this.selectedStop = null;
    }
  }

  getStopName(stopId?: number): string {
    if (!stopId) {
      return 'Unbekannt';
    }
    const stop = this.allStops.find(s => s.id === stopId);
    return stop ? stop.name : 'Unbekannt';
  }

  addSchedule() {
    if (this.newSchedule.stopid && this.newSchedule.scheduledtime) {
      this.newRoute.schedules?.push({ ...this.newSchedule });
      this.newSchedule = { stopid: 0, scheduledtime: '', isholiday: false };
    }
  }

  createRoute() {
    this.routesService.createRoute(this.newRoute).subscribe(() => {
      this.loadAllRoutes();
      this.newRoute = {
        routenumber: '',
        validfrom: '',
        validto: '',
        isweekend: false,
        stops: [],
        schedules: [],
      };
    });
  }
}
