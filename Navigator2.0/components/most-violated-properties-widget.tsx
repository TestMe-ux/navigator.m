"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface PropertyData {
  name: string
  lossPercent: number
  violations: number
  revenueLoss: string
}

interface DistributionData {
  name: string
  score: number
  trend?: "up" | "down" | "stable"
  trendValue?: number
  status: "excellent" | "good" | "poor"
}

const violatedProperties: PropertyData[] = [
  {
    name: "Copthorne Hotel Newcastle",
    lossPercent: 100,
    violations: 30,
    revenueLoss: "$125.4K",
  },
  {
    name: "Aston Imperium Purwokerto",
    lossPercent: 100,
    violations: 30,
    revenueLoss: "$98.2K",
  },
  {
    name: "Grand Mercure Jakarta",
    lossPercent: 85,
    violations: 22,
    revenueLoss: "$76.5K",
  },
  {
    name: "Hilton London",
    lossPercent: 70,
    violations: 18,
    revenueLoss: "$62.3K",
  },
]

const distributionData: DistributionData[] = [
  {
    name: "Copthorne Hotel Newcastle",
    score: 99.52,
    trend: "up",
    trendValue: 2.3,
    status: "excellent",
  },
  {
    name: "Heritage Queenstown",
    score: 85.71,
    trend: "stable",
    trendValue: 0.1,
    status: "excellent",
  },
  {
    name: "Grand Mercure Jakarta",
    score: 78.45,
    trend: "down",
    trendValue: -1.2,
    status: "good",
  },
  {
    name: "Aston Imperium Purwokerto",
    score: 72.33,
    trend: "up",
    trendValue: 3.1,
    status: "good",
  },
]

const overallDistributionScore = 62.82

