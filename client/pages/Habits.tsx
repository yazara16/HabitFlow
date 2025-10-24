import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  Target,
  Flame,
  TrendingUp,
  Calendar,
  Clock,
  Dumbbell,
  Droplets,
  DollarSign,
  ShoppingCart,
  Star,
  ArrowUpDown,
  Settings
} from "lucide-react";
import Navigation from "@/components/Navigation";
import HabitDialog from "@/components/HabitDialog";
import { useHabits, Habit as HabitType } from "@/contexts/HabitsContext";
import { toast } from "@/hooks/use-toast";

type Habit = HabitType;

export default function Habits() {
  const { habits, addHabit, updateHabit, removeHabit } = useHabits();

  const [habitDialogOpen, setHabitDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "streak" | "progress" | "created">("name");

  const categories = [
    { id: "all", name: "Todos", icon: Target, count: habits.length },
    { id: "exercise", name: "Ejercicio", icon: Dumbbell, count: habits.filter(h => h.category === "exercise").length },
    { id: "hydration", name: "Hidratación", icon: Droplets, count: habits.filter(h => h.category === "hydration").length },
    { id: "finance", name: "Finanzas", icon: DollarSign, count: habits.filter(h => h.category === "finance").length },
    { id: "shopping", name: "Compras", icon: ShoppingCart, count: habits.filter(h => h.category === "shopping").length },
    { id: "custom", name: "Personal", icon: Star, count: habits.filter(h => h.category === "custom").length },
  ];

  const filteredHabits = habits
    .filter(habit => selectedCategory === "all" || habit.category === selectedCategory)
    .filter(habit => habit.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "streak":
          return b.streak - a.streak;
        case "progress":
          return (b.completed / b.target) - (a.completed / a.target);
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const toggleHabit = (habitId: string) => {
    const h = habits.find(h => h.id === habitId);
    if (!h) return;
    const newCompleted = h.completedToday ? Math.max(0, h.completed - 1) : Math.min(h.target, h.completed + 1);
    updateHabit(habitId, {
      completed: newCompleted,
      completedToday: !h.completedToday,
      streak: !h.completedToday ? h.streak + 1 : h.streak,
      lastCompleted: !h.completedToday ? new Date().toISOString().split('T')[0] : h.lastCompleted
    });
  };

  const incrementHabit = (habitId: string) => {
    const h = habits.find(h => h.id === habitId);
    if (!h || h.completed < 0 || h.completed >= h.target) return;
    const newCompleted = h.completed + 1;
    updateHabit(habitId, {
      completed: newCompleted,
      completedToday: newCompleted >= h.target,
      lastCompleted: newCompleted >= h.target ? new Date().toISOString().split('T')[0] : h.lastCompleted
    });
  };

  const deleteHabit = (habitId: string) => {
    removeHabit(habitId);
    setDeleteDialogOpen(false);
    setHabitToDelete(null);
    toast({ title: 'Hábito eliminado' });
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setHabitDialogOpen(true);
  };

  const handleDeleteClick = (habitId: string) => {
    setHabitToDelete(habitId);
    setDeleteDialogOpen(true);
  };

  const totalHabits = habits.length;
  const completedToday = habits.filter(h => h.completedToday).length;
  const averageStreak = habits.length ? habits.reduce((sum, h) => sum + h.streak, 0) / habits.length : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Gestión de Hábitos
              </h1>
              <p className="text-muted-foreground">
                Organiza, edita y supervisa todos tus hábitos desde un solo lugar
              </p>
            </div>
            <Button 
              className="mt-4 sm:mt-0 flex items-center space-x-2"
              onClick={() => {
                setEditingHabit(undefined);
                setHabitDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Hábito</span>
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Hábitos</p>
                    <p className="text-2xl font-bold">{totalHabits}</p>
                  </div>
                  <Target className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completados Hoy</p>
                    <p className="text-2xl font-bold">{completedToday}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-success/60" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Racha Promedio</p>
                    <p className="text-2xl font-bold">{Math.round(averageStreak)}</p>
                  </div>
                  <Flame className="h-8 w-8 text-orange-500/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar hábitos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Ordenar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                  Por nombre
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("streak")}>
                  Por racha
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("progress")}>
                  Por progreso
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("created")}>
                  Por fecha de creación
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Categories and Habits */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                  {typeof Icon === "function" ? <Icon className="h-4 w-4" /> : <Star className="h-4 w-4" /> }
                  <span className="hidden sm:inline">{category.name}</span>
                  <Badge variant="secondary" className="text-xs">{category.count}</Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {filteredHabits.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No hay hábitos</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "No se encontraron hábitos que coincidan con tu búsqueda" : "Aún no has creado hábitos en esta categoría"}
                  </p>
                  <Button onClick={() => setHabitDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Hábito
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHabits.map((habit) => {
                  const Icon = habit.icon;
                  const progress = habit.target ? (habit.completed / habit.target) * 100 : 0;
                  const isCompleted = habit.completed >= habit.target;
                  
                  return (
                    <Card key={habit.id} className="group hover:shadow-md transition-all duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${habit.color}`}>
                              {typeof Icon === "function" ? <Icon className="h-4 w-4" /> : <Star className="h-4 w-4" /> }
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg truncate">{habit.name}</CardTitle>
                              {habit.description && (
                                <CardDescription className="text-sm">
                                  {habit.description}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditHabit(habit)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(habit.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Progress */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">Progreso</span>
                              <span className="text-sm font-medium">
                                {habit.completed}/{habit.target} {habit.unit}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Progress value={progress} className="flex-1 h-2" />
                              {habit.category === "hydration" && habit.completed < habit.target && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => incrementHabit(habit.id)}
                                  className="text-xs px-2 py-1 h-6"
                                >
                                  +1
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-1">
                              <Flame className="h-4 w-4 text-orange-500" />
                              <span className="text-muted-foreground">Racha:</span>
                              <span className="font-medium">{habit.streak} días</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{habit.frequency}</span>
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          <Button
                            onClick={() => toggleHabit(habit.id)}
                            variant={isCompleted ? "secondary" : "default"}
                            className="w-full flex items-center space-x-2"
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>¡Completado!</span>
                              </>
                            ) : (
                              <>
                                <Circle className="h-4 w-4" />
                                <span>Marcar como completado</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Habit Creation/Edit Dialog */}
      <HabitDialog
        open={habitDialogOpen}
        onOpenChange={setHabitDialogOpen}
        habit={editingHabit}
        onSave={(newHabit) => {
          if (editingHabit) {
            updateHabit(editingHabit.id, newHabit as any);
            toast({ title: 'Hábito actualizado' });
          } else {
            addHabit(newHabit as any);
            toast({ title: 'Hábito creado' });
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar hábito?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este hábito y todo su historial de progreso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => habitToDelete && deleteHabit(habitToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
