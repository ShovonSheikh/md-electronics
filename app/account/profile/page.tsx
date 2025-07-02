"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1990-01-15",
    address: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "United States",
    },
  })

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }))
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSave = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setIsEditing(false)
      // Handle save logic here
      console.log("Profile updated:", profileData)
    }, 1000)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data if needed
  }

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
              <Link href="/account/profile" className="text-blue-600 font-medium">
                Profile
              </Link>
              <Link href="/account/orders" className="text-gray-600 hover:text-blue-600 transition-colors">
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
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <p className="text-gray-600">{profileData.email}</p>
                  <p className="text-sm text-gray-500">Member since January 2024</p>
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                className="flex items-center space-x-2"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Profile Content */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        disabled={!isEditing}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        disabled={!isEditing}
                        className="h-11"
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
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        disabled={!isEditing}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                        Date of Birth
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        disabled={!isEditing}
                        className="h-11"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address">
              <Card>
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                  <CardDescription>
                    Manage your shipping and billing addresses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="street" className="text-sm font-medium text-gray-700">
                      Street Address
                    </Label>
                    <Input
                      id="street"
                      value={profileData.address.street}
                      onChange={(e) => handleInputChange("address.street", e.target.value)}
                      disabled={!isEditing}
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        City
                      </Label>
                      <Input
                        id="city"
                        value={profileData.address.city}
                        onChange={(e) => handleInputChange("address.city", e.target.value)}
                        disabled={!isEditing}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                        State/Province
                      </Label>
                      <Input
                        id="state"
                        value={profileData.address.state}
                        onChange={(e) => handleInputChange("address.state", e.target.value)}
                        disabled={!isEditing}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                        ZIP/Postal Code
                      </Label>
                      <Input
                        id="zipCode"
                        value={profileData.address.zipCode}
                        onChange={(e) => handleInputChange("address.zipCode", e.target.value)}
                        disabled={!isEditing}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                        Country
                      </Label>
                      <Input
                        id="country"
                        value={profileData.address.country}
                        onChange={(e) => handleInputChange("address.country", e.target.value)}
                        disabled={!isEditing}
                        className="h-11"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Password</h4>
                        <p className="text-sm text-gray-600">Last updated 3 months ago</p>
                      </div>
                      <Button variant="outline">Change Password</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Login Sessions</h4>
                        <p className="text-sm text-gray-600">Manage your active login sessions</p>
                      </div>
                      <Button variant="outline">View Sessions</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}