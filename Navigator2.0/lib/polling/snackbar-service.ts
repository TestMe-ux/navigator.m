/**
 * Global Snackbar Service for Polling Notifications
 * Manages snackbar state across the application
 */

import { NotificationMessage } from './types';

interface SnackbarState {
  isOpen: boolean;
  message: string;
  type: 'info' | 'success' | 'error';
  onClose?: () => void;
}

class SnackbarService {
  private listeners: Set<(state: SnackbarState) => void> = new Set();
  private currentState: SnackbarState = {
    isOpen: false,
    message: '',
    type: 'info'
  };

  /**
   * Subscribe to snackbar state changes
   */
  subscribe(listener: (state: SnackbarState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.currentState);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Show a snackbar notification
   */
  show(message: string, type: 'info' | 'success' | 'error' = 'info', duration: number = 5000): void {
    this.currentState = {
      isOpen: true,
      message,
      type,
      onClose: () => this.hide()
    };

    this.notifyListeners();

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  /**
   * Hide the current snackbar
   */
  hide(): void {
    this.currentState = {
      ...this.currentState,
      isOpen: false
    };
    this.notifyListeners();
  }

  /**
   * Get current snackbar state
   */
  getState(): SnackbarState {
    return { ...this.currentState };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (error) {
        console.error('Error in snackbar listener:', error);
      }
    });
  }

  /**
   * Show report ready notification
   */
  showReportReady(reportFilePath: string): void {
    const message = `Your 'On-Demand' report is available now. Click to download or check from Reports page.`;
    this.show(message, 'success', 10000);
  }

  /**
   * Show report error notification
   */
  showReportError(): void {
    const message = `Your 'On-Demand' report failed to download due to a technical issue.`;
    this.show(message, 'error', 8000);
  }

  /**
   * Show task completed notification
   */
  showTaskCompleted(channel: string, los: string, guest: string): void {
    const message = `Your 'Lightning Refresh' has been completed successfully for ${channel}, LOS ${los}, Guest ${guest}, and the next 30 days.`;
    this.show(message, 'success', 10000);
  }

  /**
   * Show task error notification
   */
  showTaskError(): void {
    const message = `Lightning Refresh couldn't be completed due to a technical issue.`;
    this.show(message, 'error', 8000);
  }

  /**
   * Show task retry notification
   */
  showTaskRetry(channel: string): void {
    const message = `${channel} SEEMS SLOW TODAY NEED MORE TIME TO FETCH RATES`;
    this.show(message, 'info', 6000);
  }

  /**
   * Show report processing notification
   */
  showReportProcessing(): void {
    const message = "Preparing your report… please wait. Processing large data may take some time.";
    this.show(message, 'info', 8000);
  }
}

// Create singleton instance
export const snackbarService = new SnackbarService();

