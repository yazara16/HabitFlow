import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Bell, Star, Flame, Target, TrendingUp, Gift, Info, Check } from "lucide-react";

interface Notification {
  id: string;
  type: "achievement" | "reminder" | "streak" | "milestone" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: any;
  color: string;
}

const seed: Notification[] = [
  { id: "1", type: "achievement", title: "¡Nuevo logro desbloqueado!", message: "Has completado 7 días consecutivos de ejercicio", time: "Hace 5 minutos", read: false, icon: Star, color: "text-yellow-500 bg-yellow-500/10" },
  { id: "2", type: "streak", title: "¡Racha increíble!", message: "Llevas 12 días seguidos meditando. ¡Sigue así!", time: "Hace 2 horas", read: false, icon: Flame, color: "text-orange-500 bg-orange-500/10" },
  { id: "3", type: "reminder", title: "Recordatorio de hidratación", message: "Te quedan 3 vasos por completar.", time: "Hace 3 horas", read: true, icon: Target, color: "text-blue-500 bg-blue-500/10" },
  { id: "4", type: "milestone", title: "Meta del mes alcanzada", message: "Has ahorrado $200 este mes.", time: "Ayer", read: true, icon: TrendingUp, color: "text-green-500 bg-green-500/10" },
  { id: "5", type: "system", title: "Nuevas funciones disponibles", message: "Descubre las mejoras en el calendario y configuración", time: "Hace 2 días", read: true, icon: Gift, color: "text-purple-500 bg-purple-500/10" }
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Notification[]>(seed);
  const unread = useMemo(() => items.filter(i => !i.read).length, [items]);

  const markAll = () => setItems(prev => prev.map(i => ({ ...i, read: true })));
  const getTarget = (n: Notification) => (
    n.type === "reminder" ? "/today" :
    n.type === "milestone" ? "/achievements" :
    n.type === "achievement" ? "/achievements" :
    n.type === "streak" ? "/streak" :
    n.type === "system" ? "/settings" : "/dashboard"
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <h1 className="text-2xl font-bold">Notificaciones</h1>
            {unread > 0 && <Badge variant="destructive">{unread} nuevas</Badge>}
          </div>
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={markAll}>
              <Check className="h-4 w-4 mr-2" /> Marcar todas como leídas
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>Selecciona una notificación para abrir lo correspondiente</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {items.map((n) => {
              const Icon = n.icon;
              return (
                <div key={n.id} className={`flex items-start justify-between p-3 ${!n.read ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${n.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!n.read && (
                      <Badge variant="outline">Nuevo</Badge>
                    )}
                    <Button size="sm" onClick={() => navigate(getTarget(n))}>Abrir</Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
