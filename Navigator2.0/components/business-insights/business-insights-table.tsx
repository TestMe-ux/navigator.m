"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronDown, ChevronUp, Download, FileText, CheckCircle, Star, ArrowDown, ArrowUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts"
import { format, addDays, subDays } from "date-fns"

// Sample data for Business Insights table
const businessInsightsData = [
  {
    id: "BI-001",
    date: "05 Oct",
    messages: [
      <>Your <strong>rate is 47% lower</strong> than average compset.</>,
      <>You are <strong>losing on parity</strong> with current score as <strong>0%</strong>.</>,
      <>Your <strong>city demand</strong> is medium <strong>(63)</strong>.</>
    ],
    subscriberAdr: "48%",
    subscriberAdrVariance: "down",
    compRank: "1/5",
    holidays: "--",
    events: ["Music Festival", "Food & Wine Expo", "Tech Conference", "Art Exhibition", "Sports Event"],
    airline: 17250,
    demand: 46,
    otaRank: "19",
    otaRankVariance: "+2",
    parity: "20%",
    generatedBy: "System",
    createdDate: "2025-09-26"
  },
  {
    id: "BI-002", 
    date: "04 Oct",
    messages: [
      <>Your <strong>rate is 52% higher</strong> than average compset.</>,
      <>You are <strong>winning on parity</strong> with current score as <strong>15%</strong>.</>,
      <>Your <strong>city demand</strong> is high <strong>(78)</strong>.</>
    ],
    subscriberAdr: "47%",
    subscriberAdrVariance: "down",
    compRank: "2/5",
    holidays: "--",
    events: [],
    airline: 17857,
    demand: 49,
    otaRank: "16",
    otaRankVariance: "-3",
    parity: "0%",
    generatedBy: "System",
    createdDate: "2025-09-24"
  },
  {
    id: "BI-003",
    date: "03 Oct",
    messages: [
      <>Your <strong>rate is 38% lower</strong> than average compset.</>,
      <>You are <strong>losing on parity</strong> with current score as <strong>0%</strong>.</>,
      <>Your <strong>city demand</strong> is low <strong>(45)</strong>.</>
    ],
    subscriberAdr: "56%",
    subscriberAdrVariance: "up",
    compRank: "2/5",
    holidays: "--",
    events: ["Festival"],
    airline: 20767,
    demand: 58,
    otaRank: "10",
    otaRankVariance: "+1",
    parity: "0%",
    generatedBy: "System",
    createdDate: "2025-09-22"
  },
  {
    id: "BI-004",
    date: "02 Oct",
    messages: [
      <>Your <strong>rate is 25% higher</strong> than average compset.</>,
      <>You are <strong>winning on parity</strong> with current score as <strong>8%</strong>.</>,
      <>Your <strong>city demand</strong> is high <strong>(82)</strong>.</>
    ],
    subscriberAdr: "61%",
    subscriberAdrVariance: "up",
    compRank: "1/5",
    holidays: "--",
    events: ["Sports Event", "Music Festival", "Food Expo", "Tech Summit"],
    airline: 16040,
    demand: 43,
    otaRank: "3",
    otaRankVariance: "-2",
    parity: "0%",
    generatedBy: "System",
    createdDate: "2025-09-20"
  },
  {
    id: "BI-005",
    date: "01 Oct",
    messages: [
      <>Your <strong>rate is 15% lower</strong> than average compset.</>,
      <>You are <strong>losing on parity</strong> with current score as <strong>0%</strong>.</>,
      <>Your <strong>city demand</strong> is medium <strong>(55)</strong>.</>
    ],
    subscriberAdr: "47%",
    subscriberAdrVariance: "down",
    compRank: "2/5",
    holidays: "--",
    events: [],
    airline: 22133,
    demand: 59,
    otaRank: "3",
    otaRankVariance: "-1",
    parity: "0%",
    generatedBy: "System",
    createdDate: "2025-09-18"
  },
  {
    id: "BI-006",
    date: "30 Sep",
    messages: [
      <>Your <strong>rate is 35% higher</strong> than average compset.</>,
      <>You are <strong>losing on parity</strong> with current score as <strong>0%</strong>.</>,
      <>Your <strong>city demand</strong> is low <strong>(42)</strong>.</>
    ],
    subscriberAdr: "44%",
    subscriberAdrVariance: "down",
    compRank: "5/5",
    holidays: "--",
    events: ["Business Conference"],
    airline: 21731,
    demand: 55,
    otaRank: "6",
    otaRankVariance: "-4",
    parity: "0%",
    generatedBy: "System",
    createdDate: "2025-09-16"
  },
  {
    id: "BI-007",
    date: "29 Sep",
    messages: [
      <>Your <strong>rate is 22% lower</strong> than average compset.</>,
      <>You are <strong>winning on parity</strong> with current score as <strong>12%</strong>.</>,
      <>Your <strong>city demand</strong> is medium <strong>(58)</strong>.</>
    ],
    subscriberAdr: "52%",
    subscriberAdrVariance: "up",
    compRank: "2/5",
    holidays: "--",
    events: ["Convention"],
    airline: 20484,
    demand: 51,
    otaRank: "12",
    otaRankVariance: "+3",
    parity: "0%",
    generatedBy: "System",
    createdDate: "2025-09-14"
  },
  {
    id: "BI-008",
    date: "28 Sep",
    messages: [
      <>Your <strong>rate is 18% higher</strong> than average compset.</>,
      <>You are <strong>losing on parity</strong> with current score as <strong>0%</strong>.</>,
      <>Your <strong>city demand</strong> is high <strong>(71)</strong>.</>
    ],
    subscriberAdr: "49%",
    subscriberAdrVariance: "down",
    compRank: "4/5",
    holidays: "--",
    events: [],
    airline: 20510,
    demand: 55,
    otaRank: "8",
    otaRankVariance: "-2",
    parity: "0%",
    generatedBy: "System",
    createdDate: "2025-09-12"
  }
]

