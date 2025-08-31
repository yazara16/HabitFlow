import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  BarChart3,
  Calendar,
  Bell,
  Zap,
  Target,
  TrendingUp,
  Star,
  Award,
  Shield,
  Smartphone,
  ArrowRight,
  Play,
  Users,
  Clock,
  Heart,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  MessageSquare,
  UserPlus,
  LogIn,
  Book,
  GraduationCap
} from "lucide-react";
import LandingNav from "@/components/LandingNav";

export default function Index() {
  const features = [
    {
      icon: Target,
      title: "Organización Inteligente",
      description: "Crea y organiza hábitos por categorías: ejercicio, hidratación, finanzas, compras y más.",
      color: "text-blue-500"
    },
    {
      icon: BarChart3,
      title: "Visualización Avanzada",
      description: "Dashboards interactivos con gráficas que muestran tu progreso y tendencias.",
      color: "text-green-500"
    },
    {
      icon: Zap,
      title: "Motivación Instantánea",
      description: "Recibe retroalimentación inmediata, logros virtuales y animaciones motivacionales.",
      color: "text-yellow-500"
    },
    {
      icon: Bell,
      title: "Recordatorios Inteligentes",
      description: "Notificaciones personalizadas y sugerencias basadas en tu historial.",
      color: "text-purple-500"
    },
    {
      icon: Calendar,
      title: "Planificación Visual",
      description: "Calendario interactivo con drag & drop para organizar tu rutina perfecta.",
      color: "text-indigo-500"
    },
    {
      icon: Smartphone,
      title: "Acceso Offline",
      description: "Funcionalidad PWA para usar la app sin conexión y máxima seguridad.",
      color: "text-pink-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Usuarios activos", icon: Users },
    { number: "50K+", label: "Hábitos creados", icon: Target },
    { number: "85%", label: "Tasa de éxito", icon: TrendingUp },
    { number: "24/7", label: "Soporte", icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      
      {/* Hero Section */}
      <section id="hero" className="relative px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-accent/10">
        <div className="max-w-7xl mx-auto text-center">
          
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
            Transforma tu vida con
            <span className="text-primary block mt-2">hábitos inteligentes</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            HabitFlow es la aplicación definitiva para crear, rastrear y mantener hábitos saludables. 
            Con visualizaciones avanzadas, motivación constante y herramientas inteligentes.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Link to="/register">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold">
                <UserPlus className="mr-2 h-5 w-5" />
                Registrarse
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                <LogIn className="mr-2 h-5 w-5" />
                Iniciar sesión
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-2">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Características que marcan la diferencia
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre por qué miles de personas eligen HabitFlow para transformar sus rutinas diarias
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-primary/20">
                <CardHeader>
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-background border border-border group-hover:border-primary/20 transition-colors mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section id="categories" className="px-4 py-20 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Organiza todos tus hábitos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Categorías inteligentes para mantener tu vida equilibrada y organizada
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Ejercicio & Salud", icon: Heart, color: "bg-red-500", count: "12 hábitos" },
              { name: "Hidratación", icon: CheckCircle2, color: "bg-blue-500", count: "3 hábitos" },
              { name: "Finanzas", icon: TrendingUp, color: "bg-green-500", count: "8 hábitos" },
              { name: "Lectura", icon: Book, color: "bg-amber-500", count: "6 hábitos" },
              { name: "Estudio", icon: GraduationCap, color: "bg-teal-500", count: "5 hábitos" },
              { name: "Personalizado", icon: Star, color: "bg-purple-500", count: "15 hábitos" }
            ].map((category, index) => (
              <Card key={index} className="group hover:shadow-md transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${category.color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-4 py-20 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Target className="h-16 w-16 text-primary" />
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Sobre nosotros</h2>
            <p className="text-lg text-muted-foreground">
              En HabitFlow creemos que pequeños pasos diarios generan grandes cambios. Nuestra misión es darte
              herramientas claras, visuales y motivadoras para construir hábitos sostenibles y alcanzar tus metas.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="flex items-center justify-start mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mr-3">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Contacto</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-6">Escríbenos o conéctate con nosotros en redes sociales.</p>
            <div className="flex items-center space-x-4">
              <a href="mailto:soporte@habitflow.app" className="underline text-primary">soporte@habitflow.app</a>
              <a href="#" aria-label="Twitter" className="p-2 rounded-lg border border-border hover:bg-muted/50 transition"><Twitter className="h-4 w-4" /></a>
              <a href="#" aria-label="Instagram" className="p-2 rounded-lg border border-border hover:bg-muted/50 transition"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label="Facebook" className="p-2 rounded-lg border border-border hover:bg-muted/50 transition"><Facebook className="h-4 w-4" /></a>
              <a href="#" aria-label="LinkedIn" className="p-2 rounded-lg border border-border hover:bg-muted/50 transition"><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); toast({ title: "Mensaje enviado" }); }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="cname">Nombre</Label>
              <Input id="cname" placeholder="Tu nombre" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cemail">Correo</Label>
              <Input id="cemail" type="email" placeholder="tu@correo.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cmsg">Mensaje</Label>
              <Textarea id="cmsg" placeholder="Cuéntanos en qué podemos ayudarte" rows={4} required />
            </div>
            <Button type="submit" className="w-full md:w-auto">Enviar</Button>
          </form>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl p-8 sm:p-12">
            <Award className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              ¿Listo para transformar tu vida?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a miles de personas que ya están construyendo mejores hábitos y alcanzando sus metas con HabitFlow.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <Button size="lg" className="px-8 py-6 text-lg font-semibold">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Gratis para siempre • No requiere tarjeta</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">HabitFlow</span>
            </div>
            <p className="text-muted-foreground text-center md:text-right">
              © 2025 HabitFlow. Construyendo mejores hábitos, un día a la vez.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
