'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart'
import { Badge } from '@/components/ui/badge'

export function CartButton() {
  const { getTotalItems, setIsOpen } = useCart()
  const totalItems = getTotalItems()

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="relative p-2 sm:p-3 hover:bg-gray-100 rounded-xl"
      onClick={() => setIsOpen(true)}
    >
      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-blue-600 transition-colors" />
      {totalItems > 0 && (
        <Badge className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
          {totalItems}
        </Badge>
      )}
    </Button>
  )
}