export type CommunicationPlatform = 'discord' | 'slack' | 'telegram';

export interface HackathonDetails {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

export interface ChannelInfo {
  id: string;
  name: string;
  type: number;
  purpose?: string;
}

export interface CommunicationSetupResult {
  success: boolean;
  channels: ChannelInfo[];
  inviteLink?: string;
  metadata: Record<string, any>;
  error?: string;
}

export interface AnnouncementResult {
  id: string;
  content: string;
  timestamp: string;
  author: {
    username: string;
    avatar?: string;
  };
  truncatedContent?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface PlatformAdapter {
  readonly platform: CommunicationPlatform;
  
  setupCommunicationSpace(hackathon: HackathonDetails): Promise<CommunicationSetupResult>;
  fetchAnnouncements(linkId: string): Promise<AnnouncementResult[]>;
  validateConfiguration(metadata: Record<string, any>): Promise<ValidationResult>;
}

export interface CommunicationLink {
  id: string;
  hackathon_id: number;
  platform_type: CommunicationPlatform;
  link_url: string;
  channel_id?: string;
  channel_name?: string;
  is_primary: boolean;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}