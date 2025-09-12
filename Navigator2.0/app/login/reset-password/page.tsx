"use client"

import React, { Suspense, lazy } from "react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

// Lazy load background for better performance
const BackgroundSelector = lazy(() => 
  import("@/components/auth/background-selector").then(module => ({ default: module.BackgroundSelector }))
)

/**
 * Reset Password Page Component
 * 
 * Features:
 * - Clean reset password form
 * - Background visual consistency
 * - Back to login navigation
 * - Professional branding
 * 
 * @component
 * @version 1.0.0
 */
export default function ResetPasswordPage() {
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
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
