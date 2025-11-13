import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private router: Router) { }
  canActivate(): boolean {
    const token = localStorage.getItem('accessToken');

    if (token) {
      // ✅ Token exists, allow navigation
      return true;
    } else {
      // ❌ No token → block navigation
      this.router.navigate(['/login']);  // redirect to login
      return false;
    }
  }
}
