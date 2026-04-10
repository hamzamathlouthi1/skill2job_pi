import { Component, OnInit } from '@angular/core';
import { ApplicationService, ApplicationResponse } from '../../modules/services/application.service';
import { PartnerDashboardService } from '../../modules/services/partner-dashboard.service';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  interviews: ApplicationResponse[];
}

@Component({
  selector: 'app-partner-calendar',
  templateUrl: './partner-calendar.component.html',
  styleUrls: ['./partner-calendar.component.css']
})
export class PartnerCalendarComponent implements OnInit {

  loading = false;
  error = '';

  currentDate = new Date();
  weeks: CalendarDay[][] = [];

  allInterviews: ApplicationResponse[] = [];

  // Modal détail jour
  selectedDay: CalendarDay | null = null;
  detailOpen = false;

  // Vue sélectionnée
  viewMode: 'month' | 'list' = 'month';

  // Liste triée pour vue liste
  upcomingList: ApplicationResponse[] = [];

  readonly DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(
    private applicationService: ApplicationService,
    private dashboardService: PartnerDashboardService
  ) {}

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.loading = true;
    this.error = '';

    // Charge via le dashboard (contient upcomingInterviews + tous les entretiens)
    // On utilise le dashboard service qui remonte jusqu'à 10 entretiens
    // Pour un calendrier complet on utilise une approche étendue
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        // Transforme les upcomingInterviews en ApplicationResponse
        this.allInterviews = (data.upcomingInterviews || []).map(i => ({
          id: i.applicationId,
          status: 'INTERVIEW' as any,
          appliedAt: '',
          offerId: i.offerId,
          offerTitle: i.offerTitle,
          location: '',
          partnerId: 0,
          partnerName: '',
          studentUsername: i.studentUsername,
          studentEmail: i.studentEmail,
          interviewAt: i.interviewAt,
          meetLink: i.meetLink ?? null,
          interviewNote: i.note ?? null,
        }));

        this.buildCalendar();
        this.buildUpcomingList();
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load interviews.';
        this.loading = false;
      }
    });
  }

  // ─── Navigation ────────────────────────────────────────────────
  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.buildCalendar();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.buildCalendar();
  }

  get monthLabel(): string {
    return `${this.MONTHS[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  // ─── Build Calendar Grid ───────────────────────────────────────
  buildCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const today = new Date();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startPad = firstDay.getDay(); // 0=Sun
    const endPad = 6 - lastDay.getDay();

    const days: CalendarDay[] = [];

    // Jours du mois précédent
    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push(this.makeDay(d, false, today));
    }

    // Jours du mois courant
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      days.push(this.makeDay(date, true, today));
    }

    // Jours du mois suivant
    for (let i = 1; i <= endPad; i++) {
      const d = new Date(year, month + 1, i);
      days.push(this.makeDay(d, false, today));
    }

    // Découpe en semaines
    this.weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      this.weeks.push(days.slice(i, i + 7));
    }
  }

  private makeDay(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
    const isToday = date.toDateString() === today.toDateString();
    const interviews = this.allInterviews.filter(app => {
      if (!app.interviewAt) return false;
      const d = new Date(app.interviewAt);
      return d.toDateString() === date.toDateString();
    });
    return { date, isCurrentMonth, isToday, interviews };
  }

  // ─── Liste chronologique ───────────────────────────────────────
  buildUpcomingList(): void {
    const now = new Date();
    this.upcomingList = [...this.allInterviews]
      .filter(a => a.interviewAt && new Date(a.interviewAt) >= now)
      .sort((a, b) => new Date(a.interviewAt!).getTime() - new Date(b.interviewAt!).getTime());
  }

  // ─── Detail Modal ──────────────────────────────────────────────
  openDay(day: CalendarDay): void {
    if (!day.isCurrentMonth || day.interviews.length === 0) return;
    this.selectedDay = day;
    this.detailOpen = true;
  }

  closeDetail(): void {
    this.detailOpen = false;
    this.selectedDay = null;
  }

  openMeetLink(url: string | null | undefined): void {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  // ─── Helpers ───────────────────────────────────────────────────
  formatTime(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatDayNum(date: Date): number {
    return date.getDate();
  }

  totalThisMonth(): number {
    const m = this.currentDate.getMonth();
    const y = this.currentDate.getFullYear();
    return this.allInterviews.filter(a => {
      if (!a.interviewAt) return false;
      const d = new Date(a.interviewAt);
      return d.getMonth() === m && d.getFullYear() === y;
    }).length;
  }

  get todayInterviews(): ApplicationResponse[] {
    const today = new Date().toDateString();
    return this.allInterviews.filter(a => a.interviewAt && new Date(a.interviewAt).toDateString() === today);
  }

  trackByDate(_: number, w: CalendarDay[]): string {
    return w[0]?.date?.toISOString() ?? '';
  }

  trackById(_: number, a: ApplicationResponse): number {
    return a.id;
  }
}
