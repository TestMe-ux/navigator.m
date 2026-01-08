"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { 
  HelpCircle,
  Home,
  TrendingUp,
  BarChart3,
  Globe,
  MessageCircle,
  Copy,
  Check
} from "lucide-react"
import { HelpTab } from "@/components/help-tab"

const faqItems = [
  {
    question: "How often is rate data updated?",
    answer: "Rate data is updated every 4 hours during business hours and every 8 hours during off-peak times. You can see the last update time in the header of each page."
  },
  {
    question: "What does 'rate parity' mean?",
    answer: "Rate parity means maintaining consistent pricing across all distribution channels. Our dashboard helps you monitor and maintain parity by tracking rate differences across OTAs and direct booking channels."
  },
  {
    question: "How do I interpret the demand forecast accuracy?",
    answer: "Demand forecast accuracy is calculated by comparing predicted vs. actual demand over the past 30 days. An accuracy above 85% is considered excellent for revenue management purposes."
  },
  {
    question: "Can I customize the dashboard layout?",
    answer: "Yes, you can customize widget positions, hide/show sections, and set default date ranges in the Settings menu. Your preferences are saved automatically."
  },
  {
    question: "What's the difference between ADR and RevPAR?",
    answer: "ADR (Average Daily Rate) is the average price of occupied rooms, while RevPAR (Revenue Per Available Room) factors in occupancy by dividing total room revenue by total available rooms."
  }
]

const helpTabs = [
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "contact", label: "Contact", icon: MessageCircle },
]

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState("faq")
  const [emailCopied, setEmailCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("help.rategain.com")
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy email:', err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Help Tabs Section */}
        <HelpTab 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          helpTabs={helpTabs}
        />
      
      {/* Page Header */}
      <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
                 <div>
                   {activeTab === "faq" ? (
                     <>
                       <span className="text-xl font-semibold text-foreground block mb-1">Frequently Asked Questions</span>
                       <p className="text-sm text-muted-foreground">
                         Browse our most common questions and answers.
                       </p>
                     </>
                   ) : (
                     <>
                       <span className="text-xl font-semibold text-foreground block mb-1">Contact Support</span>
                       <p className="text-sm text-muted-foreground">
                         Get help from our support team or submit a ticket.
                       </p>
                     </>
                   )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
        <div className="px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-4 py-4 md:py-6 lg:py-4">
          <div className="max-w-6xl mx-auto">
            
            {/* FAQ Tab */}
            <TabsContent value="faq" className="mt-2">
              <div className="space-y-6">
                {/* Product Tour Section */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Product Tour</h3>
                      <p className="text-sm text-muted-foreground">Start your journey with our interactive product tour</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <a 
                        href="/" 
                        className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
                            <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">Overview</h4>
                            <p className="text-xs text-muted-foreground">Dashboard overview and key metrics</p>
                          </div>
                        </div>
                      </a>
                      
                      <a 
                        href="/rate-trend" 
                        className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">Rate Trends</h4>
                            <p className="text-xs text-muted-foreground">Analyze pricing trends and patterns</p>
                          </div>
                        </div>
                      </a>
                      
                      <a 
                        href="/demand" 
                        className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
                            <BarChart3 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">Demand Forecast</h4>
                            <p className="text-xs text-muted-foreground">Predict future demand</p>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* FAQ Items */}
                <div className="space-y-4">
                  {faqItems.map((faq, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 mt-0.5">
                              <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="mt-2">
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
                        <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground leading-tight">
                          Our support team is available 24/7 across all time zones to help you succeed.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 leading-tight">
                          Please send us an email at{" "}
                          <a 
                            href="mailto:help.rategain.com" 
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                          >
                            help.rategain.com
                          </a>
                          <button
                            onClick={copyEmail}
                            className="ml-2 inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {emailCopied ? (
                              <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
      </div>
      </Tabs>
    </div>
  )
} 