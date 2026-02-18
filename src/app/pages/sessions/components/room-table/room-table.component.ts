import { Component } from '@angular/core';
import { Room } from '../../models/room.model';
import { RoomService } from '../../services/room.service';


@Component({
  selector: 'app-room-table',
  templateUrl: './room-table.component.html',
  styleUrl: './room-table.component.scss'
})
export class RoomTableComponent {
  rooms: Room[] = [];
  constructor(private roomService: RoomService) {}
  
    ngOnInit(): void {
      this.loadRooms();
    }
  
    loadRooms() {
      this.roomService.getAllRooms().subscribe(data => {
        this.rooms = data;
      });
    }
    copyLink(link: string) {
  navigator.clipboard.writeText(link);
  alert('Link copied!');
}


}
