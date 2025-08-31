import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useHabits, Habit } from "@/contexts/HabitsContext";
import { Calendar as CalendarIcon } from "lucide-react";

function isScheduledOn(habit: Habit, date: Date) {
  const created = habit.createdAt ? new Date(habit.createdAt + "T00:00:00") : new Date(0);
  if (date < created) return false;
  switch (habit.frequency) {
    case "daily":
      return true;
    case "weekly":
      return date.getDay() === created.getDay();
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
}

export default function Week() {
  const { habits } = useHabits();
  const start = new Date();
  start.setHours(0,0,0,0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const schedule = days.map(d => ({ date: d, habits: habits.filter(h => isScheduledOn(h, d)) }));
  const totalSlots = schedule.reduce((acc, d) => acc + d.habits.length, 0) || 1;
  const completedSlots = schedule.reduce((acc, d) => acc + d.habits.filter(h => h.completed >= h.target).length, 0);
  const percent = Math.round((completedSlots / totalSlots) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-6">
          <CalendarIcon className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Resumen de la Semana</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Progreso semanal</CardTitle>
            <CardDescription>Vista general de los próximos 7 días</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={percent} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">{percent}% completado ({completedSlots}/{totalSlots})</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedule.map((d, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-base">{d.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</CardTitle>
                <CardDescription>{d.habits.length} hábitos programados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {d.habits.length === 0 && <p className="text-sm text-muted-foreground">Sin hábitos</p>}
                {d.habits.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="font-medium truncate">{h.name}</span>
                    <span className="text-xs text-muted-foreground">{h.completed}/{h.target} {h.unit}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
