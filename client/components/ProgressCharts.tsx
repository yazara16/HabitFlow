import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  Clock,
  Award,
} from "lucide-react";

interface ProgressData {
  day: string;
  completed: number;
  total: number;
  percentage: number;
}

interface CategoryData {
  name: string;
  completed: number;
  total: number;
  color: string;
}

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHabits } from "@/contexts/HabitsContext";

export default function ProgressCharts() {
  const { user } = useAuth();
  const { habits, getHabitsForDate } = useHabits();

  const [weeklyData, setWeeklyData] = useState<ProgressData[]>([]);
  const [categoryDataState, setCategoryDataState] = useState<CategoryData[]>([]);
  const [monthlyStreakState, setMonthlyStreakState] = useState<{ week: string; days: number }[]>([]);
  const [timeAnalytics, setTimeAnalytics] = useState({ bestWindow: "Mañana", bestDay: "—", consistentHabit: "—", avgDaily: 0, maxStreak: 0, successRate: 0 });

  const toIso = (d: Date) => d.toISOString().split("T")[0];

  useEffect(() => {
    if (!user) return;
    const build = async () => {
      // compute range: last 30 days for richer analytics
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 29);
      const from = toIso(start);
      const to = toIso(end);
      const devToken = localStorage.getItem("auth:token") || "dev-token";

      // fetch logs per habit in parallel
      const logsByHabit: Record<string, any[]> = {};
      await Promise.all(
        habits.map(async (h) => {
          try {
            const res = await fetch(`/api/users/${user.id}/habits/${h.id}/logs?from=${from}&to=${to}`, {
              headers: { Authorization: `Bearer ${devToken}` },
            });
            if (!res.ok) {
              logsByHabit[h.id] = [];
              return;
            }
            logsByHabit[h.id] = await res.json();
          } catch (e) {
            logsByHabit[h.id] = [];
          }
        }),
      );

      // Weekly data: last 7 days
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
      });

      const weekData: ProgressData[] = days.map((d) => {
        const iso = toIso(d);
        const dayHabits = getHabitsForDate(d);
        const total = dayHabits.length;
        let completed = 0;
        for (const h of dayHabits) {
          const logs = logsByHabit[h.id] || [];
          const entry = logs.find((l: any) => l.date === iso);
          if (entry && entry.completedBoolean) completed++;
        }
        const percentage = total ? Math.round((completed / total) * 100) : 0;
        return { day: d.toLocaleDateString("es-ES", { weekday: "short" }), completed, total, percentage };
      });
      setWeeklyData(weekData);

      // Category data over last 7 days
      const catMap: Record<string, { completed: number; total: number; color: string }> = {};
      for (const h of habits) {
        const color = h.color?.split(" ")[0] || "bg-muted";
        if (!catMap[h.category]) catMap[h.category] = { completed: 0, total: 0, color };
        const logs = logsByHabit[h.id] || [];
        // count completed logs in last 7 days
        const completedCount = logs.filter((l: any) => {
          const d = new Date(l.date);
          return d >= days[0] && d <= days[days.length - 1] && l.completedBoolean;
        }).length;
        catMap[h.category].completed += completedCount;
        catMap[h.category].total += days.length; // opportunities approximation
      }
      const categories = Object.keys(catMap).map((k) => ({ name: k, completed: catMap[k].completed, total: Math.max(1, catMap[k].total), color: catMap[k].color }));
      setCategoryDataState(categories);

      // Monthly streak trend (4 weeks window)
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const weeksArr: { week: string; days: number }[] = [];
      for (let w = 0; w < 4; w++) {
        const startW = new Date(first);
        startW.setDate(1 + w * 7);
        const endW = new Date(startW);
        endW.setDate(startW.getDate() + 6);
        if (endW.getMonth() !== startW.getMonth()) {
          endW.setMonth(startW.getMonth() + 1, 0);
        }
        let perfectDays = 0;
        for (let dt = new Date(startW); dt <= endW; dt.setDate(dt.getDate() + 1)) {
          const hf = getHabitsForDate(new Date(dt));
          if (hf.length === 0) continue;
          let completedAll = true;
          for (const h of hf) {
            const logs = logsByHabit[h.id] || [];
            const entry = logs.find((l: any) => l.date === toIso(new Date(dt)));
            if (!entry || !entry.completedBoolean) {
              completedAll = false;
              break;
            }
          }
          if (completedAll) perfectDays++;
        }
        weeksArr.push({ week: `Sem ${w + 1}`, days: perfectDays });
      }
      setMonthlyStreakState(weeksArr);

      // Time analytics
      const timeBuckets: Record<string, number> = { morning: 0, afternoon: 0, evening: 0 };
      const dayCounts: Record<string, { completed: number; total: number }> = {};
      const habitConsistency: Record<string, { completed: number; possible: number; name: string }> = {};

      for (const h of habits) {
        const logs = logsByHabit[h.id] || [];
        // consistency: count completed in range
        const completedCount = logs.filter((l: any) => l.completedBoolean).length;
        habitConsistency[h.name || h.id] = { completed: completedCount, possible: logs.length || 30, name: h.name };
        for (const l of logs) {
          // day of week
          const dow = new Date(l.date).toLocaleDateString("es-ES", { weekday: "long" });
          if (!dayCounts[dow]) dayCounts[dow] = { completed: 0, total: 0 };
          dayCounts[dow].total += 1;
          if (l.completedBoolean) dayCounts[dow].completed += 1;
          // time bucket based on habit.reminderTime
          const rt = h.reminderTime || "";
          const hour = parseInt(rt.split(":")[0] || "0", 10);
          if (!isNaN(hour)) {
            if (hour >= 6 && hour < 12) timeBuckets.morning += l.completedBoolean ? 1 : 0;
            else if (hour >= 12 && hour < 18) timeBuckets.afternoon += l.completedBoolean ? 1 : 0;
            else timeBuckets.evening += l.completedBoolean ? 1 : 0;
          }
        }
      }

      const bestWindow = Object.entries(timeBuckets).sort((a, b) => b[1] - a[1])[0]?.[0] || "morning";
      const windowLabel = bestWindow === "morning" ? "Mañana" : bestWindow === "afternoon" ? "Tarde" : "Noche";

      const bestDay = Object.keys(dayCounts).length
        ? Object.entries(dayCounts).sort((a, b) => (b[1].completed / Math.max(1, b[1].total)) - (a[1].completed / Math.max(1, a[1].total)))[0][0]
        : "—";

      const consistencyEntries = Object.values(habitConsistency);
      const mostConsistent = consistencyEntries.length
        ? consistencyEntries.sort((a, b) => b.completed / Math.max(1, b.possible) - a.completed / Math.max(1, a.possible))[0].name
        : "—";

      const avgDaily = days.reduce((acc, d) => acc + weekData.find((wd) => wd.day === d.toLocaleDateString("es-ES", { weekday: "short" }))!.completed, 0) / 7 || 0;
      const maxStreak = Math.max(...habits.map((h) => h.streak || 0), 0);
      const totalCompleted = consistencyEntries.reduce((acc, v) => acc + v.completed, 0);
      const totalPossible = consistencyEntries.reduce((acc, v) => acc + v.possible, 0);
      const successRate = totalPossible ? Math.round((totalCompleted / totalPossible) * 100) : 0;

      setTimeAnalytics({ bestWindow: windowLabel, bestDay, consistentHabit: mostConsistent, avgDaily: Math.round(avgDaily * 10) / 10, maxStreak, successRate });
    };

    build();
  }, [user, habits, getHabitsForDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Progress Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Progreso Semanal</span>
          </CardTitle>
          <CardDescription>
            Porcentaje de hábitos completados esta semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 text-sm font-medium text-muted-foreground">
                  {day.day}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">
                      {day.completed}/{day.total} hábitos
                    </span>
                    <span className="text-sm font-medium">
                      {day.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${day.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Promedio semanal:</span>
              <span className="font-medium text-foreground">77%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Progress Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Progreso por Categoría</span>
          </CardTitle>
          <CardDescription>
            Rendimiento de hábitos por tipo esta semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((category, index) => {
              const percentage = (category.completed / category.total) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${category.color}`}
                      />
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {category.completed}/{category.total}
                      </span>
                      <Badge
                        variant={percentage === 100 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {Math.round(percentage)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${category.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">22</div>
              <div className="text-xs text-muted-foreground">Completados</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">28</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Streak Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Tendencia de Rachas</span>
          </CardTitle>
          <CardDescription>
            Días consecutivos por semana este mes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyStreak.map((week, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-sm font-medium text-muted-foreground">
                  {week.week}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-sm ${
                            i < week.days ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {week.days}/7 días
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center space-x-2 text-primary">
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">
                ¡Mejor semana: 7/7 días completados!
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time-based Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Análisis Temporal</span>
          </CardTitle>
          <CardDescription>
            Patrones de comportamiento y horarios óptimos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Mejor momento del día
                </span>
                <Badge variant="outline">Mañana</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Completas el 78% de tus hábitos entre 6:00 AM - 10:00 AM
              </p>
            </div>

            <div className="p-3 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Día más productivo</span>
                <Badge variant="outline">Martes</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Promedio de 4.8/5 hábitos completados los martes
              </p>
            </div>

            <div className="p-3 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Hábito más consistente
                </span>
                <Badge variant="outline">Hidratación</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                100% de éxito en los últimos 7 días
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-foreground">6.2</div>
              <div className="text-xs text-muted-foreground">
                Promedio diario
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">25</div>
              <div className="text-xs text-muted-foreground">Racha máxima</div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">89%</div>
              <div className="text-xs text-muted-foreground">Tasa de éxito</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
