import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface für die Haltestellen-Daten
 * laut Swagger:
 * {
 *   "id": number,
 *   "name": string?,
 *   "shortcode": string?,
 *   "latitude": number?,
 *   "longitude": number?
 * }
 */
export interface Stop {
  id?: number;
  name?: string;
  shortcode?: string;
  latitude?: number;
  longitude?: number;
}

@Injectable({
  providedIn: 'root'
})
export class StopsService {

  // Backend-Endpunkt (Port 5213), laut Swagger: /api/STOP
  private baseUrl = 'http://localhost:5213/api/STOP';

  constructor(private http: HttpClient) {}

  /**
   * Alle Stops laden (GET /api/STOP)
   */
  getAllStops(): Observable<Stop[]> {
    return this.http.get<Stop[]>(this.baseUrl);
  }

  /**
   * Neuen Stop anlegen (POST /api/STOP)
   */
  createStop(newStop: Stop): Observable<Stop> {
    return this.http.post<Stop>(this.baseUrl, newStop);
  }

  /**
   * Stop löschen (DELETE /api/STOP/{id})
   */
  deleteStop(stopId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${stopId}`);
  }

  /**
   * (Optional) Einen Stop laden (GET /api/STOP/{id})
   */
  getStopById(stopId: number): Observable<Stop> {
    return this.http.get<Stop>(`${this.baseUrl}/${stopId}`);
  }

  /**
   * (Optional) Stop aktualisieren (PUT /api/STOP/{id})
   */
  updateStop(stopId: number, updatedStop: Stop): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${stopId}`, updatedStop);
  }

  /**
   * Stops suchen (GET /api/STOP/search)
   * query, latitude, longitude, queryLimit => optional laut Swagger
   */
  searchStops(options: {
    query?: string;
    latitude?: number;
    longitude?: number;
    queryLimit?: number;
  }): Observable<Stop[]> {
    // Bsp: /api/STOP/search?query=...&latitude=...&longitude=...&queryLimit=...
    const params: any = {};
    if (options.query)      { params.query      = options.query; }
    if (options.latitude)   { params.latitude   = options.latitude; }
    if (options.longitude)  { params.longitude  = options.longitude; }
    if (options.queryLimit) { params.queryLimit = options.queryLimit; }

    // GET-Aufruf mit Query-Params
    return this.http.get<Stop[]>(`${this.baseUrl}/search`, { params });
  }
}
