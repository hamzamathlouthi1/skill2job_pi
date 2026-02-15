import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionsService } from '../../services/sessions.service';

@Component({
  selector: 'app-session-form',
  templateUrl: './session-form.component.html',
  styleUrls: ['./session-form.component.scss']
})
export class SessionFormComponent implements OnInit {

  session: any = {
    type: 'ONLINE',
    startAt: '',
    endAt: '',
    capacity: 0
  };

  isEdit = false;
  sessionId!: number;

  constructor(
    private sessionsService: SessionsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // If there is an ID → EDIT MODE
    if (id) {
      this.isEdit = true;
      this.sessionId = +id;

      this.sessionsService.getSessionById(this.sessionId).subscribe((data: any) => {
        this.session = data;

        // 🔥 VERY IMPORTANT: fix datetime format
        this.session.startAt = this.session.startAt?.substring(0, 16);
        this.session.endAt = this.session.endAt?.substring(0, 16);
      });
    }
  }

  submit() {
    if (this.isEdit) {
      // UPDATE
      this.sessionsService.updateSession(this.sessionId, this.session).subscribe(() => {
        alert('Session updated!');
        this.router.navigate(['/sessions']);
      });
    } else {
      // ADD
      this.sessionsService.addSession(this.session).subscribe(() => {
        alert('Session created!');
        this.router.navigate(['/sessions']);
      });
    }
  }
}
