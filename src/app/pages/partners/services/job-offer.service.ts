import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobOffer } from '../models/job-offer.model';

@Injectable({ providedIn: 'root' })
export class JobOfferService {
  private baseUrl = 'http://localhost:8081/api/offers';

  constructor(private http: HttpClient) {}

  // ADMIN (optionnel)
  getAllOffers(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.baseUrl}`);
  }

  // EMPLOYER
  getOffersByPartnerId(partnerId: number): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.baseUrl}/partner/${partnerId}`);
  }

  addOffer(offer: JobOffer): Observable<JobOffer> {
    return this.http.post<JobOffer>(`${this.baseUrl}`, offer);
  }

  updateOffer(id: number, offer: JobOffer): Observable<JobOffer> {
    return this.http.put<JobOffer>(`${this.baseUrl}/${id}`, offer);
  }

  deleteOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getOfferById(id: number): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${this.baseUrl}/${id}`);
  }

  updateOfferStatus(id: number, status: string): Observable<JobOffer> {
    return this.http.put<JobOffer>(`${this.baseUrl}/${id}/status?status=${status}`, {});
  }
}
