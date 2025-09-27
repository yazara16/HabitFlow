import { Link, useNavigate } from "react-router-dom";
import AuthNav from "@/components/AuthNav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  UserPlus,
  Mail,
  Lock,
  Chrome,
  ShieldCheck,
  Image as ImageIcon,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const { register: registerUser, loginWithGoogle } = useAuth();
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [preferred, setPreferred] = useState<string[]>([]);
  const togglePreferred = (key: string) => setPreferred(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Nombre requerido" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Correo inválido",
        description: "Ingresa un correo válido",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Contraseña muy corta",
        description: "Mínimo 6 caracteres",
      });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Las contraseñas no coinciden" });
      return;
    }
    try {
      setLoading(true);
      await registerUser({ name, email, password, photoUrl: photoDataUrl });
      toast({ title: "Registro exitoso" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "No se pudo registrar",
      });
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    await loginWithGoogle();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthNav />
      <div className="max-w-md mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Crear cuenta</span>
            </CardTitle>
            <CardDescription>
              Crea tu cuenta o continúa con Google
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar contraseña</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="********"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Preferencias (elige lo que te interesa)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={preferred.includes('exercise')} onCheckedChange={() => togglePreferred('exercise')} />
                    <span className="text-sm">Ejercicio</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={preferred.includes('hydration')} onCheckedChange={() => togglePreferred('hydration')} />
                    <span className="text-sm">Hidratación</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={preferred.includes('finance')} onCheckedChange={() => togglePreferred('finance')} />
                    <span className="text-sm">Finanzas</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={preferred.includes('shopping')} onCheckedChange={() => togglePreferred('shopping')} />
                    <span className="text-sm">Compras</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={preferred.includes('reading')} onCheckedChange={() => togglePreferred('reading')} />
                    <span className="text-sm">Lectura</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={preferred.includes('study')} onCheckedChange={() => togglePreferred('study')} />
                    <span className="text-sm">Estudio</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={preferred.includes('meditation')} onCheckedChange={() => togglePreferred('meditation')} />
                    <span className="text-sm">Meditación</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={preferred.includes('custom')} onCheckedChange={() => togglePreferred('custom')} />
                    <span className="text-sm">Personalizado</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Foto (opcional)</Label>
                <div className="relative">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) {
                        setPhotoDataUrl(undefined);
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () =>
                        setPhotoDataUrl(reader.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                </div>
                {photoDataUrl && (
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <ImageIcon className="h-3 w-3" />
                    <span>Foto cargada</span>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creando..." : "Registrarse"}
              </Button>
            </form>

            <div className="my-6 flex items-center">
              <Separator className="flex-1" />
              <span className="px-3 text-xs text-muted-foreground">o</span>
              <Separator className="flex-1" />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={signUpWithGoogle}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Continuar con Google
            </Button>

            <p className="text-sm text-muted-foreground mt-6 text-center">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </CardContent>
        </Card>
        <div className="flex items-center justify-center mt-4 text-xs text-muted-foreground">
          <ShieldCheck className="h-3 w-3 mr-1" />
          <span>Gratis para siempre • No requiere tarjeta</span>
        </div>
      </div>
    </div>
  );
}
