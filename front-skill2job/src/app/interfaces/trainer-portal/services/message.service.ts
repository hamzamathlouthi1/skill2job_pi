import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private baseUrl = 'http://localhost:8087/api';

  constructor(private http: HttpClient) {}

  getMyMessages(): Observable<any> {
    return this.http.get(`${this.baseUrl}/messages/trainer`);
  }

  markMessageAsRead(messageId: number, userId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/messages/${messageId}/read`, {});
  }

  getConversation(applicationId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/messages/application/${applicationId}`);
  }

  send(message: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/messages`, message);
  }

  // Add missing countUnread method
  countUnread(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/messages/unread/count?userId=${userId}`);
  }
}
