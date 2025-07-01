import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code?: string

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, true, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, true, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 500, true, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

// Error response interface
interface ErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    statusCode: number
    timestamp: string
    path: string
    details?: any
  }
}

// Global error handler for API routes
export function handleApiError(
  error: Error | AppError,
  request: NextRequest,
  context?: Record<string, any>
): NextResponse<ErrorResponse> {
  const timestamp = new Date().toISOString()
  const path = new URL(request.url).pathname

  // Log the error
  logger.apiError('Unhandled API error', error, request, context)

  // Determine if it's an operational error
  const isAppError = error instanceof AppError
  const statusCode = isAppError ? error.statusCode : 500
  const code = isAppError ? error.code : 'INTERNAL_SERVER_ERROR'
  
  // Don't expose internal errors in production
  const message = isAppError || process.env.NODE_ENV === 'development' 
    ? error.message 
    : 'Internal server error'

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      code,
      statusCode,
      timestamp,
      path,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        context
      } : undefined
    }
  }

  return NextResponse.json(errorResponse, { status: statusCode })
}

// Async error wrapper for API routes
export function asyncHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleApiError(error as Error, request, context)
    }
  }
}

// Database error mapper
export function mapDatabaseError(error: any): AppError {
  // PostgreSQL/Supabase specific error codes
  switch (error.code) {
    case '23505': // unique_violation
      return new ConflictError('A record with this value already exists')
    case '23503': // foreign_key_violation
      return new ValidationError('Referenced record does not exist')
    case '23514': // check_violation
      return new ValidationError('Data violates database constraints')
    case '23502': // not_null_violation
      return new ValidationError('Required field is missing')
    case '42P01': // undefined_table
      return new DatabaseError('Database table not found')
    case '42703': // undefined_column
      return new DatabaseError('Database column not found')
    case 'PGRST116': // Supabase: no rows returned
      return new NotFoundError('Record')
    default:
      return new DatabaseError(error.message || 'Database operation failed', error)
  }
}

// Client-side error boundary component helper
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  
  return 'An unexpected error occurred'
}

// Error reporting helper
export function reportError(error: Error, context?: Record<string, any>) {
  logger.error('Client-side error reported', error, context)
  
  // In production, you might want to send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Sentry, LogRocket, etc.
    console.log('Would report to error tracking service:', { error, context })
  }
}

// Performance monitoring helper
export function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now()
    
    try {
      const result = await fn()
      const duration = Date.now() - startTime
      
      logger.debug(`Performance: ${operation}`, {
        duration: `${duration}ms`,
        ...context
      })
      
      resolve(result)
    } catch (error) {
      const duration = Date.now() - startTime
      
      logger.error(`Performance: ${operation} failed`, error as Error, {
        duration: `${duration}ms`,
        ...context
      })
      
      reject(error)
    }
  })
}