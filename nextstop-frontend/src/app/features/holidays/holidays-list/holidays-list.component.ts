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
