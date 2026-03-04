import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from '../models/session.model';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {

  private baseUrl = 'http://localhost:8089/api/sessions';

  constructor(private http: HttpClient) {}

  // GET ALL
  getAllSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.baseUrl}/all`);
  }

  // ADD
  addSession(session: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, session);
  }

  // DELETE
  deleteSession(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
  joinSession(sessionId: number): Observable<any> {
  return this.http.post(`${this.baseUrl}/${sessionId}/join`, {});
}

  // UPDATE
  updateSession(id: number, session: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, session);
  }

  // GET ONE (for edit form)
  getSessionById(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.baseUrl}/${id}`);
  }
  getSessionsByTrainerId(trainerId: number): Observable<Session[]> {
  return this.http.get<Session[]>(`${this.baseUrl}/sessions/trainer/${trainerId}`);
}

leaveSession(sessionId: number) {
  return this.http.post(`${this.baseUrl}/${sessionId}/leave`, {});
}
}
