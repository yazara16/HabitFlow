import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");

  const save = async () => {
    try {
      await updateProfile({ name, photoUrl });
      toast({ title: 'Perfil actualizado' });
      setEditing(false);
    } catch (e: any) {
      toast({ title: 'Error', description: String(e?.message || e) });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Información básica del usuario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.photoUrl} />
                <AvatarFallback>HF</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {editing ? (
                  <div className="space-y-2">
                    <div>
                      <Label>Nombre</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                      <Label>Foto (URL)</Label>
                      <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button onClick={save}>Guardar</Button>
                      <Button variant="ghost" onClick={() => { setEditing(false); setName(user?.name || ''); setPhotoUrl(user?.photoUrl || ''); }}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-semibold">{user?.name || "Usuario"}</p>
                    <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
                  </div>
                )}
              </div>
              {!editing && (
                <div>
                  <Button onClick={() => setEditing(true)}>Editar</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
