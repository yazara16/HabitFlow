import { useState } from "react";
import HabitDialog from "@/components/HabitDialog";
import ProgressCharts from "@/components/ProgressCharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Target, 
  Calendar,
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
  Clock,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import Navigation from "@/components/Navigation";

interface Habit {
  id: string;
  name: string;
  category: "exercise" | "hydration" | "finance" | "shopping" | "custom";
  icon: any;
  color: string;
  target: number;
  completed: number;
  streak: number;
  completedToday: boolean;
  unit: string;
}

export default function Dashboard() {
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: "1",
      name: "Correr 30 minutos",
      category: "exercise",
      icon: Dumbbell,
      color: "text-red-500 bg-red-500/10",
      target: 1,
      completed: 1,
      streak: 5,
      completedToday: true,
      unit: "sesión"
    },
    {
      id: "2", 
      name: "Beber 2 litros de agua",
      category: "hydration",
      icon: Droplets,
      color: "text-blue-500 bg-blue-500/10",
      target: 8,
      completed: 5,
      streak: 3,
      completedToday: false,
      unit: "vasos"
    },
    {
      id: "3",
      name: "Ahorrar $50",
      category: "finance", 
      icon: DollarSign,
      color: "text-green-500 bg-green-500/10",
      target: 50,
      completed: 30,
      streak: 7,
      completedToday: false,
      unit: "USD"
    },
    {
      id: "4",
      name: "Lista de compras semanal",
      category: "shopping",
      icon: ShoppingCart,
      color: "text-orange-500 bg-orange-500/10",
      target: 1,
      completed: 0,
      streak: 2,
      completedToday: false,
      unit: "lista"
    },
    {
      id: "5",
      name: "Meditar 15 minutos",
      category: "custom",
      icon: Star,
      color: "text-purple-500 bg-purple-500/10", 
      target: 1,
      completed: 1,
      streak: 12,
      completedToday: true,
      unit: "sesión"
    }
  ]);

  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const completedHabitsToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completionPercentage = (completedHabitsToday / totalHabits) * 100;

  const toggleHabit = (habitId: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const newCompleted = habit.completedToday ? 
          Math.max(0, habit.completed - 1) : 
          Math.min(habit.target, habit.completed + 1);
        
        return {
          ...habit,
          completed: newCompleted,
          completedToday: !habit.completedToday,
          streak: !habit.completedToday ? habit.streak + 1 : habit.streak
        };
      }
      return habit;
    }));
  };

  const incrementHabit = (habitId: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId && habit.completed < habit.target) {
        const newCompleted = habit.completed + 1;
        return {
          ...habit,
          completed: newCompleted,
          completedToday: newCompleted >= habit.target
        };
      }
      return habit;
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                ¡Buen día! 👋
              </h1>
              <p className="text-muted-foreground capitalize">{today}</p>
            </div>
            <Button
              className="mt-4 sm:mt-0 flex items-center space-x-2"
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hoy Completados</p>
                  <p className="text-2xl font-bold text-foreground">{completedHabitsToday}/{totalHabits}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={completionPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">{Math.round(completionPercentage)}% completado</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Racha Actual</p>
                  <p className="text-2xl font-bold text-foreground">7 días</p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-success">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">+2 desde ayer</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
                  <p className="text-2xl font-bold text-foreground">23/35</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-success">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">66% completado</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Logros</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Award className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-warning">
                <Zap className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">¡3 nuevos!</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Habits */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Hábitos de Hoy</span>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>5 pendientes</span>
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Mantén tu momentum y completa tus hábitos diarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {habits.map((habit) => {
                  const Icon = habit.icon;
                  const progress = (habit.completed / habit.target) * 100;
                  const isCompleted = habit.completed >= habit.target;
                  
                  return (
                    <div key={habit.id} className="flex items-center space-x-4 p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHabit(habit.id)}
                        className={`p-2 rounded-full ${isCompleted ? 'text-success bg-success/10' : 'text-muted-foreground hover:text-foreground'}`}
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
                          <h3 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {habit.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {habit.streak > 0 && (
                              <Badge variant="outline" className="text-xs flex items-center space-x-1">
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
                          {habit.category === "hydration" && habit.completed < habit.target && (
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

          {/* Quick Actions & Motivation */}
          <div className="space-y-6">
            {/* Motivation Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-primary">
                  <Zap className="h-5 w-5" />
                  <span>¡Motivación!</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground font-medium mb-4">
                  "¡Vas excelente! Has completado {completedHabitsToday} hábitos hoy. ¡Sigue así!"
                </p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>Solo quedan {totalHabits - completedHabitsToday} para completar el día</span>
                </div>
              </CardContent>
            </Card>

            {/* Categories Quick View */}
            <Card>
              <CardHeader>
                <CardTitle>Categorías</CardTitle>
                <CardDescription>Resumen por tipo de hábito</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Ejercicio", icon: Dumbbell, count: 1, color: "text-red-500" },
                  { name: "Hidratación", icon: Droplets, count: 1, color: "text-blue-500" },
                  { name: "Finanzas", icon: DollarSign, count: 1, color: "text-green-500" },
                  { name: "Compras", icon: ShoppingCart, count: 1, color: "text-orange-500" },
                  { name: "Personal", icon: Star, count: 1, color: "text-purple-500" }
                ].map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <category.icon className={`h-4 w-4 ${category.color}`} />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
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
                    <p className="text-xs text-muted-foreground">¡Buen comienzo!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Análisis y Progreso</h2>
            <p className="text-muted-foreground">Visualiza tu rendimiento y identifica patrones para mejorar</p>
          </div>
          <ProgressCharts />
        </div>
      </div>

      {/* Habit Creation/Edit Dialog */}
      <HabitDialog
        open={habitDialogOpen}
        onOpenChange={setHabitDialogOpen}
        habit={editingHabit}
        onSave={(newHabit) => {
          if (editingHabit) {
            // Update existing habit
            setHabits(prev => prev.map(h => h.id === editingHabit.id ? { ...newHabit, id: editingHabit.id } : h));
          } else {
            // Add new habit
            setHabits(prev => [...prev, { ...newHabit, completed: 0, streak: 0, completedToday: false }]);
          }
        }}
      />
    </div>
  );
}
