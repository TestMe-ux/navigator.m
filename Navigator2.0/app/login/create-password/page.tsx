"use client"

import React, { Suspense, lazy, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { CreatePasswordForm } from "@/components/auth/create-password-form"
import { PasswordRecovery } from "@/lib/login"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, X } from "lucide-react"

// Lazy load background for better performance
const BackgroundSelector = lazy(() => 
  import("@/components/auth/background-selector").then(module => ({ default: module.BackgroundSelector }))
)

/**
 * Create New Password Page Component
 * 
 * Features:
 * - Token validation before showing password form
 * - Clean password creation form
 * - Password complexity validation
 * - Visual password requirements popup
 * - Background visual consistency
 * - Professional branding
 * 
 * @component
 * @version 1.0.0
 */
export default function CreatePasswordPage() {
  const searchParams = useSearchParams()
  const [isValidating, setIsValidating] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [userId, setUserId] = useState("")
  const [token, setToken] = useState("")
  const hasValidated = useRef(false)

  useEffect(() => {
    // Prevent duplicate API calls
    if (hasValidated.current) return
    
    let isMounted = true
    hasValidated.current = true

    const validateToken = async () => {
      try {
        // Extract userid and token from URL parameters
        const userid = searchParams.get('userid')
        const tokenParam = searchParams.get('token')

        if (!userid || !tokenParam) {
          setErrorMessage("Invalid link. Missing user ID or token.")
          setIsValidating(false)
          return
        }

        setUserId(userid)
        setToken(tokenParam)

        // Validate token using PasswordRecovery API with password as "empty"
        const response = await PasswordRecovery({ 
          uid: userid, 
          token: tokenParam, 
          pwd: "empty" 
        })

        console.log('Validation API Response:', response)

        // Handle all response cases - simplified logic
        if (response.message === "Success" || response.message === "User Verified") {
          setIsValidToken(true)
        } else if (response.message === "User Already Deleted!") {
          setErrorMessage("User is already deleted so can't change their password!")
        } else if (response.message === "Invalid Auth Token!" || response.message === "Token is Expired!!") {
          setErrorMessage("Token Expired! Please request again for new password change!")
        } else {
          // Fallback for any other response
          console.warn('Unexpected response message:', response.message)
          setErrorMessage("Please check for Link and Try Again!")
        }
      } catch (error) {
        console.error('Token validation error:', error)
        setErrorMessage("Failed to validate token. Please try again.")
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [searchParams])

  // Show loading state while validating
  if (isValidating) {
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
                    Validating your request...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Show error message if token validation failed
  if (!isValidToken) {
    return (
      <div className="min-h-screen relative overflow-x-auto overflow-y-hidden">
        <Suspense fallback={
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
        }>
          <BackgroundSelector />
        </Suspense>
        
        <div className="relative z-10 min-h-screen flex items-center px-4 py-8 pointer-events-none">
          <div className="w-full min-w-[400px] max-w-md pointer-events-auto ml-[50%] -translate-x-1/2">
            <div className="w-full space-y-6">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-2xl font-medium text-white">
                    Invalid Request
                  </h1>
                  <p className="text-sm text-white">
                    There was an issue with your password reset request.
                  </p>
                </div>
              </div>

              {/* Error Card */}
              <Card className="shadow-2xl border border-white/20 bg-white/98 dark:bg-slate-900/98 backdrop-blur-lg">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center">
                      <X className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white font-medium">
                      {errorMessage}
                    </p>
                  </div>

                  <div className="h-[18px]"></div> {/* Spacer */}

                  <Button
                    onClick={() => window.location.href = '/login'}
                    className="w-full h-12 text-base font-semibold bg-gradient-brand hover:opacity-90 text-white shadow-brand rounded-lg transition-all transform hover:scale-[1.02]"
                  >
                    Back to Login
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show password creation form if token is valid
  return (
    <div className="min-h-screen relative overflow-x-auto overflow-y-hidden">
      {/* Background with Suspense for better loading */}
      <Suspense fallback={
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
      }>
        <BackgroundSelector />
      </Suspense>
      
      {/* Main Content Container - Responsive with scroll support */}
      <div className="relative z-10 min-h-screen flex items-center px-4 py-8 pointer-events-none">
        <div className="w-full min-w-[400px] max-w-md pointer-events-auto ml-[50%] -translate-x-1/2">
          <CreatePasswordForm userId={userId} token={token} />
        </div>
      </div>
    </div>
  )
}
