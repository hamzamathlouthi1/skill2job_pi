import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface NotificationResponse {
  id: number;
  type: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private baseUrl = '/api/notifications';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  myNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.baseUrl}/me`, {
      headers: this.headers()
    });
  }

  unreadCount(): Observable<{ unread: number }> {
    return this.http.get<{ unread: number }>(`${this.baseUrl}/unread-count`, {
      headers: this.headers()
    });
  }

  markRead(id: number): Observable<string> {
    return this.http.put(`${this.baseUrl}/${id}/read`, {}, {
      headers: this.headers(),
      responseType: 'text'
    });
  }

  markAllRead(): Observable<string> {
    return this.http.put(`${this.baseUrl}/read-all`, {}, {
      headers: this.headers(),
      responseType: 'text'
    });
  }

  deleteOne(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.headers(),
      responseType: 'text'
    });
  }

  clearAll(): Observable<string> {
    return this.http.delete(`${this.baseUrl}/clear-all`, {
      headers: this.headers(),
      responseType: 'text'
    });
  }
}