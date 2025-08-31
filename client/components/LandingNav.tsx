import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function LandingNav() {
  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="#hero" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">HabitFlow</span>
          </a>

          <div className="hidden md:flex items-center space-x-1">
            <a href="#features"><Button variant="ghost" size="sm">Servicios</Button></a>
            <a href="#categories"><Button variant="ghost" size="sm">Organiza</Button></a>
            <a href="#about"><Button variant="ghost" size="sm">Sobre nosotros</Button></a>
            <a href="#contact"><Button variant="ghost" size="sm">Contacto</Button></a>
            <Link to="/login"><Button variant="outline" size="sm">Iniciar sesión</Button></Link>
            <Link to="/register"><Button size="sm">Registro</Button></Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
