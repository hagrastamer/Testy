
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  Clock,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter
 } from 'lucide-react';
import { toast } from 'sonner';
import { cn, CARE_CATEGORIES, getCategoryInfo, formatDate, formatTime } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday, parseISO } from 'date-fns';

interface CareContentProps {
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
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  scheduled_date: string;
  scheduled_time: string | null;
  recurrence: string;
  recurrence_days: number[] | null;
  notes: string | null;
  is_completed: boolean;
  completed_at: string | null;
  pet: Pet;
}

export function CareContent({ userId }: CareContentProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<CareTask | null>(null);
  const [formData, setFormData] = useState({
    pet_id: '',
    title: '',
    description: '',
    category: 'feeding',
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    scheduled_time: '08:00',
    recurrence: 'once',
    recurrence_days: [] as number[],
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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
        setFormData(prev => ({ ...prev, pet_id: petsData[0].id }));
      }
    }

    // Fetch tasks for the next 2 weeks
    const start = format(subWeeks(startOfWeek(new Date()), 1), 'yyyy-MM-dd');
    const end = format(addWeeks(endOfWeek(new Date()), 2), 'yyyy-MM-dd');
    
    const { data: tasksData } = await supabase
      .from('care_tasks')
      .select(`
        *,
        pet:pets(id, name, animal_type, avatar_url)
      `)
      .eq('user_id', userId)
      .gte('scheduled_date', start)
      .lte('scheduled_date', end)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });
    
    if (tasksData) setTasks(tasksData);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      pet_id: pets[0]?.id || '',
      title: '',
      description: '',
      category: 'feeding',
      scheduled_date: format(new Date(), 'yyyy-MM-dd'),
      scheduled_time: '08:00',
      recurrence: 'once',
      recurrence_days: [],
      notes: '',
    });
    setEditingTask(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.pet_id) {
      toast.error('Title and pet are required');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      const taskData = {
        user_id: userId,
        pet_id: formData.pet_id,
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time || null,
        recurrence: formData.recurrence,
        recurrence_days: formData.recurrence === 'custom' ? formData.recurrence_days : null,
        notes: formData.notes || null,
        is_completed: false,
      };

      if (editingTask) {
        const { error } = await supabase
          .from('care_tasks')
          .update({ ...taskData, updated_at: new Date().toISOString() })
          .eq('id', editingTask.id);
        if (error) throw error;
        toast.success('Task updated!');
      } else {
        const { error } = await supabase.from('care_tasks').insert(taskData);
        if (error) throw error;
        toast.success('Task created!');
      }

      resetForm();
      setIsAdding(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (task: CareTask) => {
    const supabase = createClient();
    const newCompleted = !task.is_completed;
    
    const { error } = await supabase
      .from('care_tasks')
      .update({ 
        is_completed: newCompleted, 
        completed_at: newCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id);
    
    if (error) {
      toast.error(error.message);
      return;
    }

    // Log completion
    if (newCompleted) {
      await supabase.from('care_logs').insert({
        task_id: task.id,
        pet_id: task.pet_id,
        user_id: userId,
        completed_at: new Date().toISOString(),
      });
    }

    toast.success(newCompleted ? 'Task completed!' : 'Task marked as pending');
    fetchData();
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('care_tasks').delete().eq('id', taskId);
    if (error) toast.error(error.message);
    else { toast.success('Task deleted'); fetchData(); }
  };

  const handleEdit = (task: CareTask) => {
    setEditingTask(task);
    setFormData({
      pet_id: task.pet_id,
      title: task.title,
      description: task.description || '',
      category: task.category,
      scheduled_date: task.scheduled_date,
      scheduled_time: task.scheduled_time || '08:00',
      recurrence: task.recurrence,
      recurrence_days: task.recurrence_days || [],
      notes: task.notes || '',
    });
    setIsAdding(true);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchPet = !selectedPetId || task.pet_id === selectedPetId;
    const matchCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchDate = viewMode === 'day' 
      ? isSameDay(parseISO(task.scheduled_date), selectedDate)
      : true; // For week view, show all in the week
    return matchPet && matchCategory && matchDate;
  });

  // Group by date for week view
  const tasksByDate = filteredTasks.reduce((acc, task) => {
    const date = task.scheduled_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, CareTask[]>);

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate), i));

  if (loading) {
    return <div className="space-y-4 animate-pulse"><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Care Tasks</h1>
          <p className="text-muted-foreground">Manage daily care schedules</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAdding(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {pets.length > 1 && (
              <Select value={selectedPetId || 'all'} onValueChange={(v) => setSelectedPetId(v === 'all' ? null : v)}>
                <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Pets" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pets</SelectItem>
                  {pets.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CARE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setViewMode('day')}>
                <Calendar className="mr-1 h-4 w-4" />
                Day
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode('week')}>
                <Calendar className="mr-1 h-4 w-4" />
                Week
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="space-y-4">
          {weekDates.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayTasks = tasksByDate[dateStr] || [];
            const isTodayDate = isToday(date);
            
            return (
              <Card key={dateStr} className={cn(isTodayDate && 'ring-2 ring-primary/50')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn('flex items-center gap-2', isTodayDate && 'text-primary font-semibold')}>
                      <span className="font-display text-lg">{format(date, 'EEE')}</span>
                      <span className="text-2xl font-display font-bold">{format(date, 'd')}</span>
                      <span className="text-muted-foreground">{format(date, 'MMM')}</span>
                      {isTodayDate && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Today</span>}
                    </div>
                    <span className="text-sm text-muted-foreground">{dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}</span>
                  </div>
                  {dayTasks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No tasks scheduled</p>
                  ) : (
                    <div className="space-y-2">
                      {dayTasks.map(task => (
                        <TaskItem key={task.id} task={task} onToggle={handleToggleComplete} onEdit={handleEdit} onDelete={handleDelete} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</CardTitle>
              {isToday(selectedDate) && <span className="text-xs text-primary font-medium">Today</span>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subWeeks(selectedDate, 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(new Date())} className="hidden sm:flex">Today</Button>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <h4 className="font-medium mb-1">No tasks for this day</h4>
                <Button asChild size="sm" onClick={() => { resetForm(); setFormData(prev => ({ ...prev, scheduled_date: format(selectedDate, 'yyyy-MM-dd') })); setIsAdding(true); }}>
                  <Link href="#">Add Task</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={handleToggleComplete} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Task Dialog */}
      <Dialog open={isAdding || !!editingTask} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'New Care Task'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-4 pt-0">
            <div className="space-y-2">
              <Label htmlFor="pet_id">Pet *</Label>
              <Select value={formData.pet_id} onValueChange={(v) => setFormData({ ...formData, pet_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select pet" /></SelectTrigger>
                <SelectContent>
                  {pets.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input id="title" placeholder="Morning feeding" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Details..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CARE_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <span>{c.icon}</span>
                        <span>{c.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Date</Label>
                <Input id="scheduled_date" type="date" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduled_time">Time</Label>
                <Input id="scheduled_time" type="time" value={formData.scheduled_time} onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recurrence</Label>
              <Select value={formData.recurrence} onValueChange={(v) => setFormData({ ...formData, recurrence: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="weekdays">Weekdays (Mon-Fri)</SelectItem>
                  <SelectItem value="weekends">Weekends</SelectItem>
                  <SelectItem value="custom">Custom Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.recurrence === 'custom' && (
              <div className="space-y-2">
                <Label>Select Days</Label>
                <div className="flex gap-2 flex-wrap">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        recurrence_days: prev.recurrence_days.includes(i)
                          ? prev.recurrence_days.filter(d => d !== i)
                          : [...prev.recurrence_days, i]
                      }))}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        formData.recurrence_days.includes(i)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-accent'
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => resetForm()}>Cancel</Button>
              <Button type="submit" loading={submitting}>{editingTask ? 'Save Changes' : 'Create Task'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaskItem({ task, onToggle, onEdit, onDelete }: { 
  task: CareTask; 
  onToggle: (t: CareTask) => void; 
  onEdit: (t: CareTask) => void; 
  onDelete: (id: string) => void; 
}) {
  const cat = getCategoryInfo(task.category);
  
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border transition-colors',
      task.is_completed ? 'bg-green-50 border-green-200' : 'bg-background hover:bg-accent/50'
    )}>
      <Button 
        variant={task.is_completed ? 'default' : 'outline'} 
        size="icon" 
        onClick={() => onToggle(task)}
        className={cn(task.is_completed && 'bg-green-100 text-green-600')}
      >
        <CheckCircle className={cn('h-5 w-5', task.is_completed && 'fill-current')} />
      </Button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('font-medium truncate flex-1', task.is_completed && 'line-through text-muted-foreground')}>{task.title}</span>
          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', cat.color)}>{cat.icon} {cat.label}</span>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
          {task.scheduled_time && <><Clock className="h-3 w-3" />{formatTime(task.scheduled_time)}</>}
          <Avatar className="h-5 w-5"><AvatarImage src={task.pet.avatar_url} /><AvatarFallback className="text-xs">{task.pet.name[0]}</AvatarFallback></Avatar>
          <span>{task.pet.name}</span>
          {task.recurrence !== 'once' && <span className="text-primary">🔄 {task.recurrence}</span>}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(task)}><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
    </div>
  );
}
