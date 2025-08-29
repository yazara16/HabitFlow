import { useEffect, useRef } from "react";
import { useHabits, Habit as HabitType } from "@/contexts/HabitsContext";
import { toast } from "@/hooks/use-toast";

type Habit = HabitType;

function isScheduledOn(habit: Habit, date: Date) {
  const created = habit.createdAt ? new Date(habit.createdAt + "T00:00:00") : new Date(0);
  if (date < created) return false;
  switch (habit.frequency) {
    case "daily":
      return true;
    case "weekly":
      return date.getDay() === created.getDay();
    case "monthly": {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const defaultMonths = [created.getMonth() + 1];
      const defaultDays = [created.getDate()];
      const months = habit.monthlyMonths && habit.monthlyMonths.length > 0 ? habit.monthlyMonths : defaultMonths;
      const days = habit.monthlyDays && habit.monthlyDays.length > 0 ? habit.monthlyDays : defaultDays;
      return months.includes(month) && days.includes(day);
    }
    default:
      return false;
  }
}

function parseTimeToToday(time: string): Date | null {
  if (!time) return null;
  const [hh, mm] = time.split(":").map((v) => Number(v));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d;
}

export function useHabitReminders() {
  const { habits } = useHabits();
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];

    if (typeof window === "undefined" || typeof Notification === "undefined") {
      return;
    }

    const today = new Date();
    const eligible = habits.filter((h) => h.reminderEnabled && isScheduledOn(h, today));
    if (eligible.length === 0) return;

    const ensurePermission = async () => {
      if (Notification.permission === "granted") return true;
      if (Notification.permission !== "denied") {
        const perm = await Notification.requestPermission();
        return perm === "granted";
      }
      return false;
    };

    ensurePermission().then((granted) => {
      eligible.forEach((habit) => {
        const when = parseTimeToToday(habit.reminderTime || "");
        if (!when) return;
        const delay = when.getTime() - Date.now();
        if (delay <= 0) return; // no recordatorio pasado

        const id = window.setTimeout(() => {
          if (granted) {
            try {
              new Notification("Recordatorio de hábito", {
                body: `${habit.name} a las ${habit.reminderTime}`,
                tag: `habit-${habit.id}`,
              });
            } catch (_) {
              toast({ title: "Recordatorio de hábito", description: `${habit.name} a las ${habit.reminderTime}` });
            }
          } else {
            toast({ title: "Recordatorio de hábito", description: `${habit.name} a las ${habit.reminderTime}` });
          }
        }, delay);
        timersRef.current.push(id);
      });
    });

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [habits]);
}
