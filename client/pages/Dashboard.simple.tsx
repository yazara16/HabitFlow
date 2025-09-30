import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation"; 
import { useAuth } from "@/contexts/AuthContext";
import { useHabits } from "@/contexts/HabitsContext.simple";
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
  Plus,
  Flame,
  TrendingUp,
  Target,
  Calendar as CalendarIcon,
  CheckCircle2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user } = useAuth(); // ya no necesitamos logout aquí
  const { habits, loading } = useHabits();
  const navigate = useNavigate();

  // Redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleAddHabit = () => {
    navigate("/habits");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Cargando...</h2>
        </div>
      </div>
    );
  }

  const completedToday = habits.filter(habit => habit.completed || false).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;
  const totalStreak = habits.reduce((sum, habit) => sum + (habit.streak || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* No pasamos props, Navigation usa useAuth internamente */}
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            ¡Hola, {user.name}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Mantén el momentum en tus hábitos diarios
          </p>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hábitos Totales</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHabits}</div>
              <p className="text-xs text-muted-foreground">
                {totalHabits === 0 ? "Ningún hábito creado aún" : "Hábitos en progreso"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados Hoy</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedToday}</div>
              <p className="text-xs text-muted-foreground">
                de {totalHabits} hábitos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Racha Total</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStreak}</div>
              <p className="text-xs text-muted-foreground">
                Días consecutivos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progreso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Lista de hábitos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mis Hábitos</CardTitle>
                  <CardDescription>
                    Gestiona tus hábitos diarios
                  </CardDescription>
                </div>
                <Button onClick={handleAddHabit} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Cargando hábitos...</p>
                </div>
              ) : habits.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sin hábitos aún</h3>
                  <p className="text-muted-foreground mb-4">
                    ¡Crea tu primer hábito para comenzar tu jornada!
                  </p>
                  <Button onClick={handleAddHabit}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear primer hábito
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${habit.color || 'bg-blue-500'}`}>
                          <Target className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium">{habit.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Racha: {habit.streak || 0} días
                          </p>
                        </div>
                      </div>
                      <Badge variant={habit.completed ? "default" : "secondary"}>
                        {habit.completed ? "Completado" : "Pendiente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Tu progreso de los últimos días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Progreso diario</h3>
                  <p className="text-muted-foreground">
                    Tu actividad aparecerá aquí conforme vayas completando hábitos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
