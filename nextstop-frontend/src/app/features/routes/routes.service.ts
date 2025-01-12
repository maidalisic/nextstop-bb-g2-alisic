import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Struktur für Stop
 */
export interface Stop {
  id: number; // Backend gibt "id" zurück, nicht "stopid"
  name: string;
}

/**
 * Struktur für RouteStop, Schedule und RouteWithStop (wie bereits vorhanden)
 */
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
  private stopsUrl = 'http://localhost:5213/api/STOP'; // Endpunkt für Stops

  constructor(private http: HttpClient) {}

  /**
   * GET /api/ROUTE
   * Alle Routen abrufen
   */
  getAllRoutes(): Observable<RouteWithStop[]> {
    return this.http.get<RouteWithStop[]>(this.baseUrl);
  }

  /**
   * GET /api/ROUTE/{id}
   * Einzelne Route laden
   */
  getRouteById(routeId: number): Observable<RouteWithStop> {
    return this.http.get<RouteWithStop>(`${this.baseUrl}/${routeId}`);
  }

  /**
   * POST /api/ROUTE
   * Neue Route erstellen
   */
  createRoute(newRoute: RouteWithStop): Observable<RouteWithStop> {
    return this.http.post<RouteWithStop>(this.baseUrl, newRoute);
  }

  /**
   * GET /api/STOP
   * Alle Stops laden
   */
  getAllStops(): Observable<Stop[]> {
    return this.http.get<Stop[]>(this.stopsUrl);
  }
}
