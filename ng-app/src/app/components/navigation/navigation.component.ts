import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NotificationsComponent } from '../notifications/notifications.component';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule, NotificationsComponent],
  template: `
    <header class="border-b border-border/50 bg-background sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span class="text-primary font-bold">HF</span>
          </div>
          <span class="font-semibold">HabitFlow</span>
        </div>
        <div class="flex items-center gap-4">
          <nav class="flex items-center space-x-4 text-sm">
            <a routerLink="/" class="text-muted-foreground hover:text-foreground transition">Dashboard</a>
            <a routerLink="/habits" class="text-muted-foreground hover:text-foreground transition">Hábitos</a>
            <a routerLink="/calendar" class="text-muted-foreground hover:text-foreground transition">Calendario</a>
            <a routerLink="/settings" class="text-muted-foreground hover:text-foreground transition">Configuración</a>
          </nav>
          <app-notifications></app-notifications>
        </div>
      </div>
    </header>
  `
})
export class NavigationComponent {}
