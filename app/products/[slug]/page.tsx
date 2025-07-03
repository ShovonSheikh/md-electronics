"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, ArrowLeft, Plus, Minus, Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainHeader } from "@/components/layout/main-header"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"

interface Product {
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
  categories?: { name: string; slug: string }
  brands?: { name: string; slug: string }
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const resolvedParams = await params
        const productData = await getProduct(resolvedParams.slug)
        
        if (!productData) {
          notFound()
        }
        
        setProduct(productData)
        
        // Fetch related products
        if (productData.categories) {
          const related = await getRelatedProducts(productData.categories.slug, productData.id)
          setRelatedProducts(related)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params])

  const getProduct = async (slug: string) => {
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

  const getRelatedProducts = async (categorySlug: string, currentProductId: string) => {
    // First get the category ID
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single()

    if (!category) return []

    const { data: products, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (name, slug),
        brands (name, slug)
      `)
      .eq("category_id", category.id)
      .eq("is_active", true)
      .neq("id", currentProductId)
      .limit(4)

    if (error) {
      return []
    }

    return products || []
  }

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change))
  }

  const handleAddToCart = () => {
    toast({
      title: "Added to Cart!",
      description: `${quantity} x ${product?.name} has been added to your cart.`,
    })
  }

  const handleAddToWishlist = () => {
    toast({
      title: "Added to Wishlist!",
      description: `${product?.name} has been added to your wishlist.`,
    })
  }

  const handleRelatedProductWishlist = (productName: string) => {
    toast({
      title: "Added to Wishlist!",
      description: `${productName} has been added to your wishlist.`,
    })
  }

  const handleRelatedProductCart = (productName: string) => {
    toast({
      title: "Added to Cart!",
      description: `${productName} has been added to your cart.`,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <MainHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    notFound()
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
            <Link href="/products" className="text-gray-600 hover:text-blue-600">
              Shop
            </Link>
            <span className="text-gray-400">/</span>
            <Link href={`/products?category=${product.categories?.slug}`} className="text-gray-600 hover:text-blue-600">
              {product.categories?.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Link href="/products" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              <Image
                src={product.images[selectedImageIndex] || "/placeholder.svg?height=500&width=500"}
                alt={product.name}
                width={500}
                height={500}
                className="w-full h-full object-contain"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image, index) => (
                  <div 
                    key={index} 
                    className={`aspect-square bg-gray-50 rounded-lg overflow-hidden cursor-pointer border-2 ${
                      selectedImageIndex === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-contain hover:opacity-75 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline">{product.brands?.name}</Badge>
                <Badge variant="outline">{product.categories?.name}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">(4.5) 24 reviews</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">৳{product.price}</span>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">৳{product.original_price}</span>
                    <Badge className="bg-red-100 text-red-800">
                      Save ৳{(product.original_price - product.price).toFixed(2)}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div>
              <p className="text-gray-600 leading-relaxed">{product.short_description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
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
                    ? `Only ${product.stock_quantity} left`
                    : "Out of Stock"}
              </span>
              <span className="text-sm text-gray-600">SKU: {product.sku}</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-3"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-3"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700" 
                disabled={product.stock_quantity === 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="icon" onClick={handleAddToWishlist}>
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            {product.warranty_info && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Warranty Information</h4>
                <p className="text-sm text-gray-600">{product.warranty_info}</p>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {product.specifications &&
                Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-900 capitalize">{key.replace("_", " ")}</span>
                    <span className="text-gray-600">{Array.isArray(value) ? value.join(", ") : String(value)}</span>
                  </div>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Customer Reviews</h3>
                <Button variant="outline">Write a Review</Button>
              </div>
              <div className="space-y-4">
                {/* Sample reviews */}
                {[1, 2, 3].map((review) => (
                  <div key={review} className="border-b border-gray-200 pb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-medium">John D.</span>
                      <span className="text-sm text-gray-500">2 weeks ago</span>
                    </div>
                    <p className="text-gray-600">
                      Great product! Exactly what I was looking for. Fast delivery and excellent quality.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <Link href={`/products/${relatedProduct.slug}`}>
                    <div className="relative p-4 bg-gray-50">
                      {relatedProduct.original_price && relatedProduct.original_price > relatedProduct.price && (
                        <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                          {Math.round(
                            ((relatedProduct.original_price - relatedProduct.price) / relatedProduct.original_price) *
                              100,
                          )}
                          % Off
                        </Badge>
                      )}
                      <Image
                        src={relatedProduct.images[0] || "/placeholder.svg?height=200&width=200"}
                        alt={relatedProduct.name}
                        width={200}
                        height={200}
                        className="w-full h-40 object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex items-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-xs text-gray-500">(4.5)</span>
                    </div>
                    <Link href={`/products/${relatedProduct.slug}`}>
                      <h3 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2 hover:text-blue-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="font-bold text-gray-900">৳{relatedProduct.price}</span>
                      {relatedProduct.original_price && relatedProduct.original_price > relatedProduct.price && (
                        <span className="text-sm text-gray-500 line-through">৳{relatedProduct.original_price}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{relatedProduct.brands?.name}</p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRelatedProductWishlist(relatedProduct.name)}
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        Wishlist
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleRelatedProductCart(relatedProduct.name)}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
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
                <Link href="/products?category=refrigerators" className="hover:text-white transition-colors block">
                  Refrigerators
                </Link>
                <Link href="/products?category=ovens" className="hover:text-white transition-colors block">
                  Ovens
                </Link>
                <Link href="/products?category=televisions" className="hover:text-white transition-colors block">
                  Televisions
                </Link>
                <Link href="/products?category=air-conditioners" className="hover:text-white transition-colors block">
                  Air Conditioners
                </Link>
                <Link href="/products?category=washing-machines" className="hover:text-white transition-colors block">
                  Washing Machines
                </Link>
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