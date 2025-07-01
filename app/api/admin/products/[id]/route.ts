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
import { validateProduct, sanitizeHtml, sanitizeSlug } from '@/lib/validation'
import { supabase } from '@/lib/supabase'

// GET /api/admin/products/[id] - Get a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return createErrorResponse('Invalid product ID format', 400)
    }

    const { data: product, error: dbError } = await supabase
      .from('products')
      .select(`
        *,
        categories (id, name, slug),
        brands (id, name, slug)
      `)
      .eq('id', id)
      .single()

    if (dbError) {
      if (dbError.code === 'PGRST116') {
        return createErrorResponse('Product not found', 404)
      }
      return handleDatabaseError(dbError)
    }

    logApiRequest(request)
    return createSuccessResponse(product, 'Product retrieved successfully')

  } catch (error: any) {
    logApiRequest(request, undefined, error)
    return createErrorResponse('Internal server error', 500)
  }
}

// PUT /api/admin/products/[id] - Update a specific product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    if (!rateLimit(clientIP, 20, 15 * 60 * 1000)) {
      return createErrorResponse('Too many requests', 429)
    }

    // Validate method
    const methodError = validateMethod(request, ['PUT'])
    if (methodError) return methodError

    // Require admin authentication
    const { user, error: authError } = await requireAdmin(request)
    if (authError) return authError

    const { id } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return createErrorResponse('Invalid product ID format', 400)
    }

    // Parse and validate request body
    const { data: productData, error: bodyError } = await parseJsonBody(request, validateProduct)
    if (bodyError) return bodyError

    // Check if product exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id, slug, sku')
      .eq('id', id)
      .single()

    if (!existingProduct) {
      return createErrorResponse('Product not found', 404)
    }

    // Sanitize input data
    const sanitizedData = {
      ...productData!,
      name: sanitizeHtml(productData!.name),
      slug: sanitizeSlug(productData!.slug),
      description: sanitizeHtml(productData!.description),
      short_description: sanitizeHtml(productData!.short_description),
      warranty_info: productData!.warranty_info ? sanitizeHtml(productData!.warranty_info) : null,
      updated_at: new Date().toISOString(),
    }

    // Check if slug already exists (excluding current product)
    if (sanitizedData.slug !== existingProduct.slug) {
      const { data: slugExists } = await supabase
        .from('products')
        .select('id')
        .eq('slug', sanitizedData.slug)
        .neq('id', id)
        .single()

      if (slugExists) {
        return createErrorResponse('A product with this slug already exists', 409)
      }
    }

    // Check if SKU already exists (excluding current product)
    if (sanitizedData.sku !== existingProduct.sku) {
      const { data: skuExists } = await supabase
        .from('products')
        .select('id')
        .eq('sku', sanitizedData.sku)
        .neq('id', id)
        .single()

      if (skuExists) {
        return createErrorResponse('A product with this SKU already exists', 409)
      }
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

    // Update the product
    const { data: updatedProduct, error: dbError } = await supabase
      .from('products')
      .update(sanitizedData)
      .eq('id', id)
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
    return createSuccessResponse(updatedProduct, 'Product updated successfully')

  } catch (error: any) {
    logApiRequest(request, undefined, error)
    return createErrorResponse('Internal server error', 500)
  }
}

// DELETE /api/admin/products/[id] - Delete a specific product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    if (!rateLimit(clientIP, 10, 15 * 60 * 1000)) {
      return createErrorResponse('Too many requests', 429)
    }

    // Validate method
    const methodError = validateMethod(request, ['DELETE'])
    if (methodError) return methodError

    // Require admin authentication
    const { user, error: authError } = await requireAdmin(request)
    if (authError) return authError

    const { id } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return createErrorResponse('Invalid product ID format', 400)
    }

    // Check if product exists
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', id)
      .single()

    if (!existingProduct) {
      return createErrorResponse('Product not found', 404)
    }

    // Check if product is referenced in any orders
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1)

    if (orderItems && orderItems.length > 0) {
      return createErrorResponse('Cannot delete product that has been ordered. Consider deactivating it instead.', 400)
    }

    // Delete the product
    const { error: dbError } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (dbError) {
      return handleDatabaseError(dbError)
    }

    logApiRequest(request)
    return createSuccessResponse(
      { id, name: existingProduct.name }, 
      'Product deleted successfully'
    )

  } catch (error: any) {
    logApiRequest(request, undefined, error)
    return createErrorResponse('Internal server error', 500)
  }
}