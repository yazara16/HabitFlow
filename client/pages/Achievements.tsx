import Navigation from "@/components/Navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Award,
  Star,
  Flame,
  Target,
  Droplets,
  Dumbbell,
  Share2,
  Copy,
  Book,
  BookOpen,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { useHabits } from "@/contexts/HabitsContext";
import { useAuth } from "@/contexts/AuthContext";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(" ");
  let lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width <= maxWidth) line = test;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return { lines };
}

async function generateAchievementImage(
  title: string,
  emoji: string,
): Promise<Blob> {
  const w = 800,
    h = 450;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#0ea5e9");
  grad.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.arc(100 + i * 60, 80 + (i % 3) * 30, 20 + (i % 4) * 6, 0, Math.PI * 2);
    ctx.fill();
  }
  const cx = w / 2,
    cy = 180,
    r = 80;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#fde68a";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 16, 0, Math.PI * 2);
  ctx.fillStyle = "#fbbf24";
  ctx.fill();
  ctx.font =
    "bold 84px Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#78350f";
  ctx.fillText(emoji || "🏅", cx, cy);
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.font =
    "bold 32px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("¡Felicidades!", cx, cy + 120);
  ctx.font =
    "bold 28px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  const wrapped = wrapText(ctx, title, w * 0.8);
  wrapped.lines.forEach((line, idx) =>
    ctx.fillText(line, cx, cy + 160 + idx * 34),
  );
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png", 0.95),
  );
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
  const aEl = document.createElement("a");
  aEl.href = dataUrl;
  aEl.download = `${slugify(title)}.png`;
  document.body.appendChild(aEl);
  aEl.click();
  aEl.remove();
}

function iconToEmoji(Icon: any): string {
  switch (Icon) {
    case Star:
      return "⭐";
    case Droplets:
      return "💧";
    case Dumbbell:
      return "🏋️";
    case Flame:
      return "🔥";
    case Target:
      return "🎯";
    case Award:
      return "🏅";
    case Book:
      return "📚";
    case BookOpen:
      return "📖";
    case DollarSign:
      return "💰";
    case ShoppingCart:
      return "🛒";
    default:
      return "🏅";
  }
}

