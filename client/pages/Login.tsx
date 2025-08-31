import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, LogIn, ShieldCheck, User, Chrome } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { FormEvent, useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Correo inválido", description: "Ingresa un correo válido" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Contraseña muy corta", description: "Mínimo 6 caracteres" });
      return;
    }
    try {
      setLoading(true);
      await login({ email, password });
      toast({ title: "Sesión iniciada" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "No se pudo iniciar sesión" });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    await loginWithGoogle();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogIn className="h-5 w-5" />
              <span>Iniciar sesión</span>
            </CardTitle>
            <CardDescription>Accede con tu correo y contraseña o usa Google</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </Button>
            </form>

            <div className="my-6 flex items-center">
              <Separator className="flex-1" />
              <span className="px-3 text-xs text-muted-foreground">o</span>
              <Separator className="flex-1" />
            </div>

            <Button variant="outline" className="w-full" onClick={signInWithGoogle}>
              <Chrome className="mr-2 h-4 w-4" />
              Iniciar sesión con Google
            </Button>

            <p className="text-sm text-muted-foreground mt-6 text-center">
              ¿No tienes cuenta? <Link to="/register" className="text-primary hover:underline">Regístrate</Link>
            </p>
          </CardContent>
        </Card>
        <div className="flex items-center justify-center mt-4 text-xs text-muted-foreground">
          <ShieldCheck className="h-3 w-3 mr-1" />
          <span>Protegemos tu privacidad</span>
        </div>
      </div>
    </div>
  );
}
