import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partner } from '../models/partner.model';

@Injectable({ providedIn: 'root' })
export class PartnerService {
  private baseUrl = 'http://localhost:8081/api/partners';

  constructor(private http: HttpClient) {}

  // ================= ADMIN =================
  getAllPartners(): Observable<Partner[]> {
    return this.http.get<Partner[]>(`${this.baseUrl}/all`);
  }

  updatePartnerStatus(partnerId: number, status: string): Observable<Partner> {
    return this.http.put<Partner>(`${this.baseUrl}/${partnerId}/status?status=${status}`, {});
  }

  // ================= EMPLOYER =================
  getPartnerByEmployerId(employerId: number): Observable<Partner> {
    return this.http.get<Partner>(`${this.baseUrl}/employer/${employerId}`);
  }

  addPartner(employerId: number, partner: Partner): Observable<Partner> {
    return this.http.post<Partner>(`${this.baseUrl}/employer/${employerId}`, partner);
  }

  updatePartner(employerId: number, partner: Partner): Observable<Partner> {
    return this.http.put<Partner>(`${this.baseUrl}/employer/${employerId}`, partner);
  }

  // EMPLOYER: delete my partner
deletePartnerByEmployerId(employerId: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/employer/${employerId}`);
}

// ADMIN: delete partner by id
deletePartnerById(partnerId: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${partnerId}`);
}
getPartnerById(id: number): Observable<Partner> {
  return this.http.get<Partner>(`${this.baseUrl}/${id}`);
}


}
