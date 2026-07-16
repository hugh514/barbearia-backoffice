import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';
import { homeForRole } from '@/config/navigation';

export default async function AppIndex() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  redirect(homeForRole(session.user.role));
}
