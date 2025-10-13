"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  HelpCircle,
  X, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle
} from "lucide-react"

interface CoachMark {
  id: string
  title: string
  description: string
  target: string
  position: "top" | "bottom" | "left" | "right"
  category: "navigation" | "data" | "actions" | "insights" | "revenue"
  priority: number
  action?: {
    type: "click" | "hover" | "scroll"
    description: string
  }
}

const coachMarks: CoachMark[] = [
  {
    id: "welcome",
    title: "Welcome to Revenue Management Central",
    description: "This is your command center for optimizing hotel performance.\nTrack revenue KPIs, competitor rates, and market insights - all in one place to guide data-driven pricing and strategy decisions.",
    target: "[data-coach-mark='dashboard-overview']",
    position: "bottom",
    category: "navigation",
    priority: 1
  },
  {
    id: "navigation-panel",
    title: "Navigation & Collapse Panel",
    description: "Access all major revenue tools from the left menu - Rate Trends, Demand Forecast, OTA Rankings, and more.\nCollapse the panel anytime for an expanded view of your analytics workspace.",
    target: "[data-coach-mark='navigation-collapse-button']",
    position: "top",
    category: "navigation",
    priority: 2
  },
  {
    id: "revenue-kpis",
    title: "Revenue Performance KPIs",
    description: "Get a clear snapshot of your property's performance.\nReview key metrics like ADR, rate parity, and market rank, alongside local events that may impact demand and pricing opportunities.",
    target: "[data-coach-mark='kpi-cards']",
    position: "top",
    category: "data",
    priority: 3
  },
  {
    id: "rate-trends-analysis",
    title: "Rate Trends Analysis",
    description: "Compare your rates with competitors and market averages over time.\nSpot pricing gaps, monitor positioning, and uncover opportunities to adjust strategy for better competitiveness.",
    target: "[data-coach-mark='rate-trends-header']",
    position: "top",
    category: "insights",
    priority: 4
  },
  {
    id: "property-health-score",
    title: "Property Health Score",
    description: "Evaluate your channel and parity performance at a glance.\nIdentify ranking drops, or review issues - and focus on high-priority actions to protect your revenue.",
    target: "[data-coach-mark='property-health']",
    position: "top",
    category: "actions",
    priority: 5
  },
  {
    id: "market-demand-overview",
    title: "Market Demand Overview",
    description: "Understand your destination's market dynamics - analyze demand, occupancy, and ADR shifts.\nUse source market and event insights to forecast potential booking trends.",
    target: "[data-coach-mark='market-demand-header']",
    position: "top",
    category: "insights",
    priority: 6
  }
]

interface CoachMarkSystemProps {
  isVisible: boolean
  onClose: () => void
}

