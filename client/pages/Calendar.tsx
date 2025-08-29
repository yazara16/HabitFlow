import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Target,
  CheckCircle2,
  Circle,
  Flame,
  TrendingUp,
  Clock,
  Grid3X3,
  List,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import HabitDialog from "@/components/HabitDialog";
import { useHabits, Habit as HabitType } from "@/contexts/HabitsContext";
import { useHabitReminders } from "@/hooks/use-habit-reminders";
import { toast } from "@/hooks/use-toast";

type Habit = HabitType;

interface CalendarHabit {
  id: string;
  name: string;
  category: "exercise" | "hydration" | "finance" | "shopping" | "custom";
  icon: any;
  color: string;
  time?: string;
  completed: boolean;
  streak: number;
}

interface CalendarDay {
  date: Date;
  habits: CalendarHabit[];
  isCurrentMonth: boolean;
  isToday: boolean;
  completionRate: number;
}

const MAX_HABITS_PER_DAY = 2;

export default function Calendar() {
  useHabitReminders();
  const { habits, addHabit, updateHabit } = useHabits();
  const isDraggingRef = useRef(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [dayDetailOpen, setDayDetailOpen] = useState(false);
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);

  const isScheduledOn = (habit: Habit, date: Date) => {
    const created = habit.createdAt ? new Date(habit.createdAt + "T00:00:00") : new Date(0);
    if (date < created) return false;
    switch (habit.frequency) {
      case "daily":
        return true;
      case "weekly": {
        return date.getDay() === created.getDay();
      }
      case "monthly": {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const defaultMonths = [created.getMonth() + 1];
        const defaultDays = [created.getDate()];
        const months = habit.monthlyMonths && habit.monthlyMonths.length > 0 ? habit.monthlyMonths : defaultMonths;
        const days = habit.monthlyDays && habit.monthlyDays.length > 0 ? habit.monthlyDays : defaultDays;
        return months.includes(month) && days.includes(day);
      }
      default:
        return false;
    }
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();

      const dayHabits: CalendarHabit[] = isCurrentMonth
        ? habits
            .filter((h) => isScheduledOn(h, date))
            .map((h) => ({
              id: h.id,
              name: h.name,
              category: h.category,
              icon: h.icon,
              color: h.color,
              time: h.reminderTime,
              completed: date.toDateString() === new Date().toDateString() ? h.completed >= h.target : false,
              streak: h.streak,
            }))
        : [];

      const completionRate = dayHabits.length > 0 ? (dayHabits.filter((h) => h.completed).length / dayHabits.length) * 100 : 0;

      days.push({
        date,
        habits: (date.getDate() % 2 === 0 ? dayHabits : []),
        isCurrentMonth,
        isToday,
        completionRate,
      });
    }

    return days;
  };

  const calendarDays = useMemo(() => generateCalendarDays(), [currentDate, habits]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day);
    setDayDetailOpen(true);
  };

  const getCompletionColor = (rate: number) => {
    if (rate === 100) return "bg-success";
    if (rate >= 75) return "bg-warning";
    if (rate >= 50) return "bg-info";
    if (rate > 0) return "bg-destructive";
    return "bg-muted";
  };

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    const wd = d.getDay();
    d.setDate(d.getDate() - wd);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  const weekDays = useMemo(() => (
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    })
  ), [weekStart]);

  const thisMonthStats = calendarDays
    .filter((day) => day.isCurrentMonth)
    .reduce(
      (acc, day) => {
        if (day.habits.length > 0) {
          acc.totalDays++;
          if (day.completionRate === 100) acc.perfectDays++;
          if (day.completionRate >= 50) acc.goodDays++;
        }
        return acc;
      },
      { totalDays: 0, perfectDays: 0, goodDays: 0 }
    );

  const handleDropHabit = (habitId: string, dropDate: Date) => {
    const h = habits.find((x) => x.id === habitId);
    if (!h) return;
    const createdAt = dropDate.toISOString().split('T')[0];
    if (h.frequency === 'daily') {
      toast({ title: 'No se puede mover', description: 'Los hábitos diarios se repiten todos los días.' });
      return;
    }
    if (h.frequency === 'weekly') {
      updateHabit(h.id, { createdAt });
      toast({ title: 'Hábito movido', description: `Programado los ${dayNames[dropDate.getDay()]}.` });
      return;
    }
    if (h.frequency === 'monthly') {
      const m = dropDate.getMonth() + 1;
      const d = dropDate.getDate();
      const months = Array.from(new Set([...(h.monthlyMonths || []), m])).sort((a, b) => a - b);
      const days = Array.from(new Set([...(h.monthlyDays || []), d])).sort((a, b) => a - b);
      updateHabit(h.id, { createdAt, monthlyMonths: months, monthlyDays: days });
      toast({ title: 'Hábito movido', description: `Programado el día ${d} de ${monthNames[m - 1]}.` });
      return;
    }
    toast({ title: 'Frecuencia no soportada', description: 'Esta frecuencia aún no admite arrastrar y soltar.' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Calendario de Hábitos</h1>
              <p className="text-muted-foreground">Planifica y visualiza tus hábitos en el tiempo</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "month" | "week")}>
                <TabsList>
                  <TabsTrigger value="month" className="flex items-center space-x-2">
                    <Grid3X3 className="h-4 w-4" />
                    <span>Mes</span>
                  </TabsTrigger>
                  <TabsTrigger value="week" className="flex items-center space-x-2">
                    <List className="h-4 w-4" />
                    <span>Semana</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Días Perfectos</p>
                    <p className="text-2xl font-bold">{thisMonthStats.perfectDays}</p>
                  </div>
                  <Target className="h-8 w-8 text-success/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Días Productivos</p>
                    <p className="text-2xl font-bold">{thisMonthStats.goodDays}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-warning/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tasa de Éxito</p>
                    <p className="text-2xl font-bold">{thisMonthStats.totalDays > 0 ? Math.round((thisMonthStats.goodDays / thisMonthStats.totalDays) * 100) : 0}%</p>
                  </div>
                  <Flame className="h-8 w-8 text-orange-500/60" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Hoy
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>Haz clic en cualquier día para ver y gestionar tus hábitos</CardDescription>
          </CardHeader>

          <CardContent>
            {viewMode === "month" ? (
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}

                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => day.isCurrentMonth && handleDayClick(day)}
                    className={`
                      p-2 min-h-[80px] border border-border rounded-lg cursor-pointer transition-all hover:border-border/60
                      ${day.isCurrentMonth ? "bg-background" : "bg-muted/30"}
                      ${day.isToday ? "ring-2 ring-primary" : ""}
                      ${day.isCurrentMonth ? "hover:shadow-sm" : ""}
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-medium ${day.isCurrentMonth ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {day.date.getDate()}
                      </span>
                      {day.completionRate > 0 && day.isCurrentMonth && (
                        <div className={`w-2 h-2 rounded-full ${getCompletionColor(day.completionRate)}`} />
                      )}
                    </div>

                    {day.isCurrentMonth && (
                      <div className="space-y-1">
                        {day.habits.slice(0, MAX_HABITS_PER_DAY).map((habit, habitIndex) => {
                          const Icon = habit.icon;
                          return (
                            <div key={habitIndex} className={`flex items-center space-x-1 p-1 rounded text-xs ${habit.color}`}>
                              <Icon className="h-3 w-3" />
                              {habit.completed && <CheckCircle2 className="h-3 w-3 text-success ml-auto" />}
                            </div>
                          );
                        })}
                        {day.habits.length > MAX_HABITS_PER_DAY && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{day.habits.length - MAX_HABITS_PER_DAY} más
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((date, idx) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  const dayHabits: CalendarHabit[] = habits.filter(h => isScheduledOn(h, date)).map(h => ({
                    id: h.id,
                    name: h.name,
                    category: h.category,
                    icon: h.icon,
                    color: h.color,
                    time: h.reminderTime,
                    completed: date.toDateString() === new Date().toDateString() ? (h.completed >= h.target) : false,
                    streak: h.streak,
                  }));
                  const shownHabits = date.getDate() % 2 === 0 ? dayHabits : [];
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (isDraggingRef.current) return;
                        const completionRate = shownHabits.length > 0 ? (shownHabits.filter(h => h.completed).length / shownHabits.length) * 100 : 0;
                        handleDayClick({ date, habits: shownHabits, isCurrentMonth: true, isToday, completionRate });
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const id = e.dataTransfer.getData('text/plain');
                        if (id) handleDropHabit(id, date);
                      }}
                      className={`p-2 min-h-[140px] border border-border rounded-lg cursor-pointer transition-all hover:border-border/60 ${isToday ? 'ring-2 ring-primary' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{dayNames[date.getDay()]} {date.getDate()}</span>
                      </div>
                      <div className="space-y-1">
                        {shownHabits.map((habit, hIdx) => {
                          const Icon = habit.icon;
                          const source = habits.find(x => x.id === habit.id);
                          const draggable = source?.frequency !== 'daily';
                          return (
                            <div
                              key={hIdx}
                              draggable={draggable}
                              onMouseDown={(e) => e.stopPropagation()}
                              onDragStart={(e) => {
                                isDraggingRef.current = true;
                                e.dataTransfer.setData('text/plain', habit.id);
                              }}
                              onDragEnd={() => {
                                // small timeout to avoid click firing after drag
                                setTimeout(() => { isDraggingRef.current = false; }, 50);
                              }}
                              className={`flex items-center space-x-1 p-2 rounded text-xs ${habit.color} ${draggable ? 'cursor-move' : ''}`}
                            >
                              <Icon className="h-3 w-3" />
                              <span className="truncate">{habit.name}</span>
                              {habit.completed && (
                                <CheckCircle2 className="h-3 w-3 text-success ml-auto" />
                              )}
                            </div>
                          );
                        })}
                        {shownHabits.length === 0 && (
                          <div className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded">
                            Arrastra aquí
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Leyenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-sm">100% completado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-sm">75%+ completado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-info" />
                <span className="text-sm">50%+ completado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-sm">Parcialmente completado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dayDetailOpen} onOpenChange={setDayDetailOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>
                {selectedDay?.date.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </DialogTitle>
            <DialogDescription>
              {(selectedDay?.habits.length || 0)} hábitos programados para este día
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedDay?.habits.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay hábitos programados para este día</p>
                <Button className="mt-4" size="sm" onClick={() => setHabitDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Hábito
                </Button>
              </div>
            ) : (
              selectedDay?.habits.map((habit, index) => {
                const Icon = habit.icon;
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                    <div className={`p-2 rounded-lg ${habit.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{habit.name}</h4>
                        {habit.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        {habit.time && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{habit.time}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          <span>{habit.streak} días</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {selectedDay && selectedDay.habits.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progreso del día:</span>
                  <span className="font-medium">{Math.round(selectedDay.completionRate)}% completado</span>
                </div>
              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>

      <HabitDialog
        open={habitDialogOpen}
        onOpenChange={setHabitDialogOpen}
        onSave={(newHabit) => {
          if (selectedDay) {
            addHabit(newHabit as any, { assignDate: selectedDay.date });
          } else {
            addHabit(newHabit as any);
          }
        }}
      />
    </div>
  );
}
