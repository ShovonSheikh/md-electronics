import Image from "next/image"
import Link from "next/link"
import {
  Star,
  Search,
  Heart,
  ShoppingCart,
  User,
  Monitor,
  ArrowRight,
  Refrigerator,
  Microwave,
  Tv,
  Wind,
  WashingMachine,
  Snowflake,
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
    .limit(8)

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

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()
  const categories = await getCategories()

  const categoryIcons: Record<string, any> = {
    refrigerators: Refrigerator,
    ovens: Microwave,
    televisions: Tv,
    "air-conditioners": Wind,
    "washing-machines": WashingMachine,
    "deep-freezers": Snowflake,
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MD</span>
                </div>
                <span className="text-xl font-bold text-gray-900">MD Electronics</span>
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link href="/" className="text-gray-900 hover:text-blue-600 font-medium">
                  Home
                </Link>
                <Link href="/products" className="text-gray-600 hover:text-blue-600">
                  Shop
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-50 to-orange-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-500 text-sm font-medium">Best Deal in This Week</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Premium Home
                <br />
                Appliances
              </h1>
              <p className="text-gray-600 text-lg">
                Discover our extensive collection of high-quality home appliances from trusted brands
              </p>
              <div className="flex items-center space-x-4">
                <Button className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Shop Now</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(4.8)</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  alt="Premium Home Appliances"
                  width={400}
                  height={400}
                  className="mx-auto"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-lg">
                  <span className="text-blue-600 font-bold">Up to 30% Off</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Button>
              <Button variant="outline" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.slug] || Monitor
              return (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="text-center p-6 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group"
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <IconComponent className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{category.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Button>
              <Button variant="outline" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
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
                    className="w-full h-40 object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-500">(4.5)</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2">{product.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">${product.price}</span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-sm text-gray-500 line-through">${product.original_price}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{product.brands?.name}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MD</span>
                </div>
                <span className="text-xl font-bold">MD Electronics</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted partner for premium home appliances. Quality products, exceptional service, and competitive
                prices.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 cursor-pointer transition-colors">
                  <span className="text-xs">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 cursor-pointer transition-colors">
                  <span className="text-xs">t</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 cursor-pointer transition-colors">
                  <span className="text-xs">in</span>
                </div>
              </div>
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
                <Link href="#" className="hover:text-white transition-colors block">
                  Blog
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
                <p>City, State 12345</p>
                <p>📞 (555) 123-4567</p>
                <p>✉️ info@mdelectronics.com</p>
                <p>🕒 Mon-Sat: 9AM-8PM</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">© 2024 MD Electronics. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-sm text-gray-400">We Accept:</span>
              <div className="flex space-x-2">
                <div className="w-8 h-5 bg-blue-600 rounded text-xs flex items-center justify-center">VISA</div>
                <div className="w-8 h-5 bg-red-600 rounded text-xs flex items-center justify-center">MC</div>
                <div className="w-8 h-5 bg-yellow-500 rounded text-xs flex items-center justify-center text-black">
                  PP
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
