/**
 * Optimized Icon Imports
 *
 * Tree-shakeable icon imports from lucide-react
 * Reduces bundle size by importing only needed icons
 *
 * Instead of:
 * ```typescript
 * import { User, Settings, Dashboard } from 'lucide-react'; // Imports entire library!
 * ```
 *
 * Use:
 * ```typescript
 * import { UserIcon, SettingsIcon, DashboardIcon } from '@shared/ui/icons';
 * ```
 *
 * @module shared/ui/icons
 */

// ============================================================================
// USER & PROFILE ICONS
// ============================================================================

export {
  UserCheck as UserCheckIcon,
  UserCog as UserCogIcon,
  User as UserIcon,
  UserMinus as UserMinusIcon,
  UserPlus as UserPlusIcon,
  Users as UsersIcon,
  UserX as UserXIcon,
} from 'lucide-react';

// ============================================================================
// NAVIGATION ICONS
// ============================================================================

export {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronUp as ChevronUpIcon,
  X as CloseIcon,
  LayoutDashboard as DashboardIcon,
  Home as HomeIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
} from 'lucide-react';

// ============================================================================
// ACTION ICONS
// ============================================================================

export {
  Copy as CopyIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Minus as MinusIcon,
  MoreHorizontal as MoreHorizontalIcon,
  MoreVertical as MoreVerticalIcon,
  Plus as PlusIcon,
  RefreshCw as RefreshIcon,
  Save as SaveIcon,
  Trash2 as TrashIcon,
  Upload as UploadIcon,
} from 'lucide-react';

// ============================================================================
// STATUS ICONS
// ============================================================================

export {
  AlertCircle as AlertCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  Check as CheckIcon,
  HelpCircle as HelpCircleIcon,
  Info as InfoIcon,
  XCircle as XCircleIcon,
} from 'lucide-react';

// ============================================================================
// COMMUNICATION ICONS
// ============================================================================

export {
  Bell as BellIcon,
  Mail as MailIcon,
  MessageSquare as MessageIcon,
  Phone as PhoneIcon,
  Send as SendIcon,
} from 'lucide-react';

// ============================================================================
// FILE & DOCUMENT ICONS
// ============================================================================

export {
  File as FileIcon,
  FileText as FileTextIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Image as ImageIcon,
  Paperclip as PaperclipIcon,
} from 'lucide-react';

// ============================================================================
// SECURITY ICONS
// ============================================================================

export {
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Key as KeyIcon,
  Lock as LockIcon,
  ShieldAlert as ShieldAlertIcon,
  ShieldCheck as ShieldCheckIcon,
  Shield as ShieldIcon,
  Unlock as UnlockIcon,
} from 'lucide-react';

// ============================================================================
// DATA & ANALYTICS ICONS
// ============================================================================

export {
  Activity as ActivityIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
} from 'lucide-react';

// ============================================================================
// TIME & DATE ICONS
// ============================================================================

export { Calendar as CalendarIcon, Clock as ClockIcon, Timer as TimerIcon } from 'lucide-react';

// ============================================================================
// SEARCH & FILTER ICONS
// ============================================================================

export {
  Filter as FilterIcon,
  Search as SearchIcon,
  SortAsc as SortAscIcon,
  SortDesc as SortDescIcon,
} from 'lucide-react';

// ============================================================================
// SYSTEM ICONS
// ============================================================================

export {
  Cpu as CpuIcon,
  Database as DatabaseIcon,
  HardDrive as HardDriveIcon,
  Power as PowerIcon,
  Server as ServerIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from 'lucide-react';

// ============================================================================
// MISC ICONS
// ============================================================================

export {
  Bookmark as BookmarkIcon,
  ExternalLink as ExternalLinkIcon,
  Flag as FlagIcon,
  Heart as HeartIcon,
  Link as LinkIcon,
  Loader2 as LoaderIcon,
  Star as StarIcon,
  Tag as TagIcon,
} from 'lucide-react';

// ============================================================================
// ICON TYPE
// ============================================================================

import type { LucideIcon } from 'lucide-react';

export type { LucideIcon as IconType };

/**
 * Common icon props
 */
export interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  color?: string;
}

/**
 * Default export with all icons
 * (Use named imports for better tree-shaking)
 */
export default {
  // Users
  UserIcon,
  UserPlusIcon,
  UserMinusIcon,
  UserCheckIcon,
  UserXIcon,
  UsersIcon,
  UserCogIcon,

  // Navigation
  HomeIcon,
  DashboardIcon,
  SettingsIcon,
  MenuIcon,
  CloseIcon,

  // Actions
  PlusIcon,
  EditIcon,
  TrashIcon,
  SaveIcon,

  // Status
  CheckIcon,
  AlertCircleIcon,
  InfoIcon,

  // And more...
};
