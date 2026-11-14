
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  PawPrint, 
  Calendar, 
  Users, 
  User, 
  Heart,
  Settings,
  LogOut,
  Plus,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvatarWithInitials } from '@/components/ui/avatar';
import { useSupabaseUser } from '@/hooks/use-supabase-user';

const navigation = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'My Pets', href: '/pets', icon: PawPrint },
  { name: 'Care', href: '/care', icon: Calendar },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Profile', href: '/profile', icon: User },
] as const;

export function SidebarNavigation() {
  const pathname = usePathname();
  const { user } = useSupabaseUser();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-card h-screen fixed md:sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <Link href="/home" className="flex items-center gap-2 font-display font-bold text-xl text-primary">
          <Heart className="h-6 w-6 fill-current" />
          <span>PetRoutine</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 3 : 2} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 space-y-2">
        <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
        
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <AvatarWithInitials 
              name={user.user_metadata?.display_name || user.user_metadata?.full_name || 'User'} 
              src={user.user_metadata?.avatar_url} 
              size="h-8 w-8"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.user_metadata?.display_name || user.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">@{user.user_metadata?.username || 'username'}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
