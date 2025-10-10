import { logger } from './../utils/logger';

/**
 * Error Boundary Utilities
 * Utility functions and types for error handling
 */

// Error categorization utility
export function categorizeError(error: Error): 'chunk' | 'network' | 'runtime' | 'boundary' { const message = error.message.toLowerCase();
  
  if (message.includes('loading chunk') || message.includes('failed to import')) {
    return 'chunk';
  }
  
  if (message.includes('network') || message.includes('fetch')) { return 'network';
  }
  
  if (error.name === 'ChunkLoadError') { return 'chunk';
  }
  
  return 'runtime';
}

// Error reporting service
export interface ErrorDetails { errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  category: string;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string; }

export class ErrorReportingService { private static instance: ErrorReportingService;
  private endpoint: string = '/api/errors';
  
  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }
  
  async reportError(errorDetails: ErrorDetails): Promise<void> { try {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Error reported:', undefined, { errorDetails  });
        return;
      }
      
      await fetch(this.endpoint, { method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorDetails),
      });
    } catch (reportingError) { logger.error('Failed to report error:', undefined, { reportingError  });
    }
  }
  
  setEndpoint(endpoint: string): void { this.endpoint = endpoint;
  }
}