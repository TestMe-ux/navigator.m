"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { LocalStorageService } from "@/lib/localstorage"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { BackgroundSelector } from "./background-selector"

/**
 * Authentication Guard Component
 * 
 * Protects routes by checking authentication status and redirecting to login
 * if user is not authenticated. Excludes login-related pages from protection.
 * 
 * @component
 * @version 1.0.0
 */
interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Define routes that should be accessible without authentication
  const publicRoutes = [
    '/login',
    '/login/reset-password',
    '/login/create-password',
    '/signup',
    '/forgot-password',
    "/optima/auth"
  ]

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))

  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const authenticated = LocalStorageService.isAuthenticated()
        setIsAuthenticated(authenticated)

        // If user is not authenticated and trying to access protected route
        if (!authenticated && !isPublicRoute) {
          console.log('User not authenticated, redirecting to login')
          router.push('/login')
          return
        }

        // If user is authenticated and trying to access login page, redirect to dashboard
        if (authenticated && pathname === '/login') {
          console.log('User already authenticated, redirecting to dashboard')
          router.push('/')
          return
        }

      } catch (error) {
        console.error('Authentication check error:', error)
        // On error, redirect to login if not on public route
        if (!isPublicRoute) {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
       
      }
    }

    checkAuthentication()
  }, [pathname, router, isPublicRoute])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-x-auto overflow-y-hidden">
        <Suspense fallback={
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
        }>
          <BackgroundSelector />
        </Suspense>

        <div className="relative z-10 min-h-screen flex items-center px-4 py-8 pointer-events-none">
          <div className="w-full min-w-[400px] max-w-md pointer-events-auto ml-[50%] -translate-x-1/2">
            <Card className="shadow-2xl border border-white/20 bg-white/98 dark:bg-slate-900/98 backdrop-blur-lg">
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-white mx-auto" />
                  <p className="text-white font-medium">
                    Checking authentication...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // For public routes, always render children
  if (isPublicRoute) {
    return <>{children}</>
  }

  // For protected routes, only render if authenticated
  if (isAuthenticated) {
    return <>{children}</>
  }

  // If not authenticated and not public route, show nothing (redirect will happen)
  return null
}

