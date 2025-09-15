import type { Metadata } from "next"

/**
 * Authentication Layout Metadata
 */
export const metadata: Metadata = {
  title: "Login - Navigator",
  description: "Sign in to Navigator - Professional hotel rate monitoring platform",
}

/**
 * Authentication Layout Component
 * 
 * Clean layout without header/navigation for login flows
 * 
 * @component
 * @version 1.0.0
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Authentication routes now inherit theme provider from root layout
  // This layout serves as route group boundary and metadata override
  return <>{children}</>
}
