import { useMemo, useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Star,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import HabitDialog from "@/components/HabitDialog";
import { useHabits, Habit as HabitType } from "@/contexts/HabitsContext";
import { useHabitReminders } from "@/hooks/use-habit-reminders";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Habit = HabitType;

interface CalendarHabit {
  id: string;
  name: string;
  category:
    | "exercise"
    | "hydration"
    | "finance"
    | "shopping"
    | "reading"
    | "study"
    | "custom";
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
  const { user } = useAuth();
  const {
    habits,
    addHabit,
    updateHabit,
    removeHabit,
    getHabitsForDate,
    hideHabitOnDate,
    updateHabitForDate,
  } = useHabits();
  const isDraggingRef = useRef(false);
  const [forceShowDates, setForceShowDates] = useState<Record<string, boolean>>(
    {},
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [dayDetailOpen, setDayDetailOpen] = useState(false);
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const isScheduledOn = (habit: Habit, date: Date) => {
    const created = habit.createdAt
      ? new Date(habit.createdAt + "T00:00:00")
      : new Date(0);
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
        const months =
          habit.monthlyMonths && habit.monthlyMonths.length > 0
            ? habit.monthlyMonths
            : defaultMonths;
        const days =
          habit.monthlyDays && habit.monthlyDays.length > 0
            ? habit.monthlyDays
            : defaultDays;
        return months.includes(month) && days.includes(day);
      }
      default:
        return false;
    }
  };

  // calendarLogsMap: key `${date}_${habitId}` -> { completedBoolean, completedAmount }
  const [calendarLogsMap, setCalendarLogsMap] = useState<Record<string, any>>(
    {},
  );

  function toCalHabit(h: Habit, date: Date): CalendarHabit {
    const iso = date.toISOString().split("T")[0];
    const key = `${iso}_${h.id}`;
    const serverEntry = calendarLogsMap[key];
    const completed = serverEntry
      ? !!serverEntry.completedBoolean
      : h.completed >= h.target;
    return {
      id: h.id,
      name: h.name,
      category: h.category,
      icon: h.icon,
      color: h.color,
      time: h.reminderTime,
      completed,
      streak: h.streak,
    };
  }

  function isAlternateOn(date: Date) {
    return date.getDate() % 2 === 0;
  }

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

      const realHabits: CalendarHabit[] = isCurrentMonth
        ? getHabitsForDate(date).map((h) => toCalHabit(h, date))
        : [];

      const dayHabits = isCurrentMonth ? realHabits : [];
      const completionRate =
        dayHabits.length > 0
          ? (dayHabits.filter((h) => h.completed).length / dayHabits.length) *
            100
          : 0;

      days.push({
        date,
        habits: dayHabits,
        isCurrentMonth,
        isToday,
        completionRate,
      });
    }

    return days;
  };

  // Fetch calendar logs/overrides for the current month range
  const monthStart = useMemo(() => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return d.toISOString().split("T")[0];
  }, [currentDate]);
  const monthEnd = useMemo(() => {
    const d = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    return d.toISOString().split("T")[0];
  }, [currentDate]);

  // useQuery: fetch calendar logs for visible month
  const { data: calendarData, isLoading: calendarLoading } = (window as any)
    .__reactQueryClient__
    ? (window as any).__reactQueryClient__.getQueryData([
        "calendar",
        monthStart,
        monthEnd /* user id included */,
      ])
    : { data: null, isLoading: false };

  // If not available via global, perform a local fetch (fallback)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("auth:token");
        const res = await fetch(
          `/api/users/${user.id}/calendar?from=${monthStart}&to=${monthEnd}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
        );
        if (!res.ok) return;
        const json = await res.json();
        if (!mounted) return;
        const map: Record<string, any> = {};
        for (const l of json.logs || []) {
          const key = `${l.date}_${l.habitId}`;
          map[key] = {
            completedBoolean: !!l.completedBoolean,
            completedAmount: l.completedAmount,
          };
        }
        // overrides not used directly here but could be merged
        setCalendarLogsMap(map);
      } catch (e) {}
    })();
    return () => {
      mounted = false;
    };
  }, [monthStart, monthEnd, user]);

  const calendarDays = useMemo(
    () => generateCalendarDays(),
    [currentDate, habits, calendarLogsMap],
  );

  const navigate = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === "month") {
        newDate.setMonth(prev.getMonth() + (direction === "prev" ? -1 : 1));
      } else {
        newDate.setDate(prev.getDate() + (direction === "prev" ? -5 : 5));
      }
      return newDate;
    });
  };

  const buildCalendarDay = (date: Date): CalendarDay => {
    const isToday = date.toDateString() === new Date().toDateString();
    const all = getHabitsForDate(date).map((h) => toCalHabit(h, date));
    const hs = all;
    const completionRate =
      hs.length > 0
        ? (hs.filter((h) => h.completed).length / hs.length) * 100
        : 0;
    return { date, habits: hs, isCurrentMonth: true, isToday, completionRate };
  };

  const refreshSelectedDay = (date: Date) => {
    setSelectedDay(buildCalendarDay(date));
  };

  const toggleHabitCompletion = (habitId: string, date: Date) => {
    const iso = date.toISOString().split("T")[0];
    const h = habits.find((hh) => hh.id === habitId);
    if (!h) return;

    if (iso === new Date().toISOString().split("T")[0]) {
      // Toggle global today state
      const newCompleted = h.completedToday
        ? Math.max(0, h.completed - 1)
        : Math.min(h.target, h.completed + 1);
      updateHabit(habitId, {
        completed: newCompleted,
        completedToday: !h.completedToday,
        streak: !h.completedToday ? h.streak + 1 : h.streak,
        lastCompleted: !h.completedToday ? iso : h.lastCompleted,
      });
      toast({
        title: !h.completedToday
          ? "Hábito marcado como completado"
          : "Hábito desmarcado",
      });
    } else {
      // Per-day override for other dates
      const dayHabits = getHabitsForDate(date);
      const dh = dayHabits.find((x) => x.id === habitId) || h;
      const isCompleted = dh.completed >= dh.target;
      const newCompleted = isCompleted ? 0 : dh.target;
      updateHabitForDate(habitId, date, {
        completed: newCompleted,
        completedToday: newCompleted >= dh.target,
        lastCompleted: newCompleted >= dh.target ? iso : undefined,
      } as any);
      toast({
        title: isCompleted
          ? "Hábito desmarcado en la fecha"
          : "Hábito marcado en la fecha",
      });
    }

    refreshSelectedDay(date);
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(buildCalendarDay(day.date));
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

  const windowStart = useMemo(() => {
    const d = new Date(currentDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  const fiveDays = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const d = new Date(windowStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [windowStart],
  );

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
      { totalDays: 0, perfectDays: 0, goodDays: 0 },
    );

  const handleDropHabit = (habitId: string, dropDate: Date) => {
    const h = habits.find((x) => x.id === habitId);
    if (!h) return;
    const createdAt = dropDate.toISOString().split("T")[0];
    const m = dropDate.getMonth() + 1;
    const d = dropDate.getDate();
    updateHabit(h.id, {
      createdAt,
      frequency: "monthly" as any,
      monthlyMonths: [m],
      monthlyDays: [d],
    });
    toast({
      title: "Hábito movido",
      description: `Programado el ${d} de ${monthNames[m - 1]}.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Calendario de Hábitos
              </h1>
              <p className="text-muted-foreground">
                Planifica y visualiza tus hábitos en el tiempo
              </p>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Tabs
                value={viewMode}
                onValueChange={(value) =>
                  setViewMode(value as "month" | "week")
                }
              >
                <TabsList>
                  <TabsTrigger
                    value="month"
                    className="flex items-center space-x-2"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span>Mes</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="week"
                    className="flex items-center space-x-2"
                  >
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
                    <p className="text-sm text-muted-foreground">
                      Días Perfectos
                    </p>
                    <p className="text-2xl font-bold">
                      {thisMonthStats.perfectDays}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-success/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Días Productivos
                    </p>
                    <p className="text-2xl font-bold">
                      {thisMonthStats.goodDays}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-warning/60" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tasa de Éxito
                    </p>
                    <p className="text-2xl font-bold">
                      {thisMonthStats.totalDays > 0
                        ? Math.round(
                            (thisMonthStats.goodDays /
                              thisMonthStats.totalDays) *
                              100,
                          )
                        : 0}
                      %
                    </p>
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
                  {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              Haz clic en cualquier día para ver y gestionar tus hábitos
            </CardDescription>
          </CardHeader>

          <CardContent>
            {viewMode === "month" ? (
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-medium text-muted-foreground"
                  >
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
                        <div
                          className={`w-2 h-2 rounded-full ${getCompletionColor(day.completionRate)}`}
                        />
                      )}
                    </div>

                    {day.isCurrentMonth && (
                      <div className="space-y-1">
                        {day.habits
                          .slice(0, MAX_HABITS_PER_DAY)
                          .map((habit, habitIndex) => {
                            const Icon = habit.icon;
                            return (
                              <div
                                key={habitIndex}
                                className={`flex items-center space-x-1 p-1 rounded text-xs ${habit.color}`}
                              >
                                {typeof Icon === 'function' ? <Icon className="h-3 w-3" /> : <Star className="h-3 w-3" /> }
                                <span className="truncate">{habit.name}</span>
                                {habit.completed && (
                                  <CheckCircle2 className="h-3 w-3 text-success ml-auto" />
                                )}
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
              <div className="grid grid-cols-5 gap-2">
                {fiveDays.map((date, idx) => {
                  const isToday =
                    date.toDateString() === new Date().toDateString();
                  const realHabits: CalendarHabit[] = getHabitsForDate(
                    date,
                  ).map((h) => toCalHabit(h, date));
                  const displayHabits = realHabits;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (isDraggingRef.current) return;
                        const completionRate =
                          displayHabits.length > 0
                            ? (displayHabits.filter((h) => h.completed).length /
                                displayHabits.length) *
                              100
                            : 0;
                        handleDayClick({
                          date,
                          habits: displayHabits,
                          isCurrentMonth: true,
                          isToday,
                          completionRate,
                        });
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const id = e.dataTransfer.getData("text/plain");
                        if (id) handleDropHabit(id, date);
                        setTimeout(() => {
                          isDraggingRef.current = false;
                        }, 0);
                      }}
                      className={`p-2 min-h-[140px] border border-border rounded-lg cursor-pointer transition-all hover:border-border/60 ${isToday ? "ring-2 ring-primary" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {dayNames[date.getDay()]} {date.getDate()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {displayHabits.map((habit, hIdx) => {
                          const Icon = habit.icon;
                          const draggable = true;
                          return (
                            <div
                              key={hIdx}
                              draggable={draggable}
                              onMouseDown={(e) => e.stopPropagation()}
                              onDragStart={(e) => {
                                isDraggingRef.current = true;
                                e.dataTransfer.setData("text/plain", habit.id);
                              }}
                              onDragEnd={() => {
                                setTimeout(() => {
                                  isDraggingRef.current = false;
                                }, 50);
                              }}
                              className={`flex items-center space-x-1 p-2 rounded text-xs ${habit.color} cursor-move`}
                            >
                              {typeof Icon === 'function' ? <Icon className="h-3 w-3" /> : <Star className="h-3 w-3" /> }
                              <span className="truncate">{habit.name}</span>
                              {habit.completed && (
                                <CheckCircle2 className="h-3 w-3 text-success ml-auto" />
                              )}
                            </div>
                          );
                        })}
                        {displayHabits.length === 0 && (
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
              {selectedDay?.habits.length || 0} hábitos programados para este
              día
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedDay?.habits.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No hay hábitos programados para este día
                </p>
                <Button
                  className="mt-4"
                  size="sm"
                  onClick={() => setHabitDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Hábito
                </Button>
              </div>
            ) : (
              selectedDay?.habits.map((habit, index) => {
                const Icon = habit.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:border-border/60 cursor-pointer"
                    onClick={() => {
                      const original = habits.find((h) => h.id === habit.id);
                      if (original) {
                        setEditingHabit(original as any);
                        setHabitDialogOpen(true);
                      }
                    }}
                  >
                    <div className={`p-2 rounded-lg ${habit.color}`}>
                      {typeof Icon === 'function' ? <Icon className="h-4 w-4" /> : <Star className="h-4 w-4" /> }
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{habit.name}</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!selectedDay) return;
                            toggleHabitCompletion(habit.id, selectedDay.date);
                          }}
                          className="p-1 rounded"
                          aria-label={
                            habit.completed
                              ? "Marcar como no completado"
                              : "Marcar como completado"
                          }
                        >
                          {habit.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!selectedDay) return;
                            hideHabitOnDate(habit.id, selectedDay.date);
                            refreshSelectedDay(selectedDay.date);
                            toast({ title: "Hábito eliminado para este día" });
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {selectedDay && selectedDay.habits.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Progreso del día:
                  </span>
                  <span className="font-medium">
                    {Math.round(selectedDay.completionRate)}% completado
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <HabitDialog
        open={habitDialogOpen}
        onOpenChange={(open) => {
          setHabitDialogOpen(open);
          if (!open) setEditingHabit(null);
        }}
        hideFrequency
        habit={editingHabit as any}
        onSave={(newHabit) => {
          if (editingHabit && selectedDay) {
            updateHabitForDate(
              editingHabit.id,
              selectedDay.date,
              newHabit as any,
            );
            refreshSelectedDay(selectedDay.date);
            toast({ title: "Hábito actualizado para este día" });
          } else if (editingHabit) {
            updateHabit(editingHabit.id, newHabit as any);
            toast({ title: "Hábito actualizado" });
          } else if (selectedDay) {
            const date = selectedDay.date;
            const m = date.getMonth() + 1;
            const d = date.getDate();
            const habitToSave = {
              ...newHabit,
              frequency: "monthly",
              monthlyMonths: [m],
              monthlyDays: [d],
            } as any;
            addHabit(habitToSave, { assignDate: date });
            refreshSelectedDay(date);
            toast({ title: "Hábito creado" });
          } else {
            addHabit(newHabit as any);
            toast({ title: "Hábito creado" });
          }
        }}
      />
    </div>
  );
}
