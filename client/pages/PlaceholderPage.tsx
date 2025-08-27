import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

interface PlaceholderPageProps {
  title: string;
  description: string;
  backTo?: string;
}

export default function PlaceholderPage({ 
  title, 
  description, 
  backTo = "/dashboard" 
}: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Construction className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-lg">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Esta página está en desarrollo. ¡Pronto estará disponible con todas las funcionalidades que necesitas!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={backTo}>
                <Button variant="outline" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver al Dashboard</span>
                </Button>
              </Link>
              <Button className="flex items-center space-x-2">
                <span>Solicitar esta funcionalidad</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
