import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SessionsService } from '../../../services/sessions.service';
import { Session } from '../../../models/session.model';

@Component({
  selector: 'app-learner-session-table',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './learner-session-table.component.html',
  styleUrls: ['./learner-session-table.component.css']
})
export class LearnerSessionTableComponent implements OnInit {

  sessions: Session[] = [];
  currentUserId!: number;
  loading = false;

  constructor(
    private sessionsService: SessionsService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId()!;
    this.loadSessions();
  }

  loadSessions() {
    this.sessionsService.getAllSessions().subscribe((data: Session[]) => {
      this.sessions = data.filter((s: Session) => s.type === 'ONLINE');
    });
  }

  isJoined(session: Session): boolean {
    return session.participants?.some((p: any) => p.id === this.currentUserId) ?? false;
  }

  isFull(session: Session): boolean {
    return (session.participants?.length ?? 0) >= session.capacity;
  }

  getSessionStatus(session: Session): string {
    const now = new Date();
    const start = new Date(session.startAt);
    const end = new Date(session.endAt);
    if (now < start) return 'UPCOMING';
    if (now > end) return 'ENDED';
    return 'ONGOING';
  }

  joinSession(session: Session) {
    if (this.isJoined(session) || this.isFull(session)) return;

    this.loading = true;

    if (!session.participants) session.participants = [];
    session.participants.push({ id: this.currentUserId } as any);

    this.sessionsService.joinSession(session.id!).subscribe({
      next: (updatedSession: any) => {
        this.loading = false;
        this.loadSessions();

        // ✅ Always fetch full session to get roomCode
        this.sessionsService.getSessionById(updatedSession.id!).subscribe((fullSession: any) => {
          console.log('🔍 fullSession:', fullSession);
  console.log('🔍 room:', fullSession.room);
  console.log('🔍 roomCode:', fullSession.room?.roomCode);
          if (fullSession.type === 'ONLINE' && fullSession.room?.roomCode) {
            this.router.navigate(['/live', fullSession.id, fullSession.room.roomCode]);
          }
        });
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        session.participants = session.participants?.filter((p: any) => p.id !== this.currentUserId);
      }
    });
  }

  // Re-enter room for already-joined ONLINE sessions
  enterRoom(session: Session) {
    this.sessionsService.getSessionById(session.id!).subscribe((fullSession: any) => {
      if (fullSession.room?.roomCode) {
        this.router.navigate(['/live', fullSession.id, fullSession.room.roomCode]);
      }
    });
  }
}