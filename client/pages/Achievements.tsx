import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Flame, Target, Droplets, Dumbbell } from "lucide-react";
import { useHabits } from "@/contexts/HabitsContext";

export default function Achievements() {
  const { habits } = useHabits();
  const achievedHydration = habits.find(h => h.category === 'hydration' && h.completed >= h.target);
  const achievedExercise = habits.find(h => h.category === 'exercise' && h.completed >= h.target);
  const totalAchievements = [achievedHydration, achievedExercise].filter(Boolean).length + 10;

  const items = [
    { title: 'Primera semana completa', icon: Star, desc: 'Completaste hábitos durante 7 días seguidos', earned: true },
    { title: 'Meta de hidratación diaria', icon: Droplets, desc: 'Alcanzaste tu consumo de agua del día', earned: !!achievedHydration },
    { title: 'Entrenamiento constante', icon: Dumbbell, desc: 'Cumpliste tu objetivo de ejercicio', earned: !!achievedExercise },
    { title: 'Racha ardiente', icon: Flame, desc: 'Racha de 14 días ininterrumpidos', earned: false },
    { title: 'Objetivos al blanco', icon: Target, desc: 'Completaste 50 objetivos', earned: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-6">
          <Award className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Logros</h1>
          <Badge variant="secondary" className="ml-2">{totalAchievements} totales</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>Tu progreso en insignias y metas</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((a, idx) => {
              const Icon = a.icon;
              return (
                <div key={idx} className={`p-4 rounded-lg border ${a.earned ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="font-medium">{a.title}</p>
                    {a.earned && <Badge variant="outline">Obtenido</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
