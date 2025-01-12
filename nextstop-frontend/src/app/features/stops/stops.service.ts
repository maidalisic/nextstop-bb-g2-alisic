import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  private baseUrl = 'http://localhost:5213/api/STOP';

  constructor(private http: HttpClient) {}

  getAllStops(): Observable<Stop[]> {
    return this.http.get<Stop[]>(this.baseUrl);
  }

  createStop(newStop: Stop): Observable<Stop> {
    return this.http.post<Stop>(this.baseUrl, newStop);
  }

  deleteStop(stopId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${stopId}`);
  }

  getStopById(stopId: number): Observable<Stop> {
    return this.http.get<Stop>(`${this.baseUrl}/${stopId}`);
  }

  updateStop(stopId: number, updatedStop: Stop): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${stopId}`, updatedStop);
  }

  searchStops(options: {
    query?: string;
    latitude?: number;
    longitude?: number;
    queryLimit?: number;
  }): Observable<Stop[]> {
    const params: any = {};
    if (options.query)      { params.query      = options.query; }
    if (options.latitude)   { params.latitude   = options.latitude; }
    if (options.longitude)  { params.longitude  = options.longitude; }
    if (options.queryLimit) { params.queryLimit = options.queryLimit; }

    return this.http.get<Stop[]>(`${this.baseUrl}/search`, { params });
  }
}
