import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrainerApplicationService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  submitApplication(application: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/applications`, application);
  }

  getMyApplications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/applications/my`);
  }

  getApplicationStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/applications/status`);
  }

  getByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/applications/user/${userId}`);
  }

  getDetailsByApplicationId(applicationId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/applications/${applicationId}`);
  }

  update(applicationId: number, application: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/applications/${applicationId}`, application);
  }

  delete(applicationId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/applications/${applicationId}`);
  }

  exists(userId: number): Observable<string> {
    return this.http.get(`${this.baseUrl}/applications/exists/${userId}`, { responseType: 'text' });
  }

  submit(application: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/applications`, application);
  }
}
