import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TrainerProfileFoService {
  private baseUrl = 'http://localhost:8090/api/admin/trainer-profiles';
  private detailsUrl = 'http://localhost:8090/api/admin/trainer-details';

  constructor(private http: HttpClient) {}

  getMine(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/by-user/${userId}`);
  }

  getDetailsByApplicationId(applicationId: number): Observable<any> {
    return this.http.get(`${this.detailsUrl}/by-application/${applicationId}`);
  }
}