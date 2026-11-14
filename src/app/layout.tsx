
import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/components/providers';
import { AuthProvider } from '@/hooks/use-supabase-user';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'PetRoutine - Your Pet Care Companion',
    template: '%s | PetRoutine',
  },
  description: 'The all-in-one pet management and social community platform. Track care, health records, and connect with other pet lovers.',
  keywords: ['pet care', 'pet health', 'pet community', 'dog care', 'cat care', 'pet tracker'],
  authors: [{ name: 'PetRoutine' }],
  creator: 'PetRoutine',
  publisher: 'PetRoutine',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://petroutine.app',
    siteName: 'PetRoutine',
    title: 'PetRoutine - Your Pet Care Companion',
    description: 'The all-in-one pet management and social community platform.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PetRoutine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PetRoutine - Your Pet Care Companion',
    description: 'The all-in-one pet management and social community platform.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans antialiased`}>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
