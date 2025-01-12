import { Routes } from '@angular/router';
import {canNavigateToAdminGuard} from './can-navigate-to-admin.guard';

export const routes: Routes = [
  {
    path: 'holidays',
    loadComponent: () =>
      import('./features/holidays/holidays-list/holidays-list.component').then(
        (m) => m.HolidaysListComponent
      ), canActivate:[canNavigateToAdminGuard]
  },
  {
    path: 'stops',
    loadComponent: () =>
      import('./features/stops/stops-list/stops-list.component').then(
        (m) => m.StopsListComponent
      ),
  },
  {
    path: 'connections',
    loadComponent: () =>
      import(
        './features/connections/connections-list/connections-list.component'
      ).then((m) => m.ConnectionsListComponent),
  },
  {
    path: 'routes',
    loadComponent: () =>
      import('./features/routes/routes-list/routes-list.component').then(
        (m) => m.RoutesListComponent
      ), canActivate:[canNavigateToAdminGuard]
  },
  {
    path: 'statistics',
    loadComponent: () =>
      import('./features/statistics/statistics-list/statistics-list.component').then(
        (m) => m.StatisticsListComponent
      ),
  },
  { path: '', redirectTo: 'connections', pathMatch: 'full' },
  { path: '**', redirectTo: 'connections' },
];
