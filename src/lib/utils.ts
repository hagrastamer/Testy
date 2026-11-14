
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateUsername(base: string): string {
  const clean = base.toLowerCase().replace(/[^a-z0-9]/g, '');
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${clean}${suffix}`;
}

export const ANIMAL_TYPES = [
  { value: 'dog', label: 'Dog', icon: '🐕' },
  { value: 'cat', label: 'Cat', icon: '🐈' },
  { value: 'bird', label: 'Bird', icon: '🐦' },
  { value: 'rabbit', label: 'Rabbit', icon: '🐰' },
  { value: 'fish', label: 'Fish', icon: '🐠' },
  { value: 'other', label: 'Other', icon: '🐾' },
] as const;

export const CARE_CATEGORIES = [
  { value: 'feeding', label: 'Feeding', icon: '🍽️', color: 'bg-amber-100 text-amber-700' },
  { value: 'water', label: 'Water', icon: '💧', color: 'bg-blue-100 text-blue-700' },
  { value: 'walking', label: 'Walking', icon: '🚶', color: 'bg-green-100 text-green-700' },
  { value: 'exercise', label: 'Exercise', icon: '🏃', color: 'bg-orange-100 text-orange-700' },
  { value: 'bathing', label: 'Bathing', icon: '🛁', color: 'bg-purple-100 text-purple-700' },
  { value: 'grooming', label: 'Grooming', icon: '✂️', color: 'bg-pink-100 text-pink-700' },
  { value: 'cleaning', label: 'Cleaning', icon: '🧹', color: 'bg-gray-100 text-gray-700' },
  { value: 'medication', label: 'Medication', icon: '💊', color: 'bg-red-100 text-red-700' },
  { value: 'general', label: 'General Care', icon: '📋', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'custom', label: 'Custom', icon: '✨', color: 'bg-teal-100 text-teal-700' },
] as const;

export function getCategoryInfo(category: string) {
  return CARE_CATEGORIES.find((c) => c.value === category) || CARE_CATEGORIES[CARE_CATEGORIES.length - 1];
}

export function getAnimalTypeInfo(type: string) {
  return ANIMAL_TYPES.find((a) => a.value === type) || ANIMAL_TYPES[ANIMAL_TYPES.length - 1];
}
