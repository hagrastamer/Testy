
'use client';

import { ReactNode } from 'react';
import { SidebarNavigation } from './sidebar-navigation';
import { BottomNavigation } from './bottom-navigation';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNavigation />
      <BottomNavigation />
      <main className="md:ml-64 pb-16 md:pb-0 min-h-screen">
        <div className="container-padding pt-4 pb-20 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
