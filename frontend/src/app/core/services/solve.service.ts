import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Solve } from '../models/solve.model';

export interface SolveCreateData {
  timeMs: number;
  scramble: string;
  dnf?: boolean;
  plusTwo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SolveService {
  constructor(private readonly http: HttpClient) {}

  createSolve(data: SolveCreateData): Observable<Solve> {
    return this.http.post<Record<string, unknown>>(`${environment.apiUrl}/solves`, {
      time_ms: data.timeMs,
      scramble: data.scramble,
      dnf: data.dnf ?? false,
      plus_two: data.plusTwo ?? false
    }).pipe(
      map((solve) => this.mapBackendSolve(solve)),
      catchError((error) => this.handleHttpError(error, 'Nie mozna zapisac ukladania.'))
    );
  }

  getMySolves(): Observable<Solve[]> {
    return this.http.get<Record<string, unknown>[]>(`${environment.apiUrl}/solves/me`).pipe(
      map((solves) => solves.map((solve) => this.mapBackendSolve(solve))),
      catchError((error) => this.handleHttpError(error, 'Nie mozna pobrac ukladania.'))
    );
  }

  getUserTop10(userId: number): Observable<Solve[]> {
    return this.http.get<Record<string, unknown>[]>(`${environment.apiUrl}/solves/user/${userId}`).pipe(
      map((solves) => solves.map((solve) => this.mapBackendSolve(solve))),
      catchError((error) => this.handleHttpError(error, 'Nie mozna pobrac top 10.'))
    );
  }

  deleteSolve(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/solves/${id}`).pipe(
      catchError((error) => this.handleHttpError(error, 'Nie mozna usunac ukladania.'))
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

  private mapBackendSolve(solve: Record<string, unknown>): Solve {
    return {
      id: Number(solve['id']),
      timeMs: Number(solve['time_ms']),
      scramble: String(solve['scramble'] ?? ''),
      dnf: Boolean(solve['dnf']),
      plusTwo: Boolean(solve['plus_two']),
      createdAt: solve['created_at'] ? String(solve['created_at']) : undefined
    };
  }
}
