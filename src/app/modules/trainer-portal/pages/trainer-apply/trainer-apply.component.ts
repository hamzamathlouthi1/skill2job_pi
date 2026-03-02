import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TrainerApplicationFoService } from '../../../services/trainer-application-fo.service';

@Component({
  selector: 'app-trainer-apply',
  templateUrl: './trainer-apply.component.html',
  styleUrls: ['./trainer-apply.component.scss']
})
export class TrainerApplyComponent implements OnInit {

  userId: number | null = null;
  cvUrl = '';
  motivation = '';
  loading = false;
  successMsg = '';
  errorMsg = '';
  alreadyApplied = false;

  constructor(
    private appService: TrainerApplicationFoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.getUserIdFromLocalStorage();

    if (this.userId) {
      this.checkExistingApplication();
    }
  }

  private getUserIdFromLocalStorage(): number | null {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        if (u?.id && !isNaN(Number(u.id))) return Number(u.id);
      } catch {}
    }

    const raw =
      localStorage.getItem('trainer_user_id') ||
      localStorage.getItem('userId');

    if (raw && !isNaN(Number(raw))) return Number(raw);
    return null;
  }

  checkExistingApplication(): void {
    if (!this.userId) return;

    this.appService.exists(this.userId).subscribe({
      next: (status) => {
        if (status === 'PENDING' || status === 'ACCEPTED') {
          this.alreadyApplied = true;
          this.router.navigate(['/become-trainer/my-application']);
        } else {
          // REJECTED ou NONE → formulaire disponible
          this.alreadyApplied = false;
        }
      },
      error: () => {
        this.alreadyApplied = false;
      }
    });
  }

  goToMyApplication(): void {
    this.router.navigate(['/become-trainer/my-application']);
  }

  get isLoggedIn(): boolean {
    return this.userId !== null && this.userId > 0;
  }

  get isCvValid(): boolean {
    if (!this.cvUrl?.trim()) return false;
    try {
      const u = new URL(this.cvUrl.trim());
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  get isMotivationValid(): boolean {
    return (this.motivation?.trim().length ?? 0) >= 50;
  }

  get canSubmit(): boolean {
    return this.isLoggedIn && !this.alreadyApplied && this.isCvValid && this.isMotivationValid && !this.loading;
  }

  submit(): void {
    this.successMsg = '';
    this.errorMsg = '';

    if (!this.isLoggedIn) {
      this.errorMsg = 'Utilisateur non connecté. Veuillez vous connecter.';
      return;
    }

    if (this.alreadyApplied) {
      this.errorMsg = '⚠️ Vous avez déjà soumis une candidature. Allez sur "My Application".';
      return;
    }

    if (!this.isCvValid || !this.isMotivationValid) {
      this.errorMsg = 'Vérifiez le lien CV et la motivation (min. 50 caractères).';
      return;
    }

    this.loading = true;

    const body = {
      userId: Number(this.userId),
      cvUrl: this.cvUrl.trim(),
      motivation: this.motivation.trim()
    };

    this.appService.submit(body).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = '✅ Candidature envoyée. Consultez "My Application" pour suivre.';
        this.cvUrl = '';
        this.motivation = '';
        this.alreadyApplied = true;
        this.router.navigate(['/become-trainer/my-application']);
      },
      error: (err: any) => {
        this.loading = false;
        const msg = (err?.error?.message || err?.error || '').toString().toLowerCase();
        if (msg.includes('already') || msg.includes('submitted')) {
          this.alreadyApplied = true;
          this.errorMsg = '⚠️ Vous avez déjà soumis une candidature. Allez sur "My Application".';
        } else {
          this.errorMsg = `❌ Erreur (${err?.status || '???'}) : Vérifiez le backend`;
        }
      }
    });
  }
}