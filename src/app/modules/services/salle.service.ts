import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Salle } from '../models/salle.model';   // 👈 ADD THIS

@Injectable({
  providedIn: 'root'
})
export class SalleService {

  private api = 'http://localhost:8089/api/salles';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Salle[]>(`${this.api}/all`);
  }

  getById(id: number) {
    return this.http.get<Salle>(`${this.api}/${id}`);
  }

  add(salle: Salle) {
    return this.http.post(`${this.api}/add`, salle);
  }

  update(id: number, salle: Salle) {
    return this.http.put(`${this.api}/update/${id}`, salle);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/delete/${id}`);
  }
}
