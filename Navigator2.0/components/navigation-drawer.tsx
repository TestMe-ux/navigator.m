"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Settings, 
  Bell, 
  MapPin, 
  Calendar, 
  FileText, 
  Shield, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Home,
  DollarSign,
  Target,
  Activity,
  Star,
  Network,
  Lightbulb
} from "lucide-react"

interface NavigationItem {
  id: string
  title: string
  href: string
  icon: React.ElementType
  badge?: string
  description?: string
}

// Main navigation items - Core revenue management tools
const mainNavigationItems: NavigationItem[] = [
  {
    id: "cluster",
    title: "Cluster",
    href: "/cluster-view",
    icon: Network,
    description: "Cluster management and analysis"
  },
  {
    id: "overview",
    title: "Overview",
    href: "/",
    icon: Home,
    description: "Dashboard overview and key metrics"
  },
  {
    id: "rate-trends",
    title: "Rate Trends",
    href: "/rate-trend",
    icon: TrendingUp,
    description: "Rate trends and analysis"
  },
  {
    id: "demand-forecast",
    title: "Demand Forecast",
    href: "/demand",
    icon: BarChart3,
    description: "Market demand forecasting"
  },
  {
    id: "parity-monitor",
    title: "Parity Monitor",
    href: "/parity-monitoring",
    icon: Shield,
    description: "Rate parity tracking and alerts"
  },
  {
    id: "ota-rankings",
    title: "OTA Rankings",
    href: "/ota-rankings",
    icon: Star,
    description: "Online travel agent rankings"
  },
  {
    id: "business-insights",
    title: "Business Insights",
    href: "/business-insights",
    icon: Lightbulb,
    description: "Market insights and business intelligence"
  },
  {
    id: "events",
    title: "Events Calendar",
    href: "/events-calendar",
    icon: Calendar,
    description: "Event impact and calendar management"
  }
]

// Support and configuration items - Bottom section
const supportNavigationItems: NavigationItem[] = [
  {
    id: "reports",
    title: "Reports",
    href: "/reports",
    icon: FileText,
    description: "View and manage reports"
  },
  {
    id: "settings",
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Application settings and preferences"
  },
  {
    id: "help",
    title: "Help & Support",
    href: "/help",
    icon: HelpCircle,
    description: "Documentation and support resources"
  }
]

interface NavigationDrawerProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function NavigationDrawer({ 
  isCollapsed = false, 
  onToggleCollapse 
}: NavigationDrawerProps) {
  const pathname = usePathname()

  // Debug logging
  useEffect(() => {
    console.log('🎯 NavigationDrawer mounted', { isCollapsed, pathname })
  }, [isCollapsed, pathname])

  const renderNavigationItems = (items: NavigationItem[]) => {
    return items.map((item) => {
      const Icon = item.icon
      const isActive = pathname === item.href
      
      const navigationItem = (
        <div
          className={cn(
            "nav-drawer-item group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
            "hover:bg-muted/60 hover:text-foreground",
            isActive 
              ? "bg-brand-50 text-brand-700 border border-brand-200/50 shadow-sm dark:bg-brand-950/50 dark:text-brand-300 dark:border-brand-800/50" 
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => console.log(`🔗 Navigation clicked: ${item.title}`)}
          data-nav-item={item.id}
        >
          <Icon className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            isActive ? "text-brand-600 dark:text-brand-400" : ""
          )} />
          
          {!isCollapsed && (
            <>
              <span className="flex-1 truncate">{item.title}</span>
              {item.badge && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full shadow-sm dark:bg-red-900 dark:text-red-200">
                  {item.badge}
                </span>
              )}
            </>
          )}
          
          {isCollapsed && item.badge && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full shadow-sm" />
          )}
        </div>
      )

      // Wrap with tooltip when collapsed
      if (isCollapsed) {
        return (
          <Tooltip key={item.id} delayDuration={300}>
            <TooltipTrigger asChild>
              <Link href={item.href}>
                {navigationItem}
              </Link>
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              sideOffset={20}
              className="bg-black text-white border-black shadow-lg z-50"
              avoidCollisions={true}
              collisionPadding={32}
              align="start"
            >
              <p className="font-medium">{item.title}</p>
            </TooltipContent>
          </Tooltip>
        )
      }

      // No tooltip when expanded
      return (
        <Link key={item.id} href={item.href}>
          {navigationItem}
        </Link>
      )
    })
  }

  return (
    <TooltipProvider>
      <div className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-white/95 dark:bg-slate-900/95 border-r border-border shadow-lg transition-all duration-300 ease-in-out nav-drawer backdrop-blur-md flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}>
        
        {/* Main Navigation Section - Takes up available space */}
        <nav className="flex-1 overflow-y-auto p-3 nav-drawer navigation-menu" data-coach-mark="navigation-menu">
          {!isCollapsed && (
            <div className="mb-4 mt-4">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
                  Revenue Management
                </h3>
              </div>
            )}
            <div className="space-y-1" data-coach-mark="navigation-items">
              {renderNavigationItems(mainNavigationItems.slice(0, 1))}
              {!isCollapsed && (
                <div className="mx-3 pt-1 border-t border-dashed border-border/60"></div>
              )}
              {renderNavigationItems(mainNavigationItems.slice(1))}
            </div>
        </nav>
          
        {/* Bottom Section - Support + Toggle - Fixed at bottom */}
        <div className="mt-auto bg-white/90 dark:bg-slate-900/90 border-t border-border backdrop-blur-sm">
          {/* Support Section */}
          <div className="p-3">
            {!isCollapsed && (
              <div className="mb-4 mt-4">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
                  Support
                </h3>
              </div>
            )}
            <div className="space-y-1">
              {renderNavigationItems(supportNavigationItems)}
            </div>
          </div>

          {/* Toggle Button - Bottom of screen */}
          {onToggleCollapse && (
            <div className="p-3 border-t border-border/50 bg-muted/5" data-coach-mark="navigation-toggle-button">
              {isCollapsed ? (
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        console.log('🔄 Toggle navigation drawer clicked')
                        onToggleCollapse()
                      }}
                      className="h-9 w-8 p-0 mx-auto transition-all duration-200 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                      data-nav-item="toggle"
                      data-coach-mark="navigation-collapse-button"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Expand navigation menu</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    sideOffset={20}
                    className="bg-black text-white border-black shadow-lg z-50"
                    avoidCollisions={true}
                    collisionPadding={32}
                    align="end"
                  >
                    <p className="font-medium">Expand Menu</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('🔄 Toggle navigation drawer clicked')
                    onToggleCollapse()
                  }}
                  className="h-9 w-full justify-start px-3 py-2 transition-all duration-200 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  data-nav-item="toggle"
                  data-coach-mark="navigation-collapse-button"
                >
                  <div className="flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-sm font-medium">Collapse Menu</span>
                  </div>
                  <span className="sr-only">Collapse navigation menu</span>
                </Button>
              )}
            </div>
          )}
          </div>
      </div>
    </TooltipProvider>
  )
} 