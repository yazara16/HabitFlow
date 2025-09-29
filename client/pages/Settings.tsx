import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Bell,
  Palette,
  Shield,
  Download,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Globe,
  Smartphone,
  Mail,
  MessageSquare,
  Clock,
  Target,
  BarChart3,
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  AlertTriangle,
  Check,
  Info,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/contexts/HabitsContext";

interface UserSettings {
  // Profile
  name: string;
  email: string;
  bio: string;
  timezone: string;
  language: string;

  // Notifications
  pushEnabled: boolean;
  emailEnabled: boolean;
  dailyReminder: boolean;
  weeklyReport: boolean;
  achievementNotifications: boolean;
  reminderTime: string;

  // Appearance
  theme: "light" | "dark" | "system";
  colorScheme: string;
  compactMode: boolean;
  animationsEnabled: boolean;

  // Privacy
  analyticsEnabled: boolean;
  shareProgress: boolean;
  publicProfile: boolean;

  // Habits
  defaultReminderEnabled: boolean;
  autoArchiveCompleted: boolean;
  streakResetTime: string;
  weekStartsOn: "sunday" | "monday";
}

export default function Settings() {
  const {
    theme: currentTheme,
    colorScheme: currentScheme,
    setTheme,
    setColorScheme,
  } = useTheme();
  const { user, updateProfile } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    // Profile
    name: user?.name || "",
    email: user?.email || "",
    bio: "Construyendo mejores hábitos cada día",
    timezone: "America/Mexico_City",
    language: "es",

    // Notifications
    pushEnabled: true,
    emailEnabled: false,
    dailyReminder: true,
    weeklyReport: true,
    achievementNotifications: true,
    reminderTime: "09:00",

    // Appearance
    theme: currentTheme,
    colorScheme: currentScheme,
    compactMode: false,
    animationsEnabled: true,

    // Privacy
    analyticsEnabled: true,
    shareProgress: false,
    publicProfile: false,

    // Habits
    defaultReminderEnabled: true,
    autoArchiveCompleted: false,
    streakResetTime: "00:00",
    weekStartsOn: "monday",
  });

  const [activeTab, setActiveTab] = useState("profile");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === "theme") setTheme(value as any);
    if (key === "colorScheme") setColorScheme(value as any);
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    if (!user) {
      toast({
        title: "Debes iniciar sesión para guardar cambios",
        description: "Inicia sesión para guardar tus preferencias.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: settings.name, email: settings.email });
      const token = localStorage.getItem("auth:token");
      const res = await fetch(`/api/users/${user.id}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Error saving settings");
      setHasUnsavedChanges(false);
      toast({
        title: "Preferencias guardadas",
        description: "Tus ajustes fueron guardados correctamente.",
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Error",
        description: e?.message || "No se pudo guardar",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    // Reset to defaults
    setHasUnsavedChanges(true);
  };

  const [avatar, setAvatar] = useState<string | null>(user?.photoUrl || null);

  const colorSchemes = [
    { id: "purple", name: "Púrpura", color: "bg-purple-500" },
    { id: "blue", name: "Azul", color: "bg-blue-500" },
    { id: "green", name: "Verde", color: "bg-green-500" },
    { id: "orange", name: "Naranja", color: "bg-orange-500" },
    { id: "pink", name: "Rosa", color: "bg-pink-500" },
    { id: "indigo", name: "Índigo", color: "bg-indigo-500" },
  ];

  useEffect(() => {
    let mounted = true;
    if (user) {
      setSettings((prev) => ({ ...prev, name: user.name, email: user.email }));
      setAvatar(user.photoUrl || null);
      (async () => {
        try {
          const token = localStorage.getItem("auth:token");
          const res = await fetch(`/api/users/${user.id}/settings`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (!res.ok) return;
          const serverSettings = await res.json();
          if (!mounted) return;
          setSettings((prev) => ({ ...prev, ...serverSettings }) as any);
        } catch (e) {}
      })();
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  const timezones = [
    "America/Mexico_City",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/Madrid",
    "Europe/London",
    "Asia/Tokyo",
    "Australia/Sydney",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Configuración
              </h1>
              <p className="text-muted-foreground">
                Personaliza tu experiencia y preferencias de HabitFlow
              </p>
            </div>

            {hasUnsavedChanges && (
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <Button variant="outline" onClick={resetSettings}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restablecer
                </Button>
                <Button onClick={saveSettings} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            )}
          </div>

          {hasUnsavedChanges && (
            <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm text-warning">
                Tienes cambios sin guardar
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  orientation="vertical"
                >
                  <TabsList className="flex flex-col h-auto w-full bg-transparent p-2">
                    <TabsTrigger
                      value="profile"
                      className="w-full justify-start"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Perfil
                    </TabsTrigger>
                    <TabsTrigger
                      value="notifications"
                      className="w-full justify-start"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Notificaciones
                    </TabsTrigger>
                    <TabsTrigger
                      value="appearance"
                      className="w-full justify-start"
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      Apariencia
                    </TabsTrigger>
                    <TabsTrigger
                      value="habits"
                      className="w-full justify-start"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Hábitos
                    </TabsTrigger>
                    <TabsTrigger
                      value="privacy"
                      className="w-full justify-start"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Privacidad
                    </TabsTrigger>
                    <TabsTrigger value="data" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Datos
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Información del Perfil</span>
                    </CardTitle>
                    <CardDescription>
                      Gestiona tu información personal y preferencias de cuenta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={avatar ?? undefined} alt="Avatar" />
                        <AvatarFallback>HF</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files && e.target.files[0];
                            if (!f) return;
                            const reader = new FileReader();
                            reader.onload = async () => {
                              const data = reader.result as string;
                              setAvatar(data);
                              await updateProfile({ photoUrl: data });
                            };
                            reader.readAsDataURL(f);
                          }}
                        />
                        {avatar && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              setAvatar(null);
                              await updateProfile({ photoUrl: undefined });
                            }}
                          >
                            Quitar foto
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          value={settings.name}
                          onChange={(e) =>
                            updateSetting("name", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          type="email"
                          value={settings.email}
                          onChange={(e) =>
                            updateSetting("email", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía</Label>
                      <Textarea
                        id="bio"
                        placeholder="Cuéntanos un poco sobre ti y tus metas..."
                        value={settings.bio}
                        onChange={(e) => updateSetting("bio", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Zona horaria</Label>
                        <Select
                          value={settings.timezone}
                          onValueChange={(value) =>
                            updateSetting("timezone", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timezones.map((tz) => (
                              <SelectItem key={tz} value={tz}>
                                {tz.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Idioma</Label>
                        <Select
                          value={settings.language}
                          onValueChange={(value) =>
                            updateSetting("language", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <span>Notificaciones</span>
                    </CardTitle>
                    <CardDescription>
                      Configura cómo y cuándo quieres recibir notificaciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="flex items-center space-x-2">
                            <Smartphone className="h-4 w-4" />
                            <span>Notificaciones push</span>
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Recibe recordatorios en tu dispositivo
                          </p>
                        </div>
                        <Switch
                          checked={settings.pushEnabled}
                          onCheckedChange={(checked) =>
                            updateSetting("pushEnabled", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>Notificaciones por email</span>
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Recibe resúmenes y recordatorios por correo
                          </p>
                        </div>
                        <Switch
                          checked={settings.emailEnabled}
                          onCheckedChange={(checked) =>
                            updateSetting("emailEnabled", checked)
                          }
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Tipos de notificaciones</h4>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Recordatorio diario</Label>
                            <p className="text-sm text-muted-foreground">
                              Recordatorio para revisar tus hábitos
                            </p>
                          </div>
                          <Switch
                            checked={settings.dailyReminder}
                            onCheckedChange={(checked) =>
                              updateSetting("dailyReminder", checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Reporte semanal</Label>
                            <p className="text-sm text-muted-foreground">
                              Resumen de tu progreso semanal
                            </p>
                          </div>
                          <Switch
                            checked={settings.weeklyReport}
                            onCheckedChange={(checked) =>
                              updateSetting("weeklyReport", checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Notificaciones de logros</Label>
                            <p className="text-sm text-muted-foreground">
                              Celebra tus rachas y metas alcanzadas
                            </p>
                          </div>
                          <Switch
                            checked={settings.achievementNotifications}
                            onCheckedChange={(checked) =>
                              updateSetting("achievementNotifications", checked)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="reminderTime">
                        Hora del recordatorio diario
                      </Label>
                      <Input
                        id="reminderTime"
                        type="time"
                        value={settings.reminderTime}
                        onChange={(e) =>
                          updateSetting("reminderTime", e.target.value)
                        }
                        className="w-32"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appearance Settings */}
              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Palette className="h-5 w-5" />
                      <span>Apariencia</span>
                    </CardTitle>
                    <CardDescription>
                      Personaliza el aspecto de la aplicación
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium mb-3 block">
                          Tema
                        </Label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: "light", label: "Claro", icon: Sun },
                            { value: "dark", label: "Oscuro", icon: Moon },
                            {
                              value: "system",
                              label: "Sistema",
                              icon: Monitor,
                            },
                          ].map((theme) => {
                            const Icon = theme.icon;
                            return (
                              <button
                                key={theme.value}
                                onClick={() =>
                                  updateSetting("theme", theme.value as any)
                                }
                                className={`p-4 border-2 rounded-lg transition-all ${
                                  settings.theme === theme.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-border/60"
                                }`}
                              >
                                <Icon className="h-6 w-6 mx-auto mb-2" />
                                <span className="text-sm font-medium">
                                  {theme.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-medium mb-3 block">
                          Esquema de colores
                        </Label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                          {colorSchemes.map((scheme) => (
                            <button
                              key={scheme.id}
                              onClick={() =>
                                updateSetting("colorScheme", scheme.id)
                              }
                              className={`p-3 border-2 rounded-lg transition-all ${
                                settings.colorScheme === scheme.id
                                  ? "border-primary"
                                  : "border-border hover:border-border/60"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 ${scheme.color} rounded-full mx-auto mb-2`}
                              />
                              <span className="text-xs">{scheme.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Modo compacto</Label>
                          <p className="text-sm text-muted-foreground">
                            Reduce el espaciado y el tamaño de elementos
                          </p>
                        </div>
                        <Switch
                          checked={settings.compactMode}
                          onCheckedChange={(checked) =>
                            updateSetting("compactMode", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Animaciones</Label>
                          <p className="text-sm text-muted-foreground">
                            Efectos de transición y animaciones suaves
                          </p>
                        </div>
                        <Switch
                          checked={settings.animationsEnabled}
                          onCheckedChange={(checked) =>
                            updateSetting("animationsEnabled", checked)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Habits Settings */}
              <TabsContent value="habits">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Configuración de Hábitos</span>
                    </CardTitle>
                    <CardDescription>
                      Ajusta el comportamiento predeterminado de tus hábitos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Recordatorios activados por defecto</Label>
                          <p className="text-sm text-muted-foreground">
                            Nuevos hábitos tendrán recordatorios habilitados
                          </p>
                        </div>
                        <Switch
                          checked={settings.defaultReminderEnabled}
                          onCheckedChange={(checked) =>
                            updateSetting("defaultReminderEnabled", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Archivar hábitos completados</Label>
                          <p className="text-sm text-muted-foreground">
                            Ocultar automáticamente hábitos con metas alcanzadas
                          </p>
                        </div>
                        <Switch
                          checked={settings.autoArchiveCompleted}
                          onCheckedChange={(checked) =>
                            updateSetting("autoArchiveCompleted", checked)
                          }
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="streakReset">
                          Hora de reinicio de racha
                        </Label>
                        <Input
                          id="streakReset"
                          type="time"
                          value={settings.streakResetTime}
                          onChange={(e) =>
                            updateSetting("streakResetTime", e.target.value)
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Hora cuando se considera un nuevo día
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>La semana comienza en</Label>
                        <Select
                          value={settings.weekStartsOn}
                          onValueChange={(value) =>
                            updateSetting("weekStartsOn", value as any)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monday">Lunes</SelectItem>
                            <SelectItem value="sunday">Domingo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Settings */}
              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Privacidad y Seguridad</span>
                    </CardTitle>
                    <CardDescription>
                      Controla la privacidad de tus datos y el uso de
                      información
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Permitir análisis de uso</Label>
                          <p className="text-sm text-muted-foreground">
                            Ayúdanos a mejorar la app con datos anónimos
                          </p>
                        </div>
                        <Switch
                          checked={settings.analyticsEnabled}
                          onCheckedChange={(checked) =>
                            updateSetting("analyticsEnabled", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Compartir progreso</Label>
                          <p className="text-sm text-muted-foreground">
                            Permite que otros vean tu progreso general
                          </p>
                        </div>
                        <Switch
                          checked={settings.shareProgress}
                          onCheckedChange={(checked) =>
                            updateSetting("shareProgress", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Perfil público</Label>
                          <p className="text-sm text-muted-foreground">
                            Tu perfil será visible para otros usuarios
                          </p>
                        </div>
                        <Switch
                          checked={settings.publicProfile}
                          onCheckedChange={(checked) =>
                            updateSetting("publicProfile", checked)
                          }
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium mb-2">
                            Sobre tu privacidad
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Tus datos personales están protegidos con
                            encriptación de extremo a extremo. Nunca compartimos
                            información personal sin tu consentimiento
                            explícito.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Data Management */}
              <TabsContent value="data">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Gestión de Datos</span>
                    </CardTitle>
                    <CardDescription>
                      Exporta, importa o elimina tus datos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <Download className="h-5 w-5 text-primary" />
                            <h4 className="font-medium">Exportar datos</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Descarga todos tus hábitos y progreso en formato
                            JSON
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={async () => {
                              try {
                                if (!user) {
                                  toast({ title: "Debes iniciar sesión", description: "Inicia sesión para exportar tus datos.", variant: "destructive" });
                                  return;
                                }
                                const payload = {
                                  user: {
                                    id: user.id,
                                    name: user.name,
                                    email: user.email,
                                    photoUrl: user.photoUrl,
                                    createdAt: user.createdAt,
                                  },
                                  settings,
                                  habits,
                                };
                                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `habitflow-export-${user.id}-${new Date().toISOString()}.json`;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                URL.revokeObjectURL(url);
                                toast({ title: "Exportado", description: "Tu archivo JSON se descargó correctamente." });
                              } catch (e: any) {
                                console.error(e);
                                toast({ title: "Error", description: "No fue posible exportar los datos.", variant: "destructive" });
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <RefreshCw className="h-5 w-5 text-info" />
                            <h4 className="font-medium">Respaldar datos</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Crea una copia de seguridad en la nube
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={async () => {
                              if (!user) { toast({ title: "Debes iniciar sesión", description: "Inicia sesión para respaldar tus datos.", variant: "destructive" }); return; }
                              try {
                                const token = localStorage.getItem('auth:token');
                                const res = await fetch(`/api/users/${user.id}/backup`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
                                if (!res.ok) throw new Error('Backup failed');
                                const body = await res.json().catch(() => ({}));
                                toast({ title: 'Respaldo creado', description: body.filename ? `Archivo: ${body.filename}` : 'Respaldo almacenado en el servidor' });
                              } catch (e: any) {
                                console.error(e);
                                toast({ title: 'Error', description: 'No fue posible respaldar los datos', variant: 'destructive' });
                              }
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Respaldar
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium text-destructive">
                        Zona de peligro
                      </h4>

                      <Card className="border-destructive/20">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium text-destructive mb-2">
                                Eliminar todos los datos
                              </h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                Esta acción eliminará permanentemente todos tus
                                hábitos, progreso y configuraciones. No se puede
                                deshacer.
                              </p>
                              <Button variant="destructive" size="sm" onClick={async () => {
                                if (!user) { toast({ title: 'Debes iniciar sesión', description: 'Inicia sesión para eliminar tu cuenta.', variant: 'destructive' }); return; }
                                const ok = window.confirm('¿Seguro que deseas eliminar tu cuenta y todos tus datos? Esta acción no se puede deshacer.');
                                if (!ok) return;
                                try {
                                  const token = localStorage.getItem('auth:token');
                                  const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
                                  if (!res.ok) throw new Error('Delete failed');
                                  toast({ title: 'Cuenta eliminada', description: 'Tu cuenta y datos fueron eliminados.' });
                                  // logout and redirect
                                  try { logout(); } catch (e) {}
                                  navigate('/');
                                } catch (e: any) {
                                  console.error(e);
                                  toast({ title: 'Error', description: 'No fue posible eliminar la cuenta', variant: 'destructive' });
                                }
                              }}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar cuenta y datos
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
