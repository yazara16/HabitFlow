import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationKind = 'achievement' | 'reminder' | 'info';
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  kind: NotificationKind;
  date: string;
  read: boolean;
  targetRoute?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly _items$ = new BehaviorSubject<AppNotification[]>([
    { id: 'n1', title: 'Nuevo logro', message: 'Racha de 7 días', kind: 'achievement', date: new Date().toISOString(), read: false, targetRoute: '/habits' },
    { id: 'n2', title: 'Recordatorio', message: 'Beber agua a las 20:00', kind: 'reminder', date: new Date().toISOString(), read: false, targetRoute: '/habits' },
  ]);
  readonly items$ = this._items$.asObservable();

  get value() { return this._items$.value; }
  unreadCount() { return this.value.filter(n => !n.read).length; }

  markRead(id: string) {
    this._items$.next(this.value.map(n => n.id === id ? { ...n, read: true } : n));
  }
  remove(id: string) {
    this._items$.next(this.value.filter(n => n.id !== id));
  }
  add(n: Omit<AppNotification, 'id' | 'read' | 'date'> & { id?: string; read?: boolean; date?: string }) {
    const id = n.id ?? crypto.randomUUID();
    this._items$.next([{ id, read: false, date: new Date().toISOString(), ...n }, ...this.value]);
  }
}
