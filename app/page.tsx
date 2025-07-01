import Image from "next/image"
import Link from "next/link"
import {
  Star,
  Search,
  Heart,
  ShoppingCart,
  Monitor,
  ArrowRight,
  Refrigerator,
  Microwave,
  Tv,
  Wind,
  WashingMachine,
  Snowflake,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

async function getFeaturedProducts() {
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (name, slug),
      brands (name, slug)
    `)
    .eq("is_featured", true)
    .eq("is_active", true)
    .limit(4)

  if (error) {
    console.error("Error fetching featured products:", error)
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

async function getProductsByCategory() {
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (name, slug),
      brands (name, slug)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products by category:", error)
    return {}
  }

  // Group products by category, ensuring exactly 4 products per category
  const productsByCategory: Record<string, any[]> = {}
  const categoryOrder = [
    "refrigerators",
    "ovens",
    "televisions",
    "air-conditioners",
    "washing-machines",
    "deep-freezers",
  ]

  // Initialize each category with empty array
  categoryOrder.forEach((slug) => {
    productsByCategory[slug] = []
  })

  // Distribute products evenly across categories
  products?.forEach((product) => {
    const categorySlug = product.categories?.slug
    if (categorySlug && productsByCategory[categorySlug] && productsByCategory[categorySlug].length < 4) {
      productsByCategory[categorySlug].push(product)
    }
  })

  return productsByCategory
}

export default async function HomePage() {
  const [featuredProducts, categories, productsByCategory] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getProductsByCategory(),
  ])

  const categoryIcons: Record<string, any> = {
    refrigerators: Refrigerator,
    ovens: Microwave,
    televisions: Tv,
    "air-conditioners": Wind,
    "washing-machines": WashingMachine,
    "deep-freezers": Snowflake,
  }

  const ProductCard = ({ product }: { product: any }) => (
    <Link
      href={`/products/${product.slug}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 group w-full"
    >
      <div className="relative p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        {product.original_price && product.original_price > product.price && (
          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md z-10 px-2 py-1 text-xs">
            {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% Off
          </Badge>
        )}
        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md z-10 px-2 py-1 text-xs">
            Low Stock
          </Badge>
        )}
        <div className="aspect-square flex items-center justify-center">
          <Image
            src={product.images?.[0] || "/placeholder.svg?height=200&width=200"}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
      <div className="p-3 sm:p-4 lg:p-5">
        <div className="flex items-center space-x-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs text-gray-500 ml-1">(4.5)</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex flex-col space-y-1 mb-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg sm:text-xl text-gray-900">${product.price}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm sm:text-base text-gray-500 line-through">${product.original_price}</span>
            )}
          </div>
          <p className="text-xs text-gray-600">{product.brands?.name}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1"></div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Button size="sm" variant="ghost" className="p-1.5 sm:p-2 hover:bg-blue-50 rounded-lg">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-red-500" />
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg"
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header with New Logo */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-6 lg:space-x-12">
              <Link href="/" className="flex items-center group leading-7 leading-10 leading-4 leading-3 leading-3 leading-9 leading-3 leading-9 leading-9 leading-8 leading-7 leading-3">
                <Image
                  src="/md-electronics-logo.png"
                  alt="MD Electronics"
                  width={200}
                  height={50}
                  className="h-12 sm:h-14 lg:h-16 w-auto group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </Link>

              <nav className="hidden lg:flex space-x-6 xl:space-x-8">
                <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold relative">
                  Home
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 rounded-full"></div>
                </Link>
                <Link href="/products" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Shop
                </Link>
                <Link href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Categories
                </Link>
                <Link href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  About
                </Link>
                <Link href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Contact
                </Link>
              </nav>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Compact Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  className="pl-9 pr-3 py-2 w-48 lg:w-56 xl:w-64 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button variant="ghost" size="sm" className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-red-500 transition-colors" />
                </Button>

                <Button variant="ghost" size="sm" className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl relative">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-blue-600 transition-colors" />
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
                    0
                  </span>
                </Button>

                <Button variant="ghost" size="sm" className="lg:hidden p-2 sm:p-3 hover:bg-gray-100 rounded-xl">
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 lg:space-y-8">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-500 text-sm font-semibold uppercase tracking-wide">Best Deal This Week</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Premium Home
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Appliances
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg">
                Discover our extensive collection of high-quality home appliances from trusted brands with unbeatable
                prices
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-semibold">Shop Now</span>
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm sm:text-base text-gray-600 font-medium">(4.8) • 2,500+ Reviews</span>
                </div>
              </div>
            </div>
            <div className="relative mt-8 lg:mt-0">
              <div className="relative z-10">
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="Premium Home Appliances"
                  width={500}
                  height={500}
                  className="mx-auto drop-shadow-2xl w-full max-w-md lg:max-w-lg"
                />
                <div className="absolute top-4 sm:top-8 right-4 sm:right-8 bg-white rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-3 shadow-xl border border-gray-100">
                  <span className="text-blue-600 font-bold text-sm sm:text-lg">Up to 70% Off</span>
                </div>
                <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 bg-white rounded-xl sm:rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-xl border border-gray-100">
                  <span className="text-green-600 font-semibold text-xs sm:text-sm">✓ Free Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Browse by Category */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Browse by Category</h2>
            </div>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive range of home appliances across different categories
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.slug] || Monitor
              return (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="text-center p-4 sm:p-6 lg:p-8 bg-white rounded-xl sm:rounded-2xl hover:bg-blue-50 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-lg border border-gray-100 hover:border-blue-200"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300 shadow-sm">
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Featured Products Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12 lg:mb-16">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Featured Products</h2>
            </div>
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-2 group text-sm sm:text-base"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Category-Based Product Displays */}
      {categories.map((category, index) => {
        const categoryProducts = productsByCategory[category.slug] || []
        if (categoryProducts.length === 0) return null

        const IconComponent = categoryIcons[category.slug] || Monitor
        const isEven = index % 2 === 0

        return (
          <section key={category.id} className={`py-12 sm:py-16 lg:py-20 ${isEven ? "bg-gray-50" : "bg-white"}`}>
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-12 lg:mb-16">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{category.name}</h2>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1">{category.description}</p>
                  </div>
                </div>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-2 group text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">View All {category.name}</span>
                  <span className="sm:hidden">View All</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {categoryProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* Enhanced Professional Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8 lg:mb-12">
            <div className="space-y-4 sm:space-y-6 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center">
                <Image
                  src="/md-electronics-logo.png"
                  alt="MD Electronics"
                  width={200}
                  height={50}
                  className="h-12 sm:h-14 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                Your trusted partner for premium home appliances. Quality products, exceptional service, and competitive
                prices since 2020.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-blue-600 cursor-pointer transition-colors">
                  <span className="text-xs sm:text-sm font-semibold">f</span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-blue-600 cursor-pointer transition-colors">
                  <span className="text-xs sm:text-sm font-semibold">t</span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-blue-600 cursor-pointer transition-colors">
                  <span className="text-xs sm:text-sm font-semibold">in</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Quick Links</h4>
              <div className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
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
                <Link href="#" className="hover:text-white transition-colors block">
                  Support
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Categories</h4>
              <div className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                {categories.slice(0, 6).map((category) => (
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
              <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Contact Info</h4>
              <div className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <p className="flex items-start space-x-2">
                  <span className="flex-shrink-0">📍</span>
                  <span>123 Electronics Street, Tech City, TC 12345</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>(555) 123-4567</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>✉️</span>
                  <span>info@mdelectronics.com</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="flex-shrink-0">🕒</span>
                  <span>Mon-Sat: 9AM-8PM, Sun: 10AM-6PM</span>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-sm sm:text-base">© 2024 MD Electronics. All rights reserved.</p>
            <div className="flex items-center space-x-4 sm:space-x-6">
              <span className="text-gray-400 text-sm sm:text-base">We Accept:</span>
              <div className="flex space-x-2 sm:space-x-3">
                <div className="w-8 h-5 sm:w-10 sm:h-6 bg-blue-600 rounded text-xs flex items-center justify-center font-semibold">
                  VISA
                </div>
                <div className="w-8 h-5 sm:w-10 sm:h-6 bg-red-600 rounded text-xs flex items-center justify-center font-semibold">
                  MC
                </div>
                <div className="w-8 h-5 sm:w-10 sm:h-6 bg-yellow-500 rounded text-xs flex items-center justify-center text-black font-semibold">
                  PP
                </div>
                <div className="w-8 h-5 sm:w-10 sm:h-6 bg-green-600 rounded text-xs flex items-center justify-center font-semibold">
                  GPay
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
