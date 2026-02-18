import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Equipment } from '../models/equipment.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {

  private baseUrl = 'http://localhost:8081/api/equipments';

  constructor(private http: HttpClient) {}

  getAllEquipments(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${this.baseUrl}/all`);
  }
  addWithPhoto(formData: FormData) {
  return this.http.post('http://localhost:8081/api/equipments/add-with-photo', formData);
}

}
