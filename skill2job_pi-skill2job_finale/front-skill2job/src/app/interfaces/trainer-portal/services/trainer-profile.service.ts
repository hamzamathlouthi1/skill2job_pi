import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrainerProfileService {
  private baseUrl = 'http://localhost:8090/api/admin/trainer-profiles';
  private detailsUrl = 'http://localhost:8090/api/admin/trainer-details';

  constructor(private http: HttpClient) {}

  getMine(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/by-user/${userId}`);
  }

  updateMyProfile(userId: number, profile: any): Observable<any> {
    return this.getMine(userId).pipe(
      switchMap((existing: any) =>
        this.http.put(`${this.baseUrl}/${existing.id}`, profile)
      )
    );
  }

  getDetailsByApplicationId(applicationId: number): Observable<any> {
    return this.http.get(`${this.detailsUrl}/by-application/${applicationId}`);
  }
}