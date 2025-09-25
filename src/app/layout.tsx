import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TenantProvider } from "@/contexts/tenant-context"
import { syncIndustriesConfig } from "@/config/sync-industries"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
})

export const metadata: Metadata = {
  title: "Scratchie Manufacturing Quality Benchmark",
  description: "Track manufacturing quality improvements and ROI with Scratchie",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 antialiased">
        <TenantProvider initialCompany={syncIndustriesConfig}>
          {children}
        </TenantProvider>
      </body>
    </html>
  )
}
