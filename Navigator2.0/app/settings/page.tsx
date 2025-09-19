"use client"

import { useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { User, Building, Radio, Target, Bell, BarChart3, Map, Calculator } from "lucide-react"
import { SettingsTab } from "@/components/settings-tab"
import UserManagement from "./user-management/page"
import PropertySettings from "./property/page"
import ChannelSettings from "./channel/page"
import CompsetSettings from "./compset/page"
import AlertsSettings from "./alerts/page"
import ParitySettings from "./parity/page"
import MappingSettings from "./mapping/page"
import TaxSettings from "./tax/page"

const settingsTabs = [
  { id: "user-management", label: "User Management", icon: User },
  { id: "property", label: "Property", icon: Building },
  { id: "channel", label: "Channel", icon: Radio },
  { id: "compset", label: "Compset", icon: Target },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "parity", label: "Parity", icon: BarChart3 },
  { id: "mapping", label: "Mapping", icon: Map },
  { id: "tax", label: "Tax", icon: Calculator },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("user-management")

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Settings Tabs Section */}
      <SettingsTab 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settingsTabs={settingsTabs}
      />
      
      {/* Tab Contents */}
      <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-4 py-4 md:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="user-management" className="mt-2">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="property" className="mt-2">
              <PropertySettings />
            </TabsContent>
            
            <TabsContent value="channel" className="mt-2">
              <ChannelSettings />
            </TabsContent>
            
            <TabsContent value="compset" className="mt-2">
              <CompsetSettings />
            </TabsContent>
            
            <TabsContent value="alerts" className="mt-2">
              <AlertsSettings />
            </TabsContent>
            
            <TabsContent value="parity" className="mt-2">
              <ParitySettings />
            </TabsContent>
            
            <TabsContent value="mapping" className="mt-2">
              <MappingSettings />
            </TabsContent>
            
            <TabsContent value="tax" className="mt-2">
              <TaxSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}