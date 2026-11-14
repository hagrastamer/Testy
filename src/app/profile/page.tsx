
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { ProfileContent } from '@/components/profile/profile-content';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/profile');
  }

  return (
    <MainLayout>
      <ProfileContent userId={user.id} />
    </MainLayout>
  );
}
