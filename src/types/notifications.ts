export type NotificationType = 'success' | 'alert' | 'warning' | 'info' | 'opportunity' | 'deadline' | 'calculation' | 'error';

export interface NotificationEvent {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  urgency?: 'low' | 'medium' | 'high';
  soundEnabled?: boolean;
  timestamp?: number;

  // Email specific
  emailRequired?: boolean;
  recipientEmail?: string;
  emailTemplate?: string; // 'opportunity' | 'deadline' | 'regime' | 'error'
  emailVariables?: Record<string, any>;
}

export interface NotificationPreference {
  soundEnabled: boolean;
  pushEnabled: boolean;
  vibrationEnabled: boolean;
  volume?: number;           // 0 to 1

  // Email preferences
  emailNotifications: boolean;
  emailAddress?: string;
  notificationFrequency: 'immediate' | 'daily' | 'weekly';
  quietHoursStart?: string; // e.g. "20:00"
  quietHoursEnd?: string;   // e.g. "08:00"
}

export interface DemoMode {
  enabled: boolean;
  speed: number;             // 1x, 2x, 4x
  autoActions: boolean;
  activeScenario?: string;
  isPlaying?: boolean;
}

export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  plainTextBody: string;
  variables: string[];
  priority: number; // 1-3
}

export interface EmailLog {
  id: string;
  recipient: string;
  type: string;
  subject: string;
  status: 'sent' | 'queued' | 'failed';
  sentAt: number;
  openedAt?: number;
  retryCount: number;
  error?: string;
}
