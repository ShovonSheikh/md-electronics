"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Star, Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MainHeader } from "@/components/layout/main-header"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  original_price: number | null
  stock_quantity: number
  images: string[]
  categories?: { name: string; slug: string }
  brands?: { name: string; slug: string }
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Brand {
  id: string
  name: string
  slug: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const categoryParam = searchParams.get("category")
  const searchParam = searchParams.get("search")

  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam)
    }
  }, [searchParam])

  useEffect(() => {
    fetchData()
  }, [categoryParam, searchParam])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch products
      const filters: any = {}
      if (categoryParam) filters.category = categoryParam
      if (searchParam) filters.search = searchParam

      const productsData = await getProducts(filters)
      setProducts(productsData)

      // Fetch categories and brands
      const [categoriesData, brandsData] = await Promise.all([
        getCategories(),
        getBrands()
      ])
      
      setCategories(categoriesData)
      setBrands(brandsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getProducts = async (filters?: {
    category?: string
    search?: string
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
      const searchTerm = `%${filters.search}%`
      query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},short_description.ilike.${searchTerm},sku.ilike.${searchTerm}`)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      return []
    }

    return data || []
  }

  const getCategories = async () => {
    const { data: categories, error } = await supabase.from("categories").select("*").eq("is_active", true).order("name")
    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }
    return categories || []
  }

  const getBrands = async () => {
    const { data: brands, error } = await supabase.from("brands").select("*").eq("is_active", true).order("name")
    if (error) {
      console.error("Error fetching brands:", error)
      return []
    }
    return brands || []
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Update URL with search parameter
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set("search", value.trim())
    } else {
      params.delete("search")
    }
    
    // Keep category if it exists
    if (categoryParam) {
      params.set("category", categoryParam)
    }
    
    router.push(`/products?${params.toString()}`)
  }

  const handleWishlistClick = (productName: string) => {
    toast({
      title: "Added to Wishlist!",
      description: `${productName} has been added to your wishlist.`,
    })
  }

  const handleCartClick = (productName: string) => {
    toast({
      title: "Added to Cart!",
      description: `${productName} has been added to your cart.`,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <MainHeader />

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-blue-600">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">Shop</span>
            {categoryParam && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 capitalize">{categoryParam.replace("-", " ")}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {categoryParam
              ? `${categoryParam.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`
              : searchParam
              ? `Search Results for "${searchParam}"`
              : "All Products"}
          </h1>
          <div className="text-sm text-gray-600">Showing {products.length} products</div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-8">
            {/* Search */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">SEARCH</h3>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">CATEGORIES</h3>
              <div className="space-y-3">
                <Link
                  href="/products"
                  className={`text-sm hover:text-blue-600 transition-colors block ${
                    !categoryParam ? "text-blue-600 font-medium" : "text-gray-700"
                  }`}
                >
                  All Categories
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className={`text-sm hover:text-blue-600 transition-colors block ${
                      categoryParam === category.slug ? "text-blue-600 font-medium" : "text-gray-700"
                    }`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">BRANDS</h3>
              <div className="space-y-3">
                {brands.map((brand) => (
                  <div key={brand.id} className="flex items-center space-x-2">
                    <Checkbox id={`brand-${brand.id}`} />
                    <label htmlFor={`brand-${brand.id}`} className="text-sm text-gray-700 cursor-pointer">
                      {brand.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">PRICE RANGE</h3>
              <div className="space-y-2">
                {[
                  { label: "Under ৳50,000", min: 0, max: 50000 },
                  { label: "৳50,000 - ৳100,000", min: 50000, max: 100000 },
                  { label: "৳100,000 - ৳150,000", min: 100000, max: 150000 },
                  { label: "Over ৳150,000", min: 150000, max: 999999 },
                ].map((range) => (
                  <div key={range.label} className="flex items-center space-x-2">
                    <Checkbox id={`price-${range.min}`} />
                    <label htmlFor={`price-${range.min}`} className="text-sm text-gray-700 cursor-pointer">
                      {range.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700">Apply Filters</Button>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative p-4 bg-gray-50">
                        {product.original_price && product.original_price > product.price && (
                          <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                            {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% Off
                          </Badge>
                        )}
                        <Image
                          src={product.images[0] || "/placeholder.svg?height=200&width=200"}
                          alt={product.name}
                          width={200}
                          height={200}
                          className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    <div className="p-4">
                      <div className="flex items-center space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-xs text-gray-500">(4.5)</span>
                      </div>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-600 mb-2">{product.brands?.name}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900">৳{product.price}</span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-sm text-gray-500 line-through">৳{product.original_price}</span>
                          )}
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            product.stock_quantity > 10
                              ? "bg-green-100 text-green-800"
                              : product.stock_quantity > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock_quantity > 10
                            ? "In Stock"
                            : product.stock_quantity > 0
                              ? "Low Stock"
                              : "Out of Stock"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleWishlistClick(product.name)}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Wishlist
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleCartClick(product.name)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <Link href="/products" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
                  View All Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="bg-gray-900 text-white py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Image
                  src="/md-electronics-logo.png"
                  alt="MD Electronics"
                  width={350}
                  height={88}
                  className="h-20 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted partner for premium home appliances. Quality products, exceptional service, and competitive
                prices.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <Link href="/" className="hover:text-white transition-colors block">
                  Home
                </Link>
                <Link href="/products" className="hover:text-white transition-colors block">
                  Products
                </Link>
                <Link href="#" className="hover:text-white transition-colors block">
                  About Us
                </Link>
                <Link href="#" className="hover:text-white transition-colors block">
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Categories</h4>
              <div className="space-y-2 text-sm text-gray-400">
                {categories.slice(0, 5).map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="hover:text-white transition-colors block"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contact Info</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>📍 123 Electronics Street</p>
                <p>📞 (555) 123-4567</p>
                <p>✉️ info@mdelectronics.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">© 2024 MD Electronics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}