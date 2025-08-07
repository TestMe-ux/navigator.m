import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface ChartCardWrapperProps {
  title: string
  description?: string
  children: ReactNode
}

export function ChartCardWrapper({ title, description, children }: ChartCardWrapperProps) {
  return (
    <Card className="bg-white dark:bg-slate-800/50 shadow-sm rounded-lg">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</CardTitle>
        {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </CardHeader>
      <CardContent className="px-6 pb-6">{children}</CardContent>
    </Card>
  )
}
