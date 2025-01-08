import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConnectionsService, DirectConnection, ComplexConnection } from '../connections.service';

@Component({
  selector: 'wea5-connections-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './connections-list.component.html',
  styleUrls: []
})
export class ConnectionsListComponent {
  // Form-Eingaben
  fromStop = 1;      // Demo: Start-Haltestelle (ID)
  toStop = 2;        // Demo: Ziel-Haltestelle (ID)
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
      date: this.date + 'T00:00:00',  // oder belasse es bei date: "2025-03-15"
      time: this.time,
      isArrivalTime: this.isArrivalTime,
      maxResults: this.maxResults
    };

    this.connService.getDirectConnections(params).subscribe({
      next: (data) => {
        this.directResults = data;
        console.log('Direct connections:', data);
      },
      error: (err) => console.error('Error loading direct connections', err)
    });
  }

  searchComplex() {
    const params = {
      from: this.fromStop,
      to: this.toStop,
      date: this.date + 'T00:00:00',
      time: this.time,
      isArrivalTime: this.isArrivalTime,
      maxResults: this.maxResults
    };

    this.connService.getComplexConnections(params).subscribe({
      next: (data) => {
        this.complexResults = data;
        console.log('Complex connections:', data);
      },
      error: (err) => console.error('Error loading complex connections', err)
    });
  }
}
