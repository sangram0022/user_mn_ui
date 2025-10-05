import { createContext } from 'react';
import type { ToastContextType, ToastItem } from '../components/ToastProvider';

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export type { ToastContextType, ToastItem };