import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  Droplets, 
  DollarSign, 
  ShoppingCart, 
  Star,
  Heart,
  Book,
  BookOpen,
  Coffee,
  Moon,
  Target,
  Clock,
  Repeat
} from "lucide-react";

interface Habit {
  id?: string;
  name: string;
  description?: string;
  category: "exercise" | "hydration" | "finance" | "shopping" | "reading" | "study" | "custom";
  icon: any;
  color: string;
  target: number;
  unit: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  monthlyDays?: number[];
  monthlyMonths?: number[];
  reminderTime?: string;
  reminderEnabled: boolean;
}

interface HabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit;
  onSave: (habit: Habit) => void;
  hideFrequency?: boolean;
}

const categories = [
  {
    id: "exercise",
    name: "Ejercicio & Salud",
    icon: Dumbbell,
    color: "text-red-500 bg-red-500/10",
    description: "Actividad física, deportes, bienestar"
  },
  {
    id: "hydration", 
    name: "Hidratación",
    icon: Droplets,
    color: "text-blue-500 bg-blue-500/10",
    description: "Agua, líquidos saludables"
  },
  {
    id: "finance",
    name: "Finanzas",
    icon: DollarSign,
    color: "text-green-500 bg-green-500/10", 
    description: "Ahorro, gastos, inversiones (MXN)"
  },
  {
    id: "shopping",
    name: "Lista de Compras",
    icon: ShoppingCart,
    color: "text-orange-500 bg-orange-500/10",
    description: "Compras, mandados, tareas"
  },
  {
    id: "reading",
    name: "Lectura",
    icon: Book,
    color: "text-indigo-600 bg-indigo-600/10",
    description: "Páginas, libros, lectura diaria"
  },
  {
    id: "study",
    name: "Estudio",
    icon: BookOpen,
    color: "text-cyan-600 bg-cyan-600/10",
    description: "Estudio, cursos, repaso"
  },
  {
    id: "custom",
    name: "Personalizado",
    icon: Star,
    color: "text-purple-500 bg-purple-500/10",
    description: "Hábitos únicos y personalizados"
  }
];

const customIcons = [
  { icon: Heart, name: "Corazón", color: "text-pink-500" },
  { icon: Book, name: "Libro", color: "text-blue-600" },
  { icon: Coffee, name: "Café", color: "text-amber-600" },
  { icon: Moon, name: "Luna", color: "text-indigo-500" },
  { icon: Target, name: "Objetivo", color: "text-green-600" },
];

const units = [
  "minutos", "horas", "veces", "páginas", "vasos", "litros",
  "km", "pasos", "MXN", "USD", "euros", "repeticiones", "series"
];

