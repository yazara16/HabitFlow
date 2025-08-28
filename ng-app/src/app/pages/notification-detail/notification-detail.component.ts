import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-notification-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">Detalle de notificación</h2>
      <div *ngIf="n; else notFound" class="rounded-lg border p-4">
        <div class="font-semibold">{{ n.title }}</div>
        <div class="text-sm text-muted-foreground mb-4">{{ n.message }}</div>
        <button class="px-3 py-2 rounded border" (click)="back()">Volver</button>
      </div>
      <ng-template #notFound>
        <p class="text-muted-foreground">Notificación no encontrada.</p>
      </ng-template>
    </div>
  `
})
export class NotificationDetailComponent {
  n = null as any;
  constructor(private route: ActivatedRoute, private svc: NotificationsService, private router: Router) {
    const id = this.route.snapshot.paramMap.get('id');
    this.n = this.svc.value.find(x => x.id === id!);
    if (this.n) this.svc.markRead(this.n.id);
  }
  back() { this.router.navigateByUrl('/'); }
}
