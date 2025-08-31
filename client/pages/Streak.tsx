import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, CheckCircle2, Target } from "lucide-react";
import { useHabits } from "@/contexts/HabitsContext";

export default function Streak() {
  const { habits } = useHabits();
  const bestStreak = habits.reduce((m, h) => Math.max(m, h.streak), 0);
  const totalCompletedToday = habits.filter(h => h.completedToday).length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-6">
          <Flame className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold">Racha Actual</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>Estado de tu racha hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Hábitos completados hoy</p>
                <p className="text-2xl font-bold">{totalCompletedToday}</p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Mejor racha</p>
                <p className="text-2xl font-bold">{bestStreak} días</p>
              </div>
              <div className="p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Hábitos activos</p>
                <p className="text-2xl font-bold">{habits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Racha por hábito</CardTitle>
            <CardDescription>Detalle de rachas individuales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {habits.map(h => {
              const progress = Math.min(100, (h.streak / Math.max(bestStreak, 1)) * 100);
              const Icon = h.icon;
              return (
                <div key={h.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded ${h.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="font-medium">{h.name}</p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span>{h.streak} días</span>
                    </div>
                  </div>
                  <Progress value={progress} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
