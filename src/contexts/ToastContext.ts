import { createContext } from 'react';

import type { ErrorInfo } from '@utils/errorHandling';

export interface ToastContextType {
	showError: (error: ErrorInfo | unknown) => void;
	showSuccess: (message: string) => void;
	showInfo: (message: string) => void;
	clearToasts: () => void;
}

export interface ToastItem {
	id: string;
	type: 'error' | 'success' | 'info';
	message: string;
	error?: ErrorInfo;
	autoHideDelay?: number;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);