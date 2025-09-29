/**
 * Global Snackbar Component for Polling Notifications
 * Integrates with the snackbar service to show polling notifications
 */

"use client";

import React, { useEffect, useState } from 'react';
import { Snackbar } from '@/components/ui/snackbar';
import { snackbarService } from '@/lib/polling/snackbar-service';

interface SnackbarState {
  isOpen: boolean;
  message: string;
  type: 'info' | 'success' | 'error';
  onClose?: () => void;
}

export function GlobalSnackbar() {
  const [snackbarState, setSnackbarState] = useState<SnackbarState>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  useEffect(() => {
    // Subscribe to snackbar service
    const unsubscribe = snackbarService.subscribe((state) => {
      setSnackbarState(state);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const handleClose = () => {
    snackbarService.hide();
  };

  return (
    <Snackbar
      isOpen={snackbarState.isOpen}
      onClose={handleClose}
      message={snackbarState.message}
      type={snackbarState.type}
    />
  );
}
