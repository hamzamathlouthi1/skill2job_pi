import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Display a success message
   */
  success(message: string, duration = 3000) {
    this.snackBar.open(message, '×', {
      duration,
      panelClass: ['snackbar-success'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  /**
   * Display an error message
   */
  error(message: string, duration = 5000) {
    this.snackBar.open(message, '×', {
      duration,
      panelClass: ['snackbar-error'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  /**
   * General informational message
   */
  info(message: string, duration = 3000) {
    this.snackBar.open(message, '×', {
      duration,
      panelClass: ['snackbar-info'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
