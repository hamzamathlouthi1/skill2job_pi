import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HrService {

  private apiUrl = 'http://localhost:8087/api/applications';

  constructor(private http: HttpClient) {}

  // GET all + optional filter by status
  getAllApplications(status?: string): Observable<any[]> {
    const url = status ? `${this.apiUrl}?status=${status}` : this.apiUrl;
    return this.http.get<any[]>(url);
  }

  // ✅ AI Analyze => creates/updates TrainerDetails
  analyzeApplication(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/analyze`, {});
  }

  // ✅ Admin decision => ACCEPT / REJECT
  decide(id: number, decision: 'ACCEPT' | 'REJECT'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/decision?decision=${decision}`, {});
  }

  // DELETE
  deleteApplication(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
