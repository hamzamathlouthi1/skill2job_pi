import { Component, OnInit } from '@angular/core';
import { SessionsService } from './services/sessions.service';
import { Session } from './models/session.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit {

  sessions: Session[] = [];

  constructor(
    private sessionsService: SessionsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions() {
    this.sessionsService.getAllSessions().subscribe((data) => {
      this.sessions = data;
    });
  }

  deleteSession(id: number) {
    this.sessionsService.deleteSession(id).subscribe(() => {
      this.sessions = this.sessions.filter(s => s.id !== id);
    });
  }

  editSession(id: number) {
    this.router.navigate(['/sessions/edit', id]);
  }
}
