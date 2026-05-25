import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Algorithm } from '../models/algorithm.model';

@Injectable({ providedIn: 'root' })
export class AlgorithmService {
  constructor(private readonly http: HttpClient) {}

  getAlgorithms(category?: string): Observable<Algorithm[]> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<Record<string, unknown>[]>(`${environment.apiUrl}/algorithms`, { params }).pipe(
      map((algorithms) => algorithms.map((algorithm) => this.mapBackendAlgorithm(algorithm))),
      catchError((error) => this.handleHttpError(error, 'Nie mozna pobrac algorytmow.'))
    );
  }

  createAlgorithm(formData: FormData): Observable<Algorithm> {
    return this.http.post<Record<string, unknown>>(`${environment.apiUrl}/algorithms`, formData).pipe(
      map((algorithm) => this.mapBackendAlgorithm(algorithm)),
      catchError((error) => this.handleHttpError(error, 'Nie mozna dodac algorytmu.'))
    );
  }

  updateAlgorithm(id: number, formData: FormData): Observable<Algorithm> {
    return this.http.put<Record<string, unknown>>(`${environment.apiUrl}/algorithms/${id}`, formData).pipe(
      map((algorithm) => this.mapBackendAlgorithm(algorithm)),
      catchError((error) => this.handleHttpError(error, 'Nie mozna zaktualizowac algorytmu.'))
    );
  }

  deleteAlgorithm(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/algorithms/${id}`).pipe(
      catchError((error) => this.handleHttpError(error, 'Nie mozna usunac algorytmu.'))
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

  private mapBackendAlgorithm(algorithm: Record<string, unknown>): Algorithm {
    return {
      id: Number(algorithm['id']),
      category: String(algorithm['category']),
      name: String(algorithm['name'] ?? ''),
      moves: String(algorithm['moves'] ?? ''),
      description: algorithm['description'] == null ? null : String(algorithm['description']),
      imageUrl: algorithm['image_url'] == null ? null : String(algorithm['image_url']),
      createdAt: algorithm['created_at'] ? String(algorithm['created_at']) : undefined
    };
  }
}
