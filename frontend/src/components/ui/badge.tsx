import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva('inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-medium border', {
  variants: {
    variant: {
      default: 'bg-wm-green/10 text-wm-green border-wm-green/20',
      wm: 'bg-wm-green/15 text-wm-green-light border-wm-green/30 shadow-wm-sm',  // WM primary
      success: 'bg-green-500/10 text-green-400 border-green-500/20',
      warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      danger: 'bg-red-500/10 text-red-400 border-red-500/20',
      info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      outline: 'border-wm-border text-wm-text-muted bg-transparent',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}