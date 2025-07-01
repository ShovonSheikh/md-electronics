'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Truck, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    const orderParam = searchParams.get('order')
    if (orderParam) {
      try {
        const data = JSON.parse(decodeURIComponent(orderParam))
        setOrderData(data)
      } catch (error) {
        console.error('Error parsing order data:', error)
      }
    }
  }, [searchParams])

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  const orderId = `MD${Date.now().toString().slice(-6)}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">Thank you for your purchase. Your order has been received.</p>
          </div>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Order #{orderId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Customer:</p>
                  <p className="text-gray-600">{orderData.customer_name}</p>
                  <p className="text-gray-600">{orderData.customer_email}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Payment Method:</p>
                  <p className="text-gray-600 capitalize">{orderData.payment_method.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div>
                <p className="font-medium text-gray-900 mb-2">Shipping Address:</p>
                <div className="text-gray-600 text-sm">
                  <p>{orderData.shipping_address.street}</p>
                  <p>{orderData.shipping_address.city}, {orderData.shipping_address.state} {orderData.shipping_address.zip}</p>
                  <p>{orderData.shipping_address.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderData.items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${orderData.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Payment Processing</p>
                    <p className="text-sm text-gray-600">We're processing your payment and will send you a confirmation email shortly.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order Preparation</p>
                    <p className="text-sm text-gray-600">Your order will be prepared and packaged within 1-2 business days.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Shipping</p>
                    <p className="text-sm text-gray-600">You'll receive tracking information once your order ships.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products" className="flex-1">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
            <Button 
              className="flex-1"
              onClick={() => window.print()}
            >
              Print Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}