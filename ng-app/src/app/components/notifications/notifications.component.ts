import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative" (keydown.escape)="open=false">
      <button class="inline-flex items-center gap-2 h-9 rounded-md px-3 border" (click)="open=!open">
        <span class="i-lucide-bell">🔔</span>
        <span class="rounded-full border text-xs px-2" *ngIf="count()>0">{{ count() }}</span>
      </button>
      <div *ngIf="open" class="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg overflow-hidden z-50">
        <div class="p-3 text-sm font-medium border-b">Notificaciones</div>
        <div *ngIf="items().length===0" class="p-4 text-sm text-muted-foreground">Sin notificaciones</div>
        <ul class="max-h-96 overflow-auto">
          <li *ngFor="let n of items()" class="p-3 hover:bg-muted/50 transition cursor-pointer" (click)="openItem(n)">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="text-sm font-medium" [class.opacity-60]="n.read">{{ n.title }}</div>
                <div class="text-xs text-muted-foreground">{{ n.message }}</div>
              </div>
              <div class="flex items-center gap-2">
                <button class="text-xs underline" (click)="markRead(n, $event)">Marcar leído</button>
                <button class="text-xs text-red-600 underline" (click)="remove(n, $event)">Borrar</button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class NotificationsComponent {
  open = false;
  constructor(private svc: NotificationsService, private router: Router) {}
  items = () => this.svc.value;
  count = () => this.svc.unreadCount();

  markRead(n: any, ev: Event) { ev.stopPropagation(); this.svc.markRead(n.id); }
  remove(n: any, ev: Event) { ev.stopPropagation(); this.svc.remove(n.id); }
  openItem(n: any) {
    this.svc.markRead(n.id);
    this.open = false;
    if (n.targetRoute) {
      this.router.navigateByUrl(n.targetRoute);
    } else {
      this.router.navigate(['/notifications', n.id]);
    }
  }
}
