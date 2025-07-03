"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Heart, ShoppingCart, Menu, X, User, Home, Package, Grid3X3, Info, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AccountDropdown } from "@/components/account/account-dropdown"
import { useToast } from "@/hooks/use-toast"

export function MainHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const search = searchParams.get("search")
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleWishlistClick = () => {
    toast({
      title: "Added to Wishlist!",
      description: "Item has been added to your wishlist.",
    })
  }

  const handleCartClick = () => {
    toast({
      title: "Added to Cart!",
      description: "Item has been added to your cart.",
    })
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <Image
                src="/md-electronics-logo.png"
                alt="MD Electronics"
                width={450}
                height={110}
                className="h-12 sm:h-16 lg:h-20 w-auto group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-6 xl:space-x-8">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold relative">
              Home
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600 rounded-full"></div>
            </Link>
            <Link href="/products" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Products
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

          {/* Search and Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 lg:flex-initial justify-end">
            {/* Search Bar - Visible on all screens */}
            <div className="relative flex-1 lg:flex-initial max-w-xs lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearch}
                className="pl-9 pr-3 py-2 w-full border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl"
                onClick={handleWishlistClick}
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-red-500 transition-colors" />
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl relative"
                onClick={handleCartClick}
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-blue-600 transition-colors" />
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
                  0
                </span>
              </Button>

              <AccountDropdown />
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
                  <Menu className="w-5 h-5 text-gray-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Navigation Links */}
                  <div className="space-y-4">
                    <Link 
                      href="/" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <Home className="w-5 h-5" />
                      <span className="font-medium">Home</span>
                    </Link>
                    <Link 
                      href="/products" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <Package className="w-5 h-5" />
                      <span className="font-medium">Products</span>
                    </Link>
                    <Link 
                      href="#" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <Grid3X3 className="w-5 h-5" />
                      <span className="font-medium">Categories</span>
                    </Link>
                    <Link 
                      href="#" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <Info className="w-5 h-5" />
                      <span className="font-medium">About</span>
                    </Link>
                    <Link 
                      href="#" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <Phone className="w-5 h-5" />
                      <span className="font-medium">Contact</span>
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Mobile Actions */}
                  <div className="space-y-4">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start space-x-3 h-12"
                      onClick={() => {
                        handleWishlistClick()
                        setIsSheetOpen(false)
                      }}
                    >
                      <Heart className="w-5 h-5 text-gray-600" />
                      <span>Wishlist</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start space-x-3 h-12 relative"
                      onClick={() => {
                        handleCartClick()
                        setIsSheetOpen(false)
                      }}
                    >
                      <div className="relative">
                        <ShoppingCart className="w-5 h-5 text-gray-600" />
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                          0
                        </span>
                      </div>
                      <span>Cart</span>
                    </Button>
                    <div className="pt-2">
                      <AccountDropdown />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}