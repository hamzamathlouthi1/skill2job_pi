import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MessageService } from './services/message.service';
import { TrainerApplicationService } from './services/trainer-application.service';

@Component({
  selector: 'app-trainer-messages',
  templateUrl: './trainer-messages.component.html',
  styleUrls: ['./trainer-messages.component.scss']
})
export class TrainerMessagesComponent implements OnInit, OnDestroy {

  userId: number | null = null;
  adminId = 1;
  application: any = null;
  messages: any[] = [];
  newMessage = '';
  sending = false;
  loading = true;

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private messageService: MessageService,
    private appService: TrainerApplicationService
  ) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('trainer_user_id') || localStorage.getItem('userId');
    if (raw && !isNaN(Number(raw))) {
      this.userId = Number(raw);
      this.loadApplication();
    } else {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  loadApplication(): void {
    if (!this.userId) return;
    this.loading = true;
    this.application = null;
    this.appService.getByUserId(this.userId).subscribe({
      next: (app: any) => {
        this.application = app;
        this.loading = false;
        if (app?.id) {
          this.loadMessages();
          if (this.pollInterval) clearInterval(this.pollInterval);
          this.pollInterval = setInterval(() => this.loadMessages(), 10000);
        }
      },
      error: (err: any) => {
        this.loading = false;
      }
    });
  }

  loadMessages(): void {
    if (!this.application?.id) return;
    this.messageService.getMyMessages().subscribe({
      next: (data: any) => {
        this.messages = data || [];
        this.markRead();
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => { }
    });
  }

  markRead(): void {
    if (!this.application?.id || !this.userId) return;
    this.messageService.markMessageAsRead(this.application.id, this.userId)
      .subscribe({ error: () => { } });
  }

  send(): void {
    if (!this.newMessage?.trim() || !this.application?.id || !this.userId) return;
    this.sending = true;
    this.messageService.send({
      senderId: this.userId,
      receiverId: this.adminId,
      applicationId: this.application.id,
      content: this.newMessage.trim(),
      senderRole: 'TRAINER'
    }).subscribe({
      next: (msg: any) => {
        this.messages.push(msg);
        this.newMessage = '';
        this.sending = false;
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => { this.sending = false; }
    });
  }

  handleKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  isTrainer(msg: any): boolean {
    return msg?.senderRole === 'TRAINER';
  }

  scrollToBottom(): void {
    const el = document.querySelector('.messages-list') as HTMLElement | null;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
