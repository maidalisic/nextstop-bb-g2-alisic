import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app/app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    BrowserAnimationsModule,
    provideRouter(routes),   // Routing
    provideHttpClient(), provideAnimationsAsync(),     // HTTP-Client für API-Aufrufe
  ],
}).catch(err => console.error(err));
