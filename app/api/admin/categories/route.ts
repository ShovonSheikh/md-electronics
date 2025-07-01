import { NextRequest } from 'next/server'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  requireAdmin, 
  validateMethod,
  parseJsonBody,
  handleDatabaseError,
  rateLimit,
  getClientIP,
  logApiRequest
} from '@/lib/api-helpers'
import { validateCategory, sanitizeHtml, sanitizeSlug } from '@/lib/validation'
import { supabase } from '@/lib/supabase'

// GET /api/admin/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    if (!rateLimit(clientIP, 100, 15 * 60 * 1000)) {
      return createErrorResponse('Too many requests', 429)
    }

    // Validate method
    const methodError = validateMethod(request, ['GET'])
    if (methodError) return methodError

    // Require admin authentication
    const { user, error: authError } = await requireAdmin(request)
    if (authError) return authError

    const { data: categories, error: dbError } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (dbError) {
      return handleDatabaseError(dbError)
    }

    logApiRequest(request)
    return createSuccessResponse(categories, 'Categories retrieved successfully')

  } catch (error: any) {
    logApiRequest(request, undefined, error)
    return createErrorResponse('Internal server error', 500)
  }
}

// POST /api/admin/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    if (!rateLimit(clientIP, 20, 15 * 60 * 1000)) {
      return createErrorResponse('Too many requests', 429)
    }

    // Validate method
    const methodError = validateMethod(request, ['POST'])
    if (methodError) return methodError

    // Require admin authentication
    const { user, error: authError } = await requireAdmin(request)
    if (authError) return authError

    // Parse and validate request body
    const { data: categoryData, error: bodyError } = await parseJsonBody(request, validateCategory)
    if (bodyError) return bodyError

    // Sanitize input data
    const sanitizedData = {
      ...categoryData!,
      name: sanitizeHtml(categoryData!.name),
      slug: sanitizeSlug(categoryData!.slug),
      description: categoryData!.description ? sanitizeHtml(categoryData!.description) : null,
    }

    // Check if slug already exists
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', sanitizedData.slug)
      .single()

    if (existingCategory) {
      return createErrorResponse('A category with this slug already exists', 409)
    }

    // Create the category
    const { data: newCategory, error: dbError } = await supabase
      .from('categories')
      .insert([sanitizedData])
      .select('*')
      .single()

    if (dbError) {
      return handleDatabaseError(dbError)
    }

    logApiRequest(request)
    return createSuccessResponse(newCategory, 'Category created successfully')

  } catch (error: any) {
    logApiRequest(request, undefined, error)
    return createErrorResponse('Internal server error', 500)
  }
}