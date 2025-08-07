"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  Paperclip, 
  AlertTriangle, 
  Info, 
  Bug, 
  HelpCircle,
  Lightbulb,
  CheckCircle,
  Upload,
  X
} from "lucide-react"

interface SupportTicket {
  subject: string
  category: string
  priority: string
  description: string
  email: string
  attachments: File[]
}

export function SupportTicketForm() {
  const [ticket, setTicket] = useState<SupportTicket>({
    subject: "",
    category: "",
    priority: "medium",
    description: "",
    email: "",
    attachments: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const categories = [
    { value: "technical", label: "Technical Issue", icon: Bug, color: "text-red-600" },
    { value: "feature", label: "Feature Request", icon: Lightbulb, color: "text-blue-600" },
    { value: "data", label: "Data Question", icon: Info, color: "text-green-600" },
    { value: "account", label: "Account & Billing", icon: HelpCircle, color: "text-purple-600" },
    { value: "training", label: "Training & Support", icon: HelpCircle, color: "text-amber-600" }
  ]

  const priorities = [
    { value: "low", label: "Low", color: "bg-slate-100 text-slate-700" },
    { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-700" },
    { value: "high", label: "High", color: "bg-amber-100 text-amber-700" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" }
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setTicket(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeAttachment = (index: number) => {
    setTicket(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <Card className="card-enhanced">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-950">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Ticket Submitted Successfully!</h3>
              <p className="text-muted-foreground mb-4">
                Your support ticket has been created. You'll receive a confirmation email shortly.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-4">
                <div className="text-sm">
                  <strong>Ticket ID:</strong> <span className="font-mono">#RM-{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
                </div>
                <div className="text-sm mt-1">
                  <strong>Expected Response:</strong> Within 2-4 hours
                </div>
              </div>
              <Button onClick={() => setIsSubmitted(false)} variant="outline">
                Submit Another Ticket
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
          <Send className="h-5 w-5 text-brand-600" />
          Create Support Ticket
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Describe your issue and we'll get back to you as soon as possible
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@hotel.com"
              value={ticket.email}
              onChange={(e) => setTicket(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief description of your issue"
              value={ticket.subject}
              onChange={(e) => setTicket(prev => ({ ...prev, subject: e.target.value }))}
              required
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={ticket.category} onValueChange={(value) => setTicket(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${category.color}`} />
                          {category.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={ticket.priority} onValueChange={(value) => setTicket(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <Badge className={`text-xs ${priority.color}`}>
                        {priority.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
              value={ticket.description}
              onChange={(e) => setTicket(prev => ({ ...prev, description: e.target.value }))}
              rows={6}
              required
            />
            <p className="text-sm text-muted-foreground">
              Include as much detail as possible to help us resolve your issue quickly
            </p>
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments (Optional)</Label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4">
              <div className="text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                if (typeof window !== 'undefined') {
                  document.getElementById('file-upload')?.click()
                }
              }}
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Supported: JPG, PNG, PDF, DOC, TXT (Max 10MB each)
                </p>
              </div>
            </div>

            {/* Attachment List */}
            {ticket.attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Attached Files:</Label>
                {ticket.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Tips for faster resolution:
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Include screenshots or error messages if applicable</li>
                  <li>• Mention which browser and device you're using</li>
                  <li>• Describe what you were trying to accomplish</li>
                  <li>• Include the date/time when the issue occurred</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || !ticket.subject || !ticket.description || !ticket.email}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Ticket
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 