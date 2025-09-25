"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/navigator/header"
import { LayoutContent } from "@/components/layout-content"
import { AuthGuard } from "@/components/auth/auth-guard"

/**
 * Conditional Layout Component
 * 
 * Conditionally renders header and layout content based on the current route
 * Excludes header for authentication pages and includes authentication protection
 * 
 * @component
 * @version 2.0.0 - Added Authentication Guard
 */
interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Define routes that should not have header/navigation
  const authRoutes = ['/login', '/login/reset-password', '/login/create-password', '/signup', '/forgot-password']
  const isAuthRoute = authRoutes.some(route => pathname?.startsWith(route))
  
  // For rate-trend page in static mode, show header but skip auth guard
  const isRateTrendStatic = pathname === '/rate-trend'

  // For rate-trend static mode, bypass auth guard
  if (isRateTrendStatic) {
    return (
      <>
        <Header />
        <LayoutContent>{children}</LayoutContent>
      </>
    )
  }

  // Wrap everything with authentication guard
  return (
    <AuthGuard>
      {/* For authentication routes, render children without header/layout wrapper */}
      {isAuthRoute ? (
        <>{children}</>
      ) : (
        /* For regular app routes, render with header and layout wrapper */
        <>
          <Header />
          <LayoutContent>{children}</LayoutContent>
        </>
      )}
    </AuthGuard>
  )
}
