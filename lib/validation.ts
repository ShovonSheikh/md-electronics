import { z } from 'zod'

// Product validation schema
export const productSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be less than 255 characters')
    .trim(),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(255, 'Slug must be less than 255 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .trim(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .trim(),
  short_description: z.string()
    .min(10, 'Short description must be at least 10 characters')
    .max(500, 'Short description must be less than 500 characters')
    .trim(),
  price: z.number()
    .positive('Price must be positive')
    .max(999999.99, 'Price cannot exceed $999,999.99')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),
  original_price: z.number()
    .positive('Original price must be positive')
    .max(999999.99, 'Original price cannot exceed $999,999.99')
    .multipleOf(0.01, 'Original price must have at most 2 decimal places')
    .optional()
    .nullable(),
  stock_quantity: z.number()
    .int('Stock quantity must be a whole number')
    .min(0, 'Stock quantity cannot be negative')
    .max(999999, 'Stock quantity cannot exceed 999,999'),
  sku: z.string()
    .min(1, 'SKU is required')
    .max(100, 'SKU must be less than 100 characters')
    .regex(/^[A-Z0-9-_]+$/, 'SKU must contain only uppercase letters, numbers, hyphens, and underscores')
    .trim(),
  images: z.array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
  specifications: z.record(z.string(), z.any())
    .optional()
    .default({}),
  warranty_info: z.string()
    .max(1000, 'Warranty info must be less than 1000 characters')
    .trim()
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  category_id: z.string().uuid('Invalid category ID'),
  brand_id: z.string().uuid('Invalid brand ID'),
})

// Category validation schema
export const categorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(255, 'Category name must be less than 255 characters')
    .trim(),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(255, 'Slug must be less than 255 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .trim()
    .optional()
    .nullable(),
  image_url: z.string()
    .url('Invalid image URL')
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),
})

// Brand validation schema
export const brandSchema = z.object({
  name: z.string()
    .min(1, 'Brand name is required')
    .max(255, 'Brand name must be less than 255 characters')
    .trim(),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(255, 'Slug must be less than 255 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .trim(),
  logo_url: z.string()
    .url('Invalid logo URL')
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),
})

// Order validation schema
export const orderSchema = z.object({
  customer_name: z.string()
    .min(1, 'Customer name is required')
    .max(255, 'Customer name must be less than 255 characters')
    .trim(),
  customer_email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .trim(),
  customer_phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .max(50, 'Phone number must be less than 50 characters')
    .trim()
    .optional()
    .nullable(),
  shipping_address: z.object({
    street: z.string().min(1, 'Street address is required').max(255),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().min(1, 'State is required').max(100),
    zip: z.string().min(1, 'ZIP code is required').max(20),
    country: z.string().min(1, 'Country is required').max(100),
  }),
  billing_address: z.object({
    street: z.string().min(1, 'Street address is required').max(255),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().min(1, 'State is required').max(100),
    zip: z.string().min(1, 'ZIP code is required').max(20),
    country: z.string().min(1, 'Country is required').max(100),
  }),
  total_amount: z.number()
    .positive('Total amount must be positive')
    .max(999999.99, 'Total amount cannot exceed $999,999.99')
    .multipleOf(0.01, 'Total amount must have at most 2 decimal places'),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .default('pending'),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded'])
    .default('pending'),
  payment_method: z.string()
    .max(100, 'Payment method must be less than 100 characters')
    .optional()
    .nullable(),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .trim()
    .optional()
    .nullable(),
})

// Order item validation schema
export const orderItemSchema = z.object({
  order_id: z.string().uuid('Invalid order ID'),
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number()
    .int('Quantity must be a whole number')
    .positive('Quantity must be positive')
    .max(999, 'Quantity cannot exceed 999'),
  unit_price: z.number()
    .positive('Unit price must be positive')
    .max(999999.99, 'Unit price cannot exceed $999,999.99')
    .multipleOf(0.01, 'Unit price must have at most 2 decimal places'),
  total_price: z.number()
    .positive('Total price must be positive')
    .max(999999.99, 'Total price cannot exceed $999,999.99')
    .multipleOf(0.01, 'Total price must have at most 2 decimal places'),
})

// Review validation schema
export const reviewSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .trim(),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .trim(),
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(2000, 'Comment must be less than 2000 characters')
    .trim(),
  is_approved: z.boolean().default(false),
})

// Admin login validation schema
export const adminLoginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
})

// Search and filter validation schemas
export const productSearchSchema = z.object({
  search: z.string()
    .max(255, 'Search term must be less than 255 characters')
    .trim()
    .optional(),
  category: z.string()
    .max(255, 'Category must be less than 255 characters')
    .trim()
    .optional(),
  brand: z.string()
    .max(255, 'Brand must be less than 255 characters')
    .trim()
    .optional(),
  min_price: z.number()
    .min(0, 'Minimum price cannot be negative')
    .max(999999.99, 'Minimum price cannot exceed $999,999.99')
    .optional(),
  max_price: z.number()
    .min(0, 'Maximum price cannot be negative')
    .max(999999.99, 'Maximum price cannot exceed $999,999.99')
    .optional(),
  sort: z.enum(['name', 'price', 'created_at', 'rating'])
    .optional()
    .default('created_at'),
  order: z.enum(['asc', 'desc'])
    .optional()
    .default('desc'),
  limit: z.number()
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(20),
  offset: z.number()
    .int('Offset must be a whole number')
    .min(0, 'Offset cannot be negative')
    .optional()
    .default(0),
})

// Validation helper functions
export function validateProduct(data: unknown) {
  return productSchema.safeParse(data)
}

export function validateCategory(data: unknown) {
  return categorySchema.safeParse(data)
}

export function validateBrand(data: unknown) {
  return brandSchema.safeParse(data)
}

export function validateOrder(data: unknown) {
  return orderSchema.safeParse(data)
}

export function validateOrderItem(data: unknown) {
  return orderItemSchema.safeParse(data)
}

export function validateReview(data: unknown) {
  return reviewSchema.safeParse(data)
}

export function validateAdminLogin(data: unknown) {
  return adminLoginSchema.safeParse(data)
}

export function validateProductSearch(data: unknown) {
  return productSearchSchema.safeParse(data)
}

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function sanitizeSku(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9\s-_]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

// Type exports for TypeScript
export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type BrandInput = z.infer<typeof brandSchema>
export type OrderInput = z.infer<typeof orderSchema>
export type OrderItemInput = z.infer<typeof orderItemSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type AdminLoginInput = z.infer<typeof adminLoginSchema>
export type ProductSearchInput = z.infer<typeof productSearchSchema>