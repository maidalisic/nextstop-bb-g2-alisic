import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Typ für die "Direct" Connection,
 * laut deinem Code: { RouteId, FromStop, ToStop, DepartureTime, ArrivalTime }
 */
export interface DirectConnection {
  routeId: number;
  fromStop: number;
  toStop: number;
  departureTime: string;  // z.B. "08:00:00"
  arrivalTime: string;    // z.B. "09:00:00"
}

/**
 * Typ für "complex" Verbindungen (max 1 Umstieg)
 * -> laut Code: { RouteIdA, RouteIdB, FromStop, MidStop, ToStop, DepA, ArrA, DepB, ArrB }
 */
export interface ComplexConnection {
  routeIdA: number;
  routeIdB: number;
  fromStop: number;
  midStop: number;
  toStop: number;
  depA: string; 
  arrA: string; 
  depB: string; 
  arrB: string; 
}

@Injectable({
  providedIn: 'root'
})
export class ConnectionsService {
  // Wir nehmen an, dein Backend läuft auf Port 5213
  private baseUrl = 'http://localhost:5213/api/connections';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/connections/direct?from=...&to=...&date=...&time=...&isArrivalTime=...&maxResults=...
   */
  getDirectConnections(params: {
    from: number;
    to: number;
    date: string;       // z.B. "2025-03-15"
    time: string;       // z.B. "17:00:00" (dein .NET-Backend akzeptiert "TimeSpan"?)
    isArrivalTime?: boolean;
    maxResults?: number;
  }): Observable<DirectConnection[]> {
    // Wir müssen die Parameter in ein passendes Format bringen.
    const queryParams: any = {
      from: params.from,
      to: params.to,
      date: params.date,  // Dein Backend will DateTime -> evtl. "2025-03-15T00:00:00"
      time: params.time,
      isArrivalTime: params.isArrivalTime ?? false,
      maxResults: params.maxResults ?? 5
    };

    return this.http.get<DirectConnection[]>(`${this.baseUrl}/direct`, { params: queryParams });
  }

  /**
   * GET /api/connections/complex?from=...&to=...&date=...&time=...&isArrivalTime=...&maxResults=...
   */
  getComplexConnections(params: {
    from: number;
    to: number;
    date: string;
    time: string;
    isArrivalTime?: boolean;
    maxResults?: number;
  }): Observable<ComplexConnection[]> {
    const queryParams: any = {
      from: params.from,
      to: params.to,
      date: params.date,
      time: params.time,
      isArrivalTime: params.isArrivalTime ?? false,
      maxResults: params.maxResults ?? 5
    };

    return this.http.get<ComplexConnection[]>(`${this.baseUrl}/complex`, { params: queryParams });
  }
}
