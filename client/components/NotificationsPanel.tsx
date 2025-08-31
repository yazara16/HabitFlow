import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Bell,
  X,
  Check,
  Star,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Gift,
  AlertTriangle,
  Info,
  Heart,
  Zap
} from "lucide-react";

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

export default function NotificationsPanel() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "achievement",
      title: "¡Nuevo logro desbloqueado!",
      message: "Has completado 7 días consecutivos de ejercicio",
      time: "Hace 5 minutos",
      read: false,
      icon: Star,
      color: "text-yellow-500 bg-yellow-500/10"
    },
    {
      id: "2", 
      type: "streak",
      title: "¡Racha increíble!",
      message: "Llevas 12 días seguidos meditando. ¡Sigue así!",
      time: "Hace 2 horas",
      read: false,
      icon: Flame,
      color: "text-orange-500 bg-orange-500/10"
    },
    {
      id: "3",
      type: "reminder",
      title: "Recordatorio de hidratación",
      message: "No olvides beber agua. Te quedan 3 vasos por completar.",
      time: "Hace 3 horas",
      read: true,
      icon: Target,
      color: "text-blue-500 bg-blue-500/10"
    },
    {
      id: "4",
      type: "milestone",
      title: "Meta del mes alcanzada",
      message: "Has ahorrado $200 este mes. ¡Excelente trabajo!",
      time: "Ayer",
      read: true,
      icon: TrendingUp,
      color: "text-green-500 bg-green-500/10"
    },
    {
      id: "5",
      type: "system",
      title: "Nuevas funciones disponibles",
      message: "Descubre las mejoras en el calendario y configuración",
      time: "Hace 2 días",
      read: true,
      icon: Gift,
      color: "text-purple-500 bg-purple-500/10"
    }
  ]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Notification | null>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "achievement": return Star;
      case "streak": return Flame;
      case "reminder": return Bell;
      case "milestone": return Target;
      case "system": return Info;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "achievement": return "text-yellow-500";
      case "streak": return "text-orange-500";
      case "reminder": return "text-blue-500";
      case "milestone": return "text-green-500";
      case "system": return "text-purple-500";
      default: return "text-gray-500";
    }
  };

  const getTarget = (n: Notification) => (
    n.type === "reminder" ? "/habits" :
    n.type === "milestone" ? "/achievements" :
    n.type === "achievement" ? "/achievements" :
    n.type === "streak" ? "/streak" :
    n.type === "system" ? "/settings" : "/dashboard"
  );

  const openNotification = (n: Notification) => {
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    setSelected(n);
    setDetailOpen(true);
  };

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    onClick={() => openNotification(notification)}
                    className={`p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${notification.color} flex-shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notification.time}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full text-center" onClick={() => navigate('/notifications')}>
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>

    <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {selected && (
              <span className={`p-2 rounded ${selected.color}`}>
                <selected.icon className="h-4 w-4" />
              </span>
            )}
            <span>{selected?.title}</span>
          </DialogTitle>
          <DialogDescription>{selected?.time}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-foreground">{selected?.message}</p>
          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Cerrar</Button>
            {selected && (
              <Button onClick={() => { setDetailOpen(false); navigate(getTarget(selected)); }}>
                Abrir
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
