"use client"

import { useState } from "react"
import Link from "next/link"
import { User, LogIn, UserPlus, Settings, Package, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AccountDropdown() {
  const [isLoggedIn, setIsLoggedIn] = useState(false) // This would be managed by your auth system

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl flex items-center space-x-1">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          <ChevronDown className="w-3 h-3 text-gray-600 hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {!isLoggedIn ? (
          <>
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/auth/signin" className="flex items-center space-x-2 cursor-pointer">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/auth/signup" className="flex items-center space-x-2 cursor-pointer">
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel>Welcome back!</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account/profile" className="flex items-center space-x-2 cursor-pointer">
                <Settings className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/orders" className="flex items-center space-x-2 cursor-pointer">
                <Package className="w-4 h-4" />
                <span>Order History</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center space-x-2 cursor-pointer text-red-600 focus:text-red-600"
              onClick={() => setIsLoggedIn(false)}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}