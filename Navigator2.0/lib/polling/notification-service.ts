/**
 * Notification service for polling status updates
 * Uses Snackbar component instead of toast
 */

import { snackbarService } from './snackbar-service';
import { NotificationMessage } from './types';

export class NotificationService {
  /**
   * Show a notification message
   */
  static showNotification(notification: NotificationMessage): void {
    const { message, type, duration = 5000 } = notification;

    // Map notification types to snackbar types
    let snackbarType: 'info' | 'success' | 'error' = 'info';
    switch (type) {
      case 'success':
        snackbarType = 'success';
        break;
      case 'error':
        snackbarType = 'error';
        break;
      case 'warning':
      case 'info':
      default:
        snackbarType = 'info';
        break;
    }

    snackbarService.show(message, snackbarType, duration);
  }

  /**
   * Show report ready notification
   */
  static showReportReady(reportFilePath: string): void {
    snackbarService.showReportReady(reportFilePath);
  }

  /**
   * Show report error notification
   */
  static showReportError(): void {
    snackbarService.showReportError();
  }

  /**
   * Show task completed notification
   */
  static showTaskCompleted(channel: string, los: string, guest: string): void {
    snackbarService.showTaskCompleted(channel, los, guest);
  }

  /**
   * Show task error notification
   */
  static showTaskError(): void {
    snackbarService.showTaskError();
  }

  /**
   * Show task retry notification
   */
  static showTaskRetry(channel: string): void {
    snackbarService.showTaskRetry(channel);
  }

  /**
   * Show report processing notification
   */
  static showReportProcessing(): void {
    snackbarService.showReportProcessing();
  }
}
