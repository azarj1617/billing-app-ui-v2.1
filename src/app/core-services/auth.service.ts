import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthService implements HttpInterceptor {
  constructor(private router:Router){}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('accessToken'); // get your JWT
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      // console.log('test');      
      // return next.handle(authReq);
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);        
        if (error.status === 401 || error.status === 403) {
          // ✅ Token expired or invalid
          this.handleLogout();
        }
        return throwError(() => error);
      })
    );;
  }
  handleLogout(){
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigateByUrl('login');
  }
}
