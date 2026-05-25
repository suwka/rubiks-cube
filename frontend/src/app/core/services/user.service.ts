import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { ChangePasswordData, UpdateProfileData } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly http: HttpClient) {}

  getUser(id: number): Observable<User> {
    return this.http.get<Record<string, unknown>>(`${environment.apiUrl}/users/${id}`).pipe(
      map((user) => this.mapBackendUser(user)),
      catchError((error) => this.handleHttpError(error, 'Nie mozna pobrac uzytkownika.'))
    );
  }

  updateProfile(data: UpdateProfileData): Observable<User> {
    return this.http.put<Record<string, unknown>>(`${environment.apiUrl}/users/me`, {
      bio: data.bio,
      cube_setup: data.cubeSetup
    }).pipe(
      map((user) => this.mapBackendUser(user)),
      catchError((error) => this.handleHttpError(error, 'Nie mozna zapisac profilu.'))
    );
  }

  changePassword(data: ChangePasswordData): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${environment.apiUrl}/users/me/password`, {
      old_password: data.oldPassword,
      new_password: data.newPassword,
      new_password_confirm: data.newPasswordConfirm
    }).pipe(
      catchError((error) => this.handleHttpError(error, 'Nie mozna zmienic hasla.'))
    );
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
}
