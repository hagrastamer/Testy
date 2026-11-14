
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password: formData.password });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success('Password updated successfully!');
    router.push('/login?reset=success');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-petroutine-50 to-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl text-primary mb-4 justify-center">
            <Heart className="h-7 w-7 fill-current" />
            <span>PetRoutine</span>
          </Link>
          <CardTitle>Set new password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? 'border-destructive' : ''}
                disabled={isLoading}
                autoComplete="new-password"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              <p className="text-xs text-muted-foreground">At least 8 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={errors.confirmPassword ? 'border-destructive' : ''}
                disabled={isLoading}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>
            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              Update Password
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            <a href="/login" className="text-primary hover:underline">Back to sign in</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
