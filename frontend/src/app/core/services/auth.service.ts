import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { AuthTokenResponse, LoginCredentials, RegisterData } from '../models/auth.model';

type JwtPayload = {
  sub?: string;
  user_id?: number;
  role?: 'user' | 'admin';
  exp?: number;
  iat?: number;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser$ = new BehaviorSubject<User | null>(null);
  readonly isLoggedIn$ = this.currentUser$.pipe(map((user) => Boolean(user)));

  constructor(private readonly http: HttpClient) {
    const cachedUser = this.loadCachedUser();
    if (cachedUser) {
      this.currentUser$.next(cachedUser);
    } else {
      const tokenUser = this.buildUserFromToken();
      if (tokenUser) {
        this.currentUser$.next(tokenUser);
        queueMicrotask(() => {
          this.restoreSession().subscribe({
            error: () => this.logout()
          });
        });
      }
    }
  }

  login(credentials: LoginCredentials): Observable<User> {
    return this.http.post<AuthTokenResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => localStorage.setItem('token', response.access_token)),
      switchMap((response) => {
        const payload = this.decodeToken(response.access_token);
        if (!payload?.sub) {
          return throwError(() => new Error('Nieprawidlowy token logowania.'));
        }
        const immediateUser = this.buildUserFromPayload(payload);
        if (immediateUser) {
          this.currentUser$.next(immediateUser);
          localStorage.setItem('currentUser', JSON.stringify(immediateUser));
        }
        return this.hydrateCurrentUser();
      }),
      catchError((error) => this.handleHttpError(error, 'Blad logowania.'))
    );
  }

  register(data: RegisterData): Observable<User> {
    return this.http.post<Record<string, unknown>>(`${environment.apiUrl}/auth/register`, data).pipe(
      map((user) => this.mapBackendUser(user)),
      catchError((error) => this.handleHttpError(error, 'Blad rejestracji.'))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUser$.next(null);
  }

  restoreSession(): Observable<User> {
    return this.hydrateCurrentUser().pipe(
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private hydrateCurrentUser(): Observable<User> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.currentUser$.next(null);
      return throwError(() => new Error('Brak tokenu.'));
    }

    const payload = this.decodeToken(token);
    if (!payload?.sub) {
      this.logout();
      return throwError(() => new Error('Nieprawidlowy token.'));
    }

    return this.http.get<Record<string, unknown>>(`${environment.apiUrl}/auth/me`).pipe(
      map((user) => this.mapBackendUser(user)),
      tap((user) => {
        this.currentUser$.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }),
      catchError((error) => this.handleHttpError(error, 'Nie mozna odtworzyc sesji.'))
    );
  }

  getTokenPayload(): JwtPayload | null {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    return this.decodeToken(token);
  }

  private mapBackendUser(user: Record<string, unknown>): User {
    return {
      id: Number(user['id']),
      username: String(user['username'] ?? ''),
      email: user['email'] ? String(user['email']) : undefined,
      role: user['role'] === 'admin' ? 'admin' : 'user',
      bio: user['bio'] == null ? null : String(user['bio']),
      cubeSetup: user['cube_setup'] == null ? null : String(user['cube_setup']),
      ao5: user['ao5'] == null ? null : Number(user['ao5']),
      ao12: user['ao12'] == null ? null : Number(user['ao12']),
      bestTimeMs: user['best_time_ms'] == null ? null : Number(user['best_time_ms']),
      createdAt: user['created_at'] ? String(user['created_at']) : undefined
    };
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const [, payloadBase64] = token.split('.');
      if (!payloadBase64) {
        return null;
      }

      const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '='));
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }

  private loadCachedUser(): User | null {
    const raw = localStorage.getItem('currentUser');
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private buildUserFromToken(): User | null {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    return this.buildUserFromPayload(this.decodeToken(token));
  }

  private buildUserFromPayload(payload: JwtPayload | null): User | null {
    if (!payload?.sub) {
      return null;
    }

    return {
      id: typeof payload.user_id === 'number' ? payload.user_id : 0,
      username: payload.sub,
      role: payload.role ?? 'user'
    };
  }

  private handleHttpError(error: unknown, fallbackMessage: string): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      return throwError(() => new Error(error.error?.detail ?? fallbackMessage));
    }

    if (error instanceof Error) {
      return throwError(() => error);
    }

    return throwError(() => new Error(fallbackMessage));
  }
}
