import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  glass?: boolean
}

export function Card({ className, glow, glass, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-wm-border bg-wm-bg-card p-5 transition-all duration-200',
        glow && 'shadow-wm-sm hover:shadow-wm-md animate-glow',
        glass && 'bg-wm-bg-glass backdrop-blur-md border-wm-border/50',
        'hover:border-wm-green/20 shadow-card hover:shadow-card-hover',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 mb-4', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('font-display font-bold text-lg text-wm-text leading-tight', className)} {...props} />
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-wm-text-muted', className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center pt-4 border-t border-wm-border mt-4', className)} {...props} />
}