import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'wea5-root',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatTabsModule,
    RouterOutlet,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>{{ title }}</span>
    </mat-toolbar>
    <mat-tab-group [(selectedIndex)]="selectedTabIndex" (selectedIndexChange)="onTabChange($event)">
      <mat-tab label="Feiertage"></mat-tab>
      <mat-tab label="Haltestellen"></mat-tab>
      <mat-tab label="Verbindungen"></mat-tab>
      <mat-tab label="Routen"></mat-tab>
      <mat-tab label="Statistik"></mat-tab>
    </mat-tab-group>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      mat-toolbar {
        position: sticky;
        top: 0;
        z-index: 1000;
      }
      mat-tab-group {
        margin-top: 1rem;
        background: #fff;
      }
      main {
        margin-top: 2rem;
        padding: 1rem;
      }
    `,
  ],
})
export class AppComponent {
  title = 'NextStop';

  selectedTabIndex: number = 0;

  constructor(private router: Router) {
    this.updateSelectedTab();
  }

  onTabChange(index: number): void {
    const routes = ['/holidays', '/stops', '/connections', '/routes', '/statistics'];
    if (index < routes.length) {
      this.router.navigate([routes[index]]);
    }
  }

  updateSelectedTab(): void {
    const routeToIndexMap: { [key: string]: number } = {
      '/holidays': 0,
      '/stops': 1,
      '/connections': 2,
      '/routes': 3,
      '/statistics': 4,
    };

    const currentRoute = this.router.url.split('?')[0];
    this.selectedTabIndex = routeToIndexMap[currentRoute] ?? 0;
  }
}
