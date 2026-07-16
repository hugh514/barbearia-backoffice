import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badge = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        neutral: 'bg-secondary text-secondary-foreground',
        amber: 'bg-primary text-primary-foreground',
        amberSoft: 'border border-primary/40 text-primary',
        success: 'bg-[var(--success)] text-white',
        danger: 'bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badge>['tone']>;

export function StatusBadge({
  children,
  tone,
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return <span className={cn(badge({ tone }), className)}>{children}</span>;
}
