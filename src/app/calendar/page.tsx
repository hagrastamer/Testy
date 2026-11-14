
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { CalendarContent } from '@/components/calendar/calendar-content';

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/calendar');
  }

  return (
    <MainLayout>
      <CalendarContent userId={user.id} />
    </MainLayout>
  );
}
