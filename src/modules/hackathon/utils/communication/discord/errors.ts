export enum DiscordErrorType {
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  INVALID_CHANNEL = 'INVALID_CHANNEL', 
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_GUILD = 'INVALID_GUILD'
}

export class DiscordServiceError extends Error {
  constructor(
    public type: DiscordErrorType,
    message: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'DiscordServiceError';
  }
}