import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import HabitDialog from "@/components/HabitDialog";

interface DashboardStats {
  completedToday?: number;
  totalHabits?: number;
  maxStreak?: number;
  weekCompleted?: number;
  achievementsCount?: number;
  categoryCounts?: Record<string, number>;
  [key: string]: any;
}
import ProgressCharts from "@/components/ProgressCharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  TrendingUp,
  Target,
  Calendar as CalendarIcon,
  Flame,
  Plus,
  MoreHorizontal,
  Droplets,
  Dumbbell,
  DollarSign,
  ShoppingCart,
  Star,
  Award,
  Zap,
  Book,
  BookOpen,
  Clock,
  Moon,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import Celebration from "@/components/Celebration";
import { useAuth } from "@/contexts/AuthContext";
import { useHabits, Habit as HabitType } from "@/contexts/HabitsContext";
import { toast } from "@/hooks/use-toast";
import { useHabitReminders } from "@/hooks/use-habit-reminders";

type Habit = HabitType;

export default function Dashboard() {
  useHabitReminders();
  const { habits, addHabit, updateHabit } = useHabits();
  const { user } = useAuth();
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(
    undefined,
  );
  const userName = user?.name ?? "";
  const navigate = useNavigate();

  // Fetch dashboard stats via React Query
  const {
    data: serverStats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorObj,
  } = useQuery<DashboardStats, Error>({
    queryKey: ["dashboard", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const token = localStorage.getItem("auth:token");
      const res = await fetch(`/api/users/${user.id}/dashboard`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to load dashboard");
      }
      return res.json();
    },
    enabled: !!user,
    staleTime: 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  } as any);

  useEffect(() => {
    if (statsError && statsErrorObj) {
      try {
        toast({
          title: "Error cargando tablero",
          description: String((statsErrorObj as any).message || statsErrorObj),
        });
      } catch (e) {}
    }
  }, [statsError, statsErrorObj]);

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const completedHabitsToday =
    serverStats?.completedToday ??
    habits.filter((h) => h.completedToday).length;
  const totalHabits = serverStats?.totalHabits ?? (habits.length || 1);
  const completionPercentage =
    totalHabits === 0 ? 0 : (completedHabitsToday / totalHabits) * 100;

  const toggleHabit = (habitId: string) => {
    const h = habits.find((x) => x.id === habitId);
    if (!h) return;
    const newCompleted = h.completedToday
      ? Math.max(0, h.completed - 1)
      : Math.min(h.target, h.completed + 1);
    const willBeCompleted = !h.completedToday && newCompleted >= h.target;
    updateHabit(habitId, {
      completed: newCompleted,
      completedToday: !h.completedToday,
      streak: !h.completedToday ? h.streak + 1 : h.streak,
      lastCompleted: !h.completedToday
        ? new Date().toISOString().split("T")[0]
        : h.lastCompleted,
    });
    if (willBeCompleted) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1600);
    }
  };

  const incrementHabit = (habitId: string) => {
    const h = habits.find((x) => x.id === habitId);
    if (!h || h.completed >= h.target) return;
    const newCompleted = h.completed + 1;
    const willBeCompleted = newCompleted >= h.target && h.completed < h.target;
    updateHabit(habitId, {
      completed: newCompleted,
      completedToday: newCompleted >= h.target,
      lastCompleted:
        newCompleted >= h.target
          ? new Date().toISOString().split("T")[0]
          : h.lastCompleted,
    });
    if (willBeCompleted) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1600);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                ¡Buen día{userName ? ", " : ""}
                {userName}! 👋
              </h1>
              <p className="text-muted-foreground capitalize">{today}</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Button
                className="flex items-center space-x-2"
                onClick={() => {
                  setEditingHabit(undefined);
                  setHabitDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo Hábito</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card
            onClick={() => navigate("/today")}
            className="cursor-pointer hover:shadow-md"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Hoy Completados
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {statsLoading ? (
                      <span className="inline-block w-24 h-6 bg-muted/30 rounded animate-pulse" />
                    ) : (
                      `${completedHabitsToday}/${totalHabits}`
                    )}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={completionPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-4 bg-muted/30 rounded animate-pulse" />
                  ) : (
                    `${Math.round(completionPercentage)}% completado`
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate("/streak")}
            className="cursor-pointer hover:shadow-md"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Racha Actual
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {statsLoading ? (
                      <span className="inline-block w-20 h-6 bg-muted/30 rounded animate-pulse" />
                    ) : (
                      `${serverStats?.maxStreak ?? 0} días`
                    )}
                  </p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-success">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">
                  {statsLoading ? (
                    <span className="inline-block w-14 h-4 bg-muted/30 rounded animate-pulse" />
                  ) : (
                    "+2 desde ayer"
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate("/week")}
            className="cursor-pointer hover:shadow-md"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Esta Semana
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {statsLoading ? (
                      <span className="inline-block w-20 h-6 bg-muted/30 rounded animate-pulse" />
                    ) : (
                      `${serverStats?.weekCompleted ?? 0}`
                    )}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-success">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">
                  {statsLoading ? (
                    <span className="inline-block w-16 h-4 bg-muted/30 rounded animate-pulse" />
                  ) : (
                    "66% completado"
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate("/achievements")}
            className="cursor-pointer hover:shadow-md"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Logros
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {statsLoading ? (
                      <span className="inline-block w-12 h-6 bg-muted/30 rounded animate-pulse" />
                    ) : (
                      `${serverStats?.achievementsCount ?? 0}`
                    )}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Award className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-warning">
                <Zap className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">
                  {statsLoading ? (
                    <span className="inline-block w-16 h-4 bg-muted/30 rounded animate-pulse" />
                  ) : (
                    "¡3 nuevos!"
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Hábitos de Hoy</span>
                  <Badge
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <Clock className="h-3 w-3" />
                    <span>
                      {Math.max(habits.length - completedHabitsToday, 0)}{" "}
                      pendientes
                    </span>
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Mantén tu momento y completa tus hábitos diarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {habits.map((habit) => {
                  const Icon = habit.icon;
                  const progress = (habit.completed / habit.target) * 100;
                  const isCompleted = habit.completed >= habit.target;

                  return (
                    <div
                      key={habit.id}
                      className="flex items-center space-x-4 p-4 rounded-lg border border-border/50 hover:border-border transition-colors"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHabit(habit.id)}
                        className={`p-2 rounded-full ${isCompleted ? "text-success bg-success/10" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </Button>

                      <div className={`p-2 rounded-lg ${habit.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}
                          >
                            {habit.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {habit.streak > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs flex items-center space-x-1"
                              >
                                <Flame className="h-3 w-3 text-orange-500" />
                                <span>{habit.streak}</span>
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {habit.completed}/{habit.target} {habit.unit}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Progress value={progress} className="flex-1 h-2" />
                          {habit.category === "hydration" &&
                            habit.completed < habit.target && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => incrementHabit(habit.id)}
                                className="text-xs px-2 py-1 h-6"
                              >
                                +1
                              </Button>
                            )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingHabit(habit);
                          setHabitDialogOpen(true);
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-primary">
                  <Zap className="h-5 w-5" />
                  <span>¡Motivación!</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground font-medium mb-4">
                  "¡Vas excelente! Has completado {completedHabitsToday} hábitos
                  hoy. ¡Sigue así!"
                </p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>
                    Solo quedan{" "}
                    {Math.max(habits.length - completedHabitsToday, 0)} para
                    completar el día
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categorías</CardTitle>
                <CardDescription>Resumen por tipo de hábito</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    key: "exercise",
                    name: "Ejercicio",
                    icon: Dumbbell,
                    count:
                      serverStats?.categoryCounts?.exercise ??
                      habits.filter((h) => h.category === "exercise").length,
                    color: "text-red-500",
                  },
                  {
                    key: "hydration",
                    name: "Hidratación",
                    icon: Droplets,
                    count:
                      serverStats?.categoryCounts?.hydration ??
                      habits.filter((h) => h.category === "hydration").length,
                    color: "text-blue-500",
                  },
                  {
                    key: "finance",
                    name: "Finanzas",
                    icon: DollarSign,
                    count:
                      serverStats?.categoryCounts?.finance ??
                      habits.filter((h) => h.category === "finance").length,
                    color: "text-green-500",
                  },
                  {
                    key: "shopping",
                    name: "Compras",
                    icon: ShoppingCart,
                    count:
                      serverStats?.categoryCounts?.shopping ??
                      habits.filter((h) => h.category === "shopping").length,
                    color: "text-orange-500",
                  },
                  {
                    key: "reading",
                    name: "Lectura",
                    icon: Book,
                    count:
                      serverStats?.categoryCounts?.reading ??
                      habits.filter((h) => h.category === "reading").length,
                    color: "text-indigo-600",
                  },
                  {
                    key: "meditation",
                    name: "Meditación",
                    icon: Moon,
                    count:
                      serverStats?.categoryCounts?.meditation ??
                      habits.filter((h) => h.category === "meditation" || h.name.toLowerCase().includes("medit")).length,
                    color: "text-purple-500",
                  },
                  {
                    key: "study",
                    name: "Estudio",
                    icon: BookOpen,
                    count:
                      serverStats?.categoryCounts?.study ??
                      habits.filter((h) => h.category === "study").length,
                    color: "text-cyan-600",
                  },
                  {
                    key: "custom",
                    name: "Personal",
                    icon: Star,
                    count:
                      serverStats?.categoryCounts?.custom ??
                      habits.filter((h) => h.category === "custom").length,
                    color: "text-purple-500",
                  },
                ].map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const Icon = category.icon;
                        return <Icon className={`h-4 w-4 ${category.color}`} />;
                      })()}
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {statsLoading ? (
                        <span className="inline-block w-6 h-4 bg-muted/30 rounded animate-pulse" />
                      ) : (
                        category.count
                      )}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span>Logros Recientes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <Flame className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Racha de 7 días</p>
                    <p className="text-xs text-muted-foreground">¡Imparable!</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Target className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Primera semana</p>
                    <p className="text-xs text-muted-foreground">
                      ¡Buen comienzo!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Análisis y Progreso
            </h2>
            <p className="text-muted-foreground">
              Visualiza tu rendimiento y identifica patrones para mejorar
            </p>
          </div>
          <ProgressCharts />
        </div>
      </div>

      <Celebration active={celebrate} />
      <HabitDialog
        open={habitDialogOpen}
        onOpenChange={setHabitDialogOpen}
        habit={editingHabit}
        onSave={(newHabit) => {
          if (editingHabit) {
            updateHabit(editingHabit.id, newHabit as any);
            toast({ title: "Hábito actualizado" });
          } else {
            addHabit(newHabit as any);
            toast({ title: "Hábito creado" });
          }
        }}
      />
    </div>
  );
}
