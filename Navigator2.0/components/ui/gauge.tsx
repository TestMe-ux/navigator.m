import * as React from "react"
import { cn } from "@/lib/utils"

interface GaugeProps extends React.SVGProps<SVGSVGElement> {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  progressColor?: string
  backgroundColor?: string
}

export const Gauge = React.forwardRef<SVGSVGElement, GaugeProps>(
  (
    {
      value,
      max = 100,
      size = 100,
      strokeWidth = 10,
      progressColor = "hsl(var(--primary))",
      backgroundColor = "hsl(var(--muted))",
      className,
      ...props
    },
    ref,
  ) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const progress = value / max
    const strokeDashoffset = circumference * (1 - progress)

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn("transform -rotate-90", className)}
        {...props}
      >
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={backgroundColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.3s ease-out" }}
        />
      </svg>
    )
  },
)
Gauge.displayName = "Gauge"
