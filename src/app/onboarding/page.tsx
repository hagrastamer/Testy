
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useSupabaseUser } from '@/hooks/use-supabase-user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, PawPrint, ArrowRight, CheckCircle, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ANIMAL_TYPES } from '@/lib/utils';

const steps = [
  { id: 'profile', title: 'Your Profile', description: 'Tell us about yourself' },
  { id: 'pet', title: 'Your Pet', description: 'Add your first pet' },
  { id: 'complete', title: 'All Set!', description: 'You\'re ready to go' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useSupabaseUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    pet_name: '',
    animal_type: 'dog',
    breed: '',
    gender: '',
    date_of_birth: '',
    weight: '',
    color: '',
    adoption_date: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [petAvatarFile, setPetAvatarFile] = useState<File | null>(null);
  const [petAvatarPreview, setPetAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 0) {
      if (!formData.display_name.trim()) newErrors.display_name = 'Name is required';
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) newErrors.username = 'Username can only contain letters, numbers, and underscores';
      else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    } else if (currentStep === 1) {
      if (!formData.pet_name.trim()) newErrors.pet_name = 'Pet name is required';
      if (!formData.animal_type) newErrors.animal_type = 'Please select an animal type';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      // Update profile
      let avatarUrl = null;
      if (avatarFile) {
        const fileName = `${user?.id}/${Date.now()}-${avatarFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);
        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
          avatarUrl = publicUrl;
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          username: formData.username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Create pet
      let petAvatarUrl = null;
      if (petAvatarFile) {
        const fileName = `${user?.id}/${Date.now()}-${petAvatarFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pet-images')
          .upload(fileName, petAvatarFile);
        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage.from('pet-images').getPublicUrl(fileName);
          petAvatarUrl = publicUrl;
        }
      }

      const { error: petError } = await supabase
        .from('pets')
        .insert({
          user_id: user?.id,
          name: formData.pet_name,
          animal_type: formData.animal_type,
          breed: formData.breed || null,
          gender: formData.gender || null,
          date_of_birth: formData.date_of_birth || null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          color: formData.color || null,
          adoption_date: formData.adoption_date || null,
          avatar_url: petAvatarUrl,
        });

      if (petError) throw petError;

      // Create default notification preferences
      await supabase.from('notification_preferences').insert({
        user_id: user?.id,
        push_enabled: true,
        email_enabled: true,
        care_reminders: true,
        medication_reminders: true,
        vaccination_reminders: true,
        appointment_reminders: true,
        social_notifications: true,
        reminder_time: '09:00',
      });

      await refreshUser();
      toast.success('Welcome to PetRoutine!');
      router.push('/home');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'pet') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be less than 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }
    if (type === 'avatar') {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setPetAvatarFile(file);
      setPetAvatarPreview(URL.createObjectURL(file));
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-petroutine-50 to-background">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, i) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={cn(
                  'relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all',
                  i < currentStep ? 'bg-primary text-primary-foreground' :
                  i === currentStep ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                  'bg-muted text-muted-foreground'
                )}>
                  {i < currentStep ? <CheckCircle className="h-5 w-5" /> : <span>{i + 1}</span>}
                </div>
                <span className={cn('text-xs mt-1 font-medium', i <= currentStep ? 'text-foreground' : 'text-muted-foreground')}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step Content */}
        <Card className="animate-in fade-in">
          <CardHeader className="text-center pb-2">
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Profile */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <label className="relative cursor-pointer">
                    <Avatar className="h-24 w-24">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview} />
                      ) : (
                        <AvatarFallback>
                          <Heart className="h-10 w-10 text-primary" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} className="sr-only" />
                    <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                      <Camera className="h-4 w-4" />
                    </div>
                  </label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    placeholder="Your name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className={errors.display_name ? 'border-destructive' : ''}
                    autoComplete="name"
                  />
                  {errors.display_name && <p className="text-sm text-destructive">{errors.display_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                    <Input
                      id="username"
                      placeholder="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      className={cn(errors.username ? 'border-destructive' : '', 'pl-8')}
                      autoComplete="username"
                      maxLength={30}
                    />
                  </div>
                  {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
                  <p className="text-xs text-muted-foreground">Letters, numbers, and underscores only</p>
                </div>
              </div>
            )}

            {/* Step 2: Pet */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <label className="relative cursor-pointer">
                    <Avatar className="h-24 w-24">
                      {petAvatarPreview ? (
                        <AvatarImage src={petAvatarPreview} />
                      ) : (
                        <AvatarFallback>
                          <PawPrint className="h-10 w-10 text-primary" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'pet')} className="sr-only" />
                    <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                      <Camera className="h-4 w-4" />
                    </div>
                  </label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pet_name">Pet Name</Label>
                  <Input
                    id="pet_name"
                    placeholder="Buddy"
                    value={formData.pet_name}
                    onChange={(e) => setFormData({ ...formData, pet_name: e.target.value })}
                    className={errors.pet_name ? 'border-destructive' : ''}
                  />
                  {errors.pet_name && <p className="text-sm text-destructive">{errors.pet_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Animal Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {ANIMAL_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, animal_type: type.value })}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all text-center',
                          formData.animal_type === type.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50 hover:bg-accent'
                        )}
                      >
                        <span className="text-2xl block mb-1">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.animal_type && <p className="text-sm text-destructive">{errors.animal_type}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed</Label>
                    <Input id="breed" placeholder="Golden Retriever" value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select id="gender" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="input-field">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Birth Date</Label>
                    <Input id="date_of_birth" type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} max={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input id="weight" type="number" step="0.1" placeholder="15.5" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" placeholder="Golden" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adoption_date">Adoption Date</Label>
                    <Input id="adoption_date" type="date" value={formData.adoption_date} onChange={(e) => setFormData({ ...formData, adoption_date: e.target.value })} max={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Complete */}
            {currentStep === 2 && (
              <div className="text-center py-8">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold mb-2">You're all set!</h3>
                <p className="text-muted-foreground mb-8">
                  Welcome to PetRoutine, {formData.display_name}! {formData.pet_name} is ready for their first care schedule.
                </p>
                <Button size="lg" onClick={handleNext} loading={isLoading} className="w-full sm:w-auto">
                  <ArrowRight className="ml-2 h-4 w-4" />
                  Start Using PetRoutine
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="ghost" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
                Back
              </Button>
              <Button onClick={handleNext} loading={isLoading} disabled={currentStep === 2 && isLoading}>
                {currentStep === 2 ? 'Get Started' : 'Continue'}
                {currentStep < 2 && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
