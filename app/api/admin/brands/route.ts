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
import { validateBrand, sanitizeHtml, sanitizeSlug } from '@/lib/validation'
import { supabase } from '@/lib/supabase'

// GET /api/admin/brands - Get all brands
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

    const { data: brands, error: dbError } = await supabase
      .from('brands')
      .select('*')
      .order('name')

    if (dbError) {
      return handleDatabaseError(dbError)
    }

    logApiRequest(request)
    return createSuccessResponse(brands, 'Brands retrieved successfully')

  } catch (error: any) {
    logApiRequest(request, undefined, error)
    return createErrorResponse('Internal server error', 500)
  }
}

// POST /api/admin/brands - Create a new brand
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
    const { data: brandData, error: bodyError } = await parseJsonBody(request, validateBrand)
    if (bodyError) return bodyError

    // Sanitize input data
    const sanitizedData = {
      ...brandData!,
      name: sanitizeHtml(brandData!.name),
      slug: sanitizeSlug(brandData!.slug),
    }

    // Check if slug already exists
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id')
      .eq('slug', sanitizedData.slug)
      .single()

    if (existingBrand) {
      return createErrorResponse('A brand with this slug already exists', 409)
    }

    // Create the brand
    const { data: newBrand, error: dbError } = await supabase
      .from('brands')
      .insert([sanitizedData])
      .select('*')
      .single()

    if (dbError) {
      return handleDatabaseError(dbError)
    }

    logApiRequest(request)
    return createSuccessResponse(newBrand, 'Brand created successfully')

  } catch (error: any) {
    logApiRequest(request, undefined, error)
    return createErrorResponse('Internal server error', 500)
  }
}