export function MostViolatedPropertiesWidget() {
  // Return appropriate color based on score
  const getDistributionColor = (score: number) => {
    if (score >= 80) return "bg-green-500" // Excellent: 80-100%
    if (score >= 40) return "bg-orange-500" // Good: 40-79%
    return "bg-red-500" // Poor: 0-39%
  }

  const getDistributionColorClass = (score: number) => {
    if (score >= 80) return "text-green-600" // Excellent: 80-100%
    if (score >= 40) return "text-orange-600" // Good: 40-79%
    return "text-red-600" // Poor: 0-39%
  }

  const getDistributionGradient = (score: number) => {
    if (score >= 80) return "bg-gradient-to-r from-green-400 to-green-600" // Excellent
    if (score >= 40) return "bg-gradient-to-r from-orange-400 to-orange-600" // Good
    return "bg-gradient-to-r from-red-400 to-red-600" // Poor
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case "good":
        return <AlertTriangle className="h-3 w-3 text-orange-600" />
      case "poor":
        return <XCircle className="h-3 w-3 text-red-600" />
      default:
        return null
    }
  }

  // Loss bars should use purple
  const getLossColor = (lossPercent: number) => {
    return "bg-purple-500"
  }

  const getLossColorClass = (lossPercent: number) => {
    return "text-red-600" // Keep text red for loss percentages
  }

  // Calculate distribution stats
  const excellentCount = distributionData.filter((p) => p.score >= 80).length
  const goodCount = distributionData.filter((p) => p.score >= 40 && p.score < 80).length
  const poorCount = distributionData.filter((p) => p.score < 40).length

  return (
    <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-500"></div>
      <CardContent className="p-0">
        <Tabs defaultValue="violations" className="w-full">
          <div className="px-4 pt-3 pb-1">
            <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 h-auto rounded-none border-b border-gray-200">
              <TabsTrigger
                value="violations"
                className="relative text-xs font-medium py-2 px-3 bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 rounded-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-1 data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-blue-500 data-[state=active]:after:to-purple-500"
              >
                Most Violated Properties
              </TabsTrigger>
              <TabsTrigger
                value="distribution"
                className="relative text-xs font-medium py-2 px-3 bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 rounded-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-1 data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-green-500 data-[state=active]:after:to-teal-500"
              >
                Property Health Score
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="violations" className="px-4 pb-3 mt-0 data-[state=active]:block" data-state="active">
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Property</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Loss %</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Violations</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Revenue Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {violatedProperties.map((property, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-3">
                        <div className="text-xs font-medium text-gray-900">{property.name}</div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={cn("text-xs font-semibold", getLossColorClass(property.lossPercent))}>
                            {property.lossPercent}%
                          </span>
                          <div className="w-12">
                            <Progress
                              value={property.lossPercent}
                              className="h-1 bg-gray-200"
                              indicatorClassName={getLossColor(property.lossPercent)}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-xs font-medium text-gray-900">{property.violations}</span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className={cn("text-xs font-semibold", getLossColorClass(property.lossPercent))}>
                          {property.revenueLoss}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="px-4 pb-3 mt-0 data-[state=active]:block">
            <div className="space-y-4">
              {/* Overall Distribution Score with Enhanced Visualization */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
                    Overall Distribution Score
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Portfolio Health</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Main Score Display */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm text-center">
                      <div
                        className={cn("text-2xl font-bold mb-1", getDistributionColorClass(overallDistributionScore))}
                      >
                        {overallDistributionScore}%
                      </div>
                      <div className="text-xs text-gray-500 mb-2">Health Score</div>
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          overallDistributionScore >= 80
                            ? "bg-green-100 text-green-700"
                            : overallDistributionScore >= 40
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700",
                        )}
                      >
                        {getStatusIcon(
                          overallDistributionScore >= 80
                            ? "excellent"
                            : overallDistributionScore >= 40
                              ? "good"
                              : "poor",
                        )}
                        {overallDistributionScore >= 80
                          ? "Excellent"
                          : overallDistributionScore >= 40
                            ? "Good"
                            : "Poor"}
                      </div>
                    </div>
                  </div>

                  {/* Progress Visualization */}
                  <div className="lg:col-span-2">
                    <div className="space-y-3">
                      <div className="relative">
                        <Progress
                          value={overallDistributionScore}
                          className="h-6 bg-gray-200 border border-gray-300 rounded-lg"
                          indicatorClassName={getDistributionGradient(overallDistributionScore)}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-white drop-shadow-sm">
                            {overallDistributionScore}%
                          </span>
                        </div>
                      </div>

                      {/* Score Range Indicators */}
                      <div className="flex justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          Poor (0-39%)
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                          Good (40-79%)
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Excellent (80-100%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Distribution Summary */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                    <div className="text-lg font-bold text-green-600">{excellentCount}</div>
                    <div className="text-xs text-green-700">Excellent Properties</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
                    <div className="text-lg font-bold text-orange-600">{goodCount}</div>
                    <div className="text-xs text-orange-700">Good Properties</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2 border border-red-200">
                    <div className="text-lg font-bold text-red-600">{poorCount}</div>
                    <div className="text-xs text-red-700">Poor Properties</div>
                  </div>
                </div>
              </div>

              {/* Enhanced Individual Properties */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500"></div>
                  Individual Property Performance
                </h4>

                <div className="grid gap-3">
                  {distributionData.map((property, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="text-xs font-medium text-gray-900 mb-1">{property.name}</h5>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(property.status)}
                            <span
                              className={cn(
                                "text-xs font-medium capitalize",
                                property.status === "excellent"
                                  ? "text-green-600"
                                  : property.status === "good"
                                    ? "text-orange-600"
                                    : "text-red-600",
                              )}
                            >
                              {property.status}
                            </span>
                            {property.trend && (
                              <div className="flex items-center gap-1 ml-2">
                                {property.trend === "up" ? (
                                  <TrendingUp className="h-3 w-3 text-green-600" />
                                ) : property.trend === "down" ? (
                                  <TrendingDown className="h-3 w-3 text-red-600" />
                                ) : null}
                                <span
                                  className={cn(
                                    "text-xs font-medium",
                                    property.trend === "up"
                                      ? "text-green-600"
                                      : property.trend === "down"
                                        ? "text-red-600"
                                        : "text-gray-600",
                                  )}
                                >
                                  {property.trendValue && property.trendValue > 0 ? "+" : ""}
                                  {property.trendValue}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn("text-lg font-semibold", getDistributionColorClass(property.score))}>
                            {property.score}%
                          </div>
                          <div className="text-xs text-gray-500">Health Score</div>
                        </div>
                      </div>

                      <div className="relative">
                        <Progress
                          value={property.score}
                          className="h-4 bg-gray-200 border border-gray-300 rounded-lg"
                          indicatorClassName={getDistributionGradient(property.score)}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-white drop-shadow-sm">{property.score}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Legend */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                <h4 className="text-xs font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  Health Score Classification
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-green-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="text-xs font-medium text-gray-900">Excellent</div>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">80 - 100%</div>
                    <div className="h-1.5 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-orange-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <div className="text-xs font-medium text-gray-900">Good</div>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">40 - 79%</div>
                    <div className="h-1.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-red-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <div className="text-xs font-medium text-gray-900">Poor</div>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">0 - 39%</div>
                    <div className="h-1.5 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
