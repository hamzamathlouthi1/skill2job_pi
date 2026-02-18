import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionsService } from '../../services/sessions.service';
import { SalleService } from '../../services/salle.service';

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
    capacity: 0,
  };
  salles: any[] = [];
  durationHours: number = 1;
 

  isEdit = false;
  sessionId!: number;

  constructor(
    private sessionsService: SessionsService,
    private salleService: SalleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

  // 🔥 LOAD SALLES LIST
  this.loadSalles();

  const id = this.route.snapshot.paramMap.get('id');

  if (id) {
    this.isEdit = true;
    this.sessionId = +id;

    this.sessionsService.getSessionById(this.sessionId).subscribe((data: any) => {
      this.session = data;

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
  onTypeChange() {
    if (this.session.type === 'ONLINE') {
      this.session.salle = null;
    }
  }
   loadSalles() {
    this.salleService.getAll().subscribe((data: any) => {
      this.salles = data;
    });
  }
 calculateEndDate() {

  if (!this.session.startAt || !this.durationHours) return;

  const start = new Date(this.session.startAt);

  // Add duration in milliseconds (safe method)
  const end = new Date(start.getTime() + this.durationHours * 60 * 60 * 1000);

  // Format properly for datetime-local
  const year = end.getFullYear();
  const month = String(end.getMonth() + 1).padStart(2, '0');
  const day = String(end.getDate()).padStart(2, '0');
  const hours = String(end.getHours()).padStart(2, '0');
  const minutes = String(end.getMinutes()).padStart(2, '0');

  this.session.endAt = `${year}-${month}-${day}T${hours}:${minutes}`;
}

onDurationChange() {

  // Prevent values under 1
  if (!this.durationHours || this.durationHours < 1) {
    this.durationHours = 0;
  }

  this.calculateEndDate();
}

}
