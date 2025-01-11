import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stops-list',
  standalone: true,
  imports: [
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
  newStopName: string = '';
  newStopShortcode: string = '';
  newStopLatitude: number | null = null;
  newStopLongitude: number | null = null;

  searchQuery: string = '';
  searchLat: number | null = null;
  searchLong: number | null = null;
  searchLimit: number | null = null;

  stops: any[] = [];

  constructor() {}

  ngOnInit(): void {}

  addStop() {
    const newStop = {
      name: this.newStopName,
      shortcode: this.newStopShortcode,
      latitude: this.newStopLatitude,
      longitude: this.newStopLongitude,
    };

    this.stops.push(newStop);

    // Reset form
    this.newStopName = '';
    this.newStopShortcode = '';
    this.newStopLatitude = null;
    this.newStopLongitude = null;
  }

  searchStops() {
    console.log('Searching stops with query:', this.searchQuery);
    // Add logic to fetch/search stops here
  }

  deleteStop(index: number) {
    this.stops.splice(index, 1);
  }
}
