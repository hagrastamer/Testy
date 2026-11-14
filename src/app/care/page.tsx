
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { CareContent } from '@/components/care/care-content';

export default async function CarePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/care');
  }

  return (
    <MainLayout>
      <CareContent userId={user.id} />
    </MainLayout>
  );
}
