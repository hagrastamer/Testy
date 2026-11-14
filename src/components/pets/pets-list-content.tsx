
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  PawPrint, 
  Plus, 
  Edit, 
  Trash2, 
  Heart,
  Loader2,
  Camera
 } from 'lucide-react';
import { toast } from 'sonner';
import { cn, ANIMAL_TYPES, getAnimalTypeInfo } from '@/lib/utils';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface PetsListContentProps {
  userId: string;
}

interface Pet {
  id: string;
  name: string;
  animal_type: string;
  breed: string | null;
  gender: string | null;
  date_of_birth: string | null;
  weight: number | null;
  color: string | null;
  adoption_date: string | null;
  avatar_url: string | null;
  created_at: string;
}

export function PetsListContent({ userId }: PetsListContentProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deletingPet, setDeletingPet] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    animal_type: 'dog',
    breed: '',
    gender: '',
    date_of_birth: '',
    weight: '',
    color: '',
    adoption_date: '',
    notes: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setPets(data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      animal_type: 'dog',
      breed: '',
      gender: '',
      date_of_birth: '',
      weight: '',
      color: '',
      adoption_date: '',
      notes: '',
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setEditingPet(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Pet name is required');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      let avatarUrl = null;
      if (avatarFile) {
        const fileName = `${userId}/${Date.now()}-${avatarFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pet-images')
          .upload(fileName, avatarFile);
        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage.from('pet-images').getPublicUrl(fileName);
          avatarUrl = publicUrl;
        }
      }

      const petData = {
        user_id: userId,
        name: formData.name,
        animal_type: formData.animal_type,
        breed: formData.breed || null,
        gender: formData.gender || null,
        date_of_birth: formData.date_of_birth || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        color: formData.color || null,
        adoption_date: formData.adoption_date || null,
        notes: formData.notes || null,
        avatar_url: avatarUrl,
      };

      if (editingPet) {
        const { error } = await supabase
          .from('pets')
          .update({ ...petData, updated_at: new Date().toISOString() })
          .eq('id', editingPet.id);
        if (error) throw error;
        toast.success('Pet updated!');
      } else {
        // Check pet limit for free users
        const { count } = await supabase
          .from('pets')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', userId)
          .single();

        const isPremium = profile?.is_premium || false;
        if (!isPremium && (count || 0) >= 1) {
          toast.error('Free users can only have 1 pet. Upgrade to Plus for unlimited pets.');
          setSubmitting(false);
          return;
        }

        const { error } = await supabase.from('pets').insert(petData);
        if (error) throw error;
        toast.success('Pet added!');
      }

      resetForm();
      setIsAdding(false);
      fetchPets();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (petId: string) => {
    if (!confirm('Are you sure you want to delete this pet? This action cannot be undone.')) return;

    setDeletingPet(petId);
    const supabase = createClient();

    try {
      const { error } = await supabase.from('pets').delete().eq('id', petId);
      if (error) throw error;
      toast.success('Pet deleted');
      fetchPets();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeletingPet(null);
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      animal_type: pet.animal_type,
      breed: pet.breed || '',
      gender: pet.gender || '',
      date_of_birth: pet.date_of_birth || '',
      weight: pet.weight?.toString() || '',
      color: pet.color || '',
      adoption_date: pet.adoption_date || '',
      notes: '',
    });
    if (pet.avatar_url) {
      setAvatarPreview(pet.avatar_url);
    }
    setIsAdding(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <Card key={i}><CardContent className="p-4"><Skeleton className="h-20" /></CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">My Pets</h1>
          <p className="text-muted-foreground">Manage your pet profiles</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAdding(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Pet
        </Button>
      </div>

      {/* Pets Grid */}
      {pets.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-petroutine-100 text-petroutine-600">
              <PawPrint className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No pets yet</h3>
            <p className="text-muted-foreground mb-6">Add your first pet to start tracking their care</p>
            <Button onClick={() => { resetForm(); setIsAdding(true); }} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Pet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map(pet => (
            <PetCard key={pet.id} pet={pet} onEdit={handleEdit} onDelete={handleDelete} isDeleting={deletingPet === pet.id} />
          ))}
        </div>
      )}

      {/* Add/Edit Pet Dialog */}
      <Dialog open={isAdding || !!editingPet} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPet ? 'Edit Pet' : 'Add New Pet'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-4 pt-0">
            <div className="flex justify-center">
              <label className="relative cursor-pointer">
                <Avatar className="h-20 w-20">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} />
                  ) : (
                    <AvatarFallback>
                      {getAnimalTypeInfo(formData.animal_type).icon}
                    </AvatarFallback>
                  )}
                </Avatar>
                <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
                  <Camera className="h-4 w-4" />
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Pet Name *</Label>
              <Input id="name" placeholder="Buddy" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label>Animal Type *</Label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breed">Breed</Label>
                <Input id="breed" placeholder="Golden Retriever" value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
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

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Special notes, medical info, etc." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => resetForm()}>Cancel</Button>
              <Button type="submit" loading={submitting}>{editingPet ? 'Save Changes' : 'Add Pet'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PetCard({ pet, onEdit, onDelete, isDeleting }: { pet: Pet; onEdit: (p: Pet) => void; onDelete: (id: string) => void; isDeleting: boolean }) {
  const animalInfo = getAnimalTypeInfo(pet.animal_type);
  const age = pet.date_of_birth ? calculateAge(pet.date_of_birth) : 'Unknown age';

  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 flex-shrink-0">
            {pet.avatar_url ? (
              <AvatarImage src={pet.avatar_url} />
            ) : (
              <AvatarFallback className="text-xl">{animalInfo.icon}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold truncate">{pet.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{animalInfo.label}{pet.breed && ` • ${pet.breed}`}</p>
                <p className="text-xs text-muted-foreground">{age}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(pet)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(pet.id)} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                </Button>
              </div>
            </div>
            {pet.weight && (
              <p className="mt-2 text-sm text-muted-foreground">{pet.weight} kg • {pet.color || 'No color'}</p>
            )}
            {pet.adoption_date && (
              <p className="text-xs text-muted-foreground">Adopted: {formatDate(pet.adoption_date)}</p>
            )}
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/pets/${pet.id}`}>View Details</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/care?pet=${pet.id}`}>Care Tasks</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateAge(dateOfBirth: string): string {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years > 0) return `${years}y ${months}m old`;
  return `${months}m old`;
}
