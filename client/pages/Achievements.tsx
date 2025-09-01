import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Award, Star, Flame, Target, Droplets, Dumbbell, Share2, Facebook, MessageCircle, Copy, Book, BookOpen, DollarSign, ShoppingCart } from "lucide-react";
import { useHabits } from "@/contexts/HabitsContext";

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number){
  const words = text.split(' '); let lines: string[] = []; let line='';
  for(const w of words){ const test=line? line+' '+w : w; if (ctx.measureText(test).width <= maxWidth) line=test; else { if(line) lines.push(line); line=w; } }
  if(line) lines.push(line); return { lines };
}

async function generateAchievementImage(title: string, emoji: string): Promise<Blob> {
  const w = 800, h = 450;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0,0,w,h);
  grad.addColorStop(0, '#0ea5e9');
  grad.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,w,h);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let i=0;i<12;i++){ ctx.beginPath(); ctx.arc(100+i*60, 80+(i%3)*30, 20+(i%4)*6, 0, Math.PI*2); ctx.fill(); }
  const cx=w/2, cy=180, r=80;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fillStyle = '#fde68a'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r-16, 0, Math.PI*2); ctx.fillStyle = '#fbbf24'; ctx.fill();
  ctx.font = 'bold 84px Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#78350f';
  ctx.fillText(emoji || '🏅', cx, cy);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.fillText('¡Felicidades!', cx, cy+120);
  ctx.font = 'bold 28px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial';
  const wrapped = wrapText(ctx, title, w*0.8);
  wrapped.lines.forEach((line, idx) => ctx.fillText(line, cx, cy+160 + idx*34));
  const blob: Blob = await new Promise((resolve) => canvas.toBlob(b => resolve(b!), 'image/png', 0.95));
  return blob;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });
}

async function downloadAchievementImage(title: string, emoji: string) {
  const img = await generateAchievementImage(title, emoji);
  const dataUrl = await blobToDataUrl(img);
  const aEl = document.createElement('a');
  aEl.href = dataUrl; aEl.download = `${slugify(title)}.png`;
  document.body.appendChild(aEl); aEl.click(); aEl.remove();
}

function iconToEmoji(Icon: any): string {
  switch (Icon) {
    case Star: return '⭐';
    case Droplets: return '💧';
    case Dumbbell: return '🏋️';
    case Flame: return '🔥';
    case Target: return '🎯';
    case Award: return '🏅';
    case Book: return '📚';
    case BookOpen: return '📖';
    case DollarSign: return '💰';
    case ShoppingCart: return '🛒';
    default: return '🏅';
  }
}

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
    const text = `¡Felicidades por obtener este logro! ${title} — ${desc}`;
    const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    return { url, text, fb, wa };
  };

  const tryWebShare = async (title: string, text: string, url: string, imageBlob?: Blob) => {
    const nav: any = navigator;
    if (nav.share) {
      try {
        if (imageBlob && nav.canShare && nav.canShare({ files: [new File([imageBlob], `${slugify(title)}.png`, { type: 'image/png' })] })) {
          const file = new File([imageBlob], `${slugify(title)}.png`, { type: 'image/png' });
          await nav.share({ title, text, url, files: [file] });
          return true;
        }
        await nav.share({ title, text, url });
        return true;
      } catch {}
    }
    return false;
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

                            <DropdownMenuItem onClick={() => window.open(s.fb, '_blank', 'noreferrer')}>
                              <Facebook className="h-4 w-4 mr-2" /> Facebook
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(s.wa, '_blank', 'noreferrer')}>
                              <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyText(`${s.text} ${s.url}`)}>
                              <Copy className="h-4 w-4 mr-2" /> Copiar texto
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadAchievementImage(a.title, iconToEmoji(a.icon))}>
                              <Copy className="h-4 w-4 mr-2" /> Descargar imagen
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
  
                            <DropdownMenuItem onClick={() => window.open(s.fb, '_blank', 'noreferrer')}>
                              <Facebook className="h-4 w-4 mr-2" /> Facebook
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(s.wa, '_blank', 'noreferrer')}>
                              <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyText(`${s.text} ${s.url}`)}>
                              <Copy className="h-4 w-4 mr-2" /> Copiar texto
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadAchievementImage(a.title, iconToEmoji(a.icon))}>
                              <Copy className="h-4 w-4 mr-2" /> Descargar imagen
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
