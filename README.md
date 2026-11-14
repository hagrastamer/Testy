
# PetRoutine

An all-in-one pet management and social community platform built with Next.js, Supabase, and Tailwind CSS.

## Features

### 🐾 Pet Management
- Create detailed pet profiles with photos, breed, medical info
- Support for dogs, cats, birds, rabbits, fish, and other pets
- Multiple pet support (Free: 1 pet, Plus: unlimited)

### 📅 Daily Care Schedules
- Recurring and one-time care tasks (feeding, walking, medication, etc.)
- Flexible recurrence: daily, weekly, weekdays, weekends, custom days
- Today's task overview with progress tracking
- Calendar view with monthly/weekly/daily views

### 🏥 Health Records
- Weight tracking with charts
- Vaccination records with due date reminders
- Medication tracking
- Veterinary appointments
- PDF health reports

### 👥 Community (PetRoutine Plus)
- Social feed with posts, photos, videos
- Like, comment, follow, save posts
- Explore page with hashtags and categories
- User profiles with pet showcase

### 🔔 Notifications
- Browser push notifications
- Care reminders, medication alerts
- Vaccination and appointment reminders
- Social notifications

### 💳 Subscription System
- Free tier: 1 pet, all essential features
- PetRoutine Plus ($4.99/month): Unlimited pets, full community access
- Secure server-side entitlement validation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **PDF**: jsPDF + jsPDF-autotable
- **State**: Zustand
- **Toasts**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd petroutine
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**

   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to Settings → API to get your project URL and anon key
   - Go to Settings → Database to get your service role key
   - Run the SQL schema in `supabase/schema.sql` in the Supabase SQL Editor
   - Create storage buckets: `avatars`, `pet-images`, `post-images`, `post-videos`, `health-documents`
   - Set up storage policies (see schema.sql comments)

4. **Configure environment variables**

   Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

   Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. **Run the development server**
```bash
npm run dev
```

   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup, etc.)
│   ├── home/              # Dashboard
│   ├── pets/              # Pet management
│   ├── care/              # Care tasks
│   ├── health/            # Health records
│   ├── calendar/          # Calendar view
│   ├── profile/           # Profile & settings
│   ├── subscription/      # Pricing & subscription
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components (sidebar, bottom nav)
│   ├── dashboard/         # Dashboard components
│   ├── pets/              # Pet components
│   ├── care/              # Care components
│   ├── health/            # Health components
│   ├── calendar/          # Calendar components
│   ├── profile/           # Profile components
│   └── subscription/      # Subscription components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── supabase/          # Supabase clients
│   └── utils.ts           # Utility functions
├── types/                 # TypeScript types
└── middleware.ts          # Auth middleware
```

## Database Schema

The complete database schema is in `supabase/schema.sql`. It includes:

- User profiles with premium status
- Pets with detailed information
- Care tasks with recurrence support
- Health records, vaccinations, medications, vet appointments
- Weight tracking
- Social features (posts, comments, likes, follows)
- Notifications and preferences
- Subscriptions and billing events
- Moderation (reports, blocks)
- Full RLS policies for security

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production URL)
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## PWA Support

PetRoutine is a Progressive Web App. Users can install it on their devices:

- Mobile: "Add to Home Screen" from browser menu
- Desktop: Install button in address bar
- Offline support for core app shell

## License

MIT License - feel free to use this for your own projects!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and feature requests, please open a GitHub issue.

---

Built with ❤️ for pet lovers everywhere.
