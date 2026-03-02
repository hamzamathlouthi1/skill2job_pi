import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { SessionsService } from '../../../modules/services/sessions.service';
import { EquipmentService } from '../../../modules/services/equipment.service';
import { AuthService } from '../../../modules/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  totalSessions: number = 0;
  totalEquipments: number = 0;
  totalUsers: number = 0;
  sessionsThisMonth: number = 0;
  sessionsPerDay: { day: string; sessions: number }[] = [];

  constructor(
    private sessionsService: SessionsService,
    private equipmentService: EquipmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {
    this.createEquipmentChart();
  }

  loadStats(): void {
    // Get total sessions
    this.sessionsService.getAllSessions().subscribe({
      next: (sessions: any[]) => {
        this.totalSessions = sessions.length;
        this.calculateSessionsPerDay(sessions);
        // Create chart after data is loaded
        this.createSessionsChart();
      },
      error: (err) => console.error('Error loading sessions:', err)
    });

    // Get total equipments
    this.equipmentService.getAllEquipments().subscribe({
      next: (equipments: any[]) => {
        this.totalEquipments = equipments.length;
      },
      error: (err) => console.error('Error loading equipments:', err)
    });

    // Get total users
    this.authService.getAllUsers().subscribe({
      next: (users: any[]) => {
        this.totalUsers = users.length;
      },
      error: (err) => console.error('Error loading users:', err)
    });
  }

  calculateSessionsPerDay(sessions: any[]): void {
    const daysMap: { [key: string]: number } = {};
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      daysMap[dateStr] = 0;
    }

    sessions.forEach((session: any) => {
      const sessionDate = new Date(session.date || session.startDate);
      const dateStr = sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Only count sessions from last 7 days
      if (daysMap.hasOwnProperty(dateStr)) {
        daysMap[dateStr]++;
      }
      
      // Count sessions for current month
      if (sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear) {
        this.sessionsThisMonth++;
      }
    });

    this.sessionsPerDay = Object.keys(daysMap).map(day => ({
      day,
      sessions: daysMap[day]
    }));
  }

  createSessionsChart() {
    const labels = this.sessionsPerDay.map(item => item.day);
    const data = this.sessionsPerDay.map(item => item.sessions);

    new Chart("sessionsChart", {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sessions',
          data: data,
          borderColor: '#c22b33',
          backgroundColor: 'rgba(194,43,51,0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: { color: 'white' }
          }
        },
        scales: {
          x: {
            ticks: { color: 'white' }
          },
          y: {
            ticks: { color: 'white' }
          }
        }
      }
    });

  }

  createEquipmentChart() {

    new Chart("equipmentChart", {
      type: 'doughnut',
      data: {
        labels: ['Used', 'Available'],
        datasets: [{
          data: [65, 35],
          backgroundColor: [
            '#c22b33',
            '#ffffff'
          ]
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: { color: 'white' }
          }
        }
      }
    });

  }

}