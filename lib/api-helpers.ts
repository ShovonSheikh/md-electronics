import { NextRequest, NextResponse } from 'next/server'
import { authService } from './auth'
import { supabase } from './supabase'

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
      return {
        user: null,
        error: createErrorResponse('Missing or invalid authorization header', 401)
      }
    }

    const token = authHeader.substring(7)
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return {
        user: null,
        error: createErrorResponse('Invalid or expired token', 401)
      }
    }

    return { user }
  } catch (error) {
    return {
      user: null,
      error: createErrorResponse('Authentication failed', 401)
    }
  }
}

// Admin authentication middleware
export async function requireAdmin(request: NextRequest): Promise<{ user: any; error?: NextResponse }> {
  const authResult = await requireAuth(request)
  
  if (authResult.error) {
    return authResult
  }

  const isAdmin = await authService.isAdmin(authResult.user)
  
  if (!isAdmin) {
    return {
      user: null,
      error: createErrorResponse('Admin access required', 403)
    }
  }

  return authResult
}

// Rate limiting helper (basic implementation)
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
    return createErrorResponse(`Method ${request.method} not allowed`, 405)
  }
  return null
}

// Parse and validate JSON body
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
        
        return {
          error: createErrorResponse(errorMessage, 400)
        }
      }
      return { data: result.data }
    }
    
    return { data: body }
  } catch (error) {
    return {
      error: createErrorResponse('Invalid JSON in request body', 400)
    }
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

// Database error handler
export function handleDatabaseError(error: any): NextResponse {
  console.error('Database error:', error)
  
  // Handle specific Supabase/PostgreSQL errors
  if (error.code === '23505') {
    return createErrorResponse('A record with this value already exists', 409)
  }
  
  if (error.code === '23503') {
    return createErrorResponse('Referenced record does not exist', 400)
  }
  
  if (error.code === '23514') {
    return createErrorResponse('Data violates database constraints', 400)
  }
  
  // Generic database error
  return createErrorResponse('Database operation failed', 500)
}

// Logging helper
export function logApiRequest(request: NextRequest, response?: NextResponse, error?: any) {
  const timestamp = new Date().toISOString()
  const method = request.method
  const url = request.url
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  const logData = {
    timestamp,
    method,
    url,
    ip,
    userAgent,
    status: response?.status || (error ? 500 : 'unknown'),
    error: error?.message,
  }
  
  console.log('API Request:', JSON.stringify(logData))
}