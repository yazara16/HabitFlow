import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
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

export default function ProgressCharts() {
  // Mock data for demonstration
  const weeklyData: ProgressData[] = [
    { day: "Lun", completed: 4, total: 5, percentage: 80 },
    { day: "Mar", completed: 5, total: 5, percentage: 100 },
    { day: "Mié", completed: 3, total: 5, percentage: 60 },
    { day: "Jue", completed: 5, total: 5, percentage: 100 },
    { day: "Vie", completed: 4, total: 5, percentage: 80 },
    { day: "Sáb", completed: 2, total: 5, percentage: 40 },
    { day: "Dom", completed: 4, total: 5, percentage: 80 },
  ];

  const categoryData: CategoryData[] = [
    { name: "Ejercicio", completed: 6, total: 7, color: "bg-red-500" },
    { name: "Hidratación", completed: 7, total: 7, color: "bg-blue-500" },
    { name: "Finanzas", completed: 5, total: 7, color: "bg-green-500" },
    { name: "Personal", completed: 4, total: 7, color: "bg-purple-500" },
  ];

  const monthlyStreak = [
    { week: "Sem 1", days: 5 },
    { week: "Sem 2", days: 7 },
    { week: "Sem 3", days: 6 },
    { week: "Sem 4", days: 7 },
  ];

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
