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
  newStopName: string = '';
  newStopShortcode: string = '';
  newStopLatitude: number | null = null;
  newStopLongitude: number | null = null;

  searchQuery: string = '';
  queryLimit: number = 3;
  isLocationSearch: boolean = false;
  isAllStopsLoaded: boolean = false;
  lastRequestUrl: string = '';
  noStopsFound: boolean = false;

  stops: any[] = [];
  displayedColumns: string[] = ['name', 'shortcode', 'latitude', 'longitude', 'actions'];
  dataSource = new MatTableDataSource(this.stops);

  private backendUrl = 'http://localhost:5213/api/STOP';

  constructor(private http: HttpClient, public authenticationService: AuthenticationService) { }

  ngOnInit(): void {}

  addStop() {
    const newStop = {
      name: this.newStopName,
      shortcode: this.newStopShortcode,
      latitude: this.newStopLatitude,
      longitude: this.newStopLongitude,
    };

    this.stops.push(newStop);
    this.updateDataSource();

    this.newStopName = '';
    this.newStopShortcode = '';
    this.newStopLatitude = null;
    this.newStopLongitude = null;
  }

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
        this.isAllStopsLoaded = false;
        this.noStopsFound = false;

        this.lastRequestUrl = `${this.backendUrl}/search?latitude=${latitude}&longitude=${longitude}`;
        const limitedUrl = `${this.lastRequestUrl}&queryLimit=${this.queryLimit}`;

        this.fetchStops(limitedUrl);
      },
      (error) => {
        console.error('Fehler beim Abrufen des Standorts:', error);
      }
    );
  }

  searchByName() {
    if (!this.searchQuery) {
      console.error('Bitte geben Sie einen Suchbegriff ein.');
      return;
    }

    this.isLocationSearch = false;
    this.isAllStopsLoaded = false;
    this.noStopsFound = false;

    this.lastRequestUrl = `${this.backendUrl}/search?query=${this.searchQuery}`;
    const limitedUrl = `${this.lastRequestUrl}&queryLimit=${this.queryLimit}`;

    this.fetchStops(limitedUrl);
  }

  loadMoreStops() {
    if (this.isLocationSearch && this.lastRequestUrl) {
      this.fetchStops(this.lastRequestUrl);
      this.isAllStopsLoaded = true;
    }
  }

  showFewerStops() {
    if (this.isLocationSearch && this.lastRequestUrl) {
      const limitedUrl = `${this.lastRequestUrl}&queryLimit=${this.queryLimit}`;
      this.fetchStops(limitedUrl);
      this.isAllStopsLoaded = false;
    }
  }

  deleteStop(index: number) {
    this.stops.splice(index, 1);
    this.updateDataSource();
  }

  private fetchStops(url: string) {
    this.http.get<any[]>(url).subscribe((data) => {
      this.stops = data;
      this.updateDataSource();
      this.noStopsFound = data.length === 0;
    });
  }

  private updateDataSource() {
    this.dataSource.data = this.stops;
  }
}
