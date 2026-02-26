import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ Interface pour la réponse JWT
export interface JwtResponse {
  token: string;
  type: string;
  username: string;
  email?: string;
  id?: number;
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
  console.log('📝 saveToken called with token:', token);
  console.log('📝 saveToken called with userInfo:', userInfo);
  
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userInfo));
    console.log('✅ Token saved successfully');
    console.log('✅ Verification - token:', localStorage.getItem('token'));
    console.log('✅ Verification - user:', localStorage.getItem('user'));
  } catch (e) {
    console.error('❌ Error saving to localStorage:', e);
  }
}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): JwtResponse | null {
  const userStr = localStorage.getItem('user');
  console.log('🔍 AuthService.getCurrentUser - raw:', userStr);
  
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    console.log('🔍 AuthService.getCurrentUser - parsed:', user);
    return user;
  } catch (e) {
    console.error('🔍 AuthService.getCurrentUser - error:', e);
    return null;
  }
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

  // Add this method to safely get user role as string
getUserRoleString(): string | null {
  const user = this.getCurrentUser();
  if (!user || !user.roles || user.roles.length === 0) {
    return null;
  }
  
  const firstRole = user.roles[0];
  
  // Handle string role
  if (typeof firstRole === 'string') {
    return firstRole;
  }
  
  // Handle object role
  if (firstRole && typeof firstRole === 'object') {
    // Try to get name property
    const roleObj = firstRole as any;
    return roleObj.name || roleObj.role || null;
  }
  
  return null;
}
}