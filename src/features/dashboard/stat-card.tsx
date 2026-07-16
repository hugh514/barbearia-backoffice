import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function StatCard({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  highlight?: boolean;
}) {
  return (
    <Card
      className={
        highlight
          ? 'bg-sidebar text-white'
          : 'bg-card text-card-foreground'
      }
    >
      <div className="flex items-start justify-between p-5">
        <div>
          <p
            className={
              highlight
                ? 'text-xs uppercase tracking-wide text-sidebar-foreground'
                : 'text-xs uppercase tracking-wide text-muted-foreground'
            }
          >
            {label}
          </p>
          <p
            className={
              highlight
                ? 'mt-2 text-2xl font-bold text-primary'
                : 'mt-2 text-2xl font-bold text-foreground'
            }
          >
            {value}
          </p>
        </div>
        {Icon && (
          <span
            className={
              highlight
                ? 'flex size-9 items-center justify-center rounded-lg bg-white/10 text-primary'
                : 'flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground'
            }
          >
            <Icon className="size-4" />
          </span>
        )}
      </div>
    </Card>
  );
}
