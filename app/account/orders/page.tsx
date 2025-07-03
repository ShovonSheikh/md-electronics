"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Package, Eye, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock order data
const mockOrders = [
  {
    id: "ORD-2024-001",
    date: "2024-01-15",
    status: "delivered",
    total: 129999,
    items: [
      {
        name: "Samsung French Door Refrigerator 28 cu ft",
        image: "/placeholder.svg?height=80&width=80",
        quantity: 1,
        price: 129999,
      },
    ],
  },
  {
    id: "ORD-2024-002",
    date: "2024-01-10",
    status: "shipped",
    total: 89999,
    items: [
      {
        name: "Bosch Built-in Electric Oven 30\"",
        image: "/placeholder.svg?height=80&width=80",
        quantity: 1,
        price: 89999,
      },
    ],
  },
  {
    id: "ORD-2024-003",
    date: "2024-01-05",
    status: "processing",
    total: 179998,
    items: [
      {
        name: "Samsung 65\" QLED 4K Smart TV",
        image: "/placeholder.svg?height=80&width=80",
        quantity: 1,
        price: 149999,
      },
      {
        name: "LG 12000 BTU Window AC Unit",
        image: "/placeholder.svg?height=80&width=80",
        quantity: 1,
        price: 29999,
      },
    ],
  },
]

export default function OrdersPage() {
  const [selectedTab, setSelectedTab] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredOrders = mockOrders.filter(order => {
    if (selectedTab === "all") return true
    return order.status === selectedTab
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              <Image
                src="/md-electronics-logo.png"
                alt="MD Electronics"
                width={200}
                height={50}
                className="h-10 sm:h-12 w-auto"
                priority
              />
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/account/profile" className="text-gray-600 hover:text-blue-600 transition-colors">
                Profile
              </Link>
              <Link href="/account/orders" className="text-blue-600 font-medium">
                Orders
              </Link>
              <Link href="/account/addresses" className="text-gray-600 hover:text-blue-600 transition-colors">
                Addresses
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>

          {/* Order Filters */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-6">
              {filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600 text-center mb-6">
                      {selectedTab === "all" 
                        ? "You haven't placed any orders yet."
                        : `No ${selectedTab} orders found.`}
                    </p>
                    <Button asChild>
                      <Link href="/products">Start Shopping</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Order {order.id}</CardTitle>
                            <CardDescription>
                              Placed on {new Date(order.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              ৳{order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={80}
                                height={80}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                <p className="text-sm font-medium text-gray-900">৳{item.price.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            {order.status === "delivered" && (
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Invoice
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {order.status === "delivered" && (
                              <Button variant="outline" size="sm">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reorder
                              </Button>
                            )}
                            {(order.status === "processing" || order.status === "shipped") && (
                              <Button variant="outline" size="sm">
                                Track Order
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}