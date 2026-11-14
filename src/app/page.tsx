
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, 
  PawPrint, 
  Calendar, 
  Users, 
  Shield, 
  Award,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Star
 } from 'lucide-react';

const features = [
  {
    icon: PawPrint,
    title: 'Pet Profiles',
    description: 'Create detailed profiles for all your pets with photos, medical info, and care preferences.',
  },
  {
    icon: Calendar,
    title: 'Daily Care Schedules',
    description: 'Set up recurring feeding, medication, walking, and grooming reminders. Never miss a care task.',
  },
  {
    icon: Heart,
    title: 'Health Records',
    description: 'Track vaccinations, vet visits, medications, and weight history. Generate PDF reports for your vet.',
  },
  {
    icon: Users,
    title: 'Pet Community',
    description: 'Connect with other pet lovers, share photos, ask questions, and discover local pet events.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data belongs to you. We use enterprise-grade encryption and never sell your information.',
  },
  {
    icon: Award,
    title: 'Premium Features',
    description: 'Unlimited pets, advanced analytics, custom reminders, and priority support with PetRoutine Plus.',
  },
];

const stats = [
  { value: '10K+', label: 'Happy Pets' },
  { value: '50K+', label: 'Care Tasks Completed' },
  { value: '5K+', label: 'Community Members' },
  { value: '4.9', label: 'App Store Rating' },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for single pet owners',
    features: [
      '1 pet profile',
      'Unlimited care schedules',
      'Health & vaccination tracking',
      'Weight history & charts',
      'PDF health reports',
      'Calendar view',
      'Community browse (read-only)',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'PetRoutine Plus',
    price: '$4.99',
    period: '/month',
    description: 'For multi-pet families & power users',
    features: [
      'Unlimited pets',
      'Everything in Free',
      'Create community posts',
      'Upload photos & videos',
      'Like, comment & follow',
      'Advanced reminder customization',
      'Priority support',
      'Future premium features',
    ],
    cta: 'Get Plus',
    popular: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-gradient-to-b from-petroutine-50 to-background py-20 lg:py-32">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 animate-in fade-in">
              <Star className="h-4 w-4 fill-current" />
              <span>New: PetRoutine Plus - Unlimited pets & full community access</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 animate-in slide-in-from-bottom">
              Your Pet Care{' '}
              <span className="text-primary">Companion</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in slide-in-from-bottom" style={{ animationDelay: '100ms' }}>
              Track daily care, manage health records, and connect with a community of pet lovers.
              All in one beautiful app.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom" style={{ animationDelay: '200ms' }}>
              <Button size="lg" asChild>
                <Link href="/signup">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground animate-in fade-in" style={{ animationDelay: '300ms' }}>
              No credit card required - Cancel anytime - 14-day free trial of Plus
            </p>
          </div>
          <div className="mt-16 relative animate-in fade-in" style={{ animationDelay: '400ms' }}>
            <div className="relative mx-auto max-w-4xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: PawPrint, color: 'bg-amber-100', label: 'Dogs' },
                  { icon: Heart, color: 'bg-pink-100', label: 'Cats' },
                  { icon: Calendar, color: 'bg-blue-100', label: 'Birds' },
                  { icon: Users, color: 'bg-green-100', label: 'Community' },
                ].map((item, i) => (
                  <div key={item.label} className={`rounded-2xl p-6 text-center ${item.color} shadow-sm hover:shadow-lg transition-shadow`} style={{ animationDelay: `${500 + i * 100}ms` }}>
                    <item.icon className="mx-auto h-10 w-10 text-primary fill-current/20 stroke-primary" strokeWidth={2} />
                    <p className="mt-3 font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 border-y">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center animate-in fade-in">
                <div className="font-display text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Everything you need for pet care</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">PetRoutine combines powerful pet management tools with a vibrant community.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={feature.title} className="card-hover animate-in fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <CardHeader>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <feature.icon className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-muted/30">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Manage care from your phone</h2>
              <p className="text-lg text-muted-foreground mb-8">PetRoutine is a Progressive Web App - install it on your home screen and use it like a native app. Get reminders, log care, and check on your pets wherever you are.</p>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Smartphone className="h-6 w-6" /></div>
                <div>
                  <p className="font-medium">Install as PWA</p>
                  <p className="text-sm text-muted-foreground">Works offline for core features</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[9/19] max-w-sm mx-auto rounded-2xl bg-black/90 shadow-2xl border border-gray-700 overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="flex h-12 items-center justify-between px-4 border-b border-gray-700">
                    <div className="flex items-center gap-2"><div className="h-6 w-6 rounded-full bg-primary" /><span className="text-white font-medium text-sm">PetRoutine</span></div>
                    <div className="h-6 w-6 rounded-full bg-gray-700" />
                  </div>
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50"><div className="h-12 w-12 rounded-full bg-primary/20" /><div><p className="text-white font-medium">Buddy</p><p className="text-xs text-gray-400">Golden Retriever - 3 years</p></div></div>
                    <div className="space-y-2">{"['Feeding - 8:00 AM', 'Walk - 9:00 AM', 'Medication - 12:00 PM'].map((task, i) => (<div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50"><div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center"><CheckCircle className="h-4 w-4 text-green-400" /></div><span className="text-sm text-white">{task}</span></div>))}</div>
                  </div>
                  <div className="flex h-16 items-center justify-around border-t border-gray-700">{"['Home', 'Pets', 'Care', 'Community', 'Profile'].map((item, i) => (<div key={item} className="flex flex-col items-center gap-1 text-xs text-gray-400"><div className="h-6 w-6 rounded-full bg-gray-800 flex items-center justify-center" /><span>{item}</span></div>))}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Start free forever. Upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}>
                {plan.popular && (<div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"><Star className="h-3 w-3 fill-current" /> Most Popular</span></div>)}
                <CardHeader className="text-center">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1 mt-2"><span className="font-display text-4xl font-bold">{plan.price}</span><span className="text-muted-foreground">{plan.period}</span></div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">{plan.features.map((feature) => (<li key={feature} className="flex items-start gap-2 text-sm"><CheckCircle className="h-5 w-5 text-primary fill-current flex-shrink-0 mt-0.5" /><span>{feature}</span></li>))}</ul>
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'} asChild><Link href={plan.popular ? '/signup?plan=plus' : '/signup'}>{plan.cta}</Link></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container-padding max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Ready to give your pet the best care?</h2>
          <p className="text-lg opacity-90 mb-8">Join thousands of pet parents who trust PetRoutine for their daily pet care needs.</p>
          <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto"><Link href="/signup">Create Free Account</Link></Button>
        </div>
      </section>
      <footer className="py-12 border-t bg-muted/30">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div><Link href="/" className="flex items-center gap-2 font-display font-bold text-xl text-primary mb-4"><Heart className="h-6 w-6 fill-current" /><span>PetRoutine</span></Link><p className="text-sm text-muted-foreground">The all-in-one pet management and social community platform.</p></div>
            <div><h4 className="font-medium mb-4">Product</h4><ul className="space-y-2 text-sm text-muted-foreground"><li><Link href="/pets" className="hover:text-foreground">Pet Management</Link></li><li><Link href="/care" className="hover:text-foreground">Care Schedules</Link></li><li><Link href="/health" className="hover:text-foreground">Health Records</Link></li><li><Link href="/community" className="hover:text-foreground">Community</Link></li><li><Link href="/subscription" className="hover:text-foreground">Pricing</Link></li></ul></div>
            <div><h4 className="font-medium mb-4">Company</h4><ul className="space-y-2 text-sm text-muted-foreground"><li><Link href="/about" className="hover:text-foreground">About Us</Link></li><li><Link href="/blog" className="hover:text-foreground">Blog</Link></li><li><Link href="/careers" className="hover:text-foreground">Careers</Link></li><li><Link href="/press" className="hover:text-foreground">Press</Link></li><li><Link href="/contact" className="hover:text-foreground">Contact</Link></li></ul></div>
            <div><h4 className="font-medium mb-4">Legal</h4><ul className="space-y-2 text-sm text-muted-foreground"><li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li><li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li><li><Link href="/cookies" className="hover:text-foreground">Cookie Policy</Link></li></ul></div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4"><p className="text-sm text-muted-foreground">© {new Date().getFullYear()} PetRoutine. All rights reserved.</p><div className="flex items-center gap-6"><a href="https://twitter.com/petroutine" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg></a><a href="https://instagram.com/petroutine" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></a><a href="https://github.com/petroutine" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg></a></div></div>
        </div>
      </footer>
    </div>
  );
}
