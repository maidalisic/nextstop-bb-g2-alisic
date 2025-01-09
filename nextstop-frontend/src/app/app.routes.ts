import { Routes } from '@angular/router';
import { HolidaysListComponent } from './features/holidays/holidays-list/holidays-list.component';
import { StopsListComponent } from './features/stops/stops-list/stops-list.component';
import { ConnectionsListComponent } from './features/connections/connections-list/connections-list.component';
import { RoutesListComponent } from './features/routes/routes-list/routes-list.component';
import { StatisticsListComponent } from './features/statistics/statistics-list/statistics-list.component';

export const routes: Routes = [
  { path: 'holidays', component: HolidaysListComponent },
  { path: 'stops', component: StopsListComponent },
  { path: 'connections', component: ConnectionsListComponent },
  { path: 'routes', component: RoutesListComponent },
  { path: 'statistics', component: StatisticsListComponent },
  { path: '', redirectTo: 'holidays', pathMatch: 'full' }
];
