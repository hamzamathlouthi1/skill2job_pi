import { Component, OnInit, OnDestroy } from '@angular/core';
import { HrService } from './services/hr.service';
import { MessageService } from '../trainer-details/services/message.service';

@Component({
  selector: 'app-hr',
  templateUrl: './hr.component.html',
  styleUrls: ['./hr.component.scss']
})
export class HrComponent implements OnInit, OnDestroy {
  applications: any[] = [];
  selectedStatus: string = '';

  // Chat
  chatOpen = false;
  chatApp: any = null;
  messages: any[] = [];
  newMessage = '';
  sendingMessage = false;
  private chatPollInterval: any = null;
  adminId = 1;

  // Unread badges
  unreadCounts: { [appId: number]: number } = {};

  // Analyze modal
  analyzeOpen = false;
  analyzeResult: string = '';
  analyzeLoading = false;

  constructor(
    private hrService: HrService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  ngOnDestroy(): void {
    this.stopChatPoll();
  }

  // ─── APPLICATIONS ─────────────────────────────────────
  loadApplications() {
    const status = this.selectedStatus?.trim();
    this.hrService.getAllApplications(status ? status : undefined).subscribe({
      next: (data: any[]) => {
        this.applications = data;
        this.loadAllUnreadCounts();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error loading applications (check backend + CORS).');
      }
    });
  }

  // ─── UNREAD BADGES ────────────────────────────────────
  loadAllUnreadCounts(): void {
    this.applications.forEach(app => {
      this.messageService.getConversation(app.id).subscribe({
        next: msgs => {
          this.unreadCounts[app.id] = msgs.filter(
            m => m.senderRole === 'TRAINER' && !m.read
          ).length;
        },
        error: () => {
          this.unreadCounts[app.id] = 0;
        }
      });
    });
  }

  // ─── CHAT ─────────────────────────────────────────────
  openChat(app: any): void {
    this.chatApp = app;
    this.chatOpen = true;
    this.newMessage = '';
    this.unreadCounts[app.id] = 0;
    this.loadMessages();
    this.startChatPoll();
  }

  closeChat(): void {
    this.chatOpen = false;
    this.chatApp = null;
    this.messages = [];
    this.stopChatPoll();
  }

  loadMessages(): void {
    if (!this.chatApp?.id) return;
    this.messageService.getConversation(this.chatApp.id).subscribe({
      next: data => {
        this.messages = data;
        this.markRead();
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => {}
    });
  }

  sendMessage(): void {
    if (!this.newMessage?.trim() || !this.chatApp?.id) return;
    this.sendingMessage = true;

    this.messageService
      .send({
        senderId: this.adminId,
        receiverId: this.chatApp.userId,
        applicationId: this.chatApp.id,
        content: this.newMessage.trim(),
        senderRole: 'ADMIN'
      })
      .subscribe({
        next: msg => {
          this.messages.push(msg);
          this.newMessage = '';
          this.sendingMessage = false;
          setTimeout(() => this.scrollToBottom(), 50);
        },
        error: () => {
          this.sendingMessage = false;
        }
      });
  }

  markRead(): void {
    if (!this.chatApp?.id) return;
    this.messageService.markAsRead(this.chatApp.id, this.adminId).subscribe({
      next: () => {
        this.unreadCounts[this.chatApp.id] = 0;
      },
      error: () => {}
    });
  }

  startChatPoll(): void {
    this.chatPollInterval = setInterval(() => {
      this.loadMessages();
      this.loadAllUnreadCounts();
    }, 10000);
  }

  stopChatPoll(): void {
    if (this.chatPollInterval) {
      clearInterval(this.chatPollInterval);
      this.chatPollInterval = null;
    }
  }

  scrollToBottom(): void {
    const el = document.querySelector('.chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  handleKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isAdmin(msg: any): boolean {
    return msg.senderRole === 'ADMIN';
  }

  // ─── CSV ──────────────────────────────────────────────
  exportCSV(): void {
    if (this.applications.length === 0) {
      alert('No applications to export.');
      return;
    }

    const headers = ['ID', 'User ID', 'Status', 'CV URL', 'Motivation', 'Submitted At', 'Updated At'];
    const rows = this.applications.map(app => [
      app.id,
      app.userId,
      app.status,
      app.cvUrl || '',
      `"${(app.motivation || '').replace(/"/g, '""')}"`,
      app.submittedAt ? new Date(app.submittedAt).toLocaleString() : '-',
      app.updatedAt ? new Date(app.updatedAt).toLocaleString() : '-'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trainer-applications-${this.selectedStatus || 'ALL'}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ─── HR ACTIONS ───────────────────────────────────────

  analyze(id: number): void {
    this.analyzeLoading = true;
    this.analyzeResult = '';
    this.analyzeOpen = true;

    this.hrService.analyzeApplication(id).subscribe({
      next: (result: any) => {
        this.analyzeLoading = false;
        // Handle both string and object responses
        if (typeof result === 'string') {
          this.analyzeResult = result;
        } else if (result?.analysis) {
          this.analyzeResult = result.analysis;
        } else if (result?.message) {
          this.analyzeResult = result.message;
        } else {
          this.analyzeResult = JSON.stringify(result, null, 2);
        }
      },
      error: () => {
        this.analyzeLoading = false;
        this.analyzeResult = 'Error: Could not analyze this application.';
      }
    });
  }

  closeAnalyze(): void {
    this.analyzeOpen = false;
    this.analyzeResult = '';
  }

  approve(id: number): void {
    this.hrService.decide(id, 'ACCEPT').subscribe({
      next: (application: any) => {
        // Auto-create trainer profile after approval
        const userId = application?.userId;
        if (userId) {
          // Check if profile already exists first
          this.hrService.getTrainerProfileByUserId(userId).subscribe({
            next: () => {
              // Profile already exists
              alert('✅ Application approved! Trainer profile already exists.');
              this.loadApplications();
            },
            error: () => {
              // Profile doesn't exist, create it
              this.hrService.createTrainerProfile({
                userId: userId,
                mainSpeciality: 'General',
                level: 'JUNIOR',
                status: 'ACTIVE'
              }).subscribe({
                next: () => {
                  alert('✅ Approved! Trainer profile created successfully.');
                  this.loadApplications();
                },
                error: () => {
                  alert('✅ Approved, but failed to auto-create trainer profile. Create it manually.');
                  this.loadApplications();
                }
              });
            }
          });
        } else {
          alert('✅ Approved!');
          this.loadApplications();
        }
      },
      error: () => alert('❌ Error approving application')
    });
  }

  reject(id: number): void {
    this.hrService.decide(id, 'REJECT').subscribe({
      next: () => {
        alert('❌ Application rejected.');
        this.loadApplications();
      },
      error: () => alert('Error rejecting application')
    });
  }

  deleteApplication(id: number): void {
    if (!confirm('Delete this application?')) return;
    this.hrService.deleteApplication(id).subscribe({
      next: () => {
        alert('🗑 Deleted!');
        this.loadApplications();
      },
      error: () => alert('Error deleting application')
    });
  }
}