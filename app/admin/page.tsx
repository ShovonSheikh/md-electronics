"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Package,
  ShoppingCart,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  TrendingUp,
  DollarSign,
  Package2,
  ShoppingBag,
  AlertTriangle,
  Save,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

const ADMIN_EMAIL = "admin@mdelectronics.com"
const ADMIN_PASSWORD = "admin123"

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
  is_active: boolean
  is_featured: boolean
  category_id: string
  brand_id: string
  created_at: string
  updated_at: string
  categories?: { name: string; slug: string }
  brands?: { name: string; slug: string }
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
}

interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
  is_active: boolean
}

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  total_amount: number
  status: string
  payment_status: string
  created_at: string
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const { toast } = useToast()

  // Data states
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [heroImage, setHeroImage] = useState("/placeholder.svg?height=500&width=500")

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false)
  const [showHeroModal, setShowHeroModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form states
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: "",
    original_price: "",
    stock_quantity: "",
    sku: "",
    images: [] as string[],
    specifications: {} as Record<string, any>,
    warranty_info: "",
    is_active: true,
    is_featured: false,
    category_id: "",
    brand_id: "",
  })

  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  // Check authentication on mount
  useEffect(() => {
    const isAuth = localStorage.getItem("admin_authenticated")
    if (isAuth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("admin_authenticated", "true")
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      })
    } else {
      setError("Invalid email or password")
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("admin_authenticated")
    setEmail("")
    setPassword("")
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch products with relations
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`
          *,
          categories (name, slug),
          brands (name, slug)
        `)
        .order("created_at", { ascending: false })

      if (productsError) {
        console.error("Error fetching products:", productsError)
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive",
        })
      } else {
        setProducts(productsData || [])
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name")

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError)
      } else {
        setCategories(categoriesData || [])
      }

      // Fetch brands
      const { data: brandsData, error: brandsError } = await supabase.from("brands").select("*").order("name")

      if (brandsError) {
        console.error("Error fetching brands:", brandsError)
      } else {
        setBrands(brandsData || [])
      }

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      if (ordersError) {
        console.error("Error fetching orders:", ordersError)
      } else {
        setOrders(ordersData || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data from database",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateProductForm = () => {
    const errors: string[] = []

    if (!productForm.name.trim()) errors.push("Product name is required")
    if (!productForm.slug.trim()) errors.push("Slug is required")
    if (!productForm.sku.trim()) errors.push("SKU is required")
    if (!productForm.price || Number.parseFloat(productForm.price) <= 0) errors.push("Price must be greater than 0")
    if (!productForm.stock_quantity || Number.parseInt(productForm.stock_quantity) < 0)
      errors.push("Stock quantity must be 0 or greater")
    if (!productForm.category_id) errors.push("Category is required")
    if (!productForm.brand_id) errors.push("Brand is required")

    return errors
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateProductForm()
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", "),
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const productData = {
        name: productForm.name.trim(),
        slug: productForm.slug.trim(),
        description: productForm.description.trim(),
        short_description: productForm.short_description.trim(),
        price: Number.parseFloat(productForm.price),
        original_price: productForm.original_price ? Number.parseFloat(productForm.original_price) : null,
        stock_quantity: Number.parseInt(productForm.stock_quantity),
        sku: productForm.sku.trim(),
        images: productForm.images.length > 0 ? productForm.images : ["/placeholder.svg?height=400&width=400"],
        specifications: productForm.specifications || {},
        warranty_info: productForm.warranty_info.trim() || null,
        is_active: productForm.is_active,
        is_featured: productForm.is_featured,
        category_id: productForm.category_id,
        brand_id: productForm.brand_id,
      }

      let result
      if (editingProduct) {
        result = await supabase.from("products").update(productData).eq("id", editingProduct.id).select()
      } else {
        result = await supabase.from("products").insert([productData]).select()
      }

      if (result.error) {
        throw result.error
      }

      toast({
        title: "Success",
        description: `Product ${editingProduct ? "updated" : "created"} successfully!`,
      })

      setShowProductModal(false)
      setEditingProduct(null)
      resetProductForm()
      fetchData()
    } catch (error: any) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Product deleted successfully!",
      })

      fetchData()
    } catch (error: any) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const resetProductForm = () => {
    setProductForm({
      name: "",
      slug: "",
      description: "",
      short_description: "",
      price: "",
      original_price: "",
      stock_quantity: "",
      sku: "",
      images: [],
      specifications: {},
      warranty_info: "",
      is_active: true,
      is_featured: false,
      category_id: "",
      brand_id: "",
    })
  }

  const editProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      short_description: product.short_description,
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      stock_quantity: product.stock_quantity.toString(),
      sku: product.sku,
      images: product.images || [],
      specifications: product.specifications || {},
      warranty_info: product.warranty_info || "",
      is_active: product.is_active,
      is_featured: product.is_featured,
      category_id: product.category_id,
      brand_id: product.brand_id,
    })
    setShowProductModal(true)
  }

  const updateHeroImage = (imageUrl: string) => {
    setHeroImage(imageUrl)
    setShowHeroModal(false)
    toast({
      title: "Success",
      description: "Hero image updated successfully!",
    })
  }

  // Calculate dashboard stats
  const dashboardStats = {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.is_active).length,
    featuredProducts: products.filter((p) => p.is_featured).length,
    lowStockProducts: products.filter((p) => p.stock_quantity <= 5).length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    completedOrders: orders.filter((o) => o.status === "completed").length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
    totalCategories: categories.length,
    totalBrands: brands.length,
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Image
              src="/md-electronics-logo.png"
              alt="MD Electronics"
              width={200}
              height={50}
              className="h-12 w-auto mx-auto mb-4"
            />
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mdelectronics.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <p className="font-medium">Demo Credentials:</p>
              <p>Email: admin@mdelectronics.com</p>
              <p>Password: admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/md-electronics-logo.png"
                alt="MD Electronics"
                width={150}
                height={38}
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                View Site
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("dashboard")}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "products" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("products")}
            >
              <Package className="w-4 h-4 mr-2" />
              Products
            </Button>
            <Button
              variant={activeTab === "orders" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("orders")}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Orders
            </Button>
            <Button
              variant={activeTab === "hero" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("hero")}
            >
              <Upload className="w-4 h-4 mr-2" />
              Hero Images
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <Button onClick={fetchData} disabled={loading}>
                  {loading ? "Refreshing..." : "Refresh Data"}
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalProducts}</p>
                        <p className="text-xs text-gray-500">{dashboardStats.activeProducts} active</p>
                      </div>
                      <Package2 className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalOrders}</p>
                        <p className="text-xs text-gray-500">{dashboardStats.pendingOrders} pending</p>
                      </div>
                      <ShoppingBag className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ৳{dashboardStats.totalRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">{dashboardStats.completedOrders} completed</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Low Stock</p>
                        <p className="text-2xl font-bold text-gray-900 text-red-600">
                          {dashboardStats.lowStockProducts}
                        </p>
                        <p className="text-xs text-gray-500">≤ 5 items</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-gray-600">{order.customer_email}</p>
                          <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">৳{order.total_amount.toFixed(2)}</p>
                          <Badge variant={order.status === "completed" ? "default" : "secondary"}>{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Products</h2>
                <div className="flex space-x-2">
                  <Button onClick={fetchData} variant="outline" disabled={loading}>
                    {loading ? "Refreshing..." : "Refresh"}
                  </Button>
                  <Button onClick={() => setShowProductModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>

              {/* Products Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Image
                                  src={product.images?.[0] || "/placeholder.svg?height=40&width=40"}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-500">{product.sku}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.categories?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ৳{product.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`text-sm ${product.stock_quantity <= 5 ? "text-red-600 font-medium" : "text-gray-900"}`}
                              >
                                {product.stock_quantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <Badge variant={product.is_active ? "default" : "secondary"}>
                                  {product.is_active ? "Active" : "Inactive"}
                                </Badge>
                                {product.is_featured && (
                                  <Badge variant="outline" className="text-xs">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => editProduct(product)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
                <Button onClick={fetchData} variant="outline" disabled={loading}>
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{order.id.slice(0, 8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                                <div className="text-sm text-gray-500">{order.customer_email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ৳{order.total_amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                                {order.payment_status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "hero" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Hero Images</h2>
                <Button onClick={() => setShowHeroModal(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Update Hero Image
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Current Hero Image</CardTitle>
                  <CardDescription>This image appears on the homepage hero section</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full max-w-md">
                    <Image
                      src={heroImage || "/placeholder.svg"}
                      alt="Hero Image"
                      width={500}
                      height={300}
                      className="w-full h-full object-cover rounded-lg border"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setProductForm({
                      ...productForm,
                      name,
                      slug: productForm.slug || generateSlug(name),
                    })
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={productForm.slug}
                onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                value={productForm.short_description}
                onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price (৳) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="original_price">Original Price (৳)</Label>
                <Input
                  id="original_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.original_price}
                  onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="stock_quantity">Stock *</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  value={productForm.stock_quantity}
                  onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category_id">Category *</Label>
                <Select
                  value={productForm.category_id}
                  onValueChange={(value) => setProductForm({ ...productForm, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="brand_id">Brand *</Label>
                <Select
                  value={productForm.brand_id}
                  onValueChange={(value) => setProductForm({ ...productForm, brand_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="warranty_info">Warranty Info</Label>
              <Input
                id="warranty_info"
                value={productForm.warranty_info}
                onChange={(e) => setProductForm({ ...productForm, warranty_info: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={productForm.is_active}
                  onCheckedChange={(checked) => setProductForm({ ...productForm, is_active: !!checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={productForm.is_featured}
                  onCheckedChange={(checked) => setProductForm({ ...productForm, is_featured: !!checked })}
                />
                <Label htmlFor="is_featured">Featured</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowProductModal(false)
                  setEditingProduct(null)
                  resetProductForm()
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Hero Image Modal */}
      <Dialog open={showHeroModal} onOpenChange={setShowHeroModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Hero Image</DialogTitle>
            <DialogDescription>Select a new image for the homepage hero section</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                "/placeholder.svg?height=300&width=500",
                "/placeholder.svg?height=300&width=500&text=Appliances",
                "/placeholder.svg?height=300&width=500&text=Electronics",
                "/placeholder.svg?height=300&width=500&text=Home",
              ].map((image, index) => (
                <div
                  key={index}
                  className="cursor-pointer border-2 border-transparent hover:border-blue-500 rounded-lg overflow-hidden"
                  onClick={() => updateHeroImage(image)}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Hero option ${index + 1}`}
                    width={200}
                    height={120}
                    className="w-full h-24 object-cover"
                  />
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor="custom-url">Or enter custom image URL:</Label>
              <div className="flex space-x-2">
                <Input id="custom-url" placeholder="https://example.com/image.jpg" />
                <Button
                  onClick={() => {
                    const input = document.getElementById("custom-url") as HTMLInputElement
                    if (input?.value) {
                      updateHeroImage(input.value)
                    }
                  }}
                >
                  Use URL
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}