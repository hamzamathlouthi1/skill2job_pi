import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from '../models/session.model';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {

  private baseUrl = 'http://localhost:8081/api/sessions';

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

  // UPDATE
  updateSession(id: number, session: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, session);
  }

  // GET ONE (for edit form)
  getSessionById(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.baseUrl}/${id}`);
  }
}
