import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface AdminStats {
  total_users: number;
  total_solves: number;
  total_algorithms: number;
}

export interface AdminUsersPage {
  users: Array<Record<string, unknown>>;
  has_more: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private readonly http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${environment.apiUrl}/admin/stats`).pipe(
      catchError((err) => this.handleHttpError(err, 'Nie mozna pobrac statystyk'))
    );
  }

  getUsers(page = 1, limit = 20): Observable<AdminUsersPage> {
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this.http.get<AdminUsersPage>(`${environment.apiUrl}/admin/users`, { params }).pipe(
      catchError((err) => this.handleHttpError(err, 'Nie mozna pobrac listy uzytkownikow'))
    );
  }

  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/admin/users/${id}`).pipe(
      catchError((err) => this.handleHttpError(err, 'Nie mozna usunac uzytkownika'))
    );
  }

  changeUserPassword(id: number, newPassword: string, newPasswordConfirm: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${environment.apiUrl}/admin/users/${id}/password`, { new_password: newPassword, new_password_confirm: newPasswordConfirm }).pipe(
      catchError((err) => this.handleHttpError(err, 'Nie mozna zmienic hasla uzytkownika'))
    );
  }

  private handleHttpError(error: unknown, fallbackMessage: string) {
    if (error instanceof HttpErrorResponse) {
      const detail = error.error?.detail;
      const message = typeof detail === 'string' ? detail : detail ? JSON.stringify(detail) : fallbackMessage;
      return throwError(() => new Error(message));
    }
    return throwError(() => new Error(fallbackMessage));
  }
}
