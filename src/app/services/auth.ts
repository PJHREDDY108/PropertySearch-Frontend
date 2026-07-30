import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResponse {
  username: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private isBrowser: boolean;
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  register(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { username, password }).pipe(
      catchError(err => {
        const message = err?.error?.message || 'Could not register. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      catchError(err => {
        const message = err?.error?.message || 'Invalid username or password';
        return throwError(() => new Error(message));
      })
    );
  }

  setSession(username: string): void {
    if (this.isBrowser) {
      localStorage.setItem('username', username);
    }
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('username');
    }
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    return !!localStorage.getItem('username');
  }

  getUsername(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('username');
  }
}