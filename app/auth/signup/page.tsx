"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Terms of Service and Privacy Policy.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
          }
        }
      })

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        })
        // Redirect to sign in page
        window.location.href = "/auth/signin"
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        toast({
          title: "Google Sign Up Failed",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign up with Google.",
        variant: "destructive",
      })
    }
  }

  const handleFacebookSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        toast({
          title: "Facebook Sign Up Failed",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign up with Facebook.",
        variant: "destructive",
      })
    }
  }

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(formData.password) },
    { text: "Contains number", met: /\d/.test(formData.password) },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        {/* Floating Shapes */}
        <div className="absolute top-16 right-16 w-36 h-36 bg-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 left-12 w-28 h-28 bg-pink-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 right-1/4 w-44 h-44 bg-indigo-200/30 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-16 left-1/3 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-3000"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/5 right-1/3 w-72 h-72 bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/5 left-1/4 w-56 h-56 bg-gradient-to-r from-indigo-300/20 to-blue-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-1/2 left-8 w-20 h-20 bg-gradient-to-br from-pink-300/40 to-purple-300/40 transform rotate-45 blur-sm animate-pulse delay-500"></div>
        <div className="absolute top-1/4 right-8 w-16 h-16 bg-gradient-to-br from-indigo-300/40 to-blue-300/40 transform rotate-12 blur-sm animate-pulse delay-1500"></div>
        
        {/* Geometric Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="hexagons" width="8" height="8" patternUnits="userSpaceOnUse">
                <polygon points="4,0 8,2 8,6 4,8 0,6 0,2" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#hexagons)" className="text-purple-400" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4">
        <div className="w-full max-w-md">
          {/* Back to Home Link */}
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
            <CardHeader className="text-center space-y-2 pb-6">
              <div className="flex justify-center mb-4">
                <Image
                  src="/md-electronics-logo.png"
                  alt="MD Electronics"
                  width={180}
                  height={45}
                  className="h-10 w-auto"
                  priority
                />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
              <CardDescription className="text-gray-600">
                Join MD Electronics for exclusive deals and faster checkout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-10 transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          <Check className={`w-3 h-3 transition-colors ${req.met ? "text-green-500" : "text-gray-300"}`} />
                          <span className={`transition-colors ${req.met ? "text-green-600" : "text-gray-500"}`}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-10 transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 transition-opacity">Passwords do not match</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", !!checked)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" className="text-purple-600 hover:text-purple-700 transition-colors">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-purple-600 hover:text-purple-700 transition-colors">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={loading || !formData.agreeToTerms || formData.password !== formData.confirmPassword}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-11 border-gray-300 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02]"
                  onClick={handleGoogleSignUp}
                  type="button"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  className="h-11 border-gray-300 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02]"
                  onClick={handleFacebookSignUp}
                  type="button"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(180deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-35px) rotate(-180deg); }
        }
        
        .animate-float {
          animation: float 7s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 9s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}