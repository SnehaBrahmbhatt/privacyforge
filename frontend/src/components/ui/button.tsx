import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-sans font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wm-green/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-wm-green text-black hover:bg-wm-green-light active:scale-[0.98] shadow-wm-sm hover:shadow-wm-md',
        outline: 'border border-wm-border text-wm-text hover:border-wm-green/50 hover:bg-wm-green/5',
        ghost: 'text-wm-text-muted hover:text-wm-text hover:bg-wm-green/5',
        // Watermelon UI glass variant
        glass: 'bg-wm-bg-glass border border-wm-border/50 text-wm-text backdrop-blur-sm hover:border-wm-green/30 hover:bg-wm-green/5',
        // Watermelon UI stripe variant
        stripe: 'bg-transparent border border-wm-green/30 text-wm-green hover:bg-wm-green hover:text-black hover:shadow-wm-sm',
        destructive: 'bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  }
)
Button.displayName = 'Button'