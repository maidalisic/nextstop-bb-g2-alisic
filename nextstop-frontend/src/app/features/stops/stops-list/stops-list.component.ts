import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StopsService, Stop } from '../stops.service';

@Component({
  selector: 'wea5-stops-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stops-list.component.html',
  styleUrls: []
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
