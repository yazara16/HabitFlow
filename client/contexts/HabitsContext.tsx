import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dumbbell,
  Droplets,
  DollarSign,
  ShoppingCart,
  Star,
  Book,
  BookOpen,
} from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export type HabitCategory =
  | "exercise"
  | "hydration"
  | "finance"
  | "shopping"
  | "reading"
  | "study"
  | "custom";
export type HabitFrequency = "daily" | "weekly" | "monthly" | "custom";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  icon: any;
  color: string;
  target: number;
  completed: number;
  streak: number;
  completedToday: boolean;
  unit: string;
  frequency: HabitFrequency;
  monthlyDays?: number[];
  monthlyMonths?: number[];
  reminderTime?: string;
  reminderEnabled: boolean;
  createdAt: string;
  lastCompleted?: string;
}

interface HabitsContextValue {
  habits: Habit[];
  addHabit: (
    habit: Omit<
      Habit,
      "id" | "completed" | "streak" | "completedToday" | "createdAt"
    > & { id?: string },
    options?: { assignDate?: Date },
  ) => Promise<void>;
  updateHabit: (id: string, patch: Partial<Habit>) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  getHabitsForDate: (date: Date) => Habit[];
  hideHabitOnDate: (id: string, date: Date) => Promise<void>;
  updateHabitForDate: (
    id: string,
    date: Date,
    patch: Partial<Habit>,
  ) => Promise<void>;
}

const HabitsContext = createContext<HabitsContextValue | undefined>(undefined);

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits must be used within HabitsProvider");
  return ctx;
}

