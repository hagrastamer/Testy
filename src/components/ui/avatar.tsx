
import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & { fallback?: string }
>(({ className, fallback, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  >
    <AvatarPrimitive.Image
      className="aspect-square h-full w-full object-cover"
      alt=""
    />
    <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-muted">
      {fallback || <span className="text-xs font-medium">?</span>}
    </AvatarPrimitive.Fallback>
  </AvatarPrimitive.Root>
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };

// Helper component for displaying initials
export function AvatarWithInitials({ 
  name, 
  src, 
  className, 
  size = 'h-10 w-10',
  ...props 
}: { 
  name?: string; 
  src?: string; 
  className?: string;
  size?: string;
}) {
  return (
    <Avatar className={cn(size, className)} {...props}>
      {src && <AvatarImage src={src} />}
      <AvatarFallback>{name ? getInitials(name) : '?'}</AvatarFallback>
    </Avatar>
  );
}
