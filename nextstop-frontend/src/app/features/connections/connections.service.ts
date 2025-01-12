import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Typ für die "Direct" Connection
 */
export interface DirectConnection {
  routeId: number;
  fromStop: number;
  toStop: number;
  departureTime: string; // z.B. "08:00:00"
  arrivalTime: string;   // z.B. "09:00:00"
}

/**
 * Typ für "complex" Verbindungen (max 1 Umstieg)
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
  private baseUrl = 'http://localhost:5213/api/connections';

  constructor(private http: HttpClient) {}

  /**
   * GET /api/connections/direct
   */
  getDirectConnections(params: {
    from: number;
    to: number;
    date: string; // z.B. "2025-03-15T00:00:00"
    time: string; // z.B. "17:00:00"
    isArrivalTime?: boolean;
    maxResults?: number;
  }): Observable<{ connections: DirectConnection[] }> {
    const queryParams: any = {
      from: params.from,
      to: params.to,
      date: params.date,
      time: params.time,
      isArrivalTime: params.isArrivalTime ?? false,
      maxResults: params.maxResults ?? 5,
    };

    return this.http.get<{ connections: DirectConnection[] }>(
      `${this.baseUrl}/direct`,
      { params: queryParams }
    );
  }

  /**
   * GET /api/connections/complex
   */
  getComplexConnections(params: {
    from: number;
    to: number;
    date: string; // z.B. "2025-03-15T00:00:00"
    time: string; // z.B. "17:00:00"
    isArrivalTime?: boolean;
    maxResults?: number;
    maxTransfers?: number;
  }): Observable<{ connections: ComplexConnection[] }> {
    const queryParams: any = {
      from: params.from,
      to: params.to,
      date: params.date,
      time: params.time,
      isArrivalTime: params.isArrivalTime ?? false,
      maxResults: params.maxResults ?? 5,
      maxTransfers: params.maxTransfers ?? 1,
    };

    return this.http.get<{ connections: ComplexConnection[] }>(
      `${this.baseUrl}/complex`,
      { params: queryParams }
    );
  }
}
