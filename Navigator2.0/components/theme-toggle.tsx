"use client"

import { Moon, Sun, Monitor, Palette } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"

/**
 * Enhanced Theme Toggle Component
 * 
 * A professional theme switcher with:
 * - Smooth icon transitions and animations
 * - System theme detection
 * - Enhanced visual feedback
 * - Accessible design with proper ARIA labels
 * - Professional styling for header integration
 * 
 * @component
 * @version 2.0.0
 */
export function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-200"
        disabled
      >
        <div className="h-[1.2rem] w-[1.2rem] animate-pulse bg-white/20 rounded" />
        <span className="sr-only">Loading theme toggle</span>
      </Button>
    )
  }

  /**
   * Get the current effective theme
   * Resolves 'system' theme to actual light/dark value
   */
  const effectiveTheme = theme === 'system' ? systemTheme : theme

  /**
   * Get theme-specific styling and content
   */
  const getThemeIcon = () => {
    switch (effectiveTheme) {
      case 'dark':
        return <Moon className="h-[1.2rem] w-[1.2rem] text-blue-100 transition-all duration-300 rotate-0 scale-100" />
      case 'light':
        return <Sun className="h-[1.2rem] w-[1.2rem] text-blue-100 transition-all duration-300 rotate-0 scale-100" />
      default:
        return <Monitor className="h-[1.2rem] w-[1.2rem] text-blue-100 transition-all duration-300 rotate-0 scale-100" />
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'dark':
        return 'Dark Mode'
      case 'light':
        return 'Light Mode'
      case 'system':
        return `System (${effectiveTheme === 'dark' ? 'Dark' : 'Light'})`
      default:
        return 'Theme'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-200 relative group"
          aria-label={`Current theme: ${getThemeLabel()}. Click to change theme.`}
        >
          {getThemeIcon()}
          
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 rounded-md bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          
          <span className="sr-only">Toggle theme - Current: {getThemeLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-brand-lg min-w-[180px]"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
          <div className="flex items-center gap-2">
            <Palette className="h-3 w-3" />
            Theme Settings
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={`cursor-pointer transition-colors duration-200 ${
            theme === "light" 
              ? "bg-gradient-brand-subtle text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium" 
              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <div className="flex items-center gap-3 w-full">
            <Sun className="h-4 w-4 text-amber-500" />
            <div className="flex-1">
              <div className="text-sm">Light Mode</div>
                              <div className="text-sm text-muted-foreground">Bright and clean interface</div>
            </div>
            {theme === "light" && (
              <div className="w-2 h-2 rounded-full bg-brand-500" />
            )}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={`cursor-pointer transition-colors duration-200 ${
            theme === "dark" 
              ? "bg-gradient-brand-subtle text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium" 
              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <div className="flex items-center gap-3 w-full">
            <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <div className="flex-1">
              <div className="text-sm">Dark Mode</div>
                              <div className="text-sm text-muted-foreground">Easy on the eyes</div>
            </div>
            {theme === "dark" && (
              <div className="w-2 h-2 rounded-full bg-brand-500" />
            )}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={`cursor-pointer transition-colors duration-200 ${
            theme === "system" 
              ? "bg-gradient-brand-subtle text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-medium" 
              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <div className="flex items-center gap-3 w-full">
            <Monitor className="h-4 w-4 text-blue-500" />
            <div className="flex-1">
              <div className="text-sm">System</div>
              <div className="text-sm text-muted-foreground">
                Follows device preference ({effectiveTheme === 'dark' ? 'Dark' : 'Light'})
              </div>
            </div>
            {theme === "system" && (
              <div className="w-2 h-2 rounded-full bg-brand-500" />
            )}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
