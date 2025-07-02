import Image from "next/image"
import Link from "next/link"
import { Star, Search, Heart, ShoppingCart, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"

async function getProducts(searchParams: { category?: string; search?: string }) {
  let query = supabase
    .from("products")
    .select(`
      *,
      categories (name, slug),
      brands (name, slug)
    `)
    .eq("is_active", true)

  if (searchParams.category) {
    const { data: category } = await supabase.from("categories").select("id").eq("slug", searchParams.category).single()

    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  if (searchParams.search) {
    query = query.ilike("name", `%${searchParams.search}%`)
  }

  const { data: products, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return products || []
}

async function getCategories() {
  const { data: categories, error } = await supabase.from("categories").select("*").eq("is_active", true).order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return categories || []
}

async function getBrands() {
  const { data: brands, error } = await supabase.from("brands").select("*").eq("is_active", true).order("name")

  if (error) {
    console.error("Error fetching brands:", error)
    return []
  }

  return brands || []
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string }
}) {
  const products = await getProducts(searchParams)
  const categories = await getCategories()
  const brands = await getBrands()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 sm:h-24">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/md-electronics-logo.png"
                  alt="MD Electronics"
                  width={450}
                  height={120}
                  className="h-16 sm:h-18 w-auto"
                  priority
                />
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  Home
                </Link>
                <Link href="/products" className="text-gray-900 hover:text-blue-600 font-medium">
                  Products
                </Link>
                <Link href="#" className="text-gray-600 hover:text-blue-600">
                  Pages
                </Link>
                <Link href="#" className="text-gray-600 hover:text-blue-600">
                  About
                </Link>
                <Link href="#" className="text-gray-600 hover:text-blue-600">
                  Blog
                </Link>
                <Link href="#" className="text-gray-600 hover:text-blue-600">
                  Contact
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="What are you looking for?" className="pl-10 w-64 border-gray-300" />
              </div>
              <Heart className="w-6 h-6 text-gray-600 hover:text-blue-600 cursor-pointer" />
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-blue-600 cursor-pointer" />
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </div>
              <User className="w-6 h-6 text-gray-600 hover:text-blue-600 cursor-pointer" />
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-blue-600">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">Shop</span>
            {searchParams.category && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 capitalize">{searchParams.category.replace("-", " ")}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {searchParams.category
              ? `${searchParams.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}`
              : "All Products"}
          </h1>
          <div className="text-sm text-gray-600">Showing {products.length} products</div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-8">
            {/* Categories */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">CATEGORIES</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <Link
                      href={`/products?category=${category.slug}`}
                      className={`text-sm hover:text-blue-600 transition-colors ${
                        searchParams.category === category.slug ? "text-blue-600 font-medium" : "text-gray-700"
                      }`}
                    >
                      {category.name}
                    </Link>
                  </div>
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
                  { label: "Under $500", min: 0, max: 500 },
                  { label: "$500 - $1000", min: 500, max: 1000 },
                  { label: "$1000 - $1500", min: 1000, max: 1500 },
                  { label: "Over $1500", min: 1500, max: 999999 },
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                >
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
                      className="w-full h-48 object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-xs text-gray-500">(4.5)</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{product.brands?.name}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900">${product.price}</span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-gray-500 line-through">${product.original_price}</span>
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
                  </div>
                </Link>
              ))}
            </div>

            {products.length === 0 && (
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
                  width={250}
                  height={63}
                  className="h-16 w-auto brightness-0 invert"
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