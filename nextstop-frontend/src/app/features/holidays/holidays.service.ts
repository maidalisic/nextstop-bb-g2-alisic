// Pfad: src/app/features/holidays/holidays.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Holiday {
  id?: number; // laut Swagger ist "id" number
  date?: string;
  name?: string;
  isschoolholiday?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HolidaysService {
  private baseUrl = 'http://localhost:5213/api/HOLIDAY';

  constructor(private http: HttpClient) {}

  getAllHolidays(): Observable<Holiday[]> {
    return this.http.get<Holiday[]>(this.baseUrl);
  }

  getHolidayById(id: number): Observable<Holiday> {
    return this.http.get<Holiday>(`${this.baseUrl}/${id}`);
  }

  createHoliday(newHoliday: Holiday): Observable<Holiday> {
    return this.http.post<Holiday>(this.baseUrl, newHoliday);
  }

  updateHoliday(id: number, updated: Holiday): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, updated);
  }

  deleteHoliday(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
