"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface BusinessInsightsTabsProps {
  className?: string
  activeTab: string
  setActiveTab: (tab: string) => void
  businessInsightsTabs: Array<{
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
  }>
}

/**
 * Business Insights Tabs Component
 * 
 * Tab navigation for business insights page with:
 * - 4 main analysis tabs with icons
 * - Responsive design
 * - Clean styling consistent with Settings page
 * 
 * @component
 * @version 1.0.0
 */
export function BusinessInsightsTabs({ 
  className, 
  activeTab, 
  setActiveTab, 
  businessInsightsTabs 
}: BusinessInsightsTabsProps) {
  return (
    <div className={cn("w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm", className)}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-7xl xl:max-w-none mx-auto">
          <div className="flex items-center justify-start pt-6 gap-4 h-[70px]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="flex w-auto bg-transparent rounded-none h-auto p-0">
                {businessInsightsTabs.map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="px-5 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent bg-transparent hover:text-foreground rounded-none flex items-center gap-2 whitespace-nowrap"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
