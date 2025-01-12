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

  /**
   * GET /api/Statistics?startDate=...&endDate=...&routeId=...
   */
  getStatistics(params: {
    startDate?: string; // Optional machen
    endDate?: string;  // Optional machen
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

```

### statistics/statistics-list/statistics-list.component.html

```
<div class="container">
    <h2>Verspätungsstatistik</h2>
  
    <mat-card>
      <h3>Abfrage</h3>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Startdatum</mat-label>
        <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate" />
        <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
        <mat-datepicker #startPicker></mat-datepicker>
      </mat-form-field>
  
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Enddatum</mat-label>
        <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate" />
        <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
        <mat-datepicker #endPicker></mat-datepicker>
      </mat-form-field>
  
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Route ID (optional)</mat-label>
        <input matInput type="number" [(ngModel)]="routeId" />
      </mat-form-field>
  
      <button mat-raised-button color="primary" (click)="loadStats()">Statistik laden</button>
    </mat-card>
  
    <mat-card *ngIf="stats.length > 0">
      <h3>Statistik Ergebnisse</h3>
      <table mat-table [dataSource]="stats" class="mat-elevation-z8">
        <ng-container matColumnDef="routeId">
          <th mat-header-cell *matHeaderCellDef>Route ID</th>
          <td mat-cell *matCellDef="let stat">{{ stat.route.id }}</td>
        </ng-container>
      
        <ng-container matColumnDef="averageDelay">
          <th mat-header-cell *matHeaderCellDef>Ø Verspätung (Sek.)</th>
          <td mat-cell *matCellDef="let stat">{{ stat.statistics.averageDelay | number:'1.3-3' }}</td>
        </ng-container>
      
        <ng-container matColumnDef="onTimePercentage">
          <th mat-header-cell *matHeaderCellDef>Pünktlich (%)</th>
          <td mat-cell *matCellDef="let stat">{{ stat.statistics.onTimePercentage | number:'1.3-3' }}</td>
        </ng-container>
      
        <ng-container matColumnDef="slightlyLatePercentage">
          <th mat-header-cell *matHeaderCellDef>Leicht verspätet (%)</th>
          <td mat-cell *matCellDef="let stat">{{ stat.statistics.slightlyLatePercentage | number:'1.3-3' }}</td>
        </ng-container>
      
        <ng-container matColumnDef="latePercentage">
          <th mat-header-cell *matHeaderCellDef>Verspätet (%)</th>
          <td mat-cell *matCellDef="let stat">{{ stat.statistics.latePercentage | number:'1.3-3' }}</td>
        </ng-container>
      
        <ng-container matColumnDef="significantlyLatePercentage">
          <th mat-header-cell *matHeaderCellDef>Stark verspätet (%)</th>
          <td mat-cell *matCellDef="let stat">{{ stat.statistics.significantlyLatePercentage | number:'1.3-3' }}</td>
        </ng-container>
      
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>      
    </mat-card>
  
    <mat-card *ngIf="stats.length > 0">
      <h3>Visualisierung</h3>
      <canvas #chartCanvas></canvas>
    </mat-card>
  </div>
  
```

### statistics/statistics-list/statistics-list.component.ts

```
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { StatisticsService, RouteStatistics } from '../statistics.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-statistics-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './statistics-list.component.html',
  styleUrls: [],
})
export class StatisticsListComponent implements AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  startDate: Date | null = new Date('2024-01-01');
  endDate: Date | null = new Date('2026-12-31');
  routeId?: number;
  stats: RouteStatistics[] = [];
  displayedColumns: string[] = [
    'routeId',
    'averageDelay',
    'onTimePercentage',
    'slightlyLatePercentage',
    'latePercentage',
    'significantlyLatePercentage',
  ];
  chart: Chart | null = null;
  canvasReady = false;
  dataLoaded = false;

  constructor(private statsService: StatisticsService) {}

  ngAfterViewInit(): void {
    this.waitForCanvas();
  }

  private waitForCanvas() {
    const checkInterval = setInterval(() => {
      if (this.chartCanvas?.nativeElement) {
        console.log('Canvas is ready.');
        this.canvasReady = true;
        this.tryInitializeChart(); // Versuche den Chart zu initialisieren, wenn der Canvas bereit ist
        clearInterval(checkInterval);
      }
    }, 100);
  }

  loadStats() {
    const params: any = {};
    if (this.startDate) {
      params.startDate = this.formatDate(this.startDate);
    }
    if (this.endDate) {
      params.endDate = this.formatDate(this.endDate);
    }
    if (this.routeId) {
      params.routeId = this.routeId;
    }

    this.statsService.getStatistics(params).subscribe({
      next: (data) => {
        this.stats = data;
        this.dataLoaded = true;
        console.log('Statistics loaded:', this.stats);
        this.tryInitializeChart(); // Versuche den Chart zu initialisieren, wenn die Daten geladen sind
      },
      error: (err) => console.error('Error loading stats:', err),
    });
  }

  private tryInitializeChart() {
    if (this.canvasReady && this.dataLoaded) {
      console.log('Both canvas and data are ready. Initializing chart...');
      this.initializeChart();
      this.updateChart(); // Direkt die Daten nach der Initialisierung aktualisieren
    } else {
      if (!this.canvasReady) console.warn('Canvas not ready yet.');
      if (!this.dataLoaded) console.warn('Data not loaded yet.');
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00`;
  }

  private initializeChart() {
    if (this.chart) {
      console.log('Chart already initialized.');
      return;
    }

    console.log('Initializing chart...');
    const ctx = this.chartCanvas?.nativeElement.getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [
            { label: 'Pünktlich (%)', backgroundColor: 'rgba(75, 192, 192, 0.5)', data: [] },
            { label: 'Leicht verspätet (%)', backgroundColor: 'rgba(255, 206, 86, 0.5)', data: [] },
            { label: 'Verspätet (%)', backgroundColor: 'rgba(54, 162, 235, 0.5)', data: [] },
            { label: 'Stark verspätet (%)', backgroundColor: 'rgba(255, 99, 132, 0.5)', data: [] },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
        },
      });
    } else {
      console.error('Failed to get 2D context for canvas.');
    }
  }

  private updateChart() {
    if (!this.chart || this.stats.length === 0) {
      console.warn('Chart is not initialized or no stats available.');
      return;
    }

    const labels = this.stats.map((stat) => `Route ${stat.route.routeNumber}`);
    const onTimeData = this.stats.map((stat) => stat.statistics.onTimePercentage);
    const lightlyLateData = this.stats.map((stat) => stat.statistics.slightlyLatePercentage);
    const lateData = this.stats.map((stat) => stat.statistics.latePercentage);
    const heavilyLateData = this.stats.map((stat) => stat.statistics.significantlyLatePercentage);

    console.log('Updating chart with labels:', labels);
    console.log('On-time data:', onTimeData);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = onTimeData;
    this.chart.data.datasets[1].data = lightlyLateData;
    this.chart.data.datasets[2].data = lateData;
    this.chart.data.datasets[3].data = heavilyLateData;

    this.chart.update();
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
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { HolidaysService, Holiday } from '../holidays.service';

@Component({
  selector: 'wea5-holidays-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatInputModule,
    MatCheckboxModule,
    MatNativeDateModule,
  ],
  templateUrl: './holidays-list.component.html',
  styleUrls: [],
})
export class HolidaysListComponent implements OnInit {
  holidays: Holiday[] = [];
  newHolidayDate: Date | null = null;
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
    if (!this.newHolidayDate) return;

    const holiday: Holiday = {
      date: this.newHolidayDate.toISOString(),
      name: this.newHolidayName,
      isschoolholiday: this.newIsSchoolHoliday,
    };
    this.holidaysService.createHoliday(holiday).subscribe({
      next: (created) => {
        console.log('Created holiday:', created);
        this.loadHolidays();
        this.resetForm();
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

  resetForm() {
    this.newHolidayDate = null;
    this.newHolidayName = '';
    this.newIsSchoolHoliday = false;
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
<div class="container">
  <h2>Feiertage</h2>

  <!-- Formular zum Hinzufügen neuer Feiertage -->
  <mat-card class="form-card">
    <form>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Datum</mat-label>
        <input
          matInput
          [matDatepicker]="picker"
          [(ngModel)]="newHolidayDate"
          name="holidayDate"
          placeholder="Wähle ein Datum"
        />
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Bezeichnung</mat-label>
        <input
          matInput
          [(ngModel)]="newHolidayName"
          name="holidayName"
          placeholder="z.B. Ostermontag"
        />
      </mat-form-field>

      <mat-checkbox [(ngModel)]="newIsSchoolHoliday" name="isSchoolHoliday">
        Schulferien?
      </mat-checkbox>

      <div class="actions">
        <button mat-raised-button color="primary" (click)="createHoliday()">Hinzufügen</button>
        <button mat-button (click)="loadHolidays()">Neu laden</button>
      </div>
    </form>
  </mat-card>

  <!-- Tabelle mit Feiertagen -->
  <mat-card class="table-card">
    <h3>Alle Feiertage</h3>
    <table mat-table [dataSource]="holidays" class="mat-elevation-z1">
      <!-- Datum -->
      <ng-container matColumnDef="date">
        <th mat-header-cell *matHeaderCellDef>Datum</th>
        <td mat-cell *matCellDef="let holiday">{{ holiday.date | date: 'shortDate' }}</td>
      </ng-container>

      <!-- Bezeichnung -->
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Bezeichnung</th>
        <td mat-cell *matCellDef="let holiday">{{ holiday.name }}</td>
      </ng-container>

      <!-- Schulferien -->
      <ng-container matColumnDef="schoolHoliday">
        <th mat-header-cell *matHeaderCellDef>Schulferien?</th>
        <td mat-cell *matCellDef="let holiday">
          <mat-icon *ngIf="holiday.isschoolholiday" color="primary">check</mat-icon>
        </td>
      </ng-container>

      <!-- Aktionen -->
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Aktionen</th>
        <td mat-cell *matCellDef="let holiday">
          <button mat-icon-button color="warn" (click)="deleteHoliday(holiday)">
            <mat-icon>delete</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="['date', 'name', 'schoolHoliday', 'actions']"></tr>
      <tr mat-row *matRowDef="let row; columns: ['date', 'name', 'schoolHoliday', 'actions'];"></tr>
    </table>
  </mat-card>
</div>

```

### connections/connections.service.ts

```
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
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'wea5-connections-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  templateUrl: './connections-list.component.html',
  styleUrls: [],
})
export class ConnectionsListComponent {
  // Form-Eingaben
  fromStop = 1; // Start-Haltestelle (ID)
  toStop = 2; // Ziel-Haltestelle (ID)
  date = '2025-03-15'; // String, der DateTime repräsentiert
  time = '17:00:00';
  isArrivalTime = false;
  allowTransfers = false; // Checkbox: Mit Umstieg?
  maxTransfers = 1; // Anzahl der maximalen Umstiege
  maxResults = 3; // Maximale Ergebnisse (default)

  // Ergebnisse
  directResults: DirectConnection[] = [];
  complexResults: ComplexConnection[] = [];
  isLoading = false;
  showMoreResults = false; // Für "Mehr/Weniger anzeigen"

  constructor(private connService: ConnectionsService) {}

  // Suche basierend auf der Checkbox
  searchConnections() {
    this.isLoading = true;

    const params = {
      from: this.fromStop,
      to: this.toStop,
      date: `${this.date}T00:00:00`,
      time: this.time,
      isArrivalTime: this.isArrivalTime,
      maxResults: this.maxResults,
      maxTransfers: this.allowTransfers ? this.maxTransfers : undefined,
    };

    if (this.allowTransfers) {
      this.connService.getComplexConnections(params).subscribe({
        next: (data) => {
          this.complexResults = data.connections; // Extrahiere nur das `connections`-Array
          this.directResults = [];
          this.isLoading = false;
          this.showMoreResults = this.maxResults < 10; // Beispielgrenze
        },
        error: (err) => {
          console.error('Fehler bei der komplexen Suche:', err);
          this.isLoading = false;
        },
      });
    } else {
      this.connService.getDirectConnections(params).subscribe({
        next: (data) => {
          this.directResults = data.connections; // Extrahiere nur das `connections`-Array
          this.complexResults = [];
          this.isLoading = false;
          this.showMoreResults = this.maxResults < 10; // Beispielgrenze
        },
        error: (err) => {
          console.error('Fehler bei der direkten Suche:', err);
          this.isLoading = false;
        },
      });
    }
  }

  // Ergebnisse erweitern
  loadMore() {
    this.maxResults += 2; // Erhöhe die maximale Anzahl um 2
    this.searchConnections();
  }

  // Ergebnisse reduzieren
  showLess() {
    this.maxResults = 3; // Zurücksetzen auf 3 Ergebnisse
    this.searchConnections();
  }
}

```

### connections/connections-list/connections-list.component.html

```
<div class="container">
  <!-- Form-Bereich für Verbindungsanfragen -->
  <mat-card class="form-card">
    <h2>Verbindungs-Suche</h2>
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Von (Haltestelle-ID)</mat-label>
      <input matInput type="number" [(ngModel)]="fromStop" placeholder="z.B. 1" />
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Nach (Haltestelle-ID)</mat-label>
      <input matInput type="number" [(ngModel)]="toStop" placeholder="z.B. 2" />
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Datum</mat-label>
      <input matInput type="text" [(ngModel)]="date" placeholder="2025-03-15" />
    </mat-form-field>

    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Uhrzeit</mat-label>
      <input matInput type="text" [(ngModel)]="time" placeholder="17:00:00" />
    </mat-form-field>

    <mat-checkbox [(ngModel)]="isArrivalTime">Ist Ankunftszeit?</mat-checkbox>
    <mat-checkbox [(ngModel)]="allowTransfers">Mit Umstieg?</mat-checkbox>

    <mat-form-field *ngIf="allowTransfers" appearance="outline" class="full-width">
      <mat-label>Maximale Umstiege</mat-label>
      <input matInput type="number" [(ngModel)]="maxTransfers" placeholder="z.B. 1" />
    </mat-form-field>

    <button mat-raised-button color="primary" (click)="searchConnections()">Suchen</button>
  </mat-card>

  <!-- Bereich für direkte Verbindungen -->
  <mat-card class="table-card" *ngIf="directResults.length > 0">
    <h2>Direkte Verbindungen</h2>
    <table mat-table [dataSource]="directResults" class="mat-elevation-z1">
      <ng-container matColumnDef="routeId">
        <th mat-header-cell *matHeaderCellDef>Route-ID</th>
        <td mat-cell *matCellDef="let d">{{ d.routeId }}</td>
      </ng-container>
      <ng-container matColumnDef="fromStop">
        <th mat-header-cell *matHeaderCellDef>Von</th>
        <td mat-cell *matCellDef="let d">{{ d.fromStop }}</td>
      </ng-container>
      <ng-container matColumnDef="toStop">
        <th mat-header-cell *matHeaderCellDef>Nach</th>
        <td mat-cell *matCellDef="let d">{{ d.toStop }}</td>
      </ng-container>
      <ng-container matColumnDef="departureTime">
        <th mat-header-cell *matHeaderCellDef>Abfahrt</th>
        <td mat-cell *matCellDef="let d">{{ d.departureTime }}</td>
      </ng-container>
      <ng-container matColumnDef="arrivalTime">
        <th mat-header-cell *matHeaderCellDef>Ankunft</th>
        <td mat-cell *matCellDef="let d">{{ d.arrivalTime }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="['routeId', 'fromStop', 'toStop', 'departureTime', 'arrivalTime']"></tr>
      <tr mat-row *matRowDef="let row; columns: ['routeId', 'fromStop', 'toStop', 'departureTime', 'arrivalTime']"></tr>
    </table>
    <button mat-raised-button color="accent" *ngIf="showMoreResults" (click)="loadMore()">Mehr anzeigen</button>
    <button mat-raised-button color="warn" *ngIf="!showMoreResults" (click)="showLess()">Weniger anzeigen</button>
  </mat-card>

  <!-- Bereich für komplexe Verbindungen -->
  <mat-card class="table-card" *ngIf="complexResults.length > 0">
    <h2>Komplexe Verbindungen</h2>
    <table mat-table [dataSource]="complexResults" class="mat-elevation-z1">
      <ng-container matColumnDef="routeIdA">
        <th mat-header-cell *matHeaderCellDef>Route A</th>
        <td mat-cell *matCellDef="let c">{{ c.routeIdA }}</td>
      </ng-container>
      <ng-container matColumnDef="routeIdB">
        <th mat-header-cell *matHeaderCellDef>Route B</th>
        <td mat-cell *matCellDef="let c">{{ c.routeIdB }}</td>
      </ng-container>
      <ng-container matColumnDef="fromStop">
        <th mat-header-cell *matHeaderCellDef>Von</th>
        <td mat-cell *matCellDef="let c">{{ c.fromStop }}</td>
      </ng-container>
      <ng-container matColumnDef="midStop">
        <th mat-header-cell *matHeaderCellDef>Zwischenstop</th>
        <td mat-cell *matCellDef="let c">{{ c.midStop }}</td>
      </ng-container>
      <ng-container matColumnDef="toStop">
        <th mat-header-cell *matHeaderCellDef>Nach</th>
        <td mat-cell *matCellDef="let c">{{ c.toStop }}</td>
      </ng-container>
      <ng-container matColumnDef="depA">
        <th mat-header-cell *matHeaderCellDef>Abfahrt A</th>
        <td mat-cell *matCellDef="let c">{{ c.depA }}</td>
      </ng-container>
      <ng-container matColumnDef="arrA">
        <th mat-header-cell *matHeaderCellDef>Ankunft A</th>
        <td mat-cell *matCellDef="let c">{{ c.arrA }}</td>
      </ng-container>
      <ng-container matColumnDef="depB">
        <th mat-header-cell *matHeaderCellDef>Abfahrt B</th>
        <td mat-cell *matCellDef="let c">{{ c.depB }}</td>
      </ng-container>
      <ng-container matColumnDef="arrB">
        <th mat-header-cell *matHeaderCellDef>Ankunft B</th>
        <td mat-cell *matCellDef="let c">{{ c.arrB }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="['routeIdA', 'routeIdB', 'fromStop', 'midStop', 'toStop', 'depA', 'arrA', 'depB', 'arrB']"></tr>
      <tr mat-row *matRowDef="let row; columns: ['routeIdA', 'routeIdB', 'fromStop', 'midStop', 'toStop', 'depA', 'arrA', 'depB', 'arrB']"></tr>
    </table>
    <button mat-raised-button color="accent" *ngIf="showMoreResults" (click)="loadMore()">Mehr anzeigen</button>
    <button mat-raised-button color="warn" *ngIf="!showMoreResults" (click)="showLess()">Weniger anzeigen</button>
  </mat-card>
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
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';
import {AuthenticationService} from '../../../shared/authentication.service';

@Component({
  selector: 'app-stops-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './stops-list.component.html',
  styleUrls: [],
})
export class StopsListComponent implements OnInit {
  // Anlegen von Stops
  newStopName: string = '';
  newStopShortcode: string = '';
  newStopLatitude: number | null = null;
  newStopLongitude: number | null = null;

  // Suche
  searchQuery: string = '';
  queryLimit: number = 3; // Standardlimit
  isLocationSearch: boolean = false; // Standortsuche
  isAllStopsLoaded: boolean = false; // Zeigt an, ob alle Stops geladen sind
  lastRequestUrl: string = ''; // Speichert den letzten Request-URL für "Mehr laden"
  noStopsFound: boolean = false; // Zeigt an, ob keine Ergebnisse gefunden wurden

  stops: any[] = [];
  displayedColumns: string[] = ['name', 'shortcode', 'latitude', 'longitude', 'actions'];
  dataSource = new MatTableDataSource(this.stops);

  private backendUrl = 'http://localhost:5213/api/STOP';

  constructor(private http: HttpClient, public authenticationService: AuthenticationService) { }

  ngOnInit(): void {}

  // Anlegen eines neuen Stops
  addStop() {
    const newStop = {
      name: this.newStopName,
      shortcode: this.newStopShortcode,
      latitude: this.newStopLatitude,
      longitude: this.newStopLongitude,
    };

    this.stops.push(newStop); // Lokal hinzufügen
    this.updateDataSource();

    this.newStopName = '';
    this.newStopShortcode = '';
    this.newStopLatitude = null;
    this.newStopLongitude = null;
  }

  // Standortsuche
  searchByLocation() {
    if (!navigator.geolocation) {
      console.error('Geolocation wird von diesem Browser nicht unterstützt.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        this.isLocationSearch = true;
        this.isAllStopsLoaded = false; // Zurücksetzen
        this.noStopsFound = false; // Zurücksetzen

        this.lastRequestUrl = `${this.backendUrl}/search?latitude=${latitude}&longitude=${longitude}`;
        const limitedUrl = `${this.lastRequestUrl}&queryLimit=${this.queryLimit}`;

        this.fetchStops(limitedUrl);
      },
      (error) => {
        console.error('Fehler beim Abrufen des Standorts:', error);
      }
    );
  }

  // Suche nach Namen
  searchByName() {
    if (!this.searchQuery) {
      console.error('Bitte geben Sie einen Suchbegriff ein.');
      return;
    }

    this.isLocationSearch = false;
    this.isAllStopsLoaded = false; // Zurücksetzen
    this.noStopsFound = false; // Zurücksetzen

    this.lastRequestUrl = `${this.backendUrl}/search?query=${this.searchQuery}`;
    const limitedUrl = `${this.lastRequestUrl}&queryLimit=${this.queryLimit}`;

    this.fetchStops(limitedUrl);
  }

  // Mehr Stops laden
  loadMoreStops() {
    if (this.isLocationSearch && this.lastRequestUrl) {
      this.fetchStops(this.lastRequestUrl); // Request ohne Limit ausführen
      this.isAllStopsLoaded = true; // Alle Stops geladen
    }
  }

  // Weniger Stops anzeigen
  showFewerStops() {
    if (this.isLocationSearch && this.lastRequestUrl) {
      const limitedUrl = `${this.lastRequestUrl}&queryLimit=${this.queryLimit}`;
      this.fetchStops(limitedUrl); // Begrenzten Request ausführen
      this.isAllStopsLoaded = false; // Zurück zu begrenzter Anzeige
    }
  }

  // Stop löschen
  deleteStop(index: number) {
    this.stops.splice(index, 1); // Lokal entfernen
    this.updateDataSource();
  }

  private fetchStops(url: string) {
    this.http.get<any[]>(url).subscribe((data) => {
      this.stops = data;
      this.updateDataSource();
      this.noStopsFound = data.length === 0; // Überprüfen, ob keine Ergebnisse gefunden wurden
    });
  }

  private updateDataSource() {
    this.dataSource.data = this.stops; // Aktualisiert die Tabelle
  }
}

```

### stops/stops-list/stops-list.component.html

```
<div class="container">
  <!-- Abschnitt: Stops anlegen -->
  @if (authenticationService.isLoggedIn()) {
    <mat-card class="form-card">
      <h2>Neuen Stop anlegen</h2>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="newStopName" name="newStopName" placeholder="z.B. FH Hagenberg" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Shortcode</mat-label>
        <input matInput [(ngModel)]="newStopShortcode" name="newStopShortcode" placeholder="z.B. FHHGB" />
      </mat-form-field>

      <div class="coordinates">
        <mat-form-field appearance="outline" class="coordinate-field">
          <mat-label>Latitude</mat-label>
          <input matInput type="number" [(ngModel)]="newStopLatitude" name="newStopLatitude" placeholder="48.3683..." />
        </mat-form-field>

        <mat-form-field appearance="outline" class="coordinate-field">
          <mat-label>Longitude</mat-label>
          <input matInput type="number" [(ngModel)]="newStopLongitude" name="newStopLongitude" placeholder="14.5151..." />
        </mat-form-field>
      </div>

      <button mat-raised-button color="primary" (click)="addStop()">Neuen Stop anlegen</button>
    </mat-card>
  }

  <!-- Abschnitt: Stops suchen -->
  <mat-card class="form-card">
    <h2>Stops suchen</h2>
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Suchbegriff (Stadt, etc.)</mat-label>
      <input matInput [(ngModel)]="searchQuery" name="searchQuery" placeholder="z.B. Hagenberg" />
    </mat-form-field>

    <button mat-raised-button color="primary" (click)="searchByName()">Nach Name suchen</button>
    <button mat-raised-button color="accent" (click)="searchByLocation()">Nach Standort suchen</button>
  </mat-card>

  <!-- Abschnitt: Stops anzeigen -->
  <mat-card class="table-card" *ngIf="stops.length > 0">
    <h2>Stops</h2>
    <table mat-table [dataSource]="dataSource" class="mat-elevation-z1">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let stop">{{ stop.name }}</td>
      </ng-container>

      <ng-container matColumnDef="shortcode">
        <th mat-header-cell *matHeaderCellDef>Shortcode</th>
        <td mat-cell *matCellDef="let stop">{{ stop.shortcode }}</td>
      </ng-container>

      <ng-container matColumnDef="latitude">
        <th mat-header-cell *matHeaderCellDef>Latitude</th>
        <td mat-cell *matCellDef="let stop">{{ stop.latitude }}</td>
      </ng-container>

      <ng-container matColumnDef="longitude">
        <th mat-header-cell *matHeaderCellDef>Longitude</th>
        <td mat-cell *matCellDef="let stop">{{ stop.longitude }}</td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let stop; let i = index">
          <button mat-icon-button color="warn" (click)="deleteStop(i)">
            <mat-icon>delete</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>

    <!-- Buttons: Mehr laden / Weniger anzeigen -->
    <button mat-raised-button color="accent" class="full-width" *ngIf="isLocationSearch && !isAllStopsLoaded" (click)="loadMoreStops()">
      Mehr laden
    </button>
    <button mat-raised-button color="warn" class="full-width" *ngIf="isLocationSearch && isAllStopsLoaded" (click)="showFewerStops()">
      Weniger anzeigen
    </button>
  </mat-card>

  <!-- Nachricht: Keine Ergebnisse -->
  <mat-card class="form-card" *ngIf="noStopsFound">
    <h3>Leider keine Stops gefunden.</h3>
  </mat-card>
</div>

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
 * Struktur für Stop
 */
export interface Stop {
  id: number; // Backend gibt "id" zurück, nicht "stopid"
  name: string;
}

/**
 * Struktur für RouteStop, Schedule und RouteWithStop (wie bereits vorhanden)
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
  scheduledtime?: string;
  isholiday?: boolean;
}

export interface RouteWithStop {
  id?: number;
  routenumber?: string;
  validfrom?: string;
  validto?: string;
  isweekend?: boolean;
  stops?: RouteStop[];
  schedules?: Schedule[];
}

@Injectable({
  providedIn: 'root'
})
export class RoutesService {
  private baseUrl = 'http://localhost:5213/api/ROUTE';
  private stopsUrl = 'http://localhost:5213/api/STOP'; // Endpunkt für Stops

  constructor(private http: HttpClient) {}

  /**
   * GET /api/ROUTE
   * Alle Routen abrufen
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
   * Neue Route erstellen
   */
  createRoute(newRoute: RouteWithStop): Observable<RouteWithStop> {
    return this.http.post<RouteWithStop>(this.baseUrl, newRoute);
  }

  /**
   * GET /api/STOP
   * Alle Stops laden
   */
  getAllStops(): Observable<Stop[]> {
    return this.http.get<Stop[]>(this.stopsUrl);
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
<div class="container">
    <h2>Routenverwaltung</h2>
  
    <!-- Abschnitt: Alle Routen laden -->
    <mat-card>
      <h3>Alle Routen laden</h3>
      <button mat-raised-button color="primary" (click)="loadAllRoutes()">Routen anzeigen</button>
      <table mat-table [dataSource]="routes" class="mat-elevation-z1" *ngIf="routes?.length">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let route">{{ route.id }}</td>
        </ng-container>
        <ng-container matColumnDef="routenumber">
          <th mat-header-cell *matHeaderCellDef>Nummer</th>
          <td mat-cell *matCellDef="let route">{{ route.routenumber }}</td>
        </ng-container>
        <ng-container matColumnDef="validfrom">
          <th mat-header-cell *matHeaderCellDef>Gültig von</th>
          <td mat-cell *matCellDef="let route">{{ route.validfrom | date }}</td>
        </ng-container>
        <ng-container matColumnDef="validto">
          <th mat-header-cell *matHeaderCellDef>Gültig bis</th>
          <td mat-cell *matCellDef="let route">{{ route.validto | date }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="['id', 'routenumber', 'validfrom', 'validto']"></tr>
        <tr mat-row *matRowDef="let row; columns: ['id', 'routenumber', 'validfrom', 'validto'];"></tr>
      </table>
    </mat-card>
  
    <!-- Abschnitt: Route nach ID suchen -->
    <mat-card>
      <h3>Route suchen</h3>
      <mat-form-field appearance="outline">
        <mat-label>Route ID</mat-label>
        <input matInput [(ngModel)]="routeIdToSearch" type="number" />
      </mat-form-field>
      <button mat-raised-button color="primary" (click)="loadRouteById()">Route anzeigen</button>
  
      <div *ngIf="selectedRoute">
        <h4>Details der Route</h4>
        <p><b>Nummer:</b> {{ selectedRoute.routenumber }}</p>
        <p><b>Gültig von:</b> {{ selectedRoute.validfrom }}</p>
        <p><b>Gültig bis:</b> {{ selectedRoute.validto }}</p>
        <p><b>Wochenendroute:</b> {{ selectedRoute.isweekend ? 'Ja' : 'Nein' }}</p>
  
        <div *ngIf="selectedRoute.stops?.length">
          <h5>Stops</h5>
          <div class="stops-container">
            <div *ngFor="let stop of selectedRoute.stops" class="stop-card">
              <p><b>{{ getStopName(stop.stopid) }}</b></p>
              <p>Reihenfolge: {{ stop.stoporder }}</p>
            </div>
          </div>
        </div>
  
        <div *ngIf="selectedRoute.schedules?.length">
          <h5>Schedules</h5>
          <div class="schedules-container">
            <div *ngFor="let schedule of selectedRoute.schedules" class="schedule-card">
              <p>Stop: {{ getStopName(schedule.stopid) }}</p>
              <p>Zeit: {{ schedule.scheduledtime }}</p>
              <p>Feiertag: {{ schedule.isholiday ? 'Ja' : 'Nein' }}</p>
            </div>
          </div>
        </div>
      </div>
    </mat-card>
  
    <!-- Abschnitt: Route erstellen -->
    <mat-card>
      <h3>Neue Route erstellen</h3>
      <mat-form-field appearance="outline">
        <mat-label>Routenummer</mat-label>
        <input matInput [(ngModel)]="newRoute.routenumber" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Gültig von</mat-label>
        <input matInput [matDatepicker]="pickerFrom" [(ngModel)]="newRoute.validfrom" />
        <mat-datepicker-toggle matSuffix [for]="pickerFrom"></mat-datepicker-toggle>
        <mat-datepicker #pickerFrom></mat-datepicker>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Gültig bis</mat-label>
        <input matInput [matDatepicker]="pickerTo" [(ngModel)]="newRoute.validto" />
        <mat-datepicker-toggle matSuffix [for]="pickerTo"></mat-datepicker-toggle>
        <mat-datepicker #pickerTo></mat-datepicker>
      </mat-form-field>
      <mat-checkbox [(ngModel)]="newRoute.isweekend">Ist Wochenendroute?</mat-checkbox>
  
      <h4>Stops hinzufügen</h4>
      <mat-form-field appearance="outline">
        <mat-label>Stop auswählen</mat-label>
        <mat-select [(ngModel)]="selectedStop">
          <mat-option *ngFor="let stop of allStops" [value]="stop">{{ stop.name }}</mat-option>
        </mat-select>
      </mat-form-field>
      <button mat-raised-button color="primary" (click)="addStop()">Stop hinzufügen</button>
  
      <div *ngIf="newRoute.stops?.length">
        <div class="stops-container">
          <div *ngFor="let stop of newRoute.stops" class="stop-card">
            <p><b>{{ getStopName(stop.stopid) }}</b></p>
            <p>Reihenfolge: {{ stop.stoporder }}</p>
          </div>
        </div>
      </div>
  
      <h4>Schedules hinzufügen</h4>
      <mat-form-field appearance="outline">
        <mat-label>Stop auswählen</mat-label>
        <mat-select [(ngModel)]="newSchedule.stopid">
          <mat-option *ngFor="let stop of newRoute.stops" [value]="stop.stopid">{{ getStopName(stop.stopid) }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Uhrzeit</mat-label>
        <input matInput [(ngModel)]="newSchedule.scheduledtime" type="time" />
      </mat-form-field>
      <mat-checkbox [(ngModel)]="newSchedule.isholiday">Ist Feiertag?</mat-checkbox>
      <button mat-raised-button color="primary" (click)="addSchedule()">Schedule hinzufügen</button>
  
      <div *ngIf="newRoute.schedules?.length">
        <div class="schedules-container">
          <div *ngFor="let schedule of newRoute.schedules" class="schedule-card">
            <p>Stop: {{ getStopName(schedule.stopid) }}</p>
            <p>Zeit: {{ schedule.scheduledtime }}</p>
            <p>Feiertag: {{ schedule.isholiday ? 'Ja' : 'Nein' }}</p>
          </div>
        </div>
      </div>
  
      <button mat-raised-button color="accent" (click)="createRoute()">Route erstellen</button>
    </mat-card>
  </div>
  
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
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RoutesService, RouteWithStop, Schedule, Stop } from '../routes.service';

@Component({
  selector: 'app-routes-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './routes-list.component.html',
  styleUrls: [],
})
export class RoutesListComponent implements OnInit {
  routes: RouteWithStop[] = [];
  allStops: Stop[] = [];
  selectedRoute: RouteWithStop | null = null;
  routeIdToSearch: number | null = null;

  newRoute: RouteWithStop = {
    routenumber: '',
    validfrom: '',
    validto: '',
    isweekend: false,
    stops: [],
    schedules: [],
  };

  selectedStop: Stop | null = null;
  newSchedule: Schedule = { stopid: 0, scheduledtime: '', isholiday: false };

  constructor(private routesService: RoutesService) {}

  ngOnInit(): void {
    this.loadAllStops();
  }

  loadAllRoutes() {
    this.routesService.getAllRoutes().subscribe(data => {
      this.routes = data || [];
    });
  }

  loadRouteById() {
    if (this.routeIdToSearch) {
      this.routesService.getRouteById(this.routeIdToSearch).subscribe(data => {
        this.selectedRoute = data || null;
      });
    }
  }

  loadAllStops() {
    this.routesService.getAllStops().subscribe(data => {
      this.allStops = data || [];
    });
  }

  addStop() {
    if (this.selectedStop) {
      const stopOrder = (this.newRoute.stops?.length || 0) + 1;
      this.newRoute.stops?.push({
        stopid: this.selectedStop.id,
        stoporder: stopOrder,
      });
      this.selectedStop = null;
    }
  }

  getStopName(stopId?: number): string {
    if (!stopId) {
      return 'Unbekannt';
    }
    const stop = this.allStops.find(s => s.id === stopId);
    return stop ? stop.name : 'Unbekannt';
  }

  addSchedule() {
    if (this.newSchedule.stopid && this.newSchedule.scheduledtime) {
      this.newRoute.schedules?.push({ ...this.newSchedule });
      this.newSchedule = { stopid: 0, scheduledtime: '', isholiday: false };
    }
  }

  createRoute() {
    this.routesService.createRoute(this.newRoute).subscribe(() => {
      this.loadAllRoutes();
      this.newRoute = {
        routenumber: '',
        validfrom: '',
        validto: '',
        isweekend: false,
        stops: [],
        schedules: [],
      };
    });
  }
}

```

