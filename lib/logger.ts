import { NextRequest } from 'next/server'

export interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  context?: Record<string, any>
  error?: {
    name: string
    message: string
    stack?: string
  }
  request?: {
    method: string
    url: string
    ip: string
    userAgent: string
    userId?: string
  }
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, error, request } = entry
    
    if (this.isDevelopment) {
      // Colorful console output for development
      const colors = {
        info: '\x1b[36m',    // Cyan
        warn: '\x1b[33m',    // Yellow
        error: '\x1b[31m',   // Red
        debug: '\x1b[35m',   // Magenta
        reset: '\x1b[0m'
      }
      
      let output = `${colors[level]}[${level.toUpperCase()}]${colors.reset} ${timestamp} - ${message}`
      
      if (context) {
        output += `\n  Context: ${JSON.stringify(context, null, 2)}`
      }
      
      if (request) {
        output += `\n  Request: ${request.method} ${request.url} (${request.ip})`
      }
      
      if (error) {
        output += `\n  Error: ${error.name}: ${error.message}`
        if (error.stack) {
          output += `\n  Stack: ${error.stack}`
        }
      }
      
      return output
    } else {
      // JSON format for production (easier for log aggregation)
      return JSON.stringify(entry)
    }
  }

  private log(level: LogEntry['level'], message: string, context?: Record<string, any>, error?: Error, request?: NextRequest) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined
      }
    }

    if (request) {
      entry.request = {
        method: request.method,
        url: request.url,
        ip: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        userId: this.getUserId(request)
      }
    }

    const formattedLog = this.formatLog(entry)

    // Output to console
    switch (level) {
      case 'error':
        console.error(formattedLog)
        break
      case 'warn':
        console.warn(formattedLog)
        break
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedLog)
        }
        break
      default:
        console.log(formattedLog)
    }

    // In production, you might want to send logs to external services
    if (this.isProduction && level === 'error') {
      this.sendToExternalService(entry)
    }
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return 'unknown'
  }

  private getUserId(request: NextRequest): string | undefined {
    try {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // In a real implementation, you'd decode the JWT to get user ID
        // For now, we'll just indicate that there's an authenticated user
        return 'authenticated'
      }
    } catch (error) {
      // Ignore errors in user ID extraction
    }
    return undefined
  }

  private async sendToExternalService(entry: LogEntry) {
    // In production, send critical errors to external logging services
    // Examples: Sentry, LogRocket, DataDog, etc.
    try {
      // Example implementation (replace with your preferred service)
      if (process.env.SENTRY_DSN) {
        // Send to Sentry
        console.log('Would send to Sentry:', entry)
      }
      
      if (process.env.WEBHOOK_URL) {
        // Send to webhook
        await fetch(process.env.WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })
      }
    } catch (error) {
      console.error('Failed to send log to external service:', error)
    }
  }

  // Public methods
  info(message: string, context?: Record<string, any>, request?: NextRequest) {
    this.log('info', message, context, undefined, request)
  }

  warn(message: string, context?: Record<string, any>, request?: NextRequest) {
    this.log('warn', message, context, undefined, request)
  }

  error(message: string, error?: Error, context?: Record<string, any>, request?: NextRequest) {
    this.log('error', message, context, error, request)
  }

  debug(message: string, context?: Record<string, any>, request?: NextRequest) {
    this.log('debug', message, context, undefined, request)
  }

  // API-specific logging methods
  apiRequest(request: NextRequest, response?: { status: number }, duration?: number) {
    this.info('API Request', {
      method: request.method,
      url: request.url,
      status: response?.status,
      duration: duration ? `${duration}ms` : undefined
    }, request)
  }

  apiError(message: string, error: Error, request: NextRequest, context?: Record<string, any>) {
    this.error(`API Error: ${message}`, error, {
      ...context,
      method: request.method,
      url: request.url
    }, request)
  }

  authAttempt(email: string, success: boolean, request: NextRequest, reason?: string) {
    this.info('Authentication Attempt', {
      email,
      success,
      reason,
      ip: this.getClientIP(request)
    }, request)
  }

  securityEvent(event: string, request: NextRequest, context?: Record<string, any>) {
    this.warn(`Security Event: ${event}`, {
      ...context,
      ip: this.getClientIP(request),
      userAgent: request.headers.get('user-agent')
    }, request)
  }

  databaseOperation(operation: string, table: string, success: boolean, duration?: number, error?: Error) {
    if (success) {
      this.debug('Database Operation', {
        operation,
        table,
        duration: duration ? `${duration}ms` : undefined
      })
    } else {
      this.error(`Database Operation Failed: ${operation} on ${table}`, error, {
        operation,
        table,
        duration: duration ? `${duration}ms` : undefined
      })
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export types for use in other files
export type { LogEntry }