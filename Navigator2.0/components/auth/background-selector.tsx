"use client"

import React from "react"

/**
 * Static Data Flow Background Component
 * 
 * Features:
 * - Single beautiful data flow background with network visualization
 * - Advanced grid pattern with curved data paths
 * - Network nodes and professional styling
 * - Blue to purple gradient optimized for login experience
 * 
 * @component
 * @version 3.0.0 - Simplified to single background option
 */
export function BackgroundSelector() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Data Flow Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-indigo-800 to-purple-900" />
      
      {/* Data Flow Background Pattern */}
      <div className="absolute inset-0">
        {/* Advanced grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(99, 102, 241, 0.15) 1px, transparent 1px),
              linear-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px),
              linear-gradient(45deg, rgba(147, 51, 234, 0.08) 1px, transparent 1px),
              linear-gradient(-45deg, rgba(147, 51, 234, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px, 40px 40px, 80px 80px, 80px 80px'
          }} />
        </div>
        
        {/* Data flow paths */}
        <div className="absolute inset-0 overflow-hidden opacity-6">
          {/* Curved data paths */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0,200 Q 200,100 400,200 T 800,200" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="2" fill="none" />
            <path d="M 0,400 Q 300,250 600,400 T 1200,400" stroke="rgba(147, 51, 234, 0.2)" strokeWidth="2" fill="none" />
            <path d="M 200,0 Q 300,200 400,400 Q 500,600 600,800" stroke="rgba(79, 70, 229, 0.2)" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        
        {/* Network nodes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/5 left-1/5 w-3 h-3 bg-indigo-400/40 rounded-full shadow-lg" />
          <div className="absolute top-2/5 right-1/4 w-4 h-4 bg-purple-400/40 rounded-full shadow-lg" />
          <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-blue-400/40 rounded-full shadow-lg" />
          <div className="absolute top-1/2 left-1/2 w-5 h-5 bg-indigo-500/30 rounded-full shadow-xl" />
        </div>
      </div>

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none" />
    </div>
  )
}