const initialHabits: Habit[] = [
  {
    id: "1",
    name: "Correr 30 minutos",
    description: "Ejercicio cardiovascular matutino",
    category: "exercise",
    icon: Dumbbell,
    color: "text-red-500 bg-red-500/10",
    target: 1,
    completed: 1,
    streak: 5,
    completedToday: true,
    unit: "sesión",
    frequency: "daily",
    monthlyDays: [],
    monthlyMonths: [],
    reminderTime: "07:00",
    reminderEnabled: true,
    createdAt: "2024-01-15",
    lastCompleted: "2024-01-20",
  },
  {
    id: "2",
    name: "Beber 2 litros de agua",
    description: "Mantener hidratación óptima",
    category: "hydration",
    icon: Droplets,
    color: "text-blue-500 bg-blue-500/10",
    target: 8,
    completed: 5,
    streak: 3,
    completedToday: false,
    unit: "vasos",
    frequency: "daily",
    monthlyDays: [],
    monthlyMonths: [],
    reminderTime: "09:00",
    reminderEnabled: true,
    createdAt: "2024-01-10",
    lastCompleted: "2024-01-19",
  },
  {
    id: "3",
    name: "Ahorrar $50 semanales",
    description: "Meta de ahorro para emergencias",
    category: "finance",
    icon: DollarSign,
    color: "text-green-500 bg-green-500/10",
    target: 50,
    completed: 30,
    streak: 7,
    completedToday: false,
    unit: "MXN",
    frequency: "weekly",
    monthlyDays: [],
    monthlyMonths: [],
    reminderEnabled: false,
    createdAt: "2024-01-01",
  },
  {
    id: "4",
    name: "Lista de compras semanal",
    description: "Planificación de compras del hogar",
    category: "shopping",
    icon: ShoppingCart,
    color: "text-orange-500 bg-orange-500/10",
    target: 1,
    completed: 0,
    streak: 2,
    completedToday: false,
    unit: "lista",
    frequency: "weekly",
    monthlyDays: [],
    monthlyMonths: [],
    reminderTime: "18:00",
    reminderEnabled: true,
    createdAt: "2024-01-05",
  },
  {
    id: "5",
    name: "Meditar 15 minutos",
    description: "Práctica de mindfulness y relajación",
    category: "custom",
    icon: Star,
    color: "text-purple-500 bg-purple-500/10",
    target: 1,
    completed: 1,
    streak: 12,
    completedToday: true,
    unit: "sesión",
    frequency: "daily",
    monthlyDays: [],
    monthlyMonths: [],
    reminderTime: "20:00",
    reminderEnabled: true,
    createdAt: "2024-01-08",
  },
];

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const { user } = useAuth();

  const queryClient = useQueryClient();

  // Fetch habits for the current user via React Query
  const {
    data: fetchedHabits,
    isLoading: habitsLoading,
    isError: habitsError,
  } = useQuery({
    queryKey: ["habits", user?.id],
    queryFn: async () => {
      if (!user) return [] as Habit[];
      const token = localStorage.getItem("auth:token");
      const res = await fetch(`/api/users/${user.id}/habits`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to load habits");
      return (await res.json()) as Habit[];
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  // Replace local state when fetched
  useEffect(() => {
    if (!user) {
      setHabits(initialHabits);
      return;
    }
    if (Array.isArray(fetchedHabits)) setHabits(fetchedHabits);
    if (habitsError) setHabits([]);
  }, [fetchedHabits, user, habitsError]);

  // Mutations: create, update, delete
  const createMutation = useMutation({
    mutationFn: async (body: any) => {
      if (!user) throw new Error("Not authenticated");
      const token = localStorage.getItem("auth:token");
      const res = await fetch(`/api/users/${user.id}/habits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create habit");
      return await res.json();
    },
    onSuccess: (created: Habit) => {
      queryClient.invalidateQueries({ queryKey: ["habits", user?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Habit>;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const token = localStorage.getItem("auth:token");
      const res = await fetch(`/api/users/${user.id}/habits/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update habit");
      return await res.json();
    },
    onSuccess: (_updated: Habit) => {
      queryClient.invalidateQueries({ queryKey: ["habits", user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const token = localStorage.getItem("auth:token");
      const res = await fetch(`/api/users/${user.id}/habits/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete");
      return id;
    },
    onSuccess: (_id) => {
      queryClient.invalidateQueries({ queryKey: ["habits", user?.id] });
    },
  });
  const [perDayHidden, setPerDayHidden] = useState<Record<string, Set<string>>>(
    {},
  );
  const [perDayOverrides, setPerDayOverrides] = useState<
    Record<string, Record<string, Partial<Habit>>>
  >({});

  const toISO = (date: Date) => date.toISOString().split("T")[0];

  const isHabitScheduledOnDate = (habit: Habit, date: Date) => {
    const created = habit.createdAt
      ? new Date(habit.createdAt + "T00:00:00")
      : new Date(0);
    if (date < created) return false;
    switch (habit.frequency) {
      case "daily":
        return true;
      case "weekly": {
        return date.getDay() === created.getDay();
      }
      case "monthly": {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const defaultMonths = [created.getMonth() + 1];
        const defaultDays = [created.getDate()];
        const months =
          habit.monthlyMonths && habit.monthlyMonths.length > 0
            ? habit.monthlyMonths
            : defaultMonths;
        const days =
          habit.monthlyDays && habit.monthlyDays.length > 0
            ? habit.monthlyDays
            : defaultDays;
        return months.includes(month) && days.includes(day);
      }
      default:
        return false;
    }
  };

  const getHabitsForDate = (date: Date): Habit[] => {
    const iso = toISO(date);
    return habits
      .filter((h) => isHabitScheduledOnDate(h, date))
      .filter((h) => !perDayHidden[h.id]?.has(iso))
      .map((h) => {
        const override = perDayOverrides[h.id]?.[iso];
        return override ? { ...h, ...override } : h;
      });
  };

  const hideHabitOnDate = async (id: string, date: Date) => {
    const iso = toISO(date);
    setPerDayHidden((prev) => {
      const existing = new Set(prev[id] ?? []);
      existing.add(iso);
      return { ...prev, [id]: existing };
    });

    if (!user) return;
    try {
      const token = localStorage.getItem("auth:token");
      await fetch(`/api/users/${user.id}/habits/${id}/overrides`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ date: iso, hidden: true }),
      });
    } catch (e) {}
  };

  const updateHabitForDate = async (
    id: string,
    date: Date,
    patch: Partial<Habit>,
  ) => {
    const iso = toISO(date);
    setPerDayOverrides((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [iso]: { ...(prev[id]?.[iso] || {}), ...patch },
      },
    }));

    if (!user) return;
    try {
      const token = localStorage.getItem("auth:token");
      await fetch(`/api/users/${user.id}/habits/${id}/overrides`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ date: iso, patch }),
      });
      // If completion info present in patch, create or update a habit log for that date
      if (
        typeof patch.completed !== "undefined" ||
        typeof patch.completedToday !== "undefined" ||
        typeof patch.lastCompleted !== "undefined"
      ) {
        const completedAmount = (patch.completed as any) ?? undefined;
        // find current target from client state
        const currentHabit = habits.find((h) => h.id === id);
        const target = currentHabit?.target ?? 0;
        const completedBool =
          typeof patch.completed !== "undefined"
            ? patch.completed >= target
              ? 1
              : 0
            : patch.completedToday
              ? 1
              : 0;
        // Try to create a log for that date
        const token = localStorage.getItem("auth:token");
        await fetch(`/api/users/${user.id}/habits/${id}/logs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            date: iso,
            completedAmount: completedAmount ?? 0,
            completedBoolean: completedBool,
          }),
        });
      }
    } catch (e) {}
  };

  const value = useMemo<HabitsContextValue>(
    () => ({
      habits,
      addHabit: async (habit, options) => {
        const assignDate = options?.assignDate ?? new Date();
        const createdAt = assignDate.toISOString();
        const body = {
          name: habit.name,
          description: habit.description,
          category: habit.category,
          icon: habit.icon,
          color: habit.color,
          target: habit.target,
          unit: habit.unit,
          frequency: habit.frequency,
          monthlyDays: habit.monthlyDays ?? [],
          monthlyMonths: habit.monthlyMonths ?? [],
          reminderTime: habit.reminderTime,
          reminderEnabled: habit.reminderEnabled ?? false,
          createdAt,
        };
        try {
          const created: Habit = await createMutation.mutateAsync(body as any);
          // update local list optimistically
          setHabits((prev) => [...prev, created]);
          // create reminder if needed (server may already handle but keep client-side attempt)
          if (created.reminderEnabled && created.reminderTime) {
            try {
              const token = localStorage.getItem("auth:token");
              await fetch(`/api/users/${user?.id}/reminders`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                  habitId: created.id,
                  timeOfDay: created.reminderTime,
                  enabled: true,
                  recurrence: created.frequency,
                }),
              });
            } catch (e) {}
          }
        } catch (e: any) {
          throw e;
        }
      },
      updateHabit: async (id, patch) => {
        // Optimistic update: apply patch immediately to improve UX (instant toggle/check)
        const previous = habits;
        setHabits((prev) =>
          prev.map((h) => (h.id === id ? ({ ...h, ...patch } as Habit) : h)),
        );

        try {
          const updated: Habit = await updateMutation.mutateAsync({
            id,
            patch,
          });
          // Ensure we use server-canonical habit after success
          setHabits((prev) =>
            prev.map((h) =>
              h.id === id
                ? ({ ...updated, completedToday: prev.find((p) => p.id === id)?.completedToday ?? false } as Habit)
                : h,
            ),
          );

          // If completed change, create a habit log for today
          try {
            if (
              typeof patch.completed !== "undefined" ||
              typeof patch.completedToday !== "undefined" ||
              typeof patch.lastCompleted !== "undefined"
            ) {
              const today = new Date().toISOString().split("T")[0];
              const token = localStorage.getItem("auth:token");
              await fetch(`/api/users/${user?.id}/habits/${id}/logs`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                  date: patch.lastCompleted || today,
                  completedAmount: updated.completed,
                  completedBoolean: updated.completed >= (updated.target || 0),
                }),
              });
            }
          } catch (e) {}

          // Sync reminders similarly to previous behavior
          try {
            const token = localStorage.getItem("auth:token");
            const resList = await fetch(`/api/users/${user?.id}/reminders`, {
              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (resList.ok) {
              const rems = await resList.json();
              const existing = rems.find((r: any) => r.habitId === id);
              if (updated.reminderEnabled) {
                if (existing) {
                  await fetch(
                    `/api/users/${user?.id}/reminders/${existing.id}`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        timeOfDay: updated.reminderTime,
                        enabled: true,
                        recurrence: updated.frequency,
                      }),
                    },
                  );
                } else {
                  await fetch(`/api/users/${user?.id}/reminders`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      habitId: id,
                      timeOfDay: updated.reminderTime,
                      enabled: true,
                      recurrence: updated.frequency,
                    }),
                  });
                }
              } else {
                if (existing)
                  await fetch(
                    `/api/users/${user?.id}/reminders/${existing.id}`,
                    {
                      method: "DELETE",
                      headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : undefined,
                    },
                  );
              }
            }
          } catch (e) {}
        } catch (e) {
          // rollback optimistic update on error
          setHabits(previous);
          throw e;
        }
      },
      removeHabit: async (id) => {
        try {
          await deleteMutation.mutateAsync(id);
          setHabits((prev) => prev.filter((h) => h.id !== id));
          setPerDayHidden((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });
          setPerDayOverrides((prev) => {
            const copy = { ...prev } as Record<
              string,
              Record<string, Partial<Habit>>
            >;
            delete copy[id];
            return copy;
          });
        } catch (e) {
          throw e;
        }
      },
      getHabitsForDate,
      hideHabitOnDate,
      updateHabitForDate,
    }),
    [habits, perDayHidden, perDayOverrides],
  );

  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
}
