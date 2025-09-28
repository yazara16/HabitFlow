import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Zap,
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
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Use React Query to fetch notifications
  const queryClient = useQueryClient();
  const { data: notifsData, isLoading: notifsLoading } = useQuery(
    ["notifications", user?.id],
    async () => {
      if (!user) return [] as any[];
      const token = localStorage.getItem("auth:token");
      const res = await fetch(`/api/users/${user.id}/notifications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed fetching notifications");
      return await res.json();
    },
    { enabled: !!user },
  );

  // derive local notifications shape
  useEffect(() => {
    if (!notifsData) {
      setNotifications([]);
      return;
    }
    setNotifications(
      notifsData.map((it: any) => ({
        id: it.id,
        type: it.type,
        title: it.title,
        message: it.message,
        time: it.createdAt,
        read: it.read,
        icon: getTypeIcon(it.type),
        color: getTypeColor(it.type) + " bg-opacity-10",
      })),
    );
  }, [notifsData]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Notification | null>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsReadMutation = useMutation(
    async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const token = localStorage.getItem("auth:token");
      const res = await fetch(
        `/api/users/${user.id}/notifications/${id}/read`,
        {
          method: "PUT",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      if (!res.ok) throw new Error("Failed to mark read");
      return await res.json();
    },
    {
      onSuccess: () => {
        if (queryClient)
          queryClient.invalidateQueries(["notifications", user?.id]);
      },
    },
  );

  const markAllMutation = useMutation(
    async () => {
      if (!user) throw new Error("Not authenticated");
      const token = localStorage.getItem("auth:token");
      const res = await fetch(`/api/users/${user.id}/notifications/mark_all`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to mark all");
      return true;
    },
    {
      onSuccess: () => {
        if (queryClient)
          queryClient.invalidateQueries(["notifications", user?.id]);
      },
    },
  );

  const deleteMutation = useMutation(
    async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const token = localStorage.getItem("auth:token");
      const res = await fetch(`/api/users/${user.id}/notifications/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete");
      return id;
    },
    {
      onSuccess: () => {
        if (queryClient)
          queryClient.invalidateQueries(["notifications", user?.id]);
      },
    },
  );

  const markAsRead = async (id: string) => {
    if (!user) return;
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await markAllMutation.mutateAsync();
    } catch (e) {}
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (e) {}
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return Star;
      case "streak":
        return Flame;
      case "reminder":
        return Bell;
      case "milestone":
        return Target;
      case "system":
        return Info;
      default:
        return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "achievement":
        return "text-yellow-400";
      case "streak":
        return "text-red-500";
      case "reminder":
        return "text-indigo-500";
      case "milestone":
        return "text-green-500";
      case "system":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <CardTitle>Notificaciones</CardTitle>
          {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Marcar todas leídas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 && <div className="text-sm text-muted-foreground">Sin notificaciones</div>}
        {notifications.map((n) => (
          <div key={n.id} className="flex items-start justify-between py-3 border-b last:border-b-0">
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${n.color}`}>
                <n.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-muted-foreground">{n.message}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <X className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => markAsRead(n.id)}>Marcar leída</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => deleteNotification(n.id)}>Eliminar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