export default function HabitDialog({ open, onOpenChange, habit, onSave, hideFrequency }: HabitDialogProps) {
  const [formData, setFormData] = useState<Habit>(() => ({
    name: habit?.name || "",
    description: habit?.description || "",
    category: habit?.category || "custom",
    icon: habit?.icon || Star,
    color: habit?.color || "text-purple-500 bg-purple-500/10",
    target: habit?.target || 1,
    unit: habit?.unit || "veces",
    frequency: habit?.frequency || "daily",
    monthlyDays: habit?.monthlyDays || [],
    monthlyMonths: habit?.monthlyMonths || [],
    reminderTime: habit?.reminderTime || "09:00",
    reminderEnabled: habit?.reminderEnabled || false,
    ...habit
  }));

  const selectedCategory = categories.find(cat => cat.id === formData.category);

  const handleSave = () => {
    const habitToSave = {
      ...formData,
      id: habit?.id || `habit_${Date.now()}`,
      icon: formData.category === "custom" ? formData.icon : selectedCategory?.icon || Star,
      color: formData.category === "custom" ? formData.color : selectedCategory?.color || "text-purple-500 bg-purple-500/10"
    };
    
    onSave(habitToSave);
    onOpenChange(false);
    
    // Reset form for new habits
    if (!habit) {
      setFormData({
        name: "",
        description: "",
        category: "custom",
        icon: Star,
        color: "text-purple-500 bg-purple-500/10",
        target: 1,
        unit: "veces",
        frequency: "daily",
        monthlyDays: [],
        monthlyMonths: [],
        reminderTime: "09:00",
        reminderEnabled: false,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {habit ? "Editar Hábito" : "Crear Nuevo Hábito"}
          </DialogTitle>
          <DialogDescription>
            {habit
              ? "Modifica los detalles de tu hábito"
              : "Define un nuevo hábito para seguir y mejorar tu rutina diaria"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 overflow-y-auto flex-1 pr-1">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del hábito *</Label>
              <Input
                id="name"
                placeholder="Ej: Correr 30 minutos, Beber 2L de agua..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Agrega detalles sobre tu hábito..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label>Categoría</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = formData.category === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      category: category.id as any,
                      icon: category.icon,
                      color: category.color
                    }))}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-border/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`p-1 rounded ${category.color}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Icon Selection (only for custom category) */}
          {formData.category === "custom" && (
            <div className="space-y-3">
              <Label>Ícono personalizado</Label>
              <div className="flex flex-wrap gap-2">
                {customIcons.map((iconData, index) => {
                  const Icon = iconData.icon;
                  const isSelected = formData.icon === iconData.icon;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        icon: iconData.icon,
                        color: `${iconData.color} ${iconData.color.replace('text-', 'bg-')}/10`
                      }))}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-border/60'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${iconData.color}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Target & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Meta diaria</Label>
              <Input
                id="target"
                type="number"
                min="1"
                value={formData.target}
                onChange={(e) => setFormData(prev => ({ ...prev, target: Number(e.target.value) }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unidad</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Frequency */}
          {!hideFrequency && (
            <div className="space-y-2">
              <Label>Frecuencia</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">
                    <div className="flex items-center space-x-2">
                      <Repeat className="h-4 w-4" />
                      <span>Diario</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="weekly">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Semanal</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="monthly">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4" />
                      <span>Días específicos del mes</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Monthly Days and Months Selector */}
              {formData.frequency === "monthly" && (
                <div className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <Label>Selecciona los meses</Label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {[
                        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
                        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
                      ].map((monthName, index) => {
                        const monthNumber = index + 1;
                        const isSelected = formData.monthlyMonths?.includes(monthNumber) || false;
                        return (
                          <button
                            key={monthNumber}
                            type="button"
                            onClick={() => {
                              const currentMonths = formData.monthlyMonths || [];
                              const newMonths = isSelected
                                ? currentMonths.filter(m => m !== monthNumber)
                                : [...currentMonths, monthNumber].sort((a, b) => a - b);
                              setFormData(prev => ({ ...prev, monthlyMonths: newMonths }));
                            }}
                            className={`
                              px-3 py-2 rounded-md text-sm font-medium transition-all
                              ${
                                isSelected
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                              }
                            `}
                          >
                            {monthName}
                          </button>
                        );
                      })}
                    </div>
                    {formData.monthlyMonths && formData.monthlyMonths.length > 0 && (
                      <div className="p-2 bg-muted/50 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          Meses seleccionados: {formData.monthlyMonths.map(m => [
                            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                          ][m - 1]).join(", ")}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Selecciona los días del mes</Label>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                        const isSelected = formData.monthlyDays?.includes(day) || false;
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const currentDays = formData.monthlyDays || [];
                              const newDays = isSelected
                                ? currentDays.filter(d => d !== day)
                                : [...currentDays, day].sort((a, b) => a - b);
                              setFormData(prev => ({ ...prev, monthlyDays: newDays }));
                            }}
                            className={`
                              w-8 h-8 rounded-md text-sm font-medium transition-all
                              ${
                                isSelected
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                              }
                            `}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    {formData.monthlyDays && formData.monthlyDays.length > 0 && (
                      <div className="p-2 bg-muted/50 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          Días seleccionados: {formData.monthlyDays.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reminder Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Recordatorios</Label>
              <input
                type="checkbox"
                checked={formData.reminderEnabled}
                onChange={(e) => setFormData(prev => ({ ...prev, reminderEnabled: e.target.checked }))}
                className="rounded"
              />
            </div>
            
            {formData.reminderEnabled && (
              <div className="space-y-2">
                <Label htmlFor="reminderTime">Hora del recordatorio</Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={formData.reminderTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, reminderTime: e.target.value }))}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!formData.name.trim()}>
            {habit ? "Actualizar" : "Crear"} Hábito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
