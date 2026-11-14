
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { PetsListContent } from '@/components/pets/pets-list-content';

export default async function PetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/pets');
  }

  return (
    <MainLayout>
      <PetsListContent userId={user.id} />
    </MainLayout>
  );
}
