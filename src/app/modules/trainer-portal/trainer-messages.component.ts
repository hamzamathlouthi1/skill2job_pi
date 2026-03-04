import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from '../services/message.service';
import { TrainerApplicationFoService } from '../services/trainer-application-fo.service';

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
    private appService: TrainerApplicationFoService
  ) { }

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

    this.appService.getByUserId(this.userId).subscribe({
      next: (app) => {
        this.application = app;
        this.loading = false;

        if (app?.id) {
          this.loadMessages();

          if (this.pollInterval) clearInterval(this.pollInterval);
          this.pollInterval = setInterval(() => this.loadMessages(), 10000);
        }
      },
      error: () => { this.loading = false; }
    });
  }

  loadMessages(): void {
    if (!this.application?.id) return;

    this.messageService.getConversation(this.application.id).subscribe({
      next: (data) => {
        this.messages = data || [];
        this.markRead();
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => { }
    });
  }

  markRead(): void {
    if (!this.application?.id || !this.userId) return;

    this.messageService.markAsRead(this.application.id, this.userId)
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
      next: (msg) => {
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