export default function Achievements() {
  const { habits } = useHabits();
  const { user } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [userAchievements, setUserAchievements] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch(`/api/users/${user.id}/achievements`);
        if (!res.ok) return;
        const data = await res.json();
        setUserAchievements(data.map((d: any) => d.key));
      } catch (e) {}
    })();
  }, [user]);

  const achievedHydration = habits.find(
    (h) => h.category === "hydration" && h.completed >= h.target,
  );
  const achievedExercise = habits.find(
    (h) => h.category === "exercise" && h.completed >= h.target,
  );
  const totalAchievements =
    [achievedHydration, achievedExercise].filter(Boolean).length + 10;

  const items = [
    {
      title: "Primera semana completa",
      icon: Star,
      desc: "Completaste hábitos durante 7 días seguidos",
      earned: true,
    },
    {
      title: "Meta de hidratación diaria",
      icon: Droplets,
      desc: "Alcanzaste tu consumo de agua del día",
      earned: !!achievedHydration,
    },
    {
      title: "Entrenamiento constante",
      icon: Dumbbell,
      desc: "Cumpliste tu objetivo de ejercicio",
      earned: !!achievedExercise,
    },
    {
      title: "Racha ardiente",
      icon: Flame,
      desc: "Racha de 14 días ininterrumpidos",
      earned: false,
    },
    {
      title: "Objetivos al blanco",
      icon: Target,
      desc: "Completaste 50 objetivos",
      earned: false,
    },
  ];

  const totalEarned = items.filter((i) => i.earned).length;

  const buildShare = (title: string, desc: string) => {
    const url = window.location.href;
    const text = `¡Felicidades por obtener este logro! ${title} — ${desc}`;
    const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
    return { url, text, fb, wa };
  };

  const tryWebShare = async (
    title: string,
    text: string,
    url: string,
    imageBlob?: Blob,
  ) => {
    const nav: any = navigator;
    if (nav.share) {
      try {
        if (
          imageBlob &&
          nav.canShare &&
          nav.canShare({
            files: [
              new File([imageBlob], `${slugify(title)}.png`, {
                type: "image/png",
              }),
            ],
          })
        ) {
          const file = new File([imageBlob], `${slugify(title)}.png`, {
            type: "image/png",
          });
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
    let ok = false;
    try {
      // Try synchronous path first (more reliable across browsers and preserves gesture)
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      ok = document.execCommand("copy");
      document.body.removeChild(ta);
    } catch {}

    if (!ok) {
      try {
        if (navigator.clipboard && "writeText" in navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          ok = true;
        }
      } catch {}
    }

    if (ok) {
      toast({ title: "Copiado", description: "Texto copiado al portapapeles" });
    } else {
      toast({
        title: "No se pudo copiar",
        description: "Selecciona y copia manualmente",
      });
    }
  };

  const allAchievements = useMemo(() => {
    const base = [
      ...items,
      {
        title: "Hábito creado",
        icon: Award,
        desc: "Creaste tu primer hábito",
        earned: habits.length > 0,
      },
      {
        title: "10 hábitos completados",
        icon: Award,
        desc: "Completaste 10 hábitos en total",
        earned:
          habits.reduce((a, h) => a + (h.completed >= h.target ? 1 : 0), 0) >=
          10,
      },
      {
        title: "Lectura diaria",
        icon: Award,
        desc: "Completaste un hábito de lectura",
        earned: habits.some(
          (h) => h.category === "reading" && h.completed >= h.target,
        ),
      },
      {
        title: "Estudio constante",
        icon: Award,
        desc: "Completaste un hábito de estudio",
        earned: habits.some(
          (h) => h.category === "study" && h.completed >= h.target,
        ),
      },
      {
        title: "Ahorro logrado",
        icon: Award,
        desc: "Cumpliste una meta de finanzas",
        earned: habits.some(
          (h) => h.category === "finance" && h.completed >= h.target,
        ),
      },
      {
        title: "Semana perfecta",
        icon: Award,
        desc: "7 días seguidos completando",
        earned: false,
      },
      {
        title: "Madrugador",
        icon: Award,
        desc: "Completaste un hábito antes de las 8am",
        earned: false,
      },
      {
        title: "Constancia",
        icon: Award,
        desc: "30 días con actividad",
        earned: false,
      },
    ];
    return base.concat([
      {
        title: "3 hábitos completados hoy",
        icon: Award,
        desc: "Completa 3 hábitos en el mismo día",
        earned: habits.filter((h) => h.completedToday).length >= 3,
      },
      {
        title: "Día perfecto",
        icon: Award,
        desc: "Completa todos tus hábitos hoy",
        earned:
          habits.length > 0 &&
          habits.every((h) => h.completedToday || h.completed >= h.target),
      },
      {
        title: "Racha 7+",
        icon: Award,
        desc: "Alcanza una racha de 7 días en cualquier hábito",
        earned: habits.some((h) => h.streak >= 7),
      },
      {
        title: "Racha 30+",
        icon: Award,
        desc: "Alcanza una racha de 30 días en cualquier hábito",
        earned: habits.some((h) => h.streak >= 30),
      },
      {
        title: "Hidratación perfecta",
        icon: Award,
        desc: "Completa tu meta de hidratación",
        earned: habits.some(
          (h) => h.category === "hydration" && h.completed >= h.target,
        ),
      },
      {
        title: "Ejercicio constante",
        icon: Award,
        desc: "Mantén ejercicio con racha de 5+",
        earned: habits.some((h) => h.category === "exercise" && h.streak >= 5),
      },
      {
        title: "Lectura enfocada",
        icon: Award,
        desc: "Cumple tu objetivo de lectura de hoy",
        earned: habits.some(
          (h) =>
            h.category === "reading" &&
            (h.completedToday || h.completed >= h.target),
        ),
      },
      {
        title: "Estudio cumplido",
        icon: Award,
        desc: "Cumple tu objetivo de estudio de hoy",
        earned: habits.some(
          (h) =>
            h.category === "study" &&
            (h.completedToday || h.completed >= h.target),
        ),
      },
      {
        title: "5 hábitos activos",
        icon: Award,
        desc: "Crea 5 hábitos en total",
        earned: habits.length >= 5,
      },
      {
        title: "10 hábitos activos",
        icon: Award,
        desc: "Crea 10 hábitos en total",
        earned: habits.length >= 10,
      },
    ]);
  }, [habits, items]);

  // When an achievement becomes earned and the user is logged, push it to server
  useEffect(() => {
    if (!user) return;
    (async () => {
      for (const a of allAchievements) {
        if (!a.earned) continue;
        const key = slugify(a.title);
        if (userAchievements.includes(key)) continue;
        try {
          const token = localStorage.getItem("auth:token");
          const res = await fetch(`/api/users/${user.id}/achievements`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              achievementKey: key,
              meta: { title: a.title, desc: a.desc },
            }),
          });
          if (res.ok) {
            setUserAchievements((prev) => [...prev, key]);
            toast({ title: "Logro desbloqueado", description: a.title });
          }
        } catch (e) {}
      }
    })();
  }, [allAchievements, user]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-6">
          <Award className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Logros</h1>
          <Badge variant="secondary" className="ml-2">
            {totalAchievements} totales
          </Badge>
          <Badge variant="outline" className="ml-2">
            {totalEarned} obtenidos
          </Badge>
          <div className="ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Ocultar todos" : "Ver todos los logros"}
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
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${a.earned ? "bg-primary/5" : ""}`}
                >
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
                      {(() => {
                        const s = buildShare(a.title, a.desc);
                        return (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Share2 className="h-4 w-4 mr-1" /> Compartir
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onSelect={() => window.open(s.fb, "_blank") }>
                                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2v-2.9h2.2V9.3c0-2.2 1.3-3.5 3.3-3.5.96 0 1.96.17 1.96.17v2.1h-1.08c-1.06 0-1.39.66-1.39 1.33v1.6h2.36l-.38 2.9h-1.98v7A10 10 0 0022 12z"/></svg>
                                Facebook
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => window.open(s.wa, "_blank") }>
                                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 .08 4.93.04 11.03a12.3 12.3 0 001.86 6.25L0 24l6.99-1.79a11.94 11.94 0 005.01 1.2c6.63 0 11.92-4.93 11.96-11.03a11.9 11.9 0 00-3.44-8.9zM12 21.5a9.4 9.4 0 01-4.7-1.2l-.34-.2-4.15 1.06 1.1-3.99-.22-.36A9.4 9.4 0 012.5 11C2.5 6 6.7 2.2 12 2.2c3.2 0 6.04 1.52 7.8 4.06A8.78 8.78 0 0120.78 11c0 5-4.2 9.5-8.78 10.5z"/></svg>
                                WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={async () => {
                                  try {
                                    const blob = await generateAchievementImage(a.title, iconToEmoji(a.icon));
                                    const shared = await tryWebShare(a.title, s.text, s.url, blob);
                                    if (!shared) {
                                      await copyText(`${s.text} ${s.url}`);
                                      toast({ title: 'Compartir', description: 'Se copió el texto. Pega en Instagram para compartir.' });
                                    }
                                  } catch (e) {
                                    await copyText(`${s.text} ${s.url}`);
                                    toast({ title: 'Compartir', description: 'Se copió el texto. Pega en Instagram para compartir.' });
                                  }
                                }}>
                                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.053 1.96.24 2.42.4.6.22 1.03.48 1.48.92.45.45.7.88.92 1.48.16.46.35 1.25.4 2.42.06 1.26.07 1.65.07 4.85s-.012 3.585-.07 4.85c-.053 1.17-.24 1.96-.4 2.42-.22.6-.48 1.03-.92 1.48-.45.45-.88.7-1.48.92-.46.16-1.25.35-2.42.4-1.26.06-1.65.07-4.85.07s-3.585-.012-4.85-.07c-1.17-.053-1.96-.24-2.42-.4-.6-.22-1.03-.48-1.48-.92-.45-.45-.7-.88-.92-1.48-.16-.46-.35-1.25-.4-2.42C2.212 15.585 2.2 15.2 2.2 12s.012-3.585.07-4.85c.053-1.17.24-1.96.4-2.42.22-.6.48-1.03.92-1.48.45-.45.88-.7 1.48-.92.46-.16 1.25-.35 2.42-.4C8.415 2.212 8.8 2.2 12 2.2zm0 3.2a6.6 6.6 0 100 13.2 6.6 6.6 0 000-13.2zm0 10.88a4.28 4.28 0 110-8.56 4.28 4.28 0 010 8.56zm5.2-10.92a1.54 1.54 0 11-3.08 0 1.54 1.54 0 013.08 0z"/></svg>
                                Instagram
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(s.text)}&url=${encodeURIComponent(s.url)}`, "_blank") }>
                                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.26 4.26 0 001.88-2.35 8.48 8.48 0 01-2.7 1.03 4.24 4.24 0 00-7.22 3.86A12.02 12.02 0 013 4.79a4.24 4.24 0 001.31 5.66 4.2 4.2 0 01-1.92-.53v.05a4.24 4.24 0 003.4 4.16 4.27 4.27 0 01-1.91.07 4.26 4.26 0 003.97 2.95A8.5 8.5 0 012 19.54a12.01 12.01 0 006.5 1.9c7.8 0 12.07-6.46 12.07-12.07 0-.18-.01-.35-.02-.53A8.6 8.6 0 0022.46 6z"/></svg>
                                X
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        );
                      })()}
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
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${a.earned ? "bg-primary/5" : "bg-muted/30"}`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${a.earned ? "bg-yellow-500/20" : "bg-muted"}`}
                      >
                        <Icon
                          className={`h-4 w-4 ${a.earned ? "text-yellow-600" : "text-muted-foreground"}`}
                        />
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
                        {(() => {
                          const s = buildShare(a.title, a.desc);
                          return (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Share2 className="h-4 w-4 mr-1" /> Compartir
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem onSelect={() => window.open(s.fb, "_blank") }>
                                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2v-2.9h2.2V9.3c0-2.2 1.3-3.5 3.3-3.5.96 0 1.96.17 1.96.17v2.1h-1.08c-1.06 0-1.39.66-1.39 1.33v1.6h2.36l-.38 2.9h-1.98v7A10 10 0 0022 12z"/></svg>
                                  Facebook
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => window.open(s.wa, "_blank") }>
                                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 .08 4.93.04 11.03a12.3 12.3 0 001.86 6.25L0 24l6.99-1.79a11.94 11.94 0 005.01 1.2c6.63 0 11.92-4.93 11.96-11.03a11.9 11.9 0 00-3.44-8.9zM12 21.5a9.4 9.4 0 01-4.7-1.2l-.34-.2-4.15 1.06 1.1-3.99-.22-.36A9.4 9.4 0 012.5 11C2.5 6 6.7 2.2 12 2.2c3.2 0 6.04 1.52 7.8 4.06A8.78 8.78 0 0120.78 11c0 5-4.2 9.5-8.78 10.5z"/></svg>
                                  WhatsApp
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={async () => {
                                    try {
                                      const blob = await generateAchievementImage(a.title, iconToEmoji(a.icon));
                                      const shared = await tryWebShare(a.title, s.text, s.url, blob);
                                      if (!shared) {
                                        await copyText(`${s.text} ${s.url}`);
                                        toast({ title: 'Compartir', description: 'Se copió el texto. Pega en Instagram para compartir.' });
                                      }
                                    } catch (e) {
                                      await copyText(`${s.text} ${s.url}`);
                                      toast({ title: 'Compartir', description: 'Se copió el texto. Pega en Instagram para compartir.' });
                                    }
                                  }}>
                                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.053 1.96.24 2.42.4.6.22 1.03.48 1.48.92.45.45.7.88.92 1.48.16.46.35 1.25.4 2.42.06 1.26.07 1.65.07 4.85s-.012 3.585-.07 4.85c-.053 1.17-.24 1.96-.4 2.42-.22.6-.48 1.03-.92 1.48-.45.45-.88.7-1.48.92-.46.16-1.25.35-2.42.4-1.26.06-1.65.07-4.85.07s-3.585-.012-4.85-.07c-1.17-.053-1.96-.24-2.42-.4-.6-.22-1.03-.48-1.48-.92-.45-.45-.7-.88-.92-1.48-.16-.46-.35-1.25-.4-2.42C2.212 15.585 2.2 15.2 2.2 12s.012-3.585.07-4.85c.053-1.17.24-1.96.4-2.42.22-.6.48-1.03.92-1.48.45-.45.88-.7 1.48-.92.46-.16 1.25-.35 2.42-.4C8.415 2.212 8.8 2.2 12 2.2zm0 3.2a6.6 6.6 0 100 13.2 6.6 6.6 0 000-13.2zm0 10.88a4.28 4.28 0 110-8.56 4.28 4.28 0 010 8.56zm5.2-10.92a1.54 1.54 0 11-3.08 0 1.54 1.54 0 013.08 0z"/></svg>
                                  Instagram
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(s.text)}&url=${encodeURIComponent(s.url)}`, "_blank") }>
                                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.26 4.26 0 001.88-2.35 8.48 8.48 0 01-2.7 1.03 4.24 4.24 0 00-7.22 3.86A12.02 12.02 0 013 4.79a4.24 4.24 0 001.31 5.66 4.2 4.2 0 01-1.92-.53v.05a4.24 4.24 0 003.4 4.16 4.27 4.27 0 01-1.91.07 4.26 4.26 0 003.97 2.95A8.5 8.5 0 012 19.54a12.01 12.01 0 006.5 1.9c7.8 0 12.07-6.46 12.07-12.07 0-.18-.01-.35-.02-.53A8.6 8.6 0 0022.46 6z"/></svg>
                                  X
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          );
                        })()}
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
