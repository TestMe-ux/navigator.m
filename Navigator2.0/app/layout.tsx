import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Header } from "@/components/navigator/header"
import { FilterSidebar } from "@/components/filter-sidebar"
import { LayoutContent } from "@/components/layout-content"
import { ThemeProvider } from "@/components/theme-provider"
import { DateProvider } from "@/components/date-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import { ComparisonProvider } from "@/components/comparison-context"
import { DatadogProvider } from "@/lib/datadogRum"

/**
 * Root Layout Metadata
 * Enhanced with proper SEO and branding
 */
export const metadata: Metadata = {
  title: "Navigator_React Version",
  description: "Professional hotel rate monitoring and competitive analysis platform",
  generator: "Navigator Dashboard v2.0",
  keywords: "hotel rates, rate parity, competitive analysis, revenue management",
  authors: [{ name: "Navigator Team" }],
}

/**
 * Viewport Configuration
 * Separated from metadata as per Next.js 15 requirements
 */
export const viewport = {
  width: "device-width",
  initialScale: 1,
}

/**
 * Root Layout Component
 * 
 * Clean, professional layout structure with:
 * - Theme provider for dark/light mode switching
 * - Navigation drawer integration
 * - Proper header integration
 * - Global sidebar management
 * - Responsive design foundation
 * - Optimized font loading
 * - Professional spacing system
 * 
 * @component
 * @version 2.0.0
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Optimized font loading for professional typography */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased font-sans bg-background text-foreground">
         <DatadogProvider />
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >

            <ComparisonProvider>
              <DateProvider>
                {/* Fixed Header - Appears on all pages */}
                <Header />
                <LayoutContent>{children}</LayoutContent>
                {/* Toast notifications */}
                <Toaster />
              </DateProvider>
            </ComparisonProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
