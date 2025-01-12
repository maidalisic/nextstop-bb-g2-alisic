import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {provideHttpClient, withInterceptors, withInterceptorsFromDi} from '@angular/common/http';
import {provideOAuthClient} from 'angular-oauth2-oidc';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    provideOAuthClient(),
    BrowserAnimationsModule,
    provideAnimationsAsync(),
  ]
};
