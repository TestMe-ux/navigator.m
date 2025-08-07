"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  BookOpen, 
  Video, 
  FileText, 
  MessageCircle, 
  HelpCircle,
  TrendingUp,
  BarChart3,
  Calendar,
  Shield,
  Users,
  Settings,
  ChevronRight,
  Clock,
  Star,
  Download,
  ExternalLink,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Play,
  Bookmark,
  Headphones,
  Globe,
  Award,
  X
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { SupportTicketForm } from "@/components/navigator/support-ticket-form"

interface KnowledgeArticle {
  id: string
  title: string
  description: string
  category: string
  readTime: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  tags: string[]
  type: "article" | "video" | "guide" | "faq"
  popular?: boolean
  new?: boolean
  fullContent?: string
}

interface VideoTutorial {
  id: string
  title: string
  description: string
  duration: string
  thumbnail: string
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
}

const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: "1",
    title: "Getting Started with Rate Parity Dashboard",
    description: "Complete guide to understanding your dashboard and key metrics",
    category: "Getting Started",
    readTime: "5 min",
    difficulty: "Beginner",
    tags: ["dashboard", "overview", "basics"],
    type: "guide",
    popular: true,
    new: true,
    fullContent: `
# Getting Started with Rate Parity Dashboard

Welcome to your comprehensive rate parity dashboard! This guide will walk you through all the essential features and help you maximize your revenue management efficiency.

## Overview

The Rate Parity Dashboard is designed to give you complete visibility into your pricing strategy across all distribution channels. With real-time data and advanced analytics, you can make informed decisions that drive revenue growth.

## Key Sections

### 1. Revenue Dashboard (Overview)
Your main dashboard provides a bird's-eye view of your property's performance:

- **Revenue Insights**: Critical alerts about rate parity violations, demand surges, and market movements
- **KPI Cards**: Essential metrics like occupancy, ADR, RevPAR, and parity score
- **Rate Trends Analysis**: Interactive charts showing your rates compared to competitors
- **Market Demand**: Source market analysis and local events impact

### 2. Rate Trends Page
Deep dive into competitive analysis:

- **Rate Chart**: Visual comparison of your rates vs competitors over time
- **Channel Analysis**: Performance breakdown by distribution channel
- **Calendar View**: Day-by-day rate positioning analysis

### 3. Demand Page
Understand demand patterns:

- **Demand Calendar**: Visual representation of demand levels
- **Booking Pace**: Track how bookings are trending vs historical data
- **Occupancy Forecasts**: Predict future occupancy levels

## Getting Started Steps

### Step 1: Set Your Date Range
Use the date picker in the top navigation to select your analysis period. Most views default to the next 30 days, but you can adjust based on your needs.

### Step 2: Configure Alerts
Navigate to the alerts section to set up automated notifications for:
- Rate parity violations
- Significant competitor rate changes
- Demand surge alerts
- Market opportunity notifications

### Step 3: Understand Your Metrics

**Key Performance Indicators:**
- **Occupancy Rate**: Percentage of rooms sold vs available
- **Average Daily Rate (ADR)**: Average price per occupied room
- **Revenue Per Available Room (RevPAR)**: Total room revenue ÷ total rooms available
- **Parity Score**: Percentage of time your rates match or beat competitor rates

### Step 4: Monitor Competitor Performance
The Rate Trends section shows how your property compares to up to 10 competitors. Use the visibility controls to focus on your most important competitive set.

### Step 5: Leverage Market Intelligence
The Market Demand widget shows:
- Source market performance
- Local events and their impact
- Holiday and seasonal demand patterns

## Best Practices

### Daily Routine
1. Check Revenue Insights for any critical alerts
2. Review overnight rate changes in Rate Trends
3. Monitor upcoming demand patterns
4. Adjust rates based on competitive positioning

### Weekly Review
1. Analyze weekly performance trends
2. Review competitor pricing strategies
3. Plan for upcoming events and seasonality
4. Optimize channel performance

### Monthly Analysis
1. Evaluate overall competitive positioning
2. Assess source market performance
3. Review and adjust alerting thresholds
4. Plan strategic pricing initiatives

## Advanced Features

### Custom Date Ranges
Click on any chart to drill down into specific time periods and analyze performance in detail.

### Export Functionality
All charts and data tables can be exported for further analysis or reporting to stakeholders.

### Filter Controls
Use the advanced filter sidebar to focus on specific room types, market segments, or booking channels.

## Troubleshooting

**Common Issues:**

1. **Data Not Loading**: Check your date range selection and ensure you have proper access permissions
2. **Missing Competitor Data**: Some competitors may not update rates regularly - this is normal
3. **Alert Overload**: Adjust your alert thresholds in settings to reduce noise

## Next Steps

Now that you understand the basics, explore these advanced topics:
- Setting up automated pricing rules
- Creating custom competitive sets
- Building stakeholder reports
- Integrating with your PMS system

## Support

If you need additional help:
- Check our FAQ section for common questions
- Watch video tutorials for visual guides
- Contact our 24/7 support team for personalized assistance

Remember: The key to successful revenue management is consistent monitoring and quick response to market changes. Your dashboard provides all the tools you need to stay ahead of the competition!
    `
  },
  {
    id: "2",
    title: "Understanding Rate Spread Analysis",
    description: "Learn how to interpret rate spread charts and competitive positioning",
    category: "Rate Management",
    readTime: "8 min",
    difficulty: "Intermediate",
    tags: ["rates", "competition", "analysis"],
    type: "article",
    popular: true
  },
  {
    id: "3",
    title: "Demand Forecasting Best Practices",
    description: "Strategies for accurate demand prediction and revenue optimization",
    category: "Demand Management",
    readTime: "12 min",
    difficulty: "Advanced",
    tags: ["forecasting", "demand", "strategy"],
    type: "guide"
  },
  {
    id: "4",
    title: "Setting Up Rate Alerts",
    description: "Configure automated alerts for rate changes and market movements",
    category: "Alerts & Notifications",
    readTime: "6 min",
    difficulty: "Beginner",
    tags: ["alerts", "automation", "monitoring"],
    type: "article"
  },
  {
    id: "5",
    title: "Competitor Analysis Deep Dive",
    description: "Advanced techniques for competitive intelligence and positioning",
    category: "Competitive Intelligence",
    readTime: "15 min",
    difficulty: "Advanced",
    tags: ["competition", "intelligence", "strategy"],
    type: "guide",
    popular: true
  },
  {
    id: "6",
    title: "Export and Reporting Features",
    description: "How to generate and customize reports for stakeholders",
    category: "Reporting",
    readTime: "7 min",
    difficulty: "Intermediate",
    tags: ["reports", "export", "data"],
    type: "article"
  }
]

