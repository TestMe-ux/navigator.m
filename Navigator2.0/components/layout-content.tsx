"use client"

import React, { useState, useEffect } from "react"
import { NavigationDrawer } from "@/components/navigation-drawer"

/**
 * Layout Content Component
 * Handles navigation drawer state management with enhanced responsiveness
 */
export function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)

  const toggleNavCollapse = () => {
    setIsNavCollapsed(!isNavCollapsed)
    console.log(`🔄 Navigation drawer ${isNavCollapsed ? 'expanded' : 'collapsed'}`)
  }

  // Debug logging
  useEffect(() => {
    console.log('🏗️ LayoutContent mounted with navigation drawer')
  }, [])

  return (
    <div className="relative min-h-screen flex bg-slate-50 dark:bg-slate-950 pt-16">
      {/* Navigation Drawer */}
      <NavigationDrawer 
        isCollapsed={isNavCollapsed}
        onToggleCollapse={toggleNavCollapse}
      />
      
      {/* Main Application Container - Fixed margins to match nav drawer width */}
      <div 
        className={`
          flex-1 flex flex-col transition-all duration-300 ease-in-out
          ${isNavCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64'}
        `}
        style={{
          minHeight: 'calc(100vh - 4rem)',
        }}
      >
        {/* Main Content Area - No additional spacing needed */}
        <main className="flex-1 relative overflow-x-hidden bg-slate-50 dark:bg-slate-950">
          <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 