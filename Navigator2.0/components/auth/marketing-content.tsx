"use client"

import React, { useState, useEffect, memo } from "react"
import { Activity, TrendingUp, BarChart3, MapPin, Clock, Shield, Zap, Users } from "lucide-react"

/**
 * Marketing Content Component
 * 
 * Features:
 * - Carousel-based content with 3 sections
 * - Dot navigation for page switching
 * - Auto-advance every 10 seconds with hover pause
 * - Professional branding with gradients
 * - Responsive design
 * 
 * @component
 * @version 2.0.0
 */
function MarketingContentComponent() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const totalPages = 3

  // Auto-advance pages every 10 seconds, but pause when hovered
  useEffect(() => {
    if (isHovered) {
      return // Don't start interval when hovered
    }

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages)
    }, 10000) // Changed to 10 seconds

    return () => clearInterval(interval)
  }, [isHovered])
  const features = [
    {
      icon: TrendingUp,
      title: "AI-Powered Rate Optimization",
      description: "Maximize revenue with intelligent pricing recommendations based on market conditions and competitor analysis."
    },
    {
      icon: BarChart3,
      title: "Real-time Market Intelligence",
      description: "Get instant insights into competitor rates, market trends, and demand patterns across all channels."
    },
    {
      icon: MapPin,
      title: "Geographic Performance Analysis",
      description: "Monitor performance across different locations and markets with detailed geographic insights."
    },
    {
      icon: Shield,
      title: "Rate Parity Monitoring",
      description: "Ensure rate consistency across all distribution channels with automated violation detection and alerts."
    }
  ]

  const upcomingFeatures = [
    {
      icon: Zap,
      title: "Auto-Rate Adjustments",
      description: "Coming Q2 2024",
      badge: "Soon"
    },
    {
      icon: Users,
      title: "Team Collaboration Tools",
      description: "Coming Q3 2024",
      badge: "Beta"
    },
    {
      icon: Clock,
      title: "Predictive Analytics",
      description: "Coming Q4 2024",
      badge: "Preview"
    }
  ]

  // Handle dot navigation
  const handleDotClick = (pageIndex: number) => {
    setCurrentPage(pageIndex)
  }

  // Content for each page
  const renderPage = () => {
    switch (currentPage) {
      case 0:
        return (
          <div className="space-y-8">
            {/* Brand */}
            <div>
              <h1 className="text-2xl font-medium">
                Navigator <span className="text-blue-100 text-sm font-normal">by RateGain</span>
              </h1>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-normal leading-tight">
                Transform Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300">
                  Revenue Strategy
                </span>
              </h2>
              <p className="text-base text-blue-100 leading-relaxed -mb-2.5">
                Join thousands of hoteliers who trust Navigator for intelligent rate management, 
                competitive insights, and revenue optimization.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 text-center pt-6">
              <div className="space-y-2">
                <div className="text-2xl font-medium text-white">500+</div>
                <div className="text-xs text-blue-200">Hotels Trust Us</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-medium text-white">24/7</div>
                <div className="text-xs text-blue-200">Market Monitoring</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-medium text-white">15%</div>
                <div className="text-xs text-blue-200">Avg Revenue Boost</div>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-8">
            <h3 className="text-2xl font-medium text-white">Why Choose Navigator?</h3>
            <div className="space-y-4">
              {features.slice(0, 3).map((feature, index) => (
                <div 
                  key={feature.title}
                  className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-200"
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-white/10">
                    <feature.icon className="w-5 h-5 text-blue-200" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-white text-sm">{feature.title}</h4>
                    <p className="text-xs text-blue-200 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-medium text-white">What's Coming</h3>
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-300 text-xs font-medium">
                Roadmap 2024
              </div>
            </div>
            
            <div className="space-y-4">
              {upcomingFeatures.map((feature, index) => (
                       <div
                         key={feature.title}
                         className="flex items-center justify-between p-4 rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-200"
                       >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-400/20">
                      <feature.icon className="w-5 h-5 text-yellow-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white text-sm">{feature.title}</h4>
                      <p className="text-xs text-blue-200">{feature.description}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    feature.badge === 'Soon' ? 'bg-green-500/20 text-green-300' :
                    feature.badge === 'Beta' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-purple-500/20 text-purple-300'
                  }`}>
                    {feature.badge}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Message */}
            <div className="text-center pt-6 border-t border-white/5">
              <p className="text-lg font-medium text-white/80">
                Ready to transform your revenue strategy?
              </p>
              <p className="text-sm text-blue-200 mt-2">
                Join the future of hotel rate management.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div 
      className="h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center p-6 lg:p-8 xl:p-10 text-white">
        <div className="transition-all duration-500 ease-in-out">
          {renderPage()}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center pb-8 space-x-3">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentPage
                ? 'bg-white scale-110 shadow-lg'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// Memoized export for performance optimization
export const MarketingContent = memo(MarketingContentComponent)
