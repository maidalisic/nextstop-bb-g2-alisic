import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'wea5-root',
  standalone: true, // Diese Komponente ist standalone
  imports: [
    RouterOutlet, // Ermöglicht das Routing
    RouterLink,   // Ermöglicht Router-Links
  ],
  template: `
    <header>
      <h1>NextStop Frontend</h1>
      <nav class="ui secondary pointing menu">
        <a class="item" routerLink="/holidays" routerLinkActive="active">Feiertage</a>
        <a class="item" routerLink="/stops" routerLinkActive="active">Haltestellen</a>
        <a class="item" routerLink="/connections" routerLinkActive="active">Verbindungen</a>
        <a class="item" routerLink="/routes" routerLinkActive="active">Routen</a>
        <a class="item" routerLink="/statistics" routerLinkActive="active">Statistik</a>
      </nav>
    </header>
    <main class="ui container">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      header {
        margin-bottom: 2rem;
      }
      main {
        margin-top: 2rem;
      }
    `
  ],
})
export class AppComponent {
  title = 'NextStop Frontend';
}
