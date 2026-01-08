"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface SettingsTabProps {
  className?: string
  activeTab: string
  setActiveTab: (tab: string) => void
  settingsTabs: Array<{
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
  }>
}

/**
 * Settings Tab Component
 * 
 * Tab navigation for settings page with:
 * - 8 settings tabs with icons
 * - Responsive design
 * - Clean styling
 * 
 * @component
 * @version 1.0.0
 */
export function SettingsTab({ className, activeTab, setActiveTab, settingsTabs }: SettingsTabProps) {
  return (
    <div className={cn("bg-background border-b border-border shadow-sm w-full", className)}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-7xl xl:max-w-none mx-auto">
          <div className="flex items-center justify-between pt-6 gap-4 h-[70px]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex w-full bg-transparent rounded-none h-auto p-0">
                {settingsTabs.map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="px-5 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent bg-transparent hover:text-foreground rounded-none flex items-center gap-2 whitespace-nowrap flex-1 justify-center text-[14px]"
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

