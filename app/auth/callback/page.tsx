"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function AuthCallback() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Auth callback error:", error)
          toast({
            title: "Authentication Error",
            description: "There was an error signing you in. Please try again.",
            variant: "destructive",
          })
          router.push("/auth/signin")
          return
        }

        if (data.session) {
          toast({
            title: "Welcome!",
            description: "You have been successfully signed in.",
          })
          router.push("/")
        } else {
          router.push("/auth/signin")
        }
      } catch (error) {
        console.error("Unexpected error:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
        router.push("/auth/signin")
      }
    }

    handleAuthCallback()
  }, [router, toast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}