export function CoachMarkSystem({ isVisible, onClose }: CoachMarkSystemProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [positionStyles, setPositionStyles] = useState<any>({})

  const currentCoachMark = coachMarks[currentStep]

  // Reset to first coachmark when tour starts
  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0)
      setCompletedSteps(new Set())
      setIsPlaying(false)
      setTargetElement(null)
      
      // Clear any existing highlights
      if (typeof window !== 'undefined') {
        document.querySelectorAll('.coach-mark-highlight-spotlight').forEach(el => {
          el.classList.remove('coach-mark-highlight-spotlight')
        })
      }
    }
  }, [isVisible])

  // Use spotlight highlighting for all coach marks
  const highlightClass = "coach-mark-highlight-spotlight"

  useEffect(() => {
    if (!isVisible || !currentCoachMark) return

    const findTarget = () => {
      if (typeof window === 'undefined') return null
      
      const element = document.querySelector(currentCoachMark.target) as HTMLElement
      if (element) {
        console.log(`✅ Found target element: ${currentCoachMark.target}`, element)
        setTargetElement(element)
        
        // Only scroll into view for smaller elements, not for dashboard-overview
        if (!currentCoachMark.target.includes('dashboard-overview')) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        
        // Add spotlight highlight class
        element.classList.add(highlightClass)
        return element
      } else {
        console.warn(`❌ Could not find target element: ${currentCoachMark.target}`)
      }
      return null
    }

    // Clear previous target element
    setTargetElement(null)

    // Try to find target immediately
    const found = findTarget()
    
    if (!found) {
      // If not found, try multiple times with increasing delays
      const timeouts = [100, 300, 500, 800, 1000]
      
      timeouts.forEach((delay, index) => {
        setTimeout(() => {
          if (!targetElement) { // Only try if we haven't found it yet
            const element = findTarget()
            if (element) {
              console.log(`✅ Found target element after ${delay}ms delay`)
            } else if (index === timeouts.length - 1) {
              // Last attempt failed, log for debugging
              console.warn(`⚠️ Could not find target element: ${currentCoachMark.target}`)
              // Set a flag to use fallback positioning
              setTargetElement(null)
            }
          }
        }, delay)
      })
    }

    return () => {
      // Remove spotlight highlight class from all elements
      if (typeof window !== 'undefined') {
        document.querySelectorAll('.coach-mark-highlight-spotlight').forEach(el => {
          el.classList.remove('coach-mark-highlight-spotlight')
        })
      }
    }
  }, [currentStep, isVisible, currentCoachMark, targetElement])

  // Update position on scroll
  useEffect(() => {
    if (!isVisible || !targetElement) return

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect()
      const styles = calculatePositionStyles(rect)
      setPositionStyles(styles)
    }

    // Initial position calculation
    updatePosition()

    // Add scroll listener
    window.addEventListener('scroll', updatePosition, { passive: true })
    window.addEventListener('resize', updatePosition, { passive: true })

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isVisible, targetElement, currentCoachMark])

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      if (currentStep < coachMarks.length - 1) {
        handleNext()
      } else {
        setIsPlaying(false)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [isPlaying, currentStep])

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    if (currentStep < coachMarks.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkipToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const handleClose = () => {
    setIsPlaying(false)
    if (typeof window !== 'undefined') {
      document.querySelectorAll('.coach-mark-highlight-spotlight').forEach(el => {
        el.classList.remove('coach-mark-highlight-spotlight')
      })
    }
    onClose()
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setCompletedSteps(new Set())
    setIsPlaying(false)
  }

  const calculatePositionStyles = (rect: DOMRect) => {
    if (!targetElement) {
      // Fallback positioning - show in center of screen
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999
      }
    }

    const styles: any = {
      position: 'fixed',
      zIndex: 9999
    }

    // Special handling for dashboard-overview elements (coachmarks 1 & 7)
    // Always center them regardless of position setting
    if (currentCoachMark.target.includes('dashboard-overview')) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999
      }
    }

    // Standard positioning for normal-sized elements using viewport coordinates
    switch (currentCoachMark.position) {
      case 'top':
        styles.top = `${rect.top - 20}px`
        // Special handling for navigation-panel coachmark - align left
        if (currentCoachMark.id === 'navigation-panel') {
          // Check if navigation is collapsed (button width is very small)
          if (rect.width < 100) {
            // For collapsed state, position above and left-aligned
            styles.left = `${rect.left}px`
            styles.transform = 'translate(0, -100%)'
            styles.top = `${rect.top - 20}px`
          } else {
            // For expanded state, position above and left-aligned
            styles.left = `${rect.left}px`
            styles.transform = 'translate(0, -100%)'
          }
        } else {
          styles.left = `${rect.left + rect.width / 2}px`
          styles.transform = 'translate(-50%, -100%)'
        }
        break
      case 'bottom':
        styles.top = `${rect.bottom + 20}px`
        styles.left = `${rect.left + rect.width / 2}px`
        styles.transform = 'translateX(-50%)'
        break
      case 'left':
        styles.top = `${rect.top + rect.height / 2}px`
        styles.left = `${rect.left - 20}px`
        styles.transform = 'translate(-100%, -50%)'
        break
      case 'right':
        // Special handling for navigation items
        if (currentCoachMark.target.includes('navigation-items')) {
          styles.top = `${rect.top + rect.height / 2}px`
          styles.left = `${rect.right + 30}px`
          styles.transform = 'translateY(-50%)'
        } else {
          styles.top = `${rect.top + rect.height / 2}px`
          styles.left = `${rect.right + 20}px`
        styles.transform = 'translateY(-50%)'
        }
        break
    }

    return styles
  }

  const getPositionStyles = () => {
    // Use the state-based position styles that update on scroll
    return positionStyles
  }

  // COMMENTED OUT: Category functions no longer needed since tags are removed
  /*
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation': return <Target className="h-4 w-4" />
      case 'data': return <Eye className="h-4 w-4" />
      case 'actions': return <MousePointer className="h-4 w-4" />
      case 'insights': return <Lightbulb className="h-4 w-4" />
      case 'revenue': return <Target className="h-4 w-4" />
      default: return <HelpCircle className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'data': return 'bg-green-50 text-green-700 border-green-200'
      case 'actions': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'insights': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'revenue': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      default: return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }
  */

  if (!isVisible || !currentCoachMark) return null

  return (
    <>
      {/* Grey Overlay for Welcome Coachmark */}
      {currentStep === 0 && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998] pointer-events-none"
          style={{ zIndex: 9998 }}
        />
      )}

      {/* CSS Styles for Coach Mark */}
      <style jsx global>{`
        .coach-mark-highlight-spotlight {
          outline: 2px solid #1d4ed8 !important;
          outline-offset: 4px !important;
          border-radius: 8px !important;
          position: relative !important;
          z-index: 1000 !important;
        }
        
        /* White background for navigation items with consistent outline */
        .coach-mark-highlight-spotlight[data-coach-mark="navigation-items"] {
          background: rgba(255, 255, 255, 0.95) !important;
          outline: 2px solid #1d4ed8 !important;
          outline-offset: 4px !important;
          border-radius: 8px !important;
          position: relative !important;
          z-index: 1000 !important;
          box-shadow: 0 4px 12px rgba(29, 78, 216, 0.15) !important;
          backdrop-filter: blur(4px) !important;
        }
        
        .coach-mark-card {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          z-index: 9999 !important;
          position: fixed !important;
          pointer-events: auto !important;
        }
        
        /* Ensure all card content is above everything and fully interactive */
        .coach-mark-card * {
          z-index: 9999 !important;
          position: relative !important;
          pointer-events: auto !important;
        }
        
        /* Force all buttons to be fully clickable */
        .coach-mark-card button {
          z-index: 10000 !important;
          pointer-events: auto !important;
          position: relative !important;
        }
        
        /* Ensure card content is always interactive */
        .coach-mark-card .card-content {
          pointer-events: auto !important;
          z-index: 10000 !important;
        }
      `}</style>


      {/* Coach Mark Card */}
      <Card 
        className="coach-mark-card max-w-lg shadow-2xl border-2 border-blue-600 dark:border-blue-500 pointer-events-auto bg-white dark:bg-slate-900"
        style={getPositionStyles()}
      >
        <CardContent className="p-4 pointer-events-auto">
          {/* Content */}
          <div className="space-y-3">
            {/* Title with Cancel Button */}
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-foreground text-sm flex-1 pr-2">
                {currentCoachMark.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0 pointer-events-auto flex-shrink-0"
                style={{ zIndex: 10000 }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pb-5 whitespace-pre-line">
              {currentCoachMark.description}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="h-7 px-2 pointer-events-auto"
                style={{ zIndex: 10000 }}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {currentStep + 1} of {coachMarks.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="h-7 px-3 text-xs pointer-events-auto"
                style={{ zIndex: 10000 }}
              >
                Skip Tour
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                className="h-7 px-3 text-xs pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white"
                style={{ zIndex: 10000 }}
              >
                {currentStep === coachMarks.length - 1 ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Indicators */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto" style={{ zIndex: 9998 }}>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-full px-4 py-2 shadow-lg border pointer-events-auto">
          {coachMarks.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSkipToStep(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 pointer-events-auto hover:scale-110 ${
                index === currentStep
                  ? 'bg-blue-600 scale-125'
                  : completedSteps.has(index)
                  ? 'bg-emerald-500'
                  : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
              }`}
              title={`Step ${index + 1}: ${coachMarks[index].title}`}
              style={{ zIndex: 10000 }}
            />
          ))}
        </div>
      </div>
    </>
  )
}

// Global Coach Mark Trigger Button
export function CoachMarkTrigger() {
  const [showCoachMarks, setShowCoachMarks] = useState(false)

  const handleStartTour = () => {
    setShowCoachMarks(true)
  }

  const handleCloseTour = () => {
    setShowCoachMarks(false)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('revenue-dashboard-tour-completed', 'true')
        localStorage.setItem('revenue-dashboard-tour-version', '2.1')
      } catch (error) {
        console.warn('Failed to save coach mark completion status:', error)
      }
    }
  }

  return (
    <>
      {/* Revenue Manager Tour Button - Clean with black tooltip */}
      <div className="fixed bottom-6 right-6 z-50 group">
          <Button
          onClick={handleStartTour}
            className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 hover:border-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-600 dark:hover:border-slate-500"
            size="sm"
          >
            <HelpCircle className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </Button>
          
          {/* Black Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            Start Product Tour for Overview page
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
          </div>
      </div>

      {/* Coach Mark System */}
      <CoachMarkSystem 
        isVisible={showCoachMarks} 
        onClose={handleCloseTour}
      />
    </>
  )
} 