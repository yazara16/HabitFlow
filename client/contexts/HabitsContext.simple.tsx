import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
  target?: number;
  completed?: number;
  streak?: number;
  frequency?: string;
  reminderTime?: string;
  reminderEnabled?: boolean;
  createdAt?: string;
  lastCompleted?: string;
}

interface HabitsContextValue {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  loading: boolean;
}

const HabitsContext = createContext<HabitsContextValue | undefined>(undefined);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Cargar hábitos cuando el usuario cambie
  useEffect(() => {
    if (user?.id) {
      loadHabits();
    } else {
      setHabits([]);
    }
  }, [user?.id]);

  const loadHabits = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${user.id}/habits`);
      if (response.ok) {
        const data = await response.json();
        setHabits(data);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (habitData: Omit<Habit, 'id'>) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/users/${user.id}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData)
      });

      if (response.ok) {
        const newHabit = await response.json();
        setHabits(prev => [...prev, newHabit]);
      } else {
        throw new Error('Failed to create habit');
      }
    } catch (error) {
      console.error('Error adding habit:', error);
      throw error;
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/users/${user.id}/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedHabit = await response.json();
        setHabits(prev => prev.map(h => h.id === id ? updatedHabit : h));
      } else {
        throw new Error('Failed to update habit');
      }
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/users/${user.id}/habits/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setHabits(prev => prev.filter(h => h.id !== id));
      } else {
        throw new Error('Failed to delete habit');
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  };

  const value = useMemo(
    () => ({ habits, addHabit, updateHabit, deleteHabit, loading }),
    [habits, loading]
  );

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error('useHabits must be used within HabitsProvider');
  }
  return context;
}
