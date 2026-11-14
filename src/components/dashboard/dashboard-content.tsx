
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  PawPrint, 
  Plus, 
  Calendar, 
  Heart, 
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Settings,
  TrendingUp
 } from 'lucide-react';
import { formatDate, formatTime, getAnimalTypeInfo, cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface DashboardContentProps {
  userId: string;
}

interface Pet {
  id: string;
  name: string;
  animal_type: string;
  breed: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  weight: number | null;
}

interface CareTask {
  id: string;
  title: string;
  category: string;
  scheduled_time: string | null;
  is_completed: boolean;
  pet: Pet;
}

export function DashboardContent({ userId }: DashboardContentProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [todayTasks, setTodayTasks] = useState<CareTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [showAddPet, setShowAddPet] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = createClient();
    
    // Fetch pets
    const { data: petsData } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (petsData) {
      setPets(petsData);
      if (petsData.length > 0 && !selectedPetId) {
        setSelectedPetId(petsData[0].id);
      }
    }

    // Fetch today's tasks
    const today = new Date().toISOString().split('T')[0];
    const { data: tasksData } = await supabase
      .from('care_tasks')
      .select(`
        *,
        pet:pets(*)
      `)
      .eq('user_id', userId)
      .eq('scheduled_date', today)
      .order('scheduled_time', { ascending: true });
    
    if (tasksData) {
      setTodayTasks(tasksData);
    }

    setLoading(false);
  };

  const completedCount = todayTasks.filter(t => t.is_completed).length;
  const totalCount = todayTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const selectedPet = pets.find(p => p.id === selectedPetId) || pets[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Good morning! 👋</h1>
          <p className="text-muted-foreground">Here's what's happening with your pets today</p>
        </div>
        {pets.length === 0 ? (
          <Button onClick={() => setShowAddPet(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Pet
          </Button>
        ) : (
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/pets/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Pet
            </Link>
          </Button>
        )}
      </div>

      {/* Pet Selector / Pet Card */}
      {pets.length > 0 && (
        <Card className="bg-gradient-to-r from-petroutine-50 to-amber-50 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {selectedPet?.avatar_url ? (
                    <AvatarImage src={selectedPet.avatar_url} />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      {getAnimalTypeInfo(selectedPet?.animal_type || 'dog').icon}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h2 className="font-display text-xl font-bold">{selectedPet?.name}</h2>
                  <p className="text-muted-foreground capitalize">
                    {getAnimalTypeInfo(selectedPet?.animal_type || 'dog').label}
                    {selectedPet?.breed && ` • ${selectedPet.breed}`}
                  </p>
                  {selectedPet?.date_of_birth && (
                    <p className="text-sm text-muted-foreground">
                      {calculateAge(selectedPet.date_of_birth)}
                    </p>
                  )}
                </div>
              </div>
              {pets.length > 1 && (
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="input-field w-auto"
                >
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                  ))}
                </select>
              )}
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild size="sm">
                  <Link href={`/pets/${selectedPetId}`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/care">
                    <Calendar className="mr-2 h-4 w-4" />
                    Care Tasks
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {pets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-petroutine-100 text-petroutine-600">
              <PawPrint className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No pets yet</h3>
            <p className="text-muted-foreground mb-6">Add your first pet to start tracking their care</p>
            <Button onClick={() => setShowAddPet(true)} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Pet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Today's Progress */}
      {pets.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Today's Progress</CardTitle>
            <span className="text-sm font-medium text-primary">{completedCount}/{totalCount} completed</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="h-3" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-green-50">
                  <div className="font-display text-2xl font-bold text-green-600">{completedCount}</div>
                  <div className="text-xs text-green-700">Completed</div>
                </div>
                <div className="p-3 rounded-lg bg-amber-50">
                  <div className="font-display text-2xl font-bold text-amber-600">{totalCount - completedCount}</div>
                  <div className="text-xs text-amber-700">Remaining</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <div className="font-display text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
                  <div className="text-xs text-blue-700">Progress</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Tasks */}
      {pets.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Today's Care Tasks</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/care">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <h4 className="font-medium mb-1">No tasks for today</h4>
                <p className="text-sm text-muted-foreground mb-4">Add care tasks to stay on track</p>
                <Button asChild size="sm">
                  <Link href="/care">Create Task</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                      task.is_completed ? 'bg-green-50 border-green-200' : 'bg-background hover:bg-accent/50'
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-medium truncate', task.is_completed ? 'line-through text-muted-foreground' : '')}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="capitalize">{task.category}</span>
                        {task.scheduled_time && (
                          <>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            {formatTime(task.scheduled_time)}
                          </>
                        )}
                        <span>•</span>
                        <span>{task.pet.name}</span>
                      </p>
                    </div>
                    <Button
                      variant={task.is_completed ? 'default' : 'outline'}
                      size="icon"
                      className={cn(task.is_completed ? 'bg-green-100 text-green-600' : '')}
                    >
                      <CheckCircle className={cn('h-4 w-4', task.is_completed ? 'fill-current' : '')} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {pets.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Heart}
            iconColor="text-red-500"
            bgColor="bg-red-50"
            value={pets.length}
            label="Total Pets"
          />
          <StatCard
            icon={TrendingUp}
            iconColor="text-green-500"
            bgColor="bg-green-50"
            value={todayTasks.filter(t => t.is_completed).length}
            label="Tasks Done"
          />
          <StatCard
            icon={Clock}
            iconColor="text-blue-500"
            bgColor="bg-blue-50"
            value={todayTasks.filter(t => !t.is_completed).length}
            label="Pending"
          />
          <StatCard
            icon={PawPrint}
            iconColor="text-petroutine-500"
            bgColor="bg-petroutine-50"
            value={getUpcomingAppointments()}
            label="Appts This Week"
          />
        </div>
      )}
    </div>
  );

  function getUpcomingAppointments(): number {
    // This would fetch from vet_appointments table
    return 0;
  }
}

function StatCard({ icon: Icon, iconColor, bgColor, value, label }: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  value: number | string;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-display font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
          <div className={cn('p-3 rounded-full', bgColor, iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
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
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0) return `${years}y ${months}m old`;
  if (months > 0) return `${months}m ${days}d old`;
  return `${days}d old`;
}
