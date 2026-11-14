
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Camera, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle
 } from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSupabaseUser } from '@/hooks/use-supabase-user';

interface ProfileContentProps {
  userId: string;
}

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_premium: boolean;
  premium_expires_at: string | null;
  notification_preferences: any;
  privacy_settings: any;
}

export function ProfileContent({ userId }: ProfileContentProps) {
  const router = useRouter();
  const { user, refreshUser } = useSupabaseUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    bio: '',
  });
  const [notifPrefs, setNotifPrefs] = useState({
    push_enabled: true,
    email_enabled: true,
    care_reminders: true,
    medication_reminders: true,
    vaccination_reminders: true,
    appointment_reminders: true,
    social_notifications: true,
    reminder_time: '09:00',
  });
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'public',
    show_pets: true,
    show_activity: true,
  });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
      setProfile(data);
      setFormData({
        display_name: data.display_name || '',
        username: data.username || '',
        bio: data.bio || '',
      });
      if (data.avatar_url) setAvatarPreview(data.avatar_url);
      
      // Load notification preferences
      const { data: notifData } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (notifData) setNotifPrefs(notifData);
    }
    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.display_name.trim() || !formData.username.trim()) {
      toast.error('Name and username are required');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      let avatarUrl = profile?.avatar_url;
      if (avatarFile) {
        const fileName = `${userId}/${Date.now()}-${avatarFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });
        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
          avatarUrl = publicUrl;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          username: formData.username,
          bio: formData.bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      if (avatarUrl !== profile?.avatar_url) {
        await refreshUser();
      }

      toast.success('Profile saved!');
      fetchProfile();
    } catch (error: any) {
      if (error.code === '23505') toast.error('Username already taken');
      else toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: userId, ...notifPrefs, updated_at: new Date().toISOString() });
    if (error) toast.error(error.message);
    else toast.success('Notification preferences saved!');
  };

  const handleSavePrivacy = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ privacy_settings: privacySettings, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) toast.error(error.message);
    else toast.success('Privacy settings saved!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be less than 5MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('File must be an image'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) return <div className="space-y-4 animate-pulse"><Card><CardContent className="p-6 h-64" /></Card></div>;

  const isPremium = profile?.is_premium && profile?.premium_expires_at && new Date(profile.premium_expires_at) > new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative flex-shrink-0">
              <Avatar className="h-24 w-24">
                {avatarPreview ? <AvatarImage src={avatarPreview} /> : <AvatarFallback className="text-3xl">👤</AvatarFallback>}
              </Avatar>
              <label className="absolute bottom-0 right-0 cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </div>
              </label>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-display text-2xl font-bold">{formData.display_name || 'Your Name'}</h2>
              <p className="text-muted-foreground">@{formData.username || 'username'}</p>
              {isPremium && (
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                  <CheckCircle className="h-3 w-3" /> PetRoutine Plus
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="privacy"><Shield className="mr-2 h-4 w-4" />Privacy</TabsTrigger>
          <TabsTrigger value="account"><CreditCard className="mr-2 h-4 w-4" />Account</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your public profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input id="display_name" value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                    <Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} className="pl-8" placeholder="username" required maxLength={30} />
                  </div>
                  <p className="text-xs text-muted-foreground">Letters, numbers, and underscores only. This will be your public profile URL.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about yourself and your pets..." rows={4} />
                </div>
                <Button type="submit" loading={saving}>Save Profile</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">General</h4>
                <div className="space-y-3">
                  <NotificationToggle label="Push Notifications" description="Receive push notifications on your device" checked={notifPrefs.push_enabled} onChange={(v) => setNotifPrefs({ ...notifPrefs, push_enabled: v })} />
                  <NotificationToggle label="Email Notifications" description="Receive email notifications" checked={notifPrefs.email_enabled} onChange={(v) => setNotifPrefs({ ...notifPrefs, email_enabled: v })} />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Care Reminders</h4>
                <div className="space-y-3">
                  <NotificationToggle label="Feeding & Care Reminders" description="Daily care task reminders" checked={notifPrefs.care_reminders} onChange={(v) => setNotifPrefs({ ...notifPrefs, care_reminders: v })} />
                  <NotificationToggle label="Medication Reminders" description="Reminders for pet medications" checked={notifPrefs.medication_reminders} onChange={(v) => setNotifPrefs({ ...notifPrefs, medication_reminders: v })} />
                  <NotificationToggle label="Vaccination Reminders" description="Upcoming vaccination due dates" checked={notifPrefs.vaccination_reminders} onChange={(v) => setNotifPrefs({ ...notifPrefs, vaccination_reminders: v })} />
                  <NotificationToggle label="Appointment Reminders" description="Vet appointment reminders" checked={notifPrefs.appointment_reminders} onChange={(v) => setNotifPrefs({ ...notifPrefs, appointment_reminders: v })} />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Community</h4>
                <div className="space-y-3">
                  <NotificationToggle label="Social Notifications" description="Likes, comments, follows, mentions" checked={notifPrefs.social_notifications} onChange={(v) => setNotifPrefs({ ...notifPrefs, social_notifications: v })} />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Timing</h4>
                <div className="space-y-2">
                  <Label htmlFor="reminder_time">Default Reminder Time</Label>
                  <Input id="reminder_time" type="time" value={notifPrefs.reminder_time} onChange={(e) => setNotifPrefs({ ...notifPrefs, reminder_time: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control who can see your information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Profile Visibility</h4>
                <div className="space-y-3">
                  {['public', 'followers', 'private'].map(level => (
                    <label key={level} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors">
                      <input type="radio" name="profile_visibility" value={level} checked={privacySettings.profile_visibility === level} onChange={(e) => setPrivacySettings({ ...privacySettings, profile_visibility: e.target.value })} className="sr-only" />
                      <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center', privacySettings.profile_visibility === level ? 'border-primary bg-primary' : 'border-border')}>
                        {privacySettings.profile_visibility === level && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{level}</p>
                        <p className="text-sm text-muted-foreground">{level === 'public' ? 'Anyone can see your profile' : level === 'followers' ? 'Only your followers can see your profile' : 'Only you can see your profile'}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Content Visibility</h4>
                <div className="space-y-3">
                  <PrivacyToggle label="Show My Pets" description="Display your pets on your public profile" checked={privacySettings.show_pets} onChange={(v) => setPrivacySettings({ ...privacySettings, show_pets: v })} />
                  <PrivacyToggle label="Show Activity" description="Show your care completions and activity" checked={privacySettings.show_activity} onChange={(v) => setPrivacySettings({ ...privacySettings, show_activity: v })} />
                </div>
              </div>
              <Button onClick={handleSavePrivacy}>Save Privacy Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your PetRoutine plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn('p-4 rounded-lg border', isPremium ? 'bg-green-50 border-green-200' : 'bg-muted/30')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{isPremium ? 'PetRoutine Plus' : 'Free Plan'}</p>
                    <p className="text-sm text-muted-foreground">
                      {isPremium 
                        ? `Active until ${formatDate(profile?.premium_expires_at || '')}` 
                        : 'Upgrade for unlimited pets and full community access'}
                    </p>
                  </div>
                  {isPremium ? (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">Active</span>
                  ) : (
                    <Button asChild variant="outline"><Link href="/subscription">Upgrade to Plus</Link></Button>
                  )}
                </div>
              </div>

              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Account Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" asChild><Link href="/settings/password">Change Password</Link></Button>
                  <Button variant="outline" asChild><Link href="/settings/email">Change Email</Link></Button>
                  <Button variant="destructive" onClick={handleSignOut} className="w-full justify-start"><LogOut className="mr-2 h-4 w-4" />Sign Out</Button>
                  <Button variant="destructive" className="w-full justify-start"><AlertCircle className="mr-2 h-4 w-4" />Delete Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function PrivacyToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
