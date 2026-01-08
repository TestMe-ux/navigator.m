"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function MappingSettingsPage() {
  const pathname = usePathname()
  
  // Determine which tab is active based on pathname
  const getActiveTab = () => {
    if (pathname?.includes("/mapping/room")) return "room"
    if (pathname?.includes("/mapping/rate")) return "rate"
    if (pathname?.includes("/mapping/inclusions")) return "inclusions"
    return "room" // default
  }

  const [activeTab, setActiveTab] = useState(getActiveTab())

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-gradient-to-br from-card to-card/50 border-gray-200 dark:border-slate-700 rounded-lg border">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-base font-medium text-foreground">Mapping Settings</span>
            
            {/* Tab Navigation */}
            <div className="flex items-center gap-1">
              <Link href="/settings/mapping/room">
                <button
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTab === "room"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Room
                </button>
              </Link>
              <Link href="/settings/mapping/rate">
                <button
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTab === "rate"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Rate
                </button>
              </Link>
              <Link href="/settings/mapping/inclusions">
                <button
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTab === "inclusions"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Inclusions
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content will be rendered by the child pages */}
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            Select a tab above to access Room, Rate, or Inclusions mapping settings.
          </p>
        </div>
      </div>
    </div>
  )
}