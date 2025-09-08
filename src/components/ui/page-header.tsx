import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions?: React.ReactNode
  gradient?: boolean
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, actions, gradient = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-6 pb-8 animate-fade-in",
          gradient && "bg-gradient-to-r from-primary/10 via-accent/5 to-transparent rounded-lg p-6 border border-border/50 shadow-community",
          className
        )}
        {...props}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className={cn(
              "text-3xl font-bold tracking-tight text-foreground transition-all duration-300",
              gradient && "bg-gradient-primary bg-clip-text text-transparent"
            )}>
              {title}
            </h1>
            {description && (
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap gap-3 animate-slide-up">
              {actions}
            </div>
          )}
        </div>
      </div>
    )
  }
)
PageHeader.displayName = "PageHeader"

export { PageHeader }