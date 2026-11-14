
'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock,
  Plus,
  Heart,
  Pill,
  Syringe,
  Stethoscope
 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameDay, isToday, addDays, parseISO } from 'date-fns';
import { cn, CARE_CATEGORIES, getCategoryInfo, formatTime } from '@/lib/utils';

interface CalendarContentProps {
  userId: string;
}

interface Pet {
  id: string;
  name: string;
  animal_type: string;
  avatar_url: string | null;
}

interface CareTask {
  id: string;
  pet_id: string;
  title: string;
  category: string;
  scheduled_date: string;
  scheduled_time: string | null;
  is_completed: boolean;
  pet: Pet;
}

interface VetAppointment {
  id: string;
  pet_id: string;
  title: string;
  date: string;
  time: string | null;
  clinic: string | null;
  pet: Pet;
}

interface Vaccination {
  id: string;
  pet_id: string;
  vaccine_name: string;
  next_due_date: string | null;
  pet: Pet;
}

export function CalendarContent({ userId }: CalendarContentProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pets, setPets] = useState<Pet[]>([]);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [appointments, setAppointments] = useState<VetAppointment[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const fetchData = async () => {
    const supabase = createClient();
    
    const { data: petsData } = await supabase
      .from('pets')
      .select('id, name, animal_type, avatar_url')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (petsData) {
      setPets(petsData);
      if (petsData.length > 0 && !selectedPetId) {
        setSelectedPetId(petsData[0].id);
      }
    }

    const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    const [tasksRes, apptsRes, vaccRes] = await Promise.all([
      supabase.from('care_tasks')
        .select(`*, pet:pets(id, name, animal_type, avatar_url)`)
        .eq('user_id', userId)
        .gte('scheduled_date', monthStart)
        .lte('scheduled_date', monthEnd)
        .order('scheduled_date'),
      supabase.from('vet_appointments')
        .select(`*, pet:pets(id, name, animal_type, avatar_url)`)
        .eq('user_id', userId)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date'),
      supabase.from('vaccinations')
        .select(`*, pet:pets(id, name, animal_type, avatar_url)`)
        .eq('user_id', userId)
        .gte('next_due_date', monthStart)
        .lte('next_due_date', monthEnd)
        .order('next_due_date'),
    ]);

    if (tasksRes.data) setTasks(tasksRes.data);
    if (apptsRes.data) setAppointments(apptsRes.data);
    if (vaccRes.data) setVaccinations(vaccRes.data);
    setLoading(false);
  };

  const selectedPet = pets.find(p => p.id === selectedPetId);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.scheduled_date === dateStr);
    const dayAppointments = appointments.filter(a => a.date === dateStr);
    const dayVaccinations = vaccinations.filter(v => v.next_due_date === dateStr);
    
    return [...dayTasks, ...dayAppointments, ...dayVaccinations];
  };

  // Generate calendar weeks
  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    const weeks: Date[][] = [];
    let week: Date[] = [];
    
    for (let d = calendarStart; d <= calendarEnd; d = addDays(d, 1)) {
      week.push(d);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    return weeks;
  }, [currentMonth]);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => { setCurrentMonth(new Date()); setSelectedDate(new Date()); };

  if (loading) return <div className="space-y-4 animate-pulse"><Card><CardContent className="p-6 h-80" /></Card></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View all care tasks and appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={goToToday} className="hidden sm:flex">Today</Button>
          <Button variant="outline" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Pet Selector */}
      {pets.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {selectedPet?.avatar_url ? <AvatarImage src={selectedPet.avatar_url} /> : <AvatarFallback>🐾</AvatarFallback>}
                </Avatar>
                <div>
                  <p className="font-medium">{selectedPet?.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{selectedPet?.animal_type}</p>
                </div>
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

      {/* Calendar Grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b p-2 text-center text-xs font-medium text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {weeks.flatMap((week, weekIndex) => 
              week.map((day, dayIndex) => {
                const isCurrentMonth = isSameDay(day, new Date(day.getFullYear(), day.getMonth(), 1)) || 
                  (day.getMonth() === currentMonth.getMonth());
                const isSelected = isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                const events = getEventsForDate(day);
                const filteredEvents = selectedPetId 
                  ? events.filter(e => e.pet_id === selectedPetId)
                  : events;

                return (
                  <button
                    key={`${weekIndex}-${dayIndex}`}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'relative aspect-square p-1 flex flex-col',
                      !isCurrentMonth && 'text-muted-foreground/50',
                      isSelected && 'bg-primary/10',
                      isTodayDate && 'bg-primary/5 ring-2 ring-primary/20',
                      'hover:bg-accent/50 transition-colors'
                    )}
                  >
                    <span className={cn(
                      'text-sm font-medium',
                      isTodayDate && 'text-primary',
                      isSelected && 'text-primary'
                    )}>
                      {format(day, 'd')}
                    </span>
                    {filteredEvents.length > 0 && (
                      <div className="flex-1 overflow-hidden mt-1 space-y-0.5">
                        {filteredEvents.slice(0, 3).map((event, i) => (
                          <div key={i} className={cn(
                            'h-1.5 rounded px-1 truncate text-[10px] font-medium',
                            'care_task' in event ? getCategoryInfo(event.category).color.replace('bg-', 'bg-').replace('text-', 'bg-') :
                            'clinic' in event ? 'bg-purple-100 text-purple-700' :
                            'vaccine_name' in event ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          )} />
                        ))}
                        {filteredEvents.length > 3 && (
                          <div className="text-[10px] text-center text-muted-foreground">+{filteredEvents.length - 3} more</div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const dayTasks = tasks.filter(t => t.scheduled_date === dateStr);
            const dayAppointments = appointments.filter(a => a.date === dateStr);
            const dayVaccinations = vaccinations.filter(v => v.next_due_date === dateStr);
            
            const allEvents = [
              ...dayTasks.map(t => ({ ...t, type: 'task' as const })),
              ...dayAppointments.map(a => ({ ...a, type: 'appointment' as const })),
              ...dayVaccinations.map(v => ({ ...v, type: 'vaccination' as const })),
            ].filter(e => !selectedPetId || e.pet_id === selectedPetId)
            .sort((a, b) => {
              const timeA = 'scheduled_time' in a ? a.scheduled_time || '23:59' : 'time' in a ? a.time || '23:59' : '23:59';
              const timeB = 'scheduled_time' in b ? b.scheduled_time || '23:59' : 'time' in b ? b.time || '23:59' : '23:59';
              return timeA.localeCompare(timeB);
            });

            if (allEvents.length === 0) {
              return (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No events scheduled for this day</p>
                </div>
              );
            }

            return (
              <div className="space-y-2">
                {allEvents.map((event, i) => (
                  <div key={i} className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    event.type === 'task' && event.is_completed ? 'bg-green-50 border-green-200' : 'bg-background'
                  )}>
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-full shrink-0',
                      event.type === 'task' ? getCategoryInfo(event.category).color.replace('bg-', 'bg-').replace('text-', 'bg-') :
                      event.type === 'appointment' ? 'bg-purple-100 text-purple-600' :
                      'bg-blue-100 text-blue-600'
                    )}>
                      {event.type === 'task' && <Clock className="h-5 w-5" />}
                      {event.type === 'appointment' && <Stethoscope className="h-5 w-5" />}
                      {event.type === 'vaccination' && <Syringe className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn('font-medium truncate flex-1', event.type === 'task' && event.is_completed && 'line-through text-muted-foreground')}>
                          {event.title || event.vaccine_name}
                        </p>
                        {event.type === 'task' && (
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getCategoryInfo(event.category).color)}>
                            {getCategoryInfo(event.category).icon} {getCategoryInfo(event.category).label}
                          </span>
                        )}
                        {event.type === 'appointment' && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Appointment</span>}
                        {event.type === 'vaccination' && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Vaccination Due</span>}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                        <Avatar className="h-5 w-5"><AvatarImage src={event.pet.avatar_url} /><AvatarFallback className="text-xs">{event.pet.name[0]}</AvatarFallback></Avatar>
                        <span>{event.pet.name}</span>
                        {event.type === 'task' && event.scheduled_time && <><Clock className="h-3 w-3" />{formatTime(event.scheduled_time)}</>}
                        {event.type === 'appointment' && event.time && <><Clock className="h-3 w-3" />{formatTime(event.time)}</>}
                        {event.type === 'appointment' && event.clinic && <><span>•</span>{event.clinic}</>}
                      </p>
                    </div>
                    {event.type === 'task' && (
                      <Button 
                        variant={event.is_completed ? 'default' : 'outline'} 
                        size="icon" 
                        className={event.is_completed ? 'bg-green-100 text-green-600' : ''}
                      >
                        <Heart className={cn('h-4 w-4', event.is_completed && 'fill-current')} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium">Event Types:</span>
            {CARE_CATEGORIES.map(cat => (
              <span key={cat.value} className={cn('flex items-center gap-1 px-2 py-1 rounded-full', cat.color)}>
                <span className="h-2 w-2 rounded-full bg-current" />
                {cat.label}
              </span>
            ))}
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700">
              <Stethoscope className="h-3 w-3" /> Appointment
            </span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              <Syringe className="h-3 w-3" /> Vaccination
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
