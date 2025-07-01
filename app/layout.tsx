import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MD Electronics - Premium Home Appliances",
  description:
    "Your trusted partner for premium home appliances. Quality products, exceptional service, and competitive prices.",
  keywords: "electronics, appliances, refrigerators, ovens, televisions, air conditioners, washing machines",
  authors: [{ name: "MD Electronics" }],
  creator: "MD Electronics",
  publisher: "MD Electronics",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mdelectronics.com",
    title: "MD Electronics - Premium Home Appliances",
    description:
      "Your trusted partner for premium home appliances. Quality products, exceptional service, and competitive prices.",
    siteName: "MD Electronics",
  },
  twitter: {
    card: "summary_large_image",
    title: "MD Electronics - Premium Home Appliances",
    description:
      "Your trusted partner for premium home appliances. Quality products, exceptional service, and competitive prices.",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
