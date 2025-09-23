import { DiscordErrorType, DiscordServiceError } from './errors';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableErrors: DiscordErrorType[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 16000, // 16 seconds
  retryableErrors: [
    DiscordErrorType.API_RATE_LIMIT,
    DiscordErrorType.NETWORK_ERROR
  ]
};

export class DiscordRetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // If this is the last attempt, throw the error
        if (attempt === config.maxRetries) {
          break;
        }
        
        // Check if error is retryable
        if (error instanceof DiscordServiceError && !config.retryableErrors.includes(error.type)) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt),
          config.maxDelay
        );
        
        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000;
        
        console.warn(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${jitteredDelay}ms delay`, {
          error: error instanceof DiscordServiceError ? error.type : error instanceof Error ? error.message : String(error),
          attempt: attempt + 1,
          maxRetries: config.maxRetries,
          delay: jitteredDelay
        });
        
        await this.sleep(jitteredDelay);
      }
    }
    
    throw lastError!;
  }
  
  static async withRetryForDiscordAPI<T>(
    operation: () => Promise<Response>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<Response> {
    return this.withRetry(async () => {
      const response = await operation();
      
      // Check for Discord API specific errors
      if (!response.ok) {
        const errorType = this.getDiscordErrorType(response.status);
        const errorText = await response.text();
        
        // For rate limits, mark as retryable
        const isRetryable = errorType === DiscordErrorType.API_RATE_LIMIT || 
                           errorType === DiscordErrorType.NETWORK_ERROR;
        
        throw new DiscordServiceError(
          errorType,
          `Discord API error: ${response.status} ${response.statusText} - ${errorText}`,
          isRetryable
        );
      }
      
      return response;
    }, config);
  }
  
  private static getDiscordErrorType(statusCode: number): DiscordErrorType {
    switch (statusCode) {
      case 429:
        return DiscordErrorType.API_RATE_LIMIT;
      case 403:
        return DiscordErrorType.PERMISSION_DENIED;
      case 404:
        return DiscordErrorType.INVALID_CHANNEL;
      case 400:
        return DiscordErrorType.INVALID_GUILD;
      default:
        if (statusCode >= 500) {
          return DiscordErrorType.NETWORK_ERROR;
        }
        return DiscordErrorType.NETWORK_ERROR;
    }
  }
  
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}