'use client'

import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface BuyNowButtonProps {
  product: any
  className?: string
}

export function BuyNowButton({ product, className }: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { clearCart, addItem } = useCart()
  const router = useRouter()
  const { toast } = useToast()

  const handleBuyNow = async () => {
    if (product.stock_quantity <= 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Clear cart and add only this product
      clearCart()
      addItem(product)
      
      // Redirect to checkout
      router.push('/checkout')
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleBuyNow}
      disabled={isLoading || product.stock_quantity <= 0}
      className={className}
    >
      <CreditCard className="w-4 h-4 mr-2" />
      {isLoading ? "Processing..." : "Buy Now"}
    </Button>
  )
}