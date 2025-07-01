import { NextRequest, NextResponse } from 'next/server'
import { authService } from './auth'
import { supabase } from './supabase'
import { logger } from './logger'
import { 
  AppError, 
  AuthenticationError, 
  AuthorizationError, 
  RateLimitError,
  handleApiError,
  mapDatabaseError,
  measurePerformance
} from './error-handler'

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

// Create standardized API responses
export function createSuccessResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  })
}

export function createErrorResponse(error: string | ApiError, status: number = 400): NextResponse<ApiResponse> {
  const errorMessage = typeof error === 'string' ? error : error.message
  const statusCode = typeof error === 'object' && error.status ? error.status : status

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
    },
    { status: statusCode }
  )
}

// Authentication middleware for API routes
export async function requireAuth(request: NextRequest): Promise<{ user: any; error?: NextResponse }> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.securityEvent('Missing authorization header', request)
      throw new AuthenticationError('Missing or invalid authorization header')
    }

    const token = authHeader.substring(7)
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      logger.securityEvent('Invalid token', request, { error: error?.message })
      throw new AuthenticationError('Invalid or expired token')
    }

    logger.debug('User authenticated', { userId: user.id, email: user.email }, request)
    return { user }
  } catch (error) {
    if (error instanceof AppError) {
      return { user: null, error: handleApiError(error, request) }
    }
    return { user: null, error: handleApiError(new AuthenticationError(), request) }
  }
}

// Admin authentication middleware
export async function requireAdmin(request: NextRequest): Promise<{ user: any; error?: NextResponse }> {
  const authResult = await requireAuth(request)
  
  if (authResult.error) {
    return authResult
  }

  try {
    const isAdmin = await authService.isAdmin(authResult.user)
    
    if (!isAdmin) {
      logger.securityEvent('Non-admin access attempt', request, { 
        userId: authResult.user.id,
        email: authResult.user.email 
      })
      throw new AuthorizationError('Admin access required')
    }

    logger.debug('Admin access granted', { 
      userId: authResult.user.id,
      email: authResult.user.email 
    }, request)

    return authResult
  } catch (error) {
    if (error instanceof AppError) {
      return { user: null, error: handleApiError(error, request) }
    }
    return { user: null, error: handleApiError(new AuthorizationError(), request) }
  }
}

// Rate limiting helper with enhanced logging
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now()
  const windowStart = now - windowMs

  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key)
    }
  }

  const current = rateLimitMap.get(identifier)
  
  if (!current) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now })
    return true
  }

  if (current.resetTime < windowStart) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now })
    return true
  }

  if (current.count >= maxRequests) {
    logger.warn('Rate limit exceeded', {
      identifier,
      currentCount: current.count,
      maxRequests,
      windowMs
    })
    return false
  }

  current.count++
  return true
}

// Get client IP address
export function getClientIP(request: NextRequest): string {
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

// Validate request method
export function validateMethod(request: NextRequest, allowedMethods: string[]): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    const error = new AppError(`Method ${request.method} not allowed`, 405, true, 'METHOD_NOT_ALLOWED')
    return handleApiError(error, request)
  }
  return null
}

// Parse and validate JSON body with enhanced error handling
export async function parseJsonBody<T>(
  request: NextRequest,
  validator?: (data: unknown) => { success: boolean; data?: T; error?: any }
): Promise<{ data?: T; error?: NextResponse }> {
  try {
    const body = await request.json()
    
    if (validator) {
      const result = validator(body)
      if (!result.success) {
        const errorMessage = result.error?.issues
          ? result.error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`).join(', ')
          : 'Invalid request data'
        
        const validationError = new AppError(errorMessage, 400, true, 'VALIDATION_ERROR')
        return { error: handleApiError(validationError, request) }
      }
      return { data: result.data }
    }
    
    return { data: body }
  } catch (error) {
    const parseError = new AppError('Invalid JSON in request body', 400, true, 'INVALID_JSON')
    return { error: handleApiError(parseError, request) }
  }
}

// Parse query parameters
export function parseQueryParams(request: NextRequest): Record<string, string | string[]> {
  const { searchParams } = new URL(request.url)
  const params: Record<string, string | string[]> = {}
  
  for (const [key, value] of searchParams.entries()) {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value)
      } else {
        params[key] = [params[key] as string, value]
      }
    } else {
      params[key] = value
    }
  }
  
  return params
}

// Enhanced database error handler
export function handleDatabaseError(error: any): NextResponse {
  const mappedError = mapDatabaseError(error)
  logger.error('Database error occurred', error, {
    code: error.code,
    detail: error.detail,
    hint: error.hint
  })
  
  return NextResponse.json(
    {
      success: false,
      error: mappedError.message,
      code: mappedError.code
    },
    { status: mappedError.statusCode }
  )
}

// Enhanced logging helper with performance tracking
export function logApiRequest(
  request: NextRequest, 
  response?: NextResponse, 
  error?: any,
  startTime?: number
) {
  const duration = startTime ? Date.now() - startTime : undefined
  
  if (error) {
    logger.apiError('API request failed', error, request, {
      status: response?.status,
      duration: duration ? `${duration}ms` : undefined
    })
  } else {
    logger.apiRequest(request, { status: response?.status || 200 }, duration)
  }
}

// API route wrapper with comprehensive error handling and logging
export function withApiHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const startTime = Date.now()
    
    try {
      // Rate limiting check
      const clientIP = getClientIP(request)
      if (!rateLimit(clientIP, 100, 15 * 60 * 1000)) {
        throw new RateLimitError('Too many requests')
      }

      // Execute the handler with performance monitoring
      const response = await measurePerformance(
        `API ${request.method} ${new URL(request.url).pathname}`,
        () => handler(request, context),
        { ip: clientIP }
      )

      // Log successful request
      logApiRequest(request, response, undefined, startTime)
      
      return response
    } catch (error) {
      // Handle and log error
      const errorResponse = handleApiError(error as Error, request, context)
      logApiRequest(request, errorResponse, error, startTime)
      
      return errorResponse
    }
  }
}

// Health check helper
export function createHealthCheck() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  })
}