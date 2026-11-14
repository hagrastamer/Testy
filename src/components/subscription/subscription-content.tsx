
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Crown, 
  CheckCircle, 
  Heart, 
  PawPrint, 
  Users, 
  FileText, 
  Bell, 
  Shield,
  Star,
  Loader2,
  Lock
 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface SubscriptionContentProps {
  userId: string | null;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export function SubscriptionContent({ userId }: SubscriptionContentProps) {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (userId) fetchSubscription();
    else setLoading(false);
  }, [userId]);

  const fetchSubscription = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) setSubscription(data);
    setLoading(false);
  };

  const isPremium = subscription?.plan === 'plus' && subscription?.status === 'active';
  const isExpired = subscription?.current_period_end && new Date(subscription.current_period_end) < new Date();

  const handleUpgrade = async () => {
    if (!userId) {
      router.push('/signup?plan=plus');
      return;
    }

    setUpgrading(true);
    // TODO: Integrate with payment provider (Stripe, etc.)
    // For now, simulate upgrade
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan: 'plus',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false,
        });
      
      if (error) throw error;
      
      // Update profile
      await supabase
        .from('profiles')
        .update({ is_premium: true, premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() })
        .eq('id', userId);

      toast.success('Upgraded to PetRoutine Plus! (Demo mode - no real payment)');
      fetchSubscription();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription? You\'ll lose Plus features at the end of the billing period.')) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('user_id', userId);
    if (error) toast.error(error.message);
    else { toast.success('Subscription will cancel at period end'); fetchSubscription(); }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for single pet owners',
      features: [
        { icon: PawPrint, text: '1 pet profile', included: true },
        { icon: Heart, text: 'Unlimited care schedules', included: true },
        { icon: Shield, text: 'Health & vaccination tracking', included: true },
        { icon: FileText, text: 'Weight history & charts', included: true },
        { icon: FileText, text: 'PDF health reports', included: true },
        { icon: Bell, text: 'Calendar view', included: true },
        { icon: Users, text: 'Community browse (read-only)', included: true },
        { icon: Crown, text: 'Create community posts', included: false },
        { icon: Crown, text: 'Upload photos & videos', included: false },
        { icon: Crown, text: 'Like, comment & follow', included: false },
        { icon: Crown, text: 'Advanced reminders', included: false },
        { icon: Crown, text: 'Priority support', included: false },
      ],
      cta: 'Current Plan',
      popular: false,
      disabled: true,
    },
    {
      name: 'PetRoutine Plus',
      price: '$4.99',
      period: '/month',
      description: 'For multi-pet families & power users',
      features: [
        { icon: PawPrint, text: 'Unlimited pets', included: true },
        { icon: Heart, text: 'Everything in Free', included: true },
        { icon: Users, text: 'Create community posts', included: true },
        { icon: Heart, text: 'Upload photos & videos', included: true },
        { icon: Shield, text: 'Like, comment & follow', included: true },
        { icon: FileText, text: 'Advanced reminder customization', included: true },
        { icon: Bell, text: 'Priority support', included: true },
        { icon: Crown, text: 'Future premium features', included: true },
      ],
      cta: isPremium ? 'Current Plan' : 'Upgrade to Plus',
      popular: true,
      disabled: isPremium,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Card><CardContent className="p-6 h-32" /></Card>
        <div className="grid md:grid-cols-2 gap-6">
          <Card><CardContent className="p-6 h-80" /></Card>
          <Card><CardContent className="p-6 h-80" /></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Start free forever. Upgrade to Plus for unlimited pets and full community access.
        </p>
      </div>

      {/* Current Status */}
      {userId && subscription && (
        <Card className={cn(isPremium ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50')}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={cn('p-3 rounded-full', isPremium ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600')}>
                  {isPremium ? <Crown className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                </div>
                <div>
                  <p className="font-semibold">{isPremium ? 'PetRoutine Plus Active' : 'Free Plan'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isPremium 
                      ? `Renews on ${new Date(subscription.current_period_end).toLocaleDateString()}` 
                      : 'Upgrade for unlimited pets and full community access'}
                    {subscription.cancel_at_period_end && ' • Will cancel at period end'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {isPremium && !subscription.cancel_at_period_end && (
                  <Button variant="outline" onClick={handleCancel} size="sm">Cancel Subscription</Button>
                )}
                {!isPremium && (
                  <Button onClick={handleUpgrade} loading={upgrading}>Upgrade to Plus</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {userId && !subscription && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-amber-100 text-amber-600"><Lock className="h-6 w-6" /></div>
                <div>
                  <p className="font-semibold">Free Plan</p>
                  <p className="text-sm text-muted-foreground">Upgrade for unlimited pets and full community access</p>
                </div>
              </div>
              <Button onClick={handleUpgrade} loading={upgrading}>Upgrade to Plus</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={cn('relative', plan.popular ? 'border-primary shadow-lg ring-2 ring-primary/20' : '')}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  <Star className="h-3 w-3 fill-current" />
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader className="text-center pb-4">
              <CardTitle>{plan.name}</CardTitle>
              <div className="flex items-baseline justify-center gap-1 mt-2">
                <span className="font-display text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={cn('flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center', feature.included ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground')}>
                      {feature.included ? <CheckCircle className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <feature.icon className={cn('h-4 w-4', feature.included ? 'text-foreground' : 'text-muted-foreground')} />
                        <span className={cn(feature.included ? '' : 'text-muted-foreground')}>{feature.text}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full" 
                variant={plan.popular ? 'default' : 'outline'}
                disabled={plan.disabled || upgrading}
                loading={upgrading && plan.popular}
                onClick={plan.disabled ? undefined : handleUpgrade}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access to Plus features until the end of your current billing period.' },
            { q: 'What happens to my data if I cancel?', a: 'Your pets, care tasks, health records, and all data remain yours. Free users can keep 1 pet profile with all essential features. Additional pets become read-only.' },
            { q: 'Is there a free trial?', a: 'Yes! New users get a 14-day free trial of PetRoutine Plus. No credit card required to start.' },
            { q: 'Can I manage multiple pets on the Free plan?', a: 'The Free plan allows 1 pet profile. Upgrade to Plus for unlimited pets.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, Apple Pay, and Google Pay through our secure payment processor.' },
          ].map((faq, i) => (
            <Card key={i}>
              <CardContent className="p-4 pt-6">
                <h4 className="font-medium mb-1">{faq.q}</h4>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {!userId && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Sign in or create an account to manage your subscription</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild><Link href="/login">Sign In</Link></Button>
            <Button variant="outline" asChild><Link href="/signup">Create Account</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
