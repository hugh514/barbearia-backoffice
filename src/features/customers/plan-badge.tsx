import { StatusBadge, type BadgeTone } from '@/components/ui/status-badge';
import { PLAN_STATUS_LABEL, type PlanStatus } from './schemas';

const TONE: Record<PlanStatus, BadgeTone> = {
  ACTIVE: 'success',
  PENDING: 'amberSoft',
  OVERDUE: 'danger',
  CANCELLED: 'neutral',
  NONE: 'neutral',
};

export function PlanBadge({ status }: { status: PlanStatus }) {
  return <StatusBadge tone={TONE[status]}>{PLAN_STATUS_LABEL[status]}</StatusBadge>;
}
