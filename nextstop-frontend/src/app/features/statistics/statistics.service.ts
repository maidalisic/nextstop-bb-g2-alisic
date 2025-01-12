import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RouteStatistics {
  route: {
    id: number;
    routeNumber: string;
    validFrom: string;
    validTo: string;
    isWeekend: boolean;
  };
  statistics: {
    averageDelay: number;
    onTimePercentage: number;
    slightlyLatePercentage: number;
    latePercentage: number;
    significantlyLatePercentage: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private baseUrl = 'http://localhost:5213/api/Statistics';

  constructor(private http: HttpClient) {}

  getStatistics(params: {
    startDate?: string;
    endDate?: string;
    routeId?: number;
  }): Observable<RouteStatistics[]> {
    const queryParams: any = {};
  
    if (params.startDate) {
      queryParams.startDate = params.startDate;
    }
    if (params.endDate) {
      queryParams.endDate = params.endDate;
    }
    if (params.routeId) {
      queryParams.routeId = params.routeId;
    }
  
    return this.http.get<RouteStatistics[]>(this.baseUrl, { params: queryParams });
  }
}
