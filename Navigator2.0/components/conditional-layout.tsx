"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/navigator/header"
import { LayoutContent } from "@/components/layout-content"

/**
 * Conditional Layout Component
 * 
 * Conditionally renders header and layout content based on the current route
 * Excludes header for authentication pages
 * 
 * @component
 * @version 1.0.0
 */
interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Define routes that should not have header/navigation
  const authRoutes = ['/login', '/login/reset-password', '/signup', '/forgot-password']
  const isAuthRoute = authRoutes.some(route => pathname?.startsWith(route))

  // For authentication routes, render children without header/layout wrapper
  if (isAuthRoute) {
    return <>{children}</>
  }

  // For regular app routes, render with header and layout wrapper
  return (
    <>
      <Header />
      <LayoutContent>{children}</LayoutContent>
    </>
  )
}
