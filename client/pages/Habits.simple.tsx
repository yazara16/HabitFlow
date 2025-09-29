import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useHabits } from "@/contexts/HabitsContext.simple";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Target,
  Dumbbell,
  Droplets,
  BookOpen,
  Moon,
  Star,
  Trash2,
  Edit,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import HabitDialog from "@/components/HabitDialog";

const iconOptions = [
  { value: "Target", icon: Target, label: "Objetivo" },
  { value: "Dumbbell", icon: Dumbbell, label: "Ejercicio" },
  { value: "Droplets", icon: Droplets, label: "Hidratación" },
  { value: "BookOpen", icon: BookOpen, label: "Lectura" },
  { value: "Moon", icon: Moon, label: "Sueño" },
  { value: "Star", icon: Star, label: "Estrella" },
];

export default function Habits() {
  const { user, logout } = useAuth();
  const { habits, addHabit, updateHabit, deleteHabit, loading } = useHabits();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast({ title: "Sesión cerrada" });
  };

  const handleCreateHabit = async (habitData: any) => {
    try {
      await addHabit(habitData);
      toast({ title: "Hábito creado", description: `${habitData.name} agregado exitosamente` });
      setShowDialog(false);
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el hábito" });
    }
  };

  const handleToggleHabit = async (habit: any) => {
    try {
      await updateHabit(habit.id, { 
        completed: !habit.completed,
        completedBoolean: !habit.completed 
      });
      toast({ title: habit.completed ? "Hábito desmarcado" : "Hábito completado" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el hábito" });
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
      toast({ title: "Hábito eliminado" });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el hábito" });
    }
  };

  const completedToday = habits.filter(habit => habit.completed).length;
  const totalHabits = habits.length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation onLogout={handleLogout} user={user} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mis Hábitos</h1>
              <p className="text-muted-foreground mt-2">
                Gestiona tus hábitos diarios y mantén el progreso
              </p>
            </div>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Hábito
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Hábitos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHabits}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completados Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de hábitos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Hábitos</CardTitle>
            <CardDescription>
              {loading ? "Cargando..." : `Tienes ${totalHabits} hábitos creados`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando hábitos...</p>
              </div>
            ) : habits.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay hábitos creados</h3>
                <p className="text-muted-foreground mb-4">
                  Crea tu primer hábito para empezar a mejorar tu día a día
                </p>
                <Button onClick={() => setShowDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer hábito
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleHabit(habit)}
                          className={`w-8 h-8 p-0 ${
                            habit.completed ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {habit.completed ? '✓' : '○'}
                        </Button>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          habit.color || 'bg-blue-500'
                        }`}>
                          <Target className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">{habit.name}</h4>
                        {habit.description && (
                          <p className="text-sm text-muted-foreground">{habit.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {habit.category || 'General'}
                          </Badge>
                          {habit.streak && habit.streak > 0 && (
                            <Badge variant="outline" className="text-xs">
                              🔥 {habit.streak} días
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para crear/editar hábitos */}
        {showDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Crear Nuevo Hábito</CardTitle>
                <CardDescription>
                  Agrega un nuevo hábito a tu rutina diaria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const habitData = {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    category: formData.get('category'),
                    target: parseInt(formData.get('target') as string) || 1,
                    frequency: formData.get('frequency'),
                  };
                  if (habitData.name) {
                    handleCreateHabit(habitData);
                  }
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre del hábito</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ej: Ejercitarse 30 minutos"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción (opcional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe tu hábito..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select name="category">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exercise">Ejercicio</SelectItem>
                        <SelectItem value="health">Salud</SelectItem>
                        <SelectItem value="learning">Aprendizaje</SelectItem>
                        <SelectItem value="productivity">Productividad</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target">Objetivo</Label>
                    <Input
                      id="target"
                      name="target"
                      type="number"
                      placeholder="1"
                      defaultValue={1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frecuencia</Label>
                    <Select name="frequency">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diario</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Crear Hábito</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