const videoTutorials: VideoTutorial[] = [
  {
    id: "v1",
    title: "Dashboard Overview - 5 Minute Tour",
    description: "Quick walkthrough of all dashboard features and navigation",
    duration: "5:23",
    thumbnail: "/api/placeholder/320/180",
    category: "Getting Started",
    difficulty: "Beginner"
  },
  {
    id: "v2",
    title: "Rate Trends Analysis Masterclass",
    description: "Deep dive into rate trend analysis and interpretation",
    duration: "18:45",
    thumbnail: "/api/placeholder/320/180",
    category: "Rate Management",
    difficulty: "Advanced"
  },
  {
    id: "v3",
    title: "Setting Up Your First Rate Alert",
    description: "Step-by-step guide to configuring rate monitoring alerts",
    duration: "8:12",
    thumbnail: "/api/placeholder/320/180",
    category: "Alerts & Notifications",
    difficulty: "Beginner"
  }
]

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

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showSupportForm, setShowSupportForm] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null)

  const categories = [
    "all",
    "Getting Started",
    "Rate Management", 
    "Demand Management",
    "Competitive Intelligence",
    "Alerts & Notifications",
    "Reporting"
  ]

  const filteredArticles = knowledgeArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4" />
      case "guide": return <BookOpen className="w-4 h-4" />
      case "article": return <FileText className="w-4 h-4" />
      case "faq": return <HelpCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      case "Intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
      case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      
      {/* Enhanced Header Section */}
      <section className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 lg:py-12">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950 dark:to-purple-950">
                  <HelpCircle className="w-8 h-8 lg:w-10 lg:h-10 text-brand-600 dark:text-brand-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground">Help & Support Center</h1>
                <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Find answers, tutorials, and expert guidance to maximize your revenue management success
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Quick Stats */}
      <section className="w-full bg-gradient-to-r from-slate-50/80 to-blue-50/60 dark:from-slate-900/80 dark:to-slate-800/60 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
          <div className="max-w-7xl xl:max-w-none mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
              
              <Card className="card-minimal hover:shadow-lg transition-all duration-200 group">
                <CardContent className="p-4 xl:p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/40 transition-colors">
                      <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">Articles</span>
                  </div>
                  <div className="text-2xl xl:text-3xl font-black text-foreground tracking-tight">24</div>
                </CardContent>
              </Card>

              <Card className="card-minimal hover:shadow-lg transition-all duration-200 group">
                <CardContent className="p-4 xl:p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                      <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">Videos</span>
                  </div>
                  <div className="text-2xl xl:text-3xl font-black text-foreground tracking-tight">12</div>
                </CardContent>
              </Card>

              <Card className="card-minimal hover:shadow-lg transition-all duration-200 group">
                <CardContent className="p-4 xl:p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/40 transition-colors">
                      <Headphones className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">Support</span>
                  </div>
                  <div className="text-2xl xl:text-3xl font-black text-foreground tracking-tight">24/7</div>
                </CardContent>
              </Card>

              <Card className="card-minimal hover:shadow-lg transition-all duration-200 group">
                <CardContent className="p-4 xl:p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
                      <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">Satisfaction</span>
                  </div>
                  <div className="text-2xl xl:text-3xl font-black text-foreground tracking-tight">98%</div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 lg:py-8 xl:py-10">
        <div className="max-w-7xl xl:max-w-none mx-auto space-y-6 lg:space-y-8">

          {/* Enhanced Search Section */}
          <section className="w-full">
            <Card className="card-elevated">
              <CardContent className="p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search articles, guides, and tutorials..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 text-base"
                    />
                  </div>
                  <Button 
                    onClick={() => setShowSupportForm(true)}
                    className="h-12 px-6 lg:px-8 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Enhanced Tabs Section */}
          <section className="w-full">
            <Tabs defaultValue="articles" className="w-full">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <TabsList className="grid grid-cols-4 lg:w-auto h-12">
                  <TabsTrigger value="articles" className="text-sm font-medium">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Articles
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="text-sm font-medium">
                    <Video className="w-4 h-4 mr-2" />
                    Videos
                  </TabsTrigger>
                  <TabsTrigger value="faq" className="text-sm font-medium">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    FAQ
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="text-sm font-medium">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact
                  </TabsTrigger>
                </TabsList>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-xs"
                    >
                      {category === "all" ? "All Categories" : category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Articles Tab */}
              <TabsContent value="articles" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredArticles.map((article) => (
                    <div key={article.id}>
                      {article.fullContent ? (
                        // Clickable article with full content
                        <Dialog>
                          <DialogTrigger asChild>
                            <Card className="card-minimal hover:shadow-lg transition-all duration-200 group cursor-pointer">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
                                      {getTypeIcon(article.type)}
                                    </div>
                                    <Badge className={getDifficultyColor(article.difficulty)}>
                                      {article.difficulty}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {article.popular && <Star className="w-4 h-4 text-amber-500" />}
                                    {article.new && <Badge variant="secondary" className="text-xs">New</Badge>}
                                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 text-xs">
                                      Full Guide
                                    </Badge>
                                  </div>
                                </div>
                                <CardTitle className="text-lg font-semibold text-foregroup-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                  {article.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {article.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {article.readTime}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <BookOpen className="w-3 h-3" />
                                      {article.category}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
                                    <span className="text-xs font-medium">Read Full Guide</span>
                                    <ChevronRight className="w-4 h-4" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold text-foreground">
                                {article.title}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                              <div className="flex items-center gap-4 mb-6">
                                <Badge className={getDifficultyColor(article.difficulty)}>
                                  {article.difficulty}
                                </Badge>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  {article.readTime}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <BookOpen className="w-4 h-4" />
                                  {article.category}
                                </div>
                              </div>
                              <div className="prose prose-slate dark:prose-invert max-w-none">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {article.fullContent}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        // Regular article card without full content
                        <Card className="card-minimal hover:shadow-lg transition-all duration-200 group cursor-pointer">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
                                  {getTypeIcon(article.type)}
                                </div>
                                <Badge className={getDifficultyColor(article.difficulty)}>
                                  {article.difficulty}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                {article.popular && <Star className="w-4 h-4 text-amber-500" />}
                                {article.new && <Badge variant="secondary" className="text-xs">New</Badge>}
                              </div>
                            </div>
                            <CardTitle className="text-lg font-semibold text-foregroup-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                              {article.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {article.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {article.readTime}
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  {article.category}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Videos Tab */}
              <TabsContent value="videos" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {videoTutorials.map((video) => (
                    <Card key={video.id} className="card-minimal hover:shadow-lg transition-all duration-200 group cursor-pointer">
                      <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-t-lg relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="p-4 rounded-full bg-white/90 dark:bg-slate-900/90 group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
                          {video.duration}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge className={getDifficultyColor(video.difficulty)}>
                              {video.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {video.category}
                            </Badge>
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                              {video.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {video.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* FAQ Tab */}
              <TabsContent value="faq" className="space-y-4">
                {faqItems.map((faq, index) => (
                  <Card key={index} className="card-minimal">
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
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="card-elevated">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Submit a Support Ticket
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SupportTicketForm />
                    </CardContent>
                  </Card>
                  
                  <div className="space-y-6">
                    <Card className="card-minimal">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
                            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="font-semibold text-foreground">Global Support</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Our support team is available 24/7 across all time zones to help you succeed.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="card-minimal">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <h3 className="font-semibold text-foreground">Quick Response</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Average response time under 2 hours for critical issues, 24 hours for general inquiries.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  )
} 