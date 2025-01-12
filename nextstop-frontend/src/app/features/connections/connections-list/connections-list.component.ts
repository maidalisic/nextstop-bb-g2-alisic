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
