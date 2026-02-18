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
deleteEquipment(id: number) {
  return this.http.delete(`http://localhost:8081/api/equipments/delete/${id}`);
}

updateEquipment(id: number, equipment: Equipment) {
  return this.http.put<Equipment>(
    `http://localhost:8081/api/equipments/update/${id}`,
    equipment
  );
}

getById(id: number) {
  return this.http.get<Equipment>(
    `http://localhost:8081/api/equipments/${id}`
  );
}
updateWithPhoto(id: number, formData: FormData) {
  return this.http.put(
    `http://localhost:8081/api/equipments/update-with-photo/${id}`,
    formData
  );
}



}
