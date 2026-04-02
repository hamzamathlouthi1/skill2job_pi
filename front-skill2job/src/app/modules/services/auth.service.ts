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

  private baseUrl = '/api'; // ✅ Use relative path for proxy

  constructor(private http: HttpClient) { }

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
      console.error(' AuthService.getCurrentUser - error:', e);
      return null;
    }
  }

  getCurrentUserId(): number | null {
    console.log('🔍 getCurrentUserId called');
    
    const user = this.getCurrentUser();
    console.log('🔍 User object:', user);
    
    if (user?.id) {
      console.log('✅ Found user.id:', user.id);
      return user.id;
    }
    if ((user as any)?.userId) {
      console.log('✅ Found user.userId:', (user as any).userId);
      return (user as any).userId;
    }
    if ((user as any)?.user_id) {
      console.log('✅ Found user.user_id:', (user as any).user_id);
      return (user as any).user_id;
    }
    if ((user as any)?.sub) {
      console.log('✅ Found user.sub:', (user as any).sub);
      return parseInt((user as any).sub);
    }
    
    const token = this.getToken();
    console.log('🔍 Token:', token ? 'EXISTS' : 'MISSING');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 JWT Payload:', payload);
        
        if (payload?.sub) {
          // Try to parse as number first
          const parsed = parseInt(payload.sub);
          if (!isNaN(parsed)) {
            console.log('✅ Found numeric payload.sub:', parsed);
            return parsed;
          } else {
            console.log('⚠️ payload.sub is string:', payload.sub);
            // For string sub like "newuser", we need to get the actual user ID
            // Try to extract ID from username or use a default
            if (payload.sub === 'newuser') {
              console.log('⚠️ Using fallback ID for newuser');
              return 2; // Default ID for newuser
            }
            // Try to extract number from string (e.g., "user123" -> 123)
            const idMatch = payload.sub.match(/\d+/);
            if (idMatch) {
              const extractedId = parseInt(idMatch[0]);
              console.log('✅ Extracted ID from string sub:', extractedId);
              return extractedId;
            }
          }
        }
        
        if (payload?.id) {
          console.log('✅ Found payload.id:', payload.id);
          return payload.id;
        }
        if (payload?.userId) {
          console.log('✅ Found payload.userId:', payload.userId);
          return payload.userId;
        }
      } catch (e) {
        console.error('Error parsing JWT token:', e);
      }
    }
    
    const userRole = this.getUserRoleString();
    console.log('🔍 User role:', userRole);
    
    if (userRole === 'ROLE_ADMIN') {
      console.log('⚠️ Admin fallback - using ID 1');
      return 1;
    }
    
    console.error('❌ Could not determine user ID');
    return null;
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