### statistics/statistics.service.spec.ts

```
import { TestBed } from '@angular/core/testing';

import { StatisticsService } from './statistics.service';

describe('StatisticsService', () => {
  let service: StatisticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

```

### statistics/statistics.service.ts

```
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

```

### statistics/statistics-list/statistics-list.component.html

```
<h2>Verspätungsstatistik</h2>

<div class="ui segment">
  <h3 class="ui header">Abfrage</h3>
  <div class="ui form">
    <div class="field">
      <label>Start Date</label>
      <input type="text" [(ngModel)]="startDate" />
    </div>
    <div class="field">
      <label>End Date</label>
      <input type="text" [(ngModel)]="endDate" />
    </div>
    <div class="field">
      <label>Route ID (optional)</label>
      <input type="number" [(ngModel)]="routeId" />
    </div>
    <button class="ui primary button" (click)="loadStats()">Statistik laden</button>
  </div>
</div>

<table class="ui celled table" *ngIf="stats.length > 0">
  <thead>
    <tr>
      <th>Route ID</th>
      <th>Average Delay (Sek.)</th>
      <th>Pünktlich (%)</th>
      <th>Leicht verspätet (%)</th>
      <th>Verspätet (%)</th>
      <th>Stark verspätet (%)</th>
      <!-- etc. je nachdem, was du ausgibst -->
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let s of stats">
      <td>{{ s.routeId }}</td>
      <td>{{ s.averageDelaySeconds }}</td>
      <td>{{ s.onTimePercent }}</td>
      <td>{{ s.lightlyDelayedPercent }}</td>
      <td>{{ s.delayedPercent }}</td>
      <td>{{ s.heavilyDelayedPercent }}</td>
    </tr>
  </tbody>
</table>

```

### statistics/statistics-list/statistics-list.component.ts

```
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatisticsService, RouteStatistics } from '../statistics.service';

@Component({
  selector: 'wea5-statistics-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics-list.component.html',
  styleUrls: [],
})
export class StatisticsListComponent {
  startDate = '2024-01-01T00:00:00';
  endDate = '2024-12-31T23:59:59';
  routeId?: number;
  stats: RouteStatistics[] = [];

  constructor(private statsService: StatisticsService) {}

  loadStats() {
    const params = {
      startDate: this.startDate,
      endDate: this.endDate,
      routeId: this.routeId ? this.routeId : undefined,
    };

    this.statsService.getStatistics(params).subscribe({
      next: (data) => {
        this.stats = data;
        console.log('Statistics loaded:', data);
      },
      error: (err) => console.error('Error loading stats:', err),
    });
  }
}

```

### statistics/statistics-list/statistics-list.component.spec.ts

```
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsListComponent } from './statistics-list.component';

describe('StatisticsListComponent', () => {
  let component: StatisticsListComponent;
  let fixture: ComponentFixture<StatisticsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatisticsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

### holidays/holidays.service.ts

```
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

```

### holidays/holidays.service.spec.ts

```
import { TestBed } from '@angular/core/testing';

import { HolidaysService } from './holidays.service';

describe('HolidaysService', () => {
  let service: HolidaysService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HolidaysService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

```

### holidays/holidays-list/holidays-list.component.ts

```
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HolidaysService, Holiday } from '../holidays.service';

@Component({
  selector: 'wea5-holidays-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './holidays-list.component.html',
  styleUrls: [],
})
export class HolidaysListComponent implements OnInit {
  holidays: Holiday[] = [];
  newHolidayDate = '';
  newHolidayName = '';
  newIsSchoolHoliday = false;

  constructor(private holidaysService: HolidaysService) {}

  ngOnInit(): void {
    this.loadHolidays();
  }

  loadHolidays() {
    this.holidaysService.getAllHolidays().subscribe({
      next: (data) => (this.holidays = data),
      error: (err) => console.error('Error loading holidays', err),
    });
  }

  createHoliday() {
    const holiday: Holiday = {
      date: this.newHolidayDate,
      name: this.newHolidayName,
      isschoolholiday: this.newIsSchoolHoliday,
    };
    this.holidaysService.createHoliday(holiday).subscribe({
      next: (created) => {
        console.log('Created holiday:', created);
        this.loadHolidays();
      },
      error: (err) => console.error('Error creating holiday:', err),
    });
  }

  deleteHoliday(h: Holiday) {
    if (!h.id) return;

    this.holidaysService.deleteHoliday(h.id).subscribe({
      next: () => {
        console.log('Deleted holiday ID:', h.id);
        this.loadHolidays();
      },
      error: (err) => console.error('Error deleting holiday:', err),
    });
  }
}

```

### holidays/holidays-list/holidays-list.component.spec.ts

```
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidaysListComponent } from './holidays-list.component';

