import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Target } from "lucide-react";
import { useHabits } from "@/contexts/HabitsContext";

export default function Today() {
  const { habits } = useHabits();
  const completed = habits.filter(h => h.completedToday);
  const pending = habits.filter(h => !h.completedToday);
  const total = habits.length || 1;
  const percent = Math.round((completed.length / total) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-6">
          <Target className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Hoy Completados</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumen de hoy</CardTitle>
            <CardDescription>Progreso y tareas del día</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={percent} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">{percent}% completado ({completed.length}/{total})</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><CheckCircle2 className="h-4 w-4 text-success"/><span>Completados</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completed.length === 0 && <p className="text-sm text-muted-foreground">Aún no completas hábitos</p>}
              {completed.map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="font-medium truncate">{h.name}</span>
                  <span className="text-xs text-muted-foreground">{h.completed}/{h.target} {h.unit}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2"><Circle className="h-4 w-4 text-muted-foreground"/><span>Pendientes</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending.length === 0 && <p className="text-sm text-muted-foreground">Sin pendientes</p>}
              {pending.map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="font-medium truncate">{h.name}</span>
                  <span className="text-xs text-muted-foreground">{h.completed}/{h.target} {h.unit}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
