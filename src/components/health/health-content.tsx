
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Heart,
  Syringe,
  Pill,
  Stethoscope,
  Activity,
  Loader2,
  Download,
  AlertCircle
 } from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDate } from '@/lib/utils';
import { format, subMonths } from 'date-fns';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  Chart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area
} from 'recharts';

interface HealthContentProps {
  userId: string;
}

interface Pet {
  id: string;
  name: string;
  animal_type: string;
  avatar_url: string | null;
  weight: number | null;
}

interface WeightRecord {
  id: string;
  pet_id: string;
  weight: number;
  unit: string;
  date: string;
  notes: string | null;
}

interface Vaccination {
  id: string;
  pet_id: string;
  vaccine_name: string;
  date_administered: string;
  next_due_date: string | null;
  veterinarian: string | null;
  clinic: string | null;
  notes: string | null;
}

interface Medication {
  id: string;
  pet_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

interface VetAppointment {
  id: string;
  pet_id: string;
  title: string;
  date: string;
  time: string | null;
  clinic: string | null;
  veterinarian: string | null;
  notes: string | null;
  follow_up_date: string | null;
}

export function HealthContent({ userId }: HealthContentProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<VetAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weight');
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    if (selectedPetId) {
      fetchHealthData();
    }
  }, [selectedPetId]);

  const fetchPets = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('pets')
      .select('id, name, animal_type, avatar_url, weight')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) {
      setPets(data);
      if (data.length > 0 && !selectedPetId) {
        setSelectedPetId(data[0].id);
      }
    }
    setLoading(false);
  };

  const fetchHealthData = async () => {
    if (!selectedPetId) return;
    const supabase = createClient();

    const [weightRes, vaccRes, medRes, apptRes] = await Promise.all([
      supabase.from('weight_records').select('*').eq('pet_id', selectedPetId).order('date', { ascending: true }),
      supabase.from('vaccinations').select('*').eq('pet_id', selectedPetId).order('date_administered', { ascending: false }),
      supabase.from('medications').select('*').eq('pet_id', selectedPetId).order('start_date', { ascending: false }),
      supabase.from('vet_appointments').select('*').eq('pet_id', selectedPetId).order('date', { ascending: true }),
    ]);

    if (weightRes.data) setWeightRecords(weightRes.data);
    if (vaccRes.data) setVaccinations(vaccRes.data);
    if (medRes.data) setMedications(medRes.data);
    if (apptRes.data) setAppointments(apptRes.data);
  };

  const selectedPet = pets.find(p => p.id === selectedPetId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();

    try {
      let table = '';
      let data: any = { pet_id: selectedPetId, user_id: userId };
      
      if (activeTab === 'weight') {
        table = 'weight_records';
        data = { ...data, weight: parseFloat(formData.weight), unit: formData.unit || 'kg', date: formData.date, notes: formData.notes };
      } else if (activeTab === 'vaccinations') {
        table = 'vaccinations';
        data = { ...data, vaccine_name: formData.vaccine_name, date_administered: formData.date_administered, next_due_date: formData.next_due_date, veterinarian: formData.veterinarian, clinic: formData.clinic, notes: formData.notes };
      } else if (activeTab === 'medications') {
        table = 'medications';
        data = { ...data, name: formData.name, dosage: formData.dosage, frequency: formData.frequency, start_date: formData.start_date, end_date: formData.end_date, is_active: formData.is_active };
      } else if (activeTab === 'appointments') {
        table = 'vet_appointments';
        data = { ...data, title: formData.title, date: formData.date, time: formData.time, clinic: formData.clinic, veterinarian: formData.veterinarian, notes: formData.notes, follow_up_date: formData.follow_up_date };
      }

      if (editingItem) {
        const { error } = await supabase.from(table).update(data).eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Updated!');
      } else {
        const { error } = await supabase.from(table).insert(data);
        if (error) throw error;
        toast.success('Added!');
      }

      setShowDialog(false);
      setEditingItem(null);
      fetchHealthData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Delete this record?')) return;
    const supabase = createClient();
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); fetchHealthData(); }
  };

  const openDialog = (item?: any) => {
    setEditingItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData({ date: format(new Date(), 'yyyy-MM-dd'), date_administered: format(new Date(), 'yyyy-MM-dd'), start_date: format(new Date(), 'yyyy-MM-dd'), is_active: true, unit: 'kg' });
    }
    setShowDialog(true);
  };

  const getDialogFields = () => {
    const baseFields = (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={formData.date || formData.date_administered || formData.start_date} onChange={(e) => setFormData({ ...formData, [activeTab === 'vaccinations' ? 'date_administered' : activeTab === 'medications' ? 'start_date' : 'date']: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
        </div>
      </div>
    );

    if (activeTab === 'weight') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="weight">Weight</Label><Input id="weight" type="number" step="0.1" placeholder="15.5" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} required /></div>
            <div className="space-y-2"><Label htmlFor="unit">Unit</Label><Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="kg">kg</SelectItem><SelectItem value="lbs">lbs</SelectItem></SelectContent></Select></div>
          </div>
          {baseFields}
        </div>
      );
    }
    if (activeTab === 'vaccinations') {
      return (
        <div className="space-y-4">
          <div className="space-y-2"><Label htmlFor="vaccine_name">Vaccine Name *</Label><Input id="vaccine_name" placeholder="Rabies, DHPP, etc." value={formData.vaccine_name} onChange={(e) => setFormData({ ...formData, vaccine_name: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="next_due_date">Next Due Date</Label><Input id="next_due_date" type="date" value={formData.next_due_date} onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="veterinarian">Veterinarian</Label><Input id="veterinarian" placeholder="Dr. Smith" value={formData.veterinarian} onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="clinic">Clinic</Label><Input id="clinic" placeholder="City Vet Clinic" value={formData.clinic} onChange={(e) => setFormData({ ...formData, clinic: e.target.value })} /></div>
          </div>
          {baseFields}
        </div>
      );
    }
    if (activeTab === 'medications') {
      return (
        <div className="space-y-4">
          <div className="space-y-2"><Label htmlFor="name">Medication Name *</Label><Input id="name" placeholder="Antibiotic, Pain relief, etc." value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="dosage">Dosage</Label><Input id="dosage" placeholder="10mg, 5ml, etc." value={formData.dosage} onChange={(e) => setFormData({ ...formData, dosage: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="frequency">Frequency</Label><Input id="frequency" placeholder="Twice daily, Every 8 hours" value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="end_date">End Date</Label><Input id="end_date" type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} /></div>
            <div className="space-y-2"><Label>Active</Label><Select value={formData.is_active.toString()} onValueChange={(v) => setFormData({ ...formData, is_active: v === 'true' })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem></SelectContent></Select></div>
          </div>
          {baseFields}
        </div>
      );
    }
    if (activeTab === 'appointments') {
      return (
        <div className="space-y-4">
          <div className="space-y-2"><Label htmlFor="title">Appointment Title *</Label><Input id="title" placeholder="Annual checkup, Vaccination, etc." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="time">Time</Label><Input id="time" type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="follow_up_date">Follow-up Date</Label><Input id="follow_up_date" type="date" value={formData.follow_up_date} onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="veterinarian">Veterinarian</Label><Input id="veterinarian" placeholder="Dr. Smith" value={formData.veterinarian} onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="clinic">Clinic</Label><Input id="clinic" placeholder="City Vet Clinic" value={formData.clinic} onChange={(e) => setFormData({ ...formData, clinic: e.target.value })} /></div>
          </div>
          {baseFields}
        </div>
      );
    }
    return baseFields;
  };

  if (loading) return <div className="space-y-4 animate-pulse"><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Health Records</h1>
          <p className="text-muted-foreground">Track your pet's health history</p>
        </div>
        {selectedPet && (
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        )}
      </div>

      {/* Pet Selector */}
      {pets.length > 0 && (
        <Card className="bg-gradient-to-r from-petroutine-50 to-amber-50 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                {selectedPet?.avatar_url ? <AvatarImage src={selectedPet.avatar_url} /> : <AvatarFallback className="text-xl">🐾</AvatarFallback>}
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{selectedPet?.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedPet?.weight ? `${selectedPet.weight} kg` : 'No weight recorded'}</p>
              </div>
              {pets.length > 1 && (
                <select value={selectedPetId} onChange={(e) => setSelectedPetId(e.target.value)} className="input-field w-auto">
                  {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {pets.length === 0 && (
        <Card className="text-center py-12"><CardContent>
          <Heart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-semibold mb-2">No pets yet</h3>
          <p className="text-muted-foreground mb-4">Add a pet to start tracking health records</p>
          <Button asChild><Link href="/pets/new">Add Pet</Link></Button>
        </CardContent></Card>
      )}

      {selectedPet && (
        <>
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="weight"><Activity className="mr-2 h-4 w-4" />Weight</TabsTrigger>
              <TabsTrigger value="vaccinations"><Syringe className="mr-2 h-4 w-4" />Vaccinations</TabsTrigger>
              <TabsTrigger value="medications"><Pill className="mr-2 h-4 w-4" />Medications</TabsTrigger>
              <TabsTrigger value="appointments"><Stethoscope className="mr-2 h-4 w-4" />Appointments</TabsTrigger>
            </TabsList>

            {/* Weight Tab */}
            <TabsContent value="weight" className="space-y-4">
              {weightRecords.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">Weight History</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => openDialog()}>
                      <Plus className="mr-2 h-4 w-4" />Add
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <Chart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), 'MMM d')} />
                        <YAxis unit="kg" />
                        <Area
                          type="monotone"
                          dataKey="weight"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary) / 0.1)"
                          strokeWidth={2}
                          data={weightRecords.map(r => ({ date: r.date, weight: r.weight }))}
                        />
                        <Tooltip formatter={(value: number) => [`${value} kg`, 'Weight']} />
                      </Chart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Weight Records</CardTitle>
                </CardHeader>
                <CardContent>
                  {weightRecords.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No weight records yet. Click "Add Record" to start tracking.</div>
                  ) : (
                    <div className="space-y-2">
                      {[...weightRecords].reverse().map(record => (
                        <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-100 text-green-600"><Activity className="h-5 w-5" /></div>
                            <div>
                              <p className="font-medium">{record.weight} {record.unit}</p>
                              <p className="text-sm text-muted-foreground">{formatDate(record.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openDialog(record)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete('weight_records', record.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vaccinations Tab */}
            <TabsContent value="vaccinations" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Vaccinations</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => openDialog()}>
                    <Plus className="mr-2 h-4 w-4" />Add
                  </Button>
                </CardHeader>
                <CardContent>
                  {vaccinations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No vaccination records yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {vaccinations.map(v => (
                        <div key={v.id} className="flex items-start justify-between p-3 rounded-lg border bg-background">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-blue-100 text-blue-600"><Syringe className="h-5 w-5" /></div>
                            <div>
                              <p className="font-medium">{v.vaccine_name}</p>
                              <p className="text-sm text-muted-foreground">Given: {formatDate(v.date_administered)}</p>
                              {v.next_due_date && (
                                <p className={cn('text-sm', new Date(v.next_due_date) < new Date() ? 'text-destructive' : 'text-amber-600')}>
                                  Next due: {formatDate(v.next_due_date)} {new Date(v.next_due_date) < new Date() ? '⚠️ OVERDUE' : ''}
                                </p>
                              )}
                              {(v.veterinarian || v.clinic) && (
                                <p className="text-xs text-muted-foreground">{v.veterinarian || ''} {v.clinic ? `• ${v.clinic}` : ''}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openDialog(v)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete('vaccinations', v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medications Tab */}
            <TabsContent value="medications" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Medications</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => openDialog()}>
                    <Plus className="mr-2 h-4 w-4" />Add
                  </Button>
                </CardHeader>
                <CardContent>
                  {medications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No medication records yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {medications.map(m => (
                        <div key={m.id} className={cn('flex items-start justify-between p-3 rounded-lg border', m.is_active ? 'bg-green-50 border-green-200' : 'bg-background')}>
                          <div className="flex items-start gap-3">
                            <div className={cn('p-2 rounded-full', m.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600')}>
                              <Pill className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{m.name}</p>
                                {m.is_active && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>}
                              </div>
                              <p className="text-sm text-muted-foreground">{m.dosage || ''} {m.frequency ? `• ${m.frequency}` : ''}</p>
                              <p className="text-xs text-muted-foreground">Started: {formatDate(m.start_date)} {m.end_date ? `• Ends: ${formatDate(m.end_date)}` : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openDialog(m)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete('medications', m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Vet Appointments</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => openDialog()}>
                    <Plus className="mr-2 h-4 w-4" />Add
                  </Button>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No appointments scheduled.</div>
                  ) : (
                    <div className="space-y-2">
                      {appointments.map(a => (
                        <div key={a.id} className="flex items-start justify-between p-3 rounded-lg border bg-background">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-purple-100 text-purple-600"><Stethoscope className="h-5 w-5" /></div>
                            <div>
                              <p className="font-medium">{a.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(a.date)} {a.time ? `at ${format(new Date(`2000-01-01T${a.time}`), 'h:mm a')}` : ''}
                              </p>
                              {(a.clinic || a.veterinarian) && (
                                <p className="text-xs text-muted-foreground">{a.clinic || ''} {a.veterinarian ? `• Dr. ${a.veterinarian}` : ''}</p>
                              )}
                              {a.follow_up_date && (
                                <p className="text-xs text-blue-600">Follow-up: {formatDate(a.follow_up_date)}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openDialog(a)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete('vet_appointments', a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add/Edit Dialog */}
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit' : 'Add'} {activeTab === 'weight' ? 'Weight Record' : activeTab === 'vaccinations' ? 'Vaccination' : activeTab === 'medications' ? 'Medication' : 'Appointment'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 p-4 pt-0">
                {getDialogFields()}
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setShowDialog(false); setEditingItem(null); }}>Cancel</Button>
                  <Button type="submit" loading={submitting}>{editingItem ? 'Save Changes' : 'Add Record'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
