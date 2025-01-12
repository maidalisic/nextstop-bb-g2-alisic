import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DirectConnection {
  routeId: number;
  fromStop: number;
  toStop: number;
  departureTime: string;
  arrivalTime: string;
}

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

  getDirectConnections(params: {
    from: number;
    to: number;
    date: string;
    time: string;
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

  getComplexConnections(params: {
    from: number;
    to: number;
    date: string;
    time: string;
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
