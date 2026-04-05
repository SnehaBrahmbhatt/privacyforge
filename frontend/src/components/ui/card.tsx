import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?:  boolean
  glass?: boolean
  hover?: boolean   // Fix: was referenced in History.tsx but missing from interface
}

export function Card({ className, glow, glass, hover, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-all duration-200',
        'bg-wm-bg-card border-wm-border',
        'shadow-card',
        glow  && 'shadow-wm-sm hover:shadow-wm-md animate-glow',
        glass && 'bg-wm-bg-glass backdrop-blur-md border-wm-border/50',
        hover && 'hover:border-wm-green/25 hover:shadow-card-hover cursor-pointer',
        !hover && 'hover:border-wm-green/15',
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
  return (
    <div
      className={cn('flex items-center pt-4 border-t border-wm-border mt-4', className)}
      {...props}
    />
  )
}