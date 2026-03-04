import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from '../../../services/message.service';
@Component({
  selector: 'app-trainer-layout',
  templateUrl: './trainer-layout.component.html',
  styleUrls: ['./trainer-layout.component.scss']
})
export class TrainerLayoutComponent implements OnInit, OnDestroy {

  unreadCount = 0;
  private pollInterval: any = null;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.checkUnread();
    this.pollInterval = setInterval(() => this.checkUnread(), 15000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  checkUnread(): void {
    const raw = localStorage.getItem('trainer_user_id') || localStorage.getItem('userId');
    if (!raw || isNaN(Number(raw))) return;

    this.messageService.countUnread(Number(raw)).subscribe({
      next: (res) => { this.unreadCount = res.count; },
      error: () => {}
    });
  }
}