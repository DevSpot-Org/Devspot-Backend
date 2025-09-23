import { PlatformAdapter, CommunicationPlatform } from './types';
import { DiscordAdapter } from './adapters/DiscordAdapter';

export class PlatformRegistry {
  private static adapters = new Map<string, PlatformAdapter>();
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) {
      return;
    }

    try {
      // Register Discord adapter
      this.register(new DiscordAdapter());
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Platform Registry:', error);
      // Don't throw - allow system to continue with limited functionality
    }
  }

  static register(adapter: PlatformAdapter): void {
    this.adapters.set(adapter.platform, adapter);
  }

  static get(platform: string): PlatformAdapter | undefined {
    if (!this.initialized) {
      this.initialize();
    }
    return this.adapters.get(platform);
  }

  static getSupportedPlatforms(): string[] {
    if (!this.initialized) {
      this.initialize();
    }
    return Array.from(this.adapters.keys());
  }

  static isSupported(platform: string): boolean {
    if (!this.initialized) {
      this.initialize();
    }
    return this.adapters.has(platform);
  }

  static getAllAdapters(): PlatformAdapter[] {
    if (!this.initialized) {
      this.initialize();
    }
    return Array.from(this.adapters.values());
  }

  static clear(): void {
    this.adapters.clear();
    this.initialized = false;
  }

  static getAdapterInfo(): Array<{ platform: string; available: boolean; error?: string }> {
    const info: Array<{ platform: string; available: boolean; error?: string }> = [];
    
    // Check Discord
    try {
      const discordAdapter = this.get('discord');
      info.push({
        platform: 'discord',
        available: !!discordAdapter,
        error: !discordAdapter ? 'Discord adapter not available' : undefined
      });
    } catch (error) {
      info.push({
        platform: 'discord',
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Future platforms would be checked here
    info.push({
      platform: 'slack',
      available: false,
      error: 'Slack adapter not implemented yet'
    });

    info.push({
      platform: 'telegram',
      available: false,
      error: 'Telegram adapter not implemented yet'
    });

    return info;
  }
}

// Auto-initialize on import
PlatformRegistry.initialize();