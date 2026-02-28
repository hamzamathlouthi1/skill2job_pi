import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ Interface pour la réponse JWT
export interface JwtResponse {
  token: string;
  type: string;
  username: string;
  roles: string[];
}

// ✅ Interface pour les utilisateurs
export interface User {
  id: number;
  username: string;
  email: string;
  roles: { id: number; name: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8089/api'; // ✅ URL Spring Boot

  constructor(private http: HttpClient) {}

  // ──────────────────────────────────────
  //  AUTH
  // ──────────────────────────────────────

  login(username: string, password: string): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.baseUrl}/auth/login`, {
      username,
      password
    });
  }

 register(username: string, email: string, password: string, roles: string[]): Observable<string> {
  return this.http.post(
    `${this.baseUrl}/auth/register`,
    { username, email, password, roles },
    { responseType: 'text' }  // ✅ Spring retourne un String pas du JSON
  );
}

  // ──────────────────────────────────────
  //  TOKEN
  // ──────────────────────────────────────

  saveToken(token: string, userInfo: JwtResponse): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userInfo));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): JwtResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ──────────────────────────────────────
  //  HEADERS avec token
  // ──────────────────────────────────────

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  // ──────────────────────────────────────
  //  CRUD USERS (ADMIN seulement)
  // ──────────────────────────────────────

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/admin/users`, {
      headers: this.getAuthHeaders()
    });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/admin/users/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateUser(id: number, data: any): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/admin/users/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(id: number): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/admin/users/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}