import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrainerProfileService {
  private baseUrl = 'http://localhost:8090/api';

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/trainer-profile/my`);
  }

  updateMyProfile(profile: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/trainer-profile/my`, profile);
  }

  getMine(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/trainer-profiles/me?userId=${userId}`);
  }
}
