"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Mock data for the usage trend chart
const usageData = [
  { date: "06 Aug", Scheduled: 0, OnDemand: 0, LightningRefresh: 0 },
  { date: "07 Aug", Scheduled: 0, OnDemand: 0, LightningRefresh: 0 },
  { date: "08 Aug", Scheduled: 0, OnDemand: 0, LightningRefresh: 0 },
  { date: "09 Aug", Scheduled: 0, OnDemand: 0, LightningRefresh: 0 },
  { date: "10 Aug", Scheduled: 0, OnDemand: 0, LightningRefresh: 0 },
  { date: "11 Aug", Scheduled: 0, OnDemand: 0, LightningRefresh: 0 },
  { date: "12 Aug", Scheduled: 0, OnDemand: 25, LightningRefresh: 0 },
  { date: "13 Aug", Scheduled: 185, OnDemand: 0, LightningRefresh: 0 },
  { date: "14 Aug", Scheduled: 175, OnDemand: 0, LightningRefresh: 0 },
  { date: "15 Aug", Scheduled: 190, OnDemand: 0, LightningRefresh: 0 },
  { date: "16 Aug", Scheduled: 0, OnDemand: 0, LightningRefresh: 0 },
  { date: "17 Aug", Scheduled: 0, OnDemand: 0, LightningRefresh: 0 },
]

export default function MyAccountPage() {
  const [viewBy, setViewBy] = useState("Daily")

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to your account, Namrata Jain
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Your Contract Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Your Contract</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Custom</p>
                    <p className="font-semibold text-lg">NA</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-semibold text-lg">27 February 2017</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-semibold text-lg">31 August 2025</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rate Shops - Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Rate Shops - Details</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Contract Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Contract Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Contract Period</p>
                      <p className="text-2xl font-bold">27 Feb'17 - 31 Aug'25</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Criteria</span>
                        <span className="text-sm font-medium">Values</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Competitors</span>
                        <span className="text-sm font-semibold">31</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Channels</span>
                        <span className="text-sm font-semibold">32</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary and Usage Trend */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Summary */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm font-medium">Reports</span>
                        <span className="text-sm font-medium">Consumed</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-dashed border-border">
                        <span className="text-sm text-muted-foreground">Scheduled</span>
                        <span className="text-sm font-semibold">246828</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-dashed border-border">
                        <span className="text-sm text-muted-foreground">On Demand</span>
                        <span className="text-sm font-semibold">57441</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Lightning Refresh</span>
                        <span className="text-sm font-semibold">11562</span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Trend */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Usage Trend</h3>
                      <div className="flex gap-1">
                        <span className="text-sm text-muted-foreground mr-2">View By:</span>
                        {["Daily", "Weekly", "Monthly", "Yearly"].map((period) => (
                          <Button
                            key={period}
                            variant={viewBy === period ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewBy(period)}
                            className="text-xs px-3 py-1"
                          >
                            {period}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={usageData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" fontSize={12} tick={{ fontSize: 10 }} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Scheduled" fill="#3b82f6" name="Scheduled" />
                          <Bar dataKey="OnDemand" fill="#10b981" name="On Demand" />
                          <Bar dataKey="LightningRefresh" fill="#8b5cf6" name="Lightning Refresh" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inclusions Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Inclusions</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-4">Benefits</h3>
                <ul className="space-y-3 text-foreground">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Customized annual subscription based on the need.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>
                      Access to fresh and accurate competitive Rate Intelligence for seamless decision-making.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-brand-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Ideal for consistent and long-term competitive Rate Intelligence requirements.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - User Profile */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCircle className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Namrata Jain</h3>
                <p className="text-muted-foreground mb-2">Alhambra Hotel</p>
                <p className="text-sm text-muted-foreground">Email: namrata.jain@rategain.com</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
