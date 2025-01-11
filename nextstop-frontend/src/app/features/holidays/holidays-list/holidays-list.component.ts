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
