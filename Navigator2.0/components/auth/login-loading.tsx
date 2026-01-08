"use client"

import React from "react"
import { Activity } from "lucide-react"

/**
 * Login Loading Component
 * 
 * Features:
 * - Lightweight loading screen for login page
 * - Minimal animations to reduce load time
 * - Consistent branding
 * - Fast rendering
 * 
 * @component
 * @version 1.0.0
 */
export function LoginLoading() {
  return (
    <div className="h-screen relative overflow-hidden">
      {/* Simple gradient background - no heavy animations */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
      
      {/* Loading Content */}
      <div className="relative z-10 h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          {/* Navigator Logo with subtle animation */}
          <div className="mx-auto w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg animate-pulse">
            <Activity className="w-8 h-8 text-white" />
          </div>
          
          {/* Loading Text */}
          <div className="space-y-2">
            <h1 className="text-2xl font-medium text-white">Navigator</h1>
            <p className="text-sm text-blue-200">Loading your dashboard...</p>
          </div>
          
          {/* Loading Spinner */}
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        </div>
      </div>
    </div>
  )
}




