import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with service role key for admin operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          short_description: string
          price: number
          original_price: number | null
          stock_quantity: number
          sku: string
          images: string[]
          specifications: Record<string, any>
          warranty_info: string | null
          meta_title: string | null
          meta_description: string | null
          is_active: boolean
          is_featured: boolean
          category_id: string
          brand_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          short_description: string
          price: number
          original_price?: number | null
          stock_quantity: number
          sku: string
          images: string[]
          specifications?: Record<string, any>
          warranty_info?: string | null
          meta_title?: string | null
          meta_description?: string | null
          is_active?: boolean
          is_featured?: boolean
          category_id: string
          brand_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          short_description?: string
          price?: number
          original_price?: number | null
          stock_quantity?: number
          sku?: string
          images?: string[]
          specifications?: Record<string, any>
          warranty_info?: string | null
          meta_title?: string | null
          meta_description?: string | null
          is_active?: boolean
          is_featured?: boolean
          category_id?: string
          brand_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          customer_name: string
          customer_email: string
          customer_phone: string | null
          shipping_address: Record<string, any>
          billing_address: Record<string, any>
          total_amount: number
          status: string
          payment_status: string
          payment_method: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          shipping_address: Record<string, any>
          billing_address: Record<string, any>
          total_amount: number
          status?: string
          payment_status?: string
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          shipping_address?: Record<string, any>
          billing_address?: Record<string, any>
          total_amount?: number
          status?: string
          payment_status?: string
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string | null
          name: string
          email: string
          rating: number
          comment: string
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id?: string | null
          name: string
          email: string
          rating: number
          comment: string
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string | null
          name?: string
          email?: string
          rating?: number
          comment?: string
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper functions for common operations
export const getProducts = async (filters?: {
  category?: string
  search?: string
  featured?: boolean
  limit?: number
}) => {
  let query = supabase
    .from("products")
    .select(`
      *,
      categories (name, slug),
      brands (name, slug)
    `)
    .eq("is_active", true)

  if (filters?.category) {
    const { data: category } = await supabase.from("categories").select("id").eq("slug", filters.category).single()

    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`)
  }

  if (filters?.featured) {
    query = query.eq("is_featured", true)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data || []
}

export const getProduct = async (slug: string) => {
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (name, slug),
      brands (name, slug)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !product) {
    return null
  }

  return product
}

export const getCategories = async () => {
  const { data: categories, error } = await supabase.from("categories").select("*").eq("is_active", true).order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return categories || []
}

export const getBrands = async () => {
  const { data: brands, error } = await supabase.from("brands").select("*").eq("is_active", true).order("name")

  if (error) {
    console.error("Error fetching brands:", error)
    return []
  }

  return brands || []
}
