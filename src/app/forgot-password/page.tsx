
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSent(true);
    toast.success('Password reset email sent!');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-petroutine-50 to-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl text-primary mb-4 justify-center">
            <Heart className="h-7 w-7 fill-current" />
            <span>PetRoutine</span>
          </Link>
          <CardTitle>{sent ? 'Check your email' : 'Forgot password?'}</CardTitle>
          <CardDescription>
            {sent
              ? 'We\'ve sent a password reset link to your email.'
              : 'Enter your email and we\'ll send you a reset link.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!sent && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={error ? 'border-destructive' : ''}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                Send Reset Link
              </Button>
            </form>
          )}
          <p className="text-center text-sm text-muted-foreground">
            {sent ? (
              <>
                Didn't receive it?{' '}
                <button onClick={() => setSent(false)} className="text-primary hover:underline">Resend</button>
              </>
            ) : (
              <>
                Remember your password?{' '}
                <Link href="/login" className="text-primary hover:underline">Sign in</Link>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
