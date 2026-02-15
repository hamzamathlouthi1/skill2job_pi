import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Session } from '../../models/session.model';

@Component({
  selector: 'app-session-table',
  templateUrl: './session-table.component.html',
  styleUrls: ['./session-table.component.scss']
})
export class SessionTableComponent {

  @Input() sessions: Session[] = [];
  @Output() delete = new EventEmitter<number>();

onDelete(id: number) {
  if (confirm('Delete this session?')) {
    this.delete.emit(id);
  }
}
@Output() edit = new EventEmitter<number>();

onEdit(id: number) {
  this.edit.emit(id);
}
}
