import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Beispielhaftes Interface – je nachdem, wie deine API das JSON zurückgibt.
 * Du könntest es anpassen, wenn dein Backend z.B. so was liefert:
 * {
 *   routeId: number,
 *   routeNumber: string,
 *   averageDelaySeconds: number,
 *   percentOnTime: number,
 *   ...
 * }
 */
export interface RouteStatistics {
  routeId: number;
  // ggf. weitere Felder
  averageDelaySeconds: number;
  onTimePercent: number;
  lightlyDelayedPercent: number;
  delayedPercent: number;
  heavilyDelayedPercent: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private baseUrl = 'http://localhost:5213/api/Statistics';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/Statistics?startDate=...&endDate=...&routeId=...
   */
  getStatistics(params: {
    startDate: string;  // z.B. "2024-01-01T00:00:00"
    endDate:   string;  // z.B. "2024-12-31T23:59:59"
    routeId?:  number;
  }): Observable<RouteStatistics[]> {
    const queryParams: any = {
      startDate: params.startDate,
      endDate:   params.endDate,
    };
    if (params.routeId) {
      queryParams.routeId = params.routeId;
    }

    return this.http.get<RouteStatistics[]>(this.baseUrl, { params: queryParams });
  }
}
