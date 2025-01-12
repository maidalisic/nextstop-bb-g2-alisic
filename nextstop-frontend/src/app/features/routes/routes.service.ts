import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Stop {
  id: number;
  name: string;
}

export interface RouteStop {
  routeid?: number;
  stopid?: number;
  stoporder?: number;
}

export interface Schedule {
  id?: number;
  routeid?: number;
  stopid?: number;
  scheduledtime?: string;
  isholiday?: boolean;
}

export interface RouteWithStop {
  id?: number;
  routenumber?: string;
  validfrom?: string;
  validto?: string;
  isweekend?: boolean;
  stops?: RouteStop[];
  schedules?: Schedule[];
}

@Injectable({
  providedIn: 'root'
})
export class RoutesService {
  private baseUrl = 'http://localhost:5213/api/ROUTE';
  private stopsUrl = 'http://localhost:5213/api/STOP';

  constructor(private http: HttpClient) {}

  getAllRoutes(): Observable<RouteWithStop[]> {
    return this.http.get<RouteWithStop[]>(this.baseUrl);
  }

  getRouteById(routeId: number): Observable<RouteWithStop> {
    return this.http.get<RouteWithStop>(`${this.baseUrl}/${routeId}`);
  }

  createRoute(newRoute: RouteWithStop): Observable<RouteWithStop> {
    return this.http.post<RouteWithStop>(this.baseUrl, newRoute);
  }

  getAllStops(): Observable<Stop[]> {
    return this.http.get<Stop[]>(this.stopsUrl);
  }
}
