"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  type?: "demand" | "events" | "widget"
  className?: string
  showCycleCounter?: boolean
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = "widget", 
  className,
  showCycleCounter = false 
}) => {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingCycle, setLoadingCycle] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prevProgress) => {
        // Random increment between 3-11%
        const increment = Math.floor(Math.random() * 9) + 3
        const newProgress = prevProgress + increment
        
        if (newProgress >= 100) {
          // Reset to 0 and increment cycle counter
          setLoadingCycle(prev => prev + 1)
          return 0
        }
        
        return newProgress
      })
    }, 80) // Update every 80ms
    
    return () => clearInterval(interval)
  }, [])

  const WidgetProgress = ({ className: progressClassName }: { className?: string }) => (
    <div className={cn("absolute top-0 left-0 right-0 z-10", progressClassName)}>
      <div className="h-[3px] w-full bg-gray-200/50 dark:bg-gray-800/50 overflow-hidden rounded-sm">
        <div 
          className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out"
          style={{ 
            width: `${loadingProgress}%`,
            transform: `translateX(0%)` 
          }}
        />
      </div>
    </div>
  )

  if (type === "demand") {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Header Section */}
        <Card className="relative overflow-hidden">
          <WidgetProgress />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filter Bar */}
        <Card className="relative overflow-hidden">
          <WidgetProgress />
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-28" />
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <WidgetProgress />
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="relative overflow-hidden lg:col-span-2">
            <WidgetProgress />
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>

          {/* Events */}
          <Card className="relative overflow-hidden">
            <WidgetProgress />
            <CardHeader>
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="relative overflow-hidden">
          <WidgetProgress />
          <CardHeader>
            <Skeleton className="h-6 w-44" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>

        {showCycleCounter && (
          <div className="fixed top-4 right-4 bg-blue-500/90 text-white px-3 py-1 rounded-md text-sm font-medium z-50">
            Cycle: {loadingCycle}
          </div>
        )}
      </div>
    )
  }

  if (type === "events") {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="relative overflow-hidden rounded-lg border bg-card">
          <WidgetProgress />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-8 w-48" />
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="relative overflow-hidden rounded-lg border bg-card">
          <WidgetProgress />
          <div className="p-4">
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="relative overflow-hidden rounded-lg border bg-card">
          <WidgetProgress />
          <div className="p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-7 w-32" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
            
            {/* Calendar Body */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-md" />
              ))}
            </div>
          </div>
        </div>

        {showCycleCounter && (
          <div className="fixed top-4 right-4 bg-blue-500/90 text-white px-3 py-1 rounded-md text-sm font-medium z-50">
            Cycle: {loadingCycle}
          </div>
        )}
      </div>
    )
  }

  // Default widget loading
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <WidgetProgress />
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  )
}

// Global Progress Bar Component
export const GlobalProgressBar = () => {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingCycle, setLoadingCycle] = useState(1)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prevProgress) => {
        const increment = Math.floor(Math.random() * 9) + 3
        const newProgress = prevProgress + increment
        
        if (newProgress >= 100) {
          setLoadingCycle(prev => prev + 1)
          return 0
        }
        
        return newProgress
      })
    }, 80)
    
    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-[3px] w-full bg-gray-200/30 dark:bg-gray-800/30 overflow-hidden">
        <div 
          className="h-full bg-blue-500/90 shadow-sm shadow-blue-500/20 transition-all duration-150 ease-out"
          style={{ 
            width: `${loadingProgress}%`,
            transform: `translateX(0%)` 
          }}
        />
      </div>
    </div>
  )
}
