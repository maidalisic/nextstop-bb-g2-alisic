import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Laut Swagger:
 * "RouteWithStop": {
 *   "id": number,
 *   "routenumber": string,
 *   "validfrom": string (DateTime),
 *   "validto": string (DateTime),
 *   "isweekend": boolean,
 *   "stops": [ { "routeid": number, "stopid": number, "stoporder": number } ],
 *   "schedules": [ { "id": number, "routeid": number, "stopid": number, "scheduledtime": string, "isholiday": boolean } ]
 * }
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
  scheduledtime?: string;  // z.B. "18:10:00" oder DateTime?
  isholiday?: boolean;
}

export interface RouteWithStop {
  id?: number;
  routenumber?: string;
  validfrom?: string;    // e.g. "2025-01-01T00:00:00"
  validto?: string;      // e.g. "2025-12-31T00:00:00"
  isweekend?: boolean;
  stops?: RouteStop[];
  schedules?: Schedule[];
}

@Injectable({
  providedIn: 'root'
})
export class RoutesService {
  // Dein Backend: http://localhost:5213
  // Endpunkt: /api/ROUTE
  private baseUrl = 'http://localhost:5213/api/ROUTE';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/ROUTE
   * Liefert alle Routen (als Array von RouteWithStop)
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
   * Neue Route anlegen (inkl. stops, schedules etc.)
   */
  createRoute(newRoute: RouteWithStop): Observable<RouteWithStop> {
    return this.http.post<RouteWithStop>(this.baseUrl, newRoute);
  }
}
