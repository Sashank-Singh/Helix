// Update or add the NavView enum if it doesn't exist
export enum NavView {
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  SETTINGS = 'settings'
}

// Message types
export interface MessageType {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

// Sequence step type
export interface SequenceStepType {
  id?: string;
  step_number?: number;
  subject?: string;
  message?: string;
  delay_days?: number;
}

// Full sequence type
export interface SequenceType {
  id: string;
  session_id: string;
  title: string;
  description: string;
  steps: SequenceStepType[];
  created_at: string;
  updated_at?: string;
}

export interface DashboardProps {
  stats: {
    totalSequences: number;
    activeSequences: number;
    totalMessages: number;
    completionRate: number;
  };
  user: any;
  loading: boolean;
  onCreateSequence?: () => void;
}

export interface SettingsProps {
  user: any;
  apiUrl: string;
  onUserUpdate: (updatedUser: any) => void;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
  token?: string;
} 