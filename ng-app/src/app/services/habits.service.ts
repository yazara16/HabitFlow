import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type HabitCategory = 'exercise' | 'hydration' | 'finance' | 'shopping' | 'custom';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  color: string;
  target: number;
  completed: number;
  unit: string;
  frequency: HabitFrequency;
  monthlyDays?: number[];
  monthlyMonths?: number[];
}

@Injectable({ providedIn: 'root' })
export class HabitsService {
  private readonly _habits$ = new BehaviorSubject<Habit[]>([
    { id: '1', name: 'Correr 30 minutos', category: 'exercise', color: 'text-red-500 bg-red-500/10', target: 1, completed: 1, unit: 'sesión', frequency: 'daily' },
    { id: '2', name: 'Beber 2 litros de agua', category: 'hydration', color: 'text-blue-500 bg-blue-500/10', target: 8, completed: 5, unit: 'vasos', frequency: 'daily' },
  ]);
  readonly habits$ = this._habits$.asObservable();

  get value() { return this._habits$.value; }

  add(habit: Omit<Habit, 'id' | 'completed'> & { completed?: number }) {
    const id = crypto.randomUUID();
    const h: Habit = { completed: 0, ...habit, id } as Habit;
    this._habits$.next([...this.value, h]);
  }

  update(id: string, patch: Partial<Habit>) {
    this._habits$.next(this.value.map(h => h.id === id ? { ...h, ...patch } : h));
  }

  remove(id: string) {
    this._habits$.next(this.value.filter(h => h.id !== id));
  }
}
