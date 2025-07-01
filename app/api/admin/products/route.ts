import { NextRequest } from 'next/server'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  requireAdmin, 
  validateMethod,
  parseJsonBody,
  parseQueryParams,
  handleDatabaseError,
  rateLimit,
  getClientIP,
  logApiRequest
} from '@/lib/api-helpers'
import { validateProduct, validateProductSearch, sanitizeHtml, sanitizeSlug } from '@/lib/validation'
import { supabase } from '@/lib/supabase'

// GET /api/admin/products - Get all products with admin access
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

    // Parse and validate query parameters
    const queryParams = parseQueryParams(request)
    const searchValidation = validateProductSearch(queryParams)
    
    if (!searchValidation.success) {
      return createErrorResponse('Invalid query parameters', 400)
    }

    const { search, category, brand, min_price, max_price, sort, order, limit, offset } = searchValidation.data

    // Build query
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (id, name, slug),
        brands (id, name, slug)
      `)

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id)
      }
    }

    if (brand) {
      const { data: brandData } = await supabase
        .from('brands')
        .select('id')
        .eq('slug', brand)
        .single()
      
      if (brandData) {
        query = query.eq('brand_id', brandData.id)
      }
    }

    if (min_price !== undefined) {
      query = query.gte('price', min_price)
    }

    if (max_price !== undefined) {
      query = query.lte('price', max_price)
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: products, error: dbError } = await query

    if (dbError) {
      return handleDatabaseError(dbError)
    }

    logApiRequest(request)
    return createSuccessResponse(products, 'Products retrieved successfully')

  } catch (error: any) {
    logApiRequest(request, undefined, error)
    return createErrorResponse('Internal server error', 500)
  }
}

// POST /api/admin/products - Create a new product
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
    const { data: productData, error: bodyError } = await parseJsonBody(request, validateProduct)
    if (bodyError) return bodyError

    // Sanitize input data
    const sanitizedData = {
      ...productData!,
      name: sanitizeHtml(productData!.name),
      slug: sanitizeSlug(productData!.slug),
      description: sanitizeHtml(productData!.description),
      short_description: sanitizeHtml(productData!.short_description),
      warranty_info: productData!.warranty_info ? sanitizeHtml(productData!.warranty_info) : null,
    }

    // Check if slug already exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', sanitizedData.slug)
      .single()

    if (existingProduct) {
      return createErrorResponse('A product with this slug already exists', 409)
    }

    // Check if SKU already exists
    const { data: existingSku } = await supabase
      .from('products')
      .select('id')
      .eq('sku', sanitizedData.sku)
      .single()

    if (existingSku) {
      return createErrorResponse('A product with this SKU already exists', 409)
    }

    // Verify category and brand exist
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', sanitizedData.category_id)
      .single()

    if (!category) {
      return createErrorResponse('Category not found', 400)
    }

    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .eq('id', sanitizedData.brand_id)
      .single()

    if (!brand) {
      return createErrorResponse('Brand not found', 400)
    }

    // Create the product
    const { data: newProduct, error: dbError } = await supabase
      .from('products')
      .insert([sanitizedData])
      .select(`
        *,
        categories (id, name, slug),
        brands (id, name, slug)
      `)
      .single()

    if (dbError) {
      return handleDatabaseError(dbError)
    }

    logApiRequest(request)
    return createSuccessResponse(newProduct, 'Product created successfully')

  } catch (error: any) {
    logApiRequest(request, undefined, error)
    return createErrorResponse('Internal server error', 500)
  }
}