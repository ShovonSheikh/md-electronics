'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart'
import { useToast } from '@/hooks/use-toast'

interface AddToCartButtonProps {
  product: any
  className?: string
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem, items } = useCart()
  const { toast } = useToast()

  const existingItem = items.find(item => item.id === product.id)
  const currentQuantityInCart = existingItem?.quantity || 0
  const maxQuantity = product.stock_quantity - currentQuantityInCart

  const handleAddToCart = () => {
    if (product.stock_quantity <= 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    if (currentQuantityInCart >= product.stock_quantity) {
      toast({
        title: "Maximum Quantity Reached",
        description: "You have reached the maximum available quantity for this product.",
        variant: "destructive",
      })
      return
    }

    for (let i = 0; i < quantity; i++) {
      addItem(product)
    }

    toast({
      title: "Added to Cart",
      description: `${quantity} ${product.name} added to your cart.`,
    })
  }

  if (product.stock_quantity <= 0) {
    return (
      <Button disabled className={className}>
        Out of Stock
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            className="px-3"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
          <Button
            variant="ghost"
            size="sm"
            className="px-3"
            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <Button 
          onClick={handleAddToCart}
          className={`flex-1 bg-blue-600 hover:bg-blue-700 ${className}`}
          disabled={maxQuantity <= 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
      
      {maxQuantity <= 5 && maxQuantity > 0 && (
        <p className="text-sm text-orange-600">
          Only {maxQuantity} left in stock
        </p>
      )}
    </div>
  )
}