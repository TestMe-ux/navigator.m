"use client"

import React, { useState, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown } from "lucide-react"

interface DemandAnalysisWidgetProps {
  className?: string
}

export function DemandAnalysisWidget({ className }: DemandAnalysisWidgetProps) {
  const [displayedIndex, setDisplayedIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [selectedCity, setSelectedCity] = useState("Berlin")
  const containerRef = useRef<HTMLDivElement>(null)

  // Cities list
  const cities = [
    "Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden", "Hanover", "Nuremberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster"
  ]

  // Generate demand data similar to the original widget
  const generateDemandData = () => {
    const data = []
    for (let i = 0; i < 20; i++) {
      const baseValue = 50 + Math.sin(i * 0.3) * 20 + Math.sin(i * 0.1) * 10
      const randomVariation = (Math.random() - 0.5) * 15
      data.push(Math.max(20, Math.min(100, baseValue + randomVariation)))
    }
    return data
  }

  const demandData = useMemo(() => generateDemandData(), [])

  // Generate interactive demand data with source markets
  const generateInteractiveDemandData = () => {
    const data = []
    const sourceMarkets = [
      { name: "Germany", base: 16 },
      { name: "Spain", base: 9 },
      { name: "United Kingdom", base: 9 },
      { name: "Turkiye", base: 7 },
      { name: "Others", base: 57 }
    ]
    
    for (let i = 0; i < demandData.length; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (demandData.length - 1 - i))
      
      data.push({
        date: date,
        demandValue: demandData[i],
        sevenDaysAgo: Math.round(demandData[i] * (0.8 + Math.random() * 0.4)),
        sourceMarkets: sourceMarkets.map(market => ({
          name: market.name,
          percentage: Math.round(market.base + (Math.random() - 0.5) * 4)
        }))
      })
    }
    return data
  }

  const interactiveDemandData = useMemo(() => generateInteractiveDemandData(), [demandData])

  return (
    <Card className={`card-elevated animate-fade-in h-[450px] ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          <div className="flex items-center gap-2">
            <span>Demand in</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto p-0 font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">
                  {selectedCity}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-[300px]">
                <ScrollArea className="h-[300px]">
                  {cities.map((city) => (
                    <DropdownMenuItem
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={selectedCity === city ? "bg-brand-50 dark:bg-brand-900/20" : ""}
                    >
                      {city}
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-4">
          {/* Demand Metric with Chart */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  {interactiveDemandData[displayedIndex].date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {Math.round(interactiveDemandData[displayedIndex].demandValue)} High
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {Math.round(((interactiveDemandData[displayedIndex].demandValue - interactiveDemandData[displayedIndex].sevenDaysAgo) / interactiveDemandData[displayedIndex].sevenDaysAgo) * 100)}% than 7 days ago
                </p>
              </div>
            </div>
            
            {/* Compact Line Chart */}
            <div className="w-full h-24 pt-5" ref={containerRef}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={demandData.map((value, index) => ({ value, index }))}
                  onMouseMove={(event) => {
                    if (event && event.activeTooltipIndex !== undefined) {
                      setHoveredIndex(event.activeTooltipIndex)
                      setDisplayedIndex(event.activeTooltipIndex)
                      setIsHovering(true)
                    }
                  }}
                  onMouseLeave={() => {
                    setDisplayedIndex(0)
                    setHoveredIndex(0)
                    setIsHovering(false)
                  }}
                >
                  <Line 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                  />
                  {/* Custom hover dot */}
                  {(isHovering || displayedIndex === 0) && (
                    <circle
                      cx={`calc(${(hoveredIndex / (demandData.length - 1)) * 100}% + 6px)`}
                      cy={((100 - demandData[hoveredIndex]) / 100) * 100 - 3.5 + "%"}
                      r="6"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="pointer-events-none"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Source Markets List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Source Markets for Inbound Traveller
            </h4>
            <div className="space-y-2">
              {interactiveDemandData[displayedIndex].sourceMarkets.map((market, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className={`text-sm text-slate-900 dark:text-slate-100 ${market.name === 'Others' ? 'font-semibold' : ''}`}>
                    {market.name}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{market.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
