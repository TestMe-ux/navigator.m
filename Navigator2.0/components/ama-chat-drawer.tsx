"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Send, X, Sparkles, Info, BarChart3, Target, Zap, ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserDetail } from "@/hooks/use-local-storage"
import { sendAMAChatMessage } from "@/lib/ama-chat"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isError?: boolean
}

interface AMAChatDrawerProps {
  className?: string
}

export function AMAChatDrawer({ className }: AMAChatDrawerProps) {
  const [userDetail] = useUserDetail()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const [expandedCategory, setExpandedCategory] = useState<string | null>("rate")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input.trim()
    setInput("")
    setIsLoading(true)

    try {
      // Call Streamlit API
      const response = await sendAMAChatMessage({
        message: currentInput,
        conversationId: conversationId,
        userId: userDetail?.userId?.toString(),
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        isError: response.isError || false,
      }

      setMessages((prev) => [...prev, assistantMessage])
      
      // Update conversation ID if provided
      if (response.conversationId) {
        setConversationId(response.conversationId)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting to the service. Please try again later.",
        timestamp: new Date(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }


  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "bg-gradient-to-r from-purple-600 to-blue-600 hover:brightness-110 text-white hover:text-white font-medium relative transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 h-auto rounded-full shadow-lg border-2 border-white/30 hover:border-white/50 backdrop-blur-sm mx-4",
            className
          )}
        >
          <Sparkles className="h-4 w-4 text-white hover:text-white" />
          <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wide text-white hover:text-white">Lens</span>
          <span className="absolute -top-1.5 right-[-26px] bg-amber-500 text-white text-[10px] font-semibold px-1.5 py-1 rounded-[2px] leading-none">
            BETA
          </span>
          <span className="sr-only">Open AI Assistant</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="!w-[1080px] sm:!w-[1200px] p-0 flex flex-col"
        style={{ width: "1080px", minWidth: "1080px", maxWidth: "1080px" }}
      >
        {/* Main Content Area - Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Messages Container - Left Side */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Custom Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0 mt-[60px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Lens - AI Assistant
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative group"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      Close
                    </div>
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
              <div className="mb-6 p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2 max-w-md">
                <p className="text-base font-medium text-gray-800 dark:text-gray-200">
                  Ask anything about rates, demand, parity, or strategy.
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Get instant insights from your Navigator data — compare rates, track demand shifts, detect parity issues, and uncover pricing opportunities using natural language.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2.5 shadow-sm",
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : message.isError
                    ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                    : "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                )}
              >
                <p className={cn(
                  "text-sm leading-relaxed whitespace-pre-wrap",
                  message.isError && "font-medium"
                )}>
                  {message.content}
                </p>
                <p
                  className={cn(
                    "text-xs mt-1.5",
                    message.role === "user"
                      ? "text-blue-100"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>

              {message.role === "user" && (
                <Avatar className="h-6 w-6 flex-shrink-0 flex items-center justify-center">
                  <AvatarImage 
                    src={userDetail?.imagePath} 
                    alt={`${userDetail?.firstName} ${userDetail?.lastName}`}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium flex items-center justify-center">
                    {userDetail?.firstName?.[0] || userDetail?.lastName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 shadow-sm">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
            </>
          )}
            </div>

            {/* Input Area - Inside Chat Container */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
              <div className="flex gap-2 items-end">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus:border-gray-300 dark:focus:border-gray-600 resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = `${Math.min(target.scrollHeight, 120)}px`
                  }}
                />
                <div className="relative group">
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600 disabled:opacity-70 text-white px-4"
                  >
                    <Send className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span className="sr-only">Send message</span>
                  </Button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 text-center leading-tight whitespace-nowrap">
                    Press Enter to send,<br />Shift+Enter for new line
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1">
                Lens can make mistakes. We doesn't use your data to train AI models.
              </p>
            </div>
          </div>

          {/* Quick Help Sidebar - Right Side */}
          {isSidebarVisible && (
            <div className="w-[336px] flex-shrink-0 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 pt-4">
                  {/* Sticky Hide Button */}
                  <div className="sticky top-[80px] z-10 flex items-start justify-end mb-4 pr-4">
                    <button
                      onClick={() => setIsSidebarVisible(false)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors relative group"
                      aria-label="Hide Suggestions"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      {/* Tooltip */}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        Hide Suggestions
                      </div>
                    </button>
                  </div>
                  {/* Ask Anything Section */}
                  <div className="mb-4 mt-[38px]">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Ask anything about rates, demand, <br/>parity, or strategy.</h3>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      Get instant insights from your Navigator data — compare rates, track demand shifts, detect parity issues, and uncover pricing opportunities using natural language.
                    </p>
                  </div>

                  {/* Sample Prompts Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-black dark:text-white mb-3">Sample Prompts</h3>
                    
                    {/* Categories */}
                    <div className="space-y-3">
                      {/* Rate Category */}
                      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg px-3 pt-3 pb-1">
                        <div 
                          onClick={() => setExpandedCategory(expandedCategory === "rate" ? null : "rate")}
                          className="flex items-center gap-2 mb-2 cursor-pointer"
                        >
                          {expandedCategory === "rate" ? (
                            <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          )}
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Rate Analytics</h4>
                        </div>
                        {expandedCategory === "rate" && (
                          <div className="mt-2">
                            {[
                              "How do my rates compare to my compset for the next 14 days, specifically for Deluxe King rooms?",
                              "Who increased rates after my last change yesterday?",
                              "Which competitor is the price leader for the upcoming weekend?",
                              "What is the price gap between us and Marriott Downtown next Saturday?",
                              "Show the dates in the next 30 days where we are the most expensive in the compset."
                            ].map((prompt, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation() // Prevent category collapse when clicking a prompt
                                  setInput(prompt)
                                  inputRef.current?.focus()
                                }}
                                className="w-full text-left p-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors flex items-start gap-2 group"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500 group-hover:bg-gray-600 dark:group-hover:bg-gray-300 mt-1.5 flex-shrink-0 transition-colors"></span>
                                <span className="flex-1 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{prompt}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Demand Category */}
                      <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg px-3 pt-3 pb-1">
                        <div 
                          onClick={() => setExpandedCategory(expandedCategory === "demand" ? null : "demand")}
                          className="flex items-center gap-2 mb-2 cursor-pointer"
                        >
                          {expandedCategory === "demand" ? (
                            <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          )}
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Demand Analytics</h4>
                        </div>
                        {expandedCategory === "demand" && (
                          <div className="mt-2">
                            {[
                              "Which dates in December have high demand but our rates are still below compset average?",
                              "Is demand picking up for next week compared to last week?",
                              "Are there any large events in Atlanta next month impacting demand and rates?",
                              "Which future dates (next 45 days) show rising demand but stagnant pricing?",
                              "Identify low-demand dates where we are overpriced vs compset."
                            ].map((prompt, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation() // Prevent category collapse when clicking a prompt
                                  setInput(prompt)
                                  inputRef.current?.focus()
                                }}
                                className="w-full text-left p-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors flex items-start gap-2 group"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500 group-hover:bg-gray-600 dark:group-hover:bg-gray-300 mt-1.5 flex-shrink-0 transition-colors"></span>
                                <span className="flex-1 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{prompt}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Parity Category */}
                      <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg px-3 pt-3 pb-1">
                        <div 
                          onClick={() => setExpandedCategory(expandedCategory === "parity" ? null : "parity")}
                          className="flex items-center gap-2 mb-2 cursor-pointer"
                        >
                          {expandedCategory === "parity" ? (
                            <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          )}
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Parity Analytics</h4>
                        </div>
                        {expandedCategory === "parity" && (
                          <div className="mt-2">
                            {[
                              "Am I currently in parity across all OTAs for Premium King room type?",
                              "Which OTA has the highest parity violations this week for my property?",
                              "Show channels where my rates are lower on OTA today.",
                              "Where is Booking.com undercutting Expedia and Brand.com by more than 5%?",
                              "Show parity trends by OTA for the last 30 days."
                            ].map((prompt, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation() // Prevent category collapse when clicking a prompt
                                  setInput(prompt)
                                  inputRef.current?.focus()
                                }}
                                className="w-full text-left p-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors flex items-start gap-2 group"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500 group-hover:bg-gray-600 dark:group-hover:bg-gray-300 mt-1.5 flex-shrink-0 transition-colors"></span>
                                <span className="flex-1 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{prompt}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Market Dynamics & Pricing Trends Category */}
                      <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg px-3 pt-3 pb-1">
                        <div 
                          onClick={() => setExpandedCategory(expandedCategory === "marketDynamics" ? null : "marketDynamics")}
                          className="flex items-center gap-2 mb-2 cursor-pointer"
                        >
                          {expandedCategory === "marketDynamics" ? (
                            <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          )}
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Market Dynamics & Pricing Trends</h4>
                        </div>
                        {expandedCategory === "marketDynamics" && (
                          <div className="mt-2">
                            {[
                              "Which dates in the next 30 days show strong demand signals and noticeable rate changes across the compset?",
                              "Show the dates where we are priced significantly above or below the compset, and how pricing trends have shifted over the last 7 days.",
                              "Where are parity violations overlapping with large pricing gaps vs competitors in the next 14 days?",
                              "Which competitors are leading price changes before key event periods, and how frequently have they adjusted rates recently?",
                              "What were the biggest week-over-week price spikes or drops across the compset and which channels were most affected?"
                            ].map((prompt, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation() // Prevent category collapse when clicking a prompt
                                  setInput(prompt)
                                  inputRef.current?.focus()
                                }}
                                className="w-full text-left p-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors flex items-start gap-2 group"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500 group-hover:bg-gray-600 dark:group-hover:bg-gray-300 mt-1.5 flex-shrink-0 transition-colors"></span>
                                <span className="flex-1 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{prompt}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Show Sidebar Button - When Hidden */}
          {!isSidebarVisible && (
            <div className="flex-shrink-0 flex items-start justify-center border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 pt-[80px]">
              <button
                onClick={() => setIsSidebarVisible(true)}
                className="p-2 mx-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors relative group"
                aria-label="Show Suggestions"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                {/* Tooltip */}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Show Suggestions
                </div>
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