interface BusinessInsightsTableProps {
  className?: string
}

export function BusinessInsightsTable({ className }: BusinessInsightsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const handleInsightExpand = (insightDate: string) => {
    setExpandedRow(expandedRow === insightDate ? null : insightDate)
  }

  // Generate 7-day trend data (3 days past + expanded date + 3 days future)
  const generateTrendData = (expandedDate: string) => {
    // Parse the expanded date (format: "05 Oct")
    const currentYear = new Date().getFullYear()
    const expandedDateObj = new Date(`${expandedDate} ${currentYear}`)
    
    const trendData = []
    
    // Generate 7 days of data
    for (let i = -3; i <= 3; i++) {
      const date = addDays(expandedDateObj, i)
      
      // Generate realistic rate data with some variation
      const compAvgRate = Math.round(180 + Math.sin(i * 0.5) * 30 + (Math.random() - 0.5) * 20)
      const subscriberLowestRate = Math.round(160 + Math.sin(i * 0.3) * 25 + (Math.random() - 0.5) * 15)
      
      trendData.push({
        date: format(date, "dd MMM"),
        "Comp Avg Rate": compAvgRate,
        "Subscriber Lowest Rate": subscriberLowestRate
      })
    }
    
    return trendData
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "processing":
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      case "failed":
        return <div className="w-4 h-4 bg-red-600 rounded-full" />
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  const getReportTypeBadge = (type: string) => {
    const badgeStyles = {
      "Market Analysis": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      "Rate Analysis": "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", 
      "Competitive Analysis": "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
    }
    
    return (
      <Badge 
        variant="secondary"
        className={badgeStyles[type as keyof typeof badgeStyles] || "bg-gray-100 text-gray-800"}
      >
        {type.split(' ')[0]}
      </Badge>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Table Heading */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Market Insights
        </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Market trends, rate performance, and competitive insights for data-driven decisions
      </p>
      </div>
      
      {/* Table Header */}
      <div className="bg-gray-100 dark:bg-gray-800">
        <div className="flex px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
          <div className="flex items-start w-[9.5%] mr-3 pl-2">Date</div>
          <div className="flex items-start w-[39%] mr-3">Insights</div>
          <div className="flex flex-col items-start w-[11%] mr-3">
            <div>Subscriber ADR</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs font-normal">(vs Avg Comp)</div>
          </div>
          <div className="flex flex-col items-start w-[6.5%] mr-3">
            <div>Comp</div>
            <div>Rank</div>
          </div>
          <div className="flex items-start w-[6.5%] mr-3">Airline</div>
          <div className="flex flex-col items-start w-[6.5%] mr-3">
            <div>Demand /</div>
            <div>Events</div>
          </div>
          <div className="flex flex-col items-start w-[6.5%] mr-3">
            <div>OTA</div>
            <div>Rank</div>
          </div>
          <div className="flex items-start w-[6.5%]">Parity</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="bg-white dark:bg-gray-900 rounded-b-lg">
        {businessInsightsData.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                No reports found
              </div>
              <div className="text-gray-400 dark:text-gray-500 text-sm">
                Try adjusting your filters or date range
              </div>
            </div>
          </div>
        ) : (
          businessInsightsData.map((report, index) => {
            const isExpanded = expandedRow === report.date
            const isNextRowExpanded = index < businessInsightsData.length - 1 && expandedRow === businessInsightsData[index + 1].date

            return (
              <div key={report.id}>
                {/* Main Row */}
                <div
                  className={`flex px-4 py-2 text-sm ${
                    isNextRowExpanded
                      ? 'border-b border-blue-200 dark:border-blue-500'
                      : isExpanded && index === businessInsightsData.length - 1
                        ? 'border-b-0'
                        : index === businessInsightsData.length - 1
                          ? 'border-b border-gray-100 dark:border-gray-800 rounded-bl-lg'
                          : 'border-b border-gray-100 dark:border-gray-800'
                  } ${
                    isExpanded
                      ? 'bg-blue-100 dark:bg-blue-800/30'
                      : index % 2 === 0
                        ? 'bg-white dark:bg-gray-900'
                        : 'bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  {/* Date */}
                  <div className="flex items-center w-[9.5%] mr-3">
                    <button
                      onClick={() => handleInsightExpand(report.date)}
                      className="flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-md transition-colors p-2"
                    >
                      <span className="text-blue-600 font-medium text-sm">
                        {report.date}
                      </span>
                      <div className="w-4 h-4 border border-blue-600 dark:border-blue-600 rounded-full flex items-center justify-center">
                        {isExpanded ? (
                          <ChevronUp className="w-2.5 h-2.5 text-blue-600" strokeWidth="2.5" />
                        ) : (
                          <ChevronDown className="w-2.5 h-2.5 text-blue-600" strokeWidth="2.5" />
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Insights */}
                  <div className="flex items-start w-[39%] mr-3">
                    {/* Messages Column */}
                    <div className="flex-1">
                      <div className="space-y-1">
                        {report.messages.map((message, msgIndex) => (
                          <div key={msgIndex} className="text-sm text-gray-700 dark:text-gray-300 break-words overflow-wrap-anywhere">
                            • {message}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Subscriber ADR */}
                  <div className="flex items-center gap-2 w-[11%] mr-3">
                    <span className={`font-medium ${report.subscriberAdrVariance === "down" ? "text-green-600" : "text-red-600"}`}>{report.subscriberAdr}</span>
                    {report.subscriberAdrVariance === "down" ? (
                      <ArrowDown className="w-3 h-3 text-green-600" strokeWidth="2" />
                    ) : (
                      <ArrowUp className="w-3 h-3 text-red-600" strokeWidth="2" />
                    )}
                  </div>

                  {/* Comp Rank */}
                  <div className="flex items-center w-[6.5%] mr-3">
                    <span className={`font-medium text-gray-900 dark:text-gray-100 ${report.compRank === "1/5" ? "text-green-600" : report.compRank === "5/5" ? "text-red-600" : ""}`}>
                      {report.compRank}
                    </span>
                  </div>

                  {/* Airline */}
                  <div className="flex items-center w-[6.5%] mr-3">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{report.airline}</span>
                  </div>

                  {/* Demand */}
                  <div className="flex items-center w-[6.5%] mr-3">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{report.demand}</span>
                    {Array.isArray(report.events) && report.events.length > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500 ml-[18px]" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-black text-white border-black text-xs px-2 py-1">
                            <div className="text-center">
                              {report.events.length <= 3 ? (
                                <div>
                                  {report.events.slice(0, 2).join(", ") + (report.events.length === 3 ? "," : "")}
                                  {report.events.length === 3 && <br />}
                                  {report.events.length === 3 && report.events[2]}
                                </div>
                              ) : (
                                <div>
                                  {report.events.slice(0, 2).join(", ")}
                                  <br />
                                  {report.events[2]}, (+{report.events.length - 3} more)
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  {/* OTA Rank */}
                  <div className="flex items-center w-[6.5%] mr-3">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{report.otaRank}</span>
                    <span className={`ml-2 text-xs ${report.otaRankVariance.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>
                      ({report.otaRankVariance})
                    </span>
                  </div>

                  {/* Parity */}
                  <div className="flex items-center w-[6.5%]">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{report.parity}</span>
                  </div>
                </div>

                {/* Expanded Row Content */}
                {isExpanded && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-500">
                    <div className="space-y-4">
                      {/* 7-Day Trend Chart */}
                      <div className="bg-white dark:bg-slate-900 p-4">
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 ml-2">
              7-Day Rate Trend Analysis
            </h4>
                        
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={generateTrendData(report.date)}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <XAxis
                                dataKey="date"
                                fontSize={11}
                                tick={{ fontSize: 11, fill: "#666" }}
                                axisLine={{ stroke: "#e5e7eb" }}
                                tickLine={{ stroke: "#e5e7eb" }}
                                tick={(props) => {
                                  const { x, y, payload } = props
                                  const isExpandedDate = payload.value === report.date
                                  return (
                                    <g transform={`translate(${x},${y})`}>
                                      <text
                                        x={0}
                                        y={0}
                                        dy={16}
                                        textAnchor="middle"
                                        fill="#666"
                                        fontSize={11}
                                        fontWeight={isExpandedDate ? "bold" : "normal"}
                                      >
                                        {payload.value}
                                      </text>
                                    </g>
                                  )
                                }}
                              />
                              <YAxis
                                fontSize={11}
                                tick={{ fontSize: 11, fill: "#666" }}
                                axisLine={{ stroke: "#e5e7eb" }}
                                tickLine={{ stroke: "#e5e7eb" }}
                                tickFormatter={(value) => `$${value}`}
                              />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: 'white',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    // Calculate dynamic width based on content
                                    const maxValueLength = Math.max(...payload.map((entry: any) => `$${entry.value}`.length))
                                    const baseWidth = 253
                                    const dynamicWidth = Math.max(baseWidth, baseWidth + (maxValueLength - 4) * 8) // Adjust for longer values
                                    
                                    return (
                                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3" style={{ minWidth: `${dynamicWidth}px` }}>
                                        <div className="mb-2">
                                          <div className="font-semibold text-gray-900 text-sm">
                                            {(() => {
                                              // Parse the label to get the date and add day of week
                                              const dateStr = label
                                              const date = new Date(dateStr)
                                              const dayOfWeek = format(date, 'EEE') // Mon, Tue, Wed, etc.
                                              return `${dateStr}, ${dayOfWeek}`
                                            })()}
                                          </div>
                                        </div>
                                        <div className="space-y-1">
                                          {payload.map((entry: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <div
                                                  className="w-2 h-2 rounded-sm"
                                                  style={{ backgroundColor: entry.color }}
                                                />
                                                <span className="text-sm text-gray-700">{entry.name}</span>
                                              </div>
                                              <span className="text-sm font-semibold text-gray-900">
                                                ${entry.value}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )
                                  }
                                  return null
                                }}
                              />
                              {/* Vertical line to highlight expanded date */}
                              <ReferenceLine 
                                x={report.date} 
                                stroke="#3b82f6" 
                                strokeDasharray="2 2" 
                                strokeWidth={1}
                                opacity={0.6}
                              />
                  <Line 
                    dataKey="Comp Avg Rate" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    strokeDasharray="3 3"
                    dot={{ r: 3 }} 
                    activeDot={{ r: 4, stroke: "#ef4444", strokeWidth: 2 }} 
                    name="Compset Avg. Rate" 
                  />
                              <Line 
                                dataKey="Subscriber Lowest Rate" 
                                stroke="#3b82f6" 
                                strokeWidth={2} 
                                dot={{ r: 3 }} 
                                activeDot={{ r: 4, stroke: "#3b82f6", strokeWidth: 2 }} 
                                name="Subscriber Lowest Rate" 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Legend */}
                        <div className="flex justify-center items-center gap-8 mt-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <div className="w-1 h-0.5 bg-red-500"></div>
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                              <div className="w-1 h-0.5 bg-red-500"></div>
                            </div>
                            <span className="text-sm text-red-500">Compset Avg. Rate</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <div className="w-1 h-0.5 bg-blue-500"></div>
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              <div className="w-1 h-0.5 bg-blue-500"></div>
                            </div>
                            <span className="text-sm text-blue-500">Subscriber Lowest Rate</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Details */}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

