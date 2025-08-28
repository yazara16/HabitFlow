import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-foreground mb-2">¡Buen día, Ara Moreno! 👋</h1>
          <p class="text-muted-foreground capitalize">{{ today }}</p>
        </div>
        <div class="flex items-center space-x-3 mt-4 sm:mt-0">
          <button class="inline-flex items-center space-x-2 rounded-md bg-primary text-white px-3 py-2 text-sm shadow">
            <span class="text-white">Nuevo Hábito</span>
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="rounded-lg border border-border/50 bg-background">
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">Hoy Completados</p>
              <p class="text-2xl font-bold text-foreground">{{ completed }}/{{ total }}</p>
            </div>
            <div class="p-3 bg-primary/10 rounded-lg">
              <span class="text-primary font-semibold">✓</span>
            </div>
          </div>
          <div class="mt-4">
            <div class="h-2 bg-muted rounded">
              <div class="h-2 bg-primary rounded" [style.width.%]="progress"></div>
            </div>
            <p class="text-xs text-muted-foreground mt-2">{{ progress | number:'1.0-0' }}% completado</p>
          </div>
        </div>
      </div>
      <div class="rounded-lg border border-border/50 bg-background p-6">
        <p class="text-sm font-medium text-muted-foreground">Racha Actual</p>
        <p class="text-2xl font-bold text-foreground">7 días</p>
      </div>
      <div class="rounded-lg border border-border/50 bg-background p-6">
        <p class="text-sm font-medium text-muted-foreground">Esta Semana</p>
        <p class="text-2xl font-bold text-foreground">23/35</p>
      </div>
      <div class="rounded-lg border border-border/50 bg-background p-6">
        <p class="text-sm font-medium text-muted-foreground">Logros</p>
        <p class="text-2xl font-bold text-foreground">12</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="rounded-lg border border-border/50 bg-background">
          <div class="p-6 border-b border-border/50">
            <div class="flex items-center justify-between">
              <span class="font-semibold">Hábitos de Hoy</span>
              <span class="inline-flex items-center space-x-1 text-xs rounded bg-muted px-2 py-1">5 pendientes</span>
            </div>
            <p class="text-sm text-muted-foreground mt-1">Mantén tu momento y completa tus hábitos diarios</p>
          </div>
          <div class="p-6 space-y-4">
            <div *ngFor="let habit of habits" class="flex items-center space-x-4 p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
              <button class="p-2 rounded-full text-muted-foreground hover:text-foreground" (click)="toggle(habit)">
                <span *ngIf="habit.completed >= habit.target">✓</span>
                <span *ngIf="habit.completed < habit.target">○</span>
              </button>
              <div class="p-2 rounded-lg" [ngClass]="habit.color">
                <span class="text-xs">{{ habit.icon }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-medium" [class.line-through]="habit.completed>=habit.target" [class.text-muted-foreground]="habit.completed>=habit.target">{{ habit.name }}</h3>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm text-muted-foreground">{{ habit.completed }}/{{ habit.target }} {{ habit.unit }}</span>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="flex-1 h-2 bg-muted rounded">
                    <div class="h-2 bg-primary rounded" [style.width.%]="(habit.completed/ habit.target)*100"></div>
                  </div>
                </div>
              </div>
              <button class="p-2 rounded hover:bg-muted">⋯</button>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-6">
        <div class="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
          <div class="text-primary font-semibold mb-2">¡Motivación!</div>
          <p class="text-foreground font-medium mb-4">"¡Vas excelente! Has completado {{ completed }} hábitos hoy. ¡Sigue así!"</p>
          <div class="text-sm text-muted-foreground">Solo quedan {{ total - completed }} para completar el día</div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  habits = [
    { id: '1', name: 'Correr 30 minutos', color: 'text-red-500 bg-red-500/10', target: 1, completed: 1, unit: 'sesión', icon: '🏃' },
    { id: '2', name: 'Beber 2 litros de agua', color: 'text-blue-500 bg-blue-500/10', target: 8, completed: 5, unit: 'vasos', icon: '💧' },
    { id: '3', name: 'Ahorrar $50', color: 'text-green-500 bg-green-500/10', target: 50, completed: 30, unit: 'USD', icon: '💰' },
    { id: '4', name: 'Lista de compras semanal', color: 'text-orange-500 bg-orange-500/10', target: 1, completed: 0, unit: 'lista', icon: '🛒' },
    { id: '5', name: 'Meditar 15 minutos', color: 'text-purple-500 bg-purple-500/10', target: 1, completed: 1, unit: 'sesión', icon: '⭐' }
  ];
  get completed() { return this.habits.filter(h => h.completed >= h.target).length; }
  get total() { return this.habits.length; }
  get progress() { return (this.completed / this.total) * 100; }
  toggle(habit: any) {
    if (habit.completed >= habit.target) {
      habit.completed = Math.max(0, habit.completed - 1);
    } else {
      habit.completed = Math.min(habit.target, habit.completed + 1);
    }
  }
}
