import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private oAuthService: OAuthService) { }

  login(): boolean {
    this.oAuthService.initCodeFlow();
    return true;
  }

  isLoggedIn() {
    return this.oAuthService.hasValidAccessToken() &&
      this.oAuthService.hasValidIdToken();
  }

}
