import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Category {
  id?: number;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiUrl = 'http://localhost:8089/api/categories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category)
      .pipe(catchError(this.handleError));
  }

  // ✅ UPDATE FIX
  update(id: number, category: Category): Observable<Category> {

    // Important — backend souvent exige l’id dans le body
    const payload = {
      ...category,
      id: id
    };

    return this.http.put<Category>(
      `${this.apiUrl}/${id}`,
      payload
    ).pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {

    let message = 'Erreur inconnue';

    if (error.status === 0) {
      message = 'Connexion backend impossible';
    } else if (error.error?.message) {
      message = error.error.message;
    } else {
      message = `Erreur serveur: ${error.status}`;
    }

    console.error('HTTP ERROR:', error);
    return throwError(() => new Error(message));
  }
}
