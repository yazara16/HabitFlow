import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Award, Star, Flame, Target, Droplets, Dumbbell, Share2, Facebook, MessageCircle, Copy } from "lucide-react";
import { useHabits } from "@/contexts/HabitsContext";

export default function Achievements() {
  const { habits } = useHabits();
  const [showAll, setShowAll] = useState(false);
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

  const totalEarned = items.filter(i => i.earned).length;

  const buildShare = (title: string, desc: string) => {
    const url = window.location.href;
    const text = `${title} — ${desc}`;
    const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    return { url, text, fb, wa };
  };

  const tryWebShare = async (title: string, text: string, url: string) => {
    if ((navigator as any).share) {
      try { await (navigator as any).share({ title, text, url }); } catch {}
    } else {
      toast({ title: 'Compartir no disponible', description: 'Usa los botones de Facebook/WhatsApp o copia el enlace.' });
    }
  };

  const copyText = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast({ title: 'Copiado', description: 'Texto copiado al portapapeles' }); } catch {}
  };

  const allAchievements = useMemo(() => {
    const base = [
      ...items,
      { title: 'Hábito creado', icon: Award, desc: 'Creaste tu primer hábito', earned: habits.length > 0 },
      { title: '10 hábitos completados', icon: Award, desc: 'Completaste 10 hábitos en total', earned: habits.reduce((a,h)=>a+(h.completed>=h.target?1:0),0) >= 10 },
      { title: 'Lectura diaria', icon: Award, desc: 'Completaste un hábito de lectura', earned: habits.some(h=>h.category==='reading' && h.completed>=h.target) },
      { title: 'Estudio constante', icon: Award, desc: 'Completaste un hábito de estudio', earned: habits.some(h=>h.category==='study' && h.completed>=h.target) },
      { title: 'Ahorro logrado', icon: Award, desc: 'Cumpliste una meta de finanzas', earned: habits.some(h=>h.category==='finance' && h.completed>=h.target) },
      { title: 'Semana perfecta', icon: Award, desc: '7 días seguidos completando', earned: false },
      { title: 'Madrugador', icon: Award, desc: 'Completaste un hábito antes de las 8am', earned: false },
      { title: 'Constancia', icon: Award, desc: '30 días con actividad', earned: false },
    ];
    return base.concat([
      { title: '3 hábitos completados hoy', icon: Award, desc: 'Completa 3 hábitos en el mismo día', earned: habits.filter(h=>h.completedToday).length >= 3 },
      { title: 'Día perfecto', icon: Award, desc: 'Completa todos tus hábitos hoy', earned: habits.length > 0 && habits.every(h=>h.completedToday || h.completed >= h.target) },
      { title: 'Racha 7+', icon: Award, desc: 'Alcanza una racha de 7 días en cualquier hábito', earned: habits.some(h=>h.streak >= 7) },
      { title: 'Racha 30+', icon: Award, desc: 'Alcanza una racha de 30 días en cualquier hábito', earned: habits.some(h=>h.streak >= 30) },
      { title: 'Hidratación perfecta', icon: Award, desc: 'Completa tu meta de hidratación', earned: habits.some(h=>h.category==='hydration' && h.completed >= h.target) },
      { title: 'Ejercicio constante', icon: Award, desc: 'Mantén ejercicio con racha de 5+', earned: habits.some(h=>h.category==='exercise' && h.streak >= 5) },
      { title: 'Lectura enfocada', icon: Award, desc: 'Cumple tu objetivo de lectura de hoy', earned: habits.some(h=>h.category==='reading' && (h.completedToday || h.completed >= h.target)) },
      { title: 'Estudio cumplido', icon: Award, desc: 'Cumple tu objetivo de estudio de hoy', earned: habits.some(h=>h.category==='study' && (h.completedToday || h.completed >= h.target)) },
      { title: '5 hábitos activos', icon: Award, desc: 'Crea 5 hábitos en total', earned: habits.length >= 5 },
      { title: '10 hábitos activos', icon: Award, desc: 'Crea 10 hábitos en total', earned: habits.length >= 10 },
    ]);
  }, [habits, items]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-6">
          <Award className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Logros</h1>
          <Badge variant="secondary" className="ml-2">{totalAchievements} totales</Badge>
          <Badge variant="outline" className="ml-2">{totalEarned} obtenidos</Badge>
          <div className="ml-auto">
            <Button size="sm" variant="outline" onClick={() => setShowAll(v=>!v)}>
              {showAll ? 'Ocultar todos' : 'Ver todos los logros'}
            </Button>
          </div>
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
                  {a.earned && (
                    <div className="flex items-center gap-2 mt-3">
                      {(() => { const s = buildShare(a.title, a.desc); return (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Share2 className="h-4 w-4 mr-1" /> Compartir
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => tryWebShare(a.title, s.text, s.url)}>
                              <Share2 className="h-4 w-4 mr-2" /> Compartir directo
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(s.fb, '_blank', 'noreferrer')}>
                              <Facebook className="h-4 w-4 mr-2" /> Facebook
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(s.wa, '_blank', 'noreferrer')}>
                              <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyText(`${s.text} ${s.url}`)}>
                              <Copy className="h-4 w-4 mr-2" /> Copiar texto
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )})()}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {showAll && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Todos los logros</CardTitle>
              <CardDescription>Desglose completo con medallas</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {allAchievements.map((a, idx) => {
                const Icon = a.icon;
                return (
                  <div key={idx} className={`p-4 rounded-lg border ${a.earned ? 'bg-primary/5' : 'bg-muted/30'}`}>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${a.earned ? 'bg-yellow-500/20' : 'bg-muted'}`}>
                        <Icon className={`h-4 w-4 ${a.earned ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                      </div>
                      <p className="font-medium text-sm">{a.title}</p>
                      {a.earned ? (
                        <Badge variant="outline">Obtenido</Badge>
                      ) : (
                        <Badge variant="secondary">Bloqueado</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                    {a.earned && (
                      <div className="flex items-center gap-2 mt-3">
                        {(() => { const s = buildShare(a.title, a.desc); return (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Share2 className="h-4 w-4 mr-1" /> Compartir
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={() => tryWebShare(a.title, s.text, s.url)}>
                                <Share2 className="h-4 w-4 mr-2" /> Compartir directo
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(s.fb, '_blank', 'noreferrer')}>
                                <Facebook className="h-4 w-4 mr-2" /> Facebook
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(s.wa, '_blank', 'noreferrer')}>
                                <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyText(`${s.text} ${s.url}`)}>
                                <Copy className="h-4 w-4 mr-2" /> Copiar texto
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )})()}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
