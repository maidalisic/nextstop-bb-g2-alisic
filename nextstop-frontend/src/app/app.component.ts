import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'wea5-root',
  standalone: true,
  imports: [
    RouterOutlet,  // Damit <router-outlet> funktioniert
    RouterLink     // Damit <a routerLink="..."> funktioniert
  ],
  template: `
    <h1>NextStop Frontend</h1>
    <nav class="ui secondary menu">
      <a class="item" routerLink="/holidays">Feiertage</a>
      <a class="item" routerLink="/stops">Haltestellen</a>
      <a class="item" routerLink="/connections">Verbindungen</a>
      <a class="item" routerLink="/routes">Routen</a>
      <a class="item" routerLink="/statistics">Statistik</a>
    </nav>
    <hr />
    <router-outlet></router-outlet>
  `,
  styles: [],
})
export class AppComponent {
  title = 'nextstop-frontend';
}
