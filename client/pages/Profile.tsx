import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user } = useAuth();
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
              <div>
                <p className="text-lg font-semibold">{user?.name || "Usuario"}</p>
                <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