describe('HolidaysListComponent', () => {
  let component: HolidaysListComponent;
  let fixture: ComponentFixture<HolidaysListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HolidaysListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidaysListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

### holidays/holidays-list/holidays-list.component.html

```
<div class="ui segment">
    <h2 class="ui header">Feiertage</h2>
  
    <div class="ui form">
      <div class="field">
        <label>Datum</label>
        <input [(ngModel)]="newHolidayDate" placeholder="YYYY-MM-DD" />
      </div>
  
      <div class="field">
        <label>Bezeichnung</label>
        <input [(ngModel)]="newHolidayName" placeholder="z.B. Ostermontag" />
      </div>
  
      <div class="field">
        <div class="ui checkbox">
          <input type="checkbox" [(ngModel)]="newIsSchoolHoliday" />
          <label>Schulferien?</label>
        </div>
      </div>
  
      <button class="ui primary button" (click)="createHoliday()">Neuen Feiertag anlegen</button>
    </div>
  
    <button class="ui button" (click)="loadHolidays()">Neu laden</button>
  
    <table class="ui celled table">
      <thead>
        <tr>
          <th>Datum</th>
          <th>Bezeichnung</th>
          <th>Schulferien?</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let h of holidays">
          <td>{{ h.date }}</td>
          <td>{{ h.name }}</td>
          <td>
            <i *ngIf="h.isschoolholiday" class="green checkmark icon"></i>
          </td>
          <td>
            <button class="ui red button" (click)="deleteHoliday(h)">Löschen</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  
```

### connections/connections.service.ts

```
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

```

### connections/connections.service.spec.ts

```
import { TestBed } from '@angular/core/testing';

import { ConnectionsService } from './connections.service';

describe('ConnectionsService', () => {
  let service: ConnectionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

```

### connections/connections-list/connections-list.component.spec.ts

```
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionsListComponent } from './connections-list.component';

describe('ConnectionsListComponent', () => {
  let component: ConnectionsListComponent;
  let fixture: ComponentFixture<ConnectionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectionsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

### connections/connections-list/connections-list.component.ts

```
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConnectionsService, DirectConnection, ComplexConnection } from '../connections.service';

@Component({
  selector: 'wea5-connections-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './connections-list.component.html',
  styleUrls: [],
})
export class ConnectionsListComponent {
  // Form-Eingaben
  fromStop = 1; // Demo: Start-Haltestelle (ID)
  toStop = 2; // Demo: Ziel-Haltestelle (ID)
  date = '2025-03-15'; // String, der DateTime repräsentiert
  time = '17:00:00';
  isArrivalTime = false;
  maxResults = 3;

  // Ergebnisse
  directResults: DirectConnection[] = [];
  complexResults: ComplexConnection[] = [];

  constructor(private connService: ConnectionsService) {}

  searchDirect() {
    const params = {
      from: this.fromStop,
      to: this.toStop,
      date: `${this.date}T00:00:00`,
      time: this.time,
      isArrivalTime: this.isArrivalTime,
      maxResults: this.maxResults,
    };

    this.connService.getDirectConnections(params).subscribe({
      next: (data) => {
        this.directResults = data;
        console.log('Direct connections:', data);
      },
      error: (err) => console.error('Error loading direct connections', err),
    });
  }

  searchComplex() {
    const params = {
      from: this.fromStop,
      to: this.toStop,
      date: `${this.date}T00:00:00`,
      time: this.time,
      isArrivalTime: this.isArrivalTime,
      maxResults: this.maxResults,
    };

    this.connService.getComplexConnections(params).subscribe({
      next: (data) => {
        this.complexResults = data;
        console.log('Complex connections:', data);
      },
      error: (err) => console.error('Error loading complex connections', err),
    });
  }
}

```

### connections/connections-list/connections-list.component.html

```
<h2>Fahrplan-Abfragen (Connections)</h2>

<div class="ui segment">
  <h3 class="ui header">Eingabe</h3>
  <div class="ui form">
    <div class="field">
      <label>From Stop (ID)</label>
      <input type="number" [(ngModel)]="fromStop" />
    </div>
    <div class="field">
      <label>To Stop (ID)</label>
      <input type="number" [(ngModel)]="toStop" />
    </div>
    <div class="field">
      <label>Datum</label>
      <input type="text" [(ngModel)]="date" placeholder="2025-03-15" />
    </div>
    <div class="field">
      <label>Uhrzeit</label>
      <input type="text" [(ngModel)]="time" placeholder="17:00:00" />
    </div>
    <div class="field">
      <label>Ist Ankunftszeit?</label>
      <input type="checkbox" [(ngModel)]="isArrivalTime" />
    </div>
    <div class="field">
      <label>Max Results</label>
      <input type="number" [(ngModel)]="maxResults" />
    </div>

    <button class="ui primary button" (click)="searchDirect()">
      Suche DIRECT
    </button>
    <button class="ui button" (click)="searchComplex()">
      Suche COMPLEX
    </button>
  </div>
</div>

<!-- Direct Results -->
<div class="ui segment">
  <h3 class="ui header">Direct Connections</h3>
  <table class="ui celled table">
    <thead>
      <tr>
        <th>RouteId</th>
        <th>FromStop</th>
        <th>ToStop</th>
        <th>DepartureTime</th>
        <th>ArrivalTime</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let d of directResults">
        <td>{{ d.routeId }}</td>
        <td>{{ d.fromStop }}</td>
        <td>{{ d.toStop }}</td>
        <td>{{ d.departureTime }}</td>
        <td>{{ d.arrivalTime }}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Complex Results -->
<div class="ui segment">
  <h3 class="ui header">Complex Connections (max 1 Umstieg)</h3>
  <table class="ui celled table">
    <thead>
      <tr>
        <th>Route A</th>
        <th>Route B</th>
        <th>FromStop</th>
        <th>MidStop</th>
        <th>ToStop</th>
        <th>DepA</th>
        <th>ArrA</th>
        <th>DepB</th>
        <th>ArrB</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let c of complexResults">
        <td>{{ c.routeIdA }}</td>
        <td>{{ c.routeIdB }}</td>
        <td>{{ c.fromStop }}</td>
        <td>{{ c.midStop }}</td>
        <td>{{ c.toStop }}</td>
        <td>{{ c.depA }}</td>
        <td>{{ c.arrA }}</td>
        <td>{{ c.depB }}</td>
        <td>{{ c.arrB }}</td>
      </tr>
    </tbody>
  </table>
</div>

```

### stops/stops.service.ts

```
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

```

### stops/stops.service.spec.ts

```
import { TestBed } from '@angular/core/testing';

import { StopsService } from './stops.service';

describe('StopsService', () => {
  let service: StopsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StopsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

```

### stops/stops-list/stops-list.component.ts

```
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StopsService, Stop } from '../stops.service';

@Component({
  selector: 'wea5-stops-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stops-list.component.html',
  styleUrls: [],
})
export class StopsListComponent implements OnInit {
  // Liste aller Stops (GET /api/STOP)
  stops: Stop[] = [];

  // Felder für "neuen Stop" anlegen
  newStopName = '';
  newStopShortcode = '';
  newStopLatitude?: number;
  newStopLongitude?: number;

  // Felder für "Suchen"
  searchQuery = '';
  searchLat?: number;
  searchLong?: number;
  searchLimit?: number;

  constructor(private stopsService: StopsService) {}

  ngOnInit(): void {
    this.loadStops();
  }

  /**
   * Alle Stops laden
   */
  loadStops() {
    this.stopsService.getAllStops().subscribe({
      next: (data) => (this.stops = data),
      error: (err) => console.error('Error loading stops', err),
    });
  }

  /**
   * Neuen Stop anlegen
   */
  createStop() {
    const s: Stop = {
      name: this.newStopName,
      shortcode: this.newStopShortcode,
      latitude: this.newStopLatitude,
      longitude: this.newStopLongitude,
    };
    this.stopsService.createStop(s).subscribe({
      next: (created) => {
        console.log('Created stop:', created);
        // Nach dem Anlegen neu laden
        this.loadStops();
      },
      error: (err) => console.error('Error creating stop', err),
    });
  }

  /**
   * Stop löschen
   */
  deleteStop(stop: Stop) {
    if (!stop.id) return;
    this.stopsService.deleteStop(stop.id).subscribe({
      next: () => {
        console.log('Deleted stop ID', stop.id);
        this.loadStops();
      },
      error: (err) => console.error('Error deleting stop', err),
    });
  }

  /**
   * Stops suchen
   */
  searchStops() {
    // Sammeln der Parameter
    const options = {
      query: this.searchQuery || undefined,
      latitude: this.searchLat || undefined,
      longitude: this.searchLong || undefined,
      queryLimit: this.searchLimit || undefined,
    };

    this.stopsService.searchStops(options).subscribe({
      next: (found) => {
        this.stops = found;
        console.log('Found stops:', found);
      },
      error: (err) => console.error('Error searching stops', err),
    });
  }
}

```

### stops/stops-list/stops-list.component.html

```
<h2>Haltestellen (Stops)</h2>

<!-- Formular zum Anlegen eines neuen Stops -->
<div class="ui segment">
  <h3 class="ui header">Neuen Stop anlegen</h3>
  <div class="ui form">
    <div class="field">
      <label>Name</label>
      <input [(ngModel)]="newStopName" placeholder="z.B. FH Hagenberg" />
    </div>
    <div class="field">
      <label>Shortcode</label>
      <input [(ngModel)]="newStopShortcode" placeholder="z.B. FHHGB" />
    </div>
    <div class="two fields">
      <div class="field">
        <label>Latitude</label>
        <input type="number" [(ngModel)]="newStopLatitude" placeholder="48.3683..." />
      </div>
      <div class="field">
        <label>Longitude</label>
        <input type="number" [(ngModel)]="newStopLongitude" placeholder="14.5155..." />
      </div>
    </div>

    <button class="ui primary button" (click)="createStop()">
      Neuen Stop anlegen
    </button>
  </div>
</div>

<!-- Suche -->
<div class="ui segment">
  <h3 class="ui header">Stops suchen</h3>
  <div class="ui form">
    <div class="field">
      <label>Suchbegriff (Name, etc.)</label>
      <input [(ngModel)]="searchQuery" placeholder="z.B. Hagenb" />
    </div>
    <div class="field">
      <label>Latitude</label>
      <input type="number" [(ngModel)]="searchLat" />
    </div>
    <div class="field">
      <label>Longitude</label>
      <input type="number" [(ngModel)]="searchLong" />
    </div>
    <div class="field">
      <label>Limit</label>
      <input type="number" [(ngModel)]="searchLimit" />
    </div>

    <button class="ui secondary button" (click)="searchStops()">
      Suchen
    </button>
  </div>
</div>

<button class="ui button" (click)="loadStops()">Alle Stops laden</button>

<!-- Tabelle aller Stops -->
<table class="ui celled table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Shortcode</th>
      <th>Latitude</th>
      <th>Longitude</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let s of stops">
      <td>{{ s.id }}</td>
      <td>{{ s.name }}</td>
      <td>{{ s.shortcode }}</td>
      <td>{{ s.latitude }}</td>
      <td>{{ s.longitude }}</td>
      <td>
        <button class="ui red button" (click)="deleteStop(s)">Löschen</button>
      </td>
    </tr>
  </tbody>
</table>

```

### stops/stops-list/stops-list.component.spec.ts

```
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopsListComponent } from './stops-list.component';

describe('StopsListComponent', () => {
  let component: StopsListComponent;
  let fixture: ComponentFixture<StopsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StopsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StopsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

### routes/routes.service.ts

```
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

```

### routes/routes.service.spec.ts

```
import { TestBed } from '@angular/core/testing';

import { RoutesService } from './routes.service';

describe('RoutesService', () => {
  let service: RoutesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoutesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

```

### routes/routes-list/routes-list.component.html

```
<h2>Routen</h2>

<div class="ui segment">
  <h3 class="ui header">Neue Route anlegen</h3>
  <div class="ui form">
    <div class="field">
      <label>Route Number</label>
      <input [(ngModel)]="newRouteNumber" placeholder="z.B. 404" />
    </div>
    <div class="field">
      <label>Gültig von</label>
      <input [(ngModel)]="newValidFrom" placeholder="2025-01-01T00:00:00" />
    </div>
    <div class="field">
      <label>Gültig bis</label>
      <input [(ngModel)]="newValidTo" placeholder="2025-12-31T23:59:59" />
    </div>
    <div class="field">
      <label>Ist Wochenende-Route?</label>
      <input type="checkbox" [(ngModel)]="newIsWeekend" />
    </div>

    <button class="ui primary button" (click)="createRoute()">Neue Route anlegen</button>
  </div>
</div>

<button class="ui button" (click)="loadRoutes()">Routen neu laden</button>

<!-- Anzeige -->
<table class="ui celled table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Nummer</th>
      <th>Gültig von</th>
      <th>Gültig bis</th>
      <th>Wochenende?</th>
      <th>Stops?</th>
      <th>Schedules?</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let r of routes">
      <td>{{ r.id }}</td>
      <td>{{ r.routenumber }}</td>
      <td>{{ r.validfrom }}</td>
      <td>{{ r.validto }}</td>
      <td>
        <i *ngIf="r.isweekend" class="green checkmark icon"></i>
      </td>
      <td>{{ r.stops?.length }}</td>
      <td>{{ r.schedules?.length }}</td>
    </tr>
  </tbody>
</table>

```

### routes/routes-list/routes-list.component.spec.ts

```
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutesListComponent } from './routes-list.component';

describe('RoutesListComponent', () => {
  let component: RoutesListComponent;
  let fixture: ComponentFixture<RoutesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoutesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

### routes/routes-list/routes-list.component.ts

```
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoutesService, RouteWithStop } from '../routes.service';

@Component({
  selector: 'wea5-routes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './routes-list.component.html',
  styleUrls: [],
})
export class RoutesListComponent implements OnInit {
  routes: RouteWithStop[] = [];
  newRouteNumber = '';
  newValidFrom = '2025-01-01T00:00:00';
  newValidTo = '2025-12-31T23:59:59';
  newIsWeekend = false;

  constructor(private routesService: RoutesService) {}

  ngOnInit(): void {
    this.loadRoutes();
  }

  loadRoutes() {
    this.routesService.getAllRoutes().subscribe({
      next: (data) => {
        this.routes = data;
        console.log('Loaded routes:', data);
      },
      error: (err) => console.error('Error loading routes', err),
    });
  }

  createRoute() {
    const r: RouteWithStop = {
      routenumber: this.newRouteNumber,
      validfrom: this.newValidFrom,
      validto: this.newValidTo,
      isweekend: this.newIsWeekend,
      stops: [],
      schedules: [],
    };

    this.routesService.createRoute(r).subscribe({
      next: (created) => {
        console.log('Created route:', created);
        this.loadRoutes();
      },
      error: (err) => console.error('Error creating route:', err),
    });
  }
}

```

