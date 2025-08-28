import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, ColorScheme } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="text-2xl font-bold mb-6">Configuración</h2>

    <div class="grid md:grid-cols-2 gap-6">
      <section class="rounded-lg border p-4">
        <h3 class="font-semibold mb-3">Apariencia</h3>
        <div class="space-y-3">
          <div>
            <div class="text-sm mb-2">Tema</div>
            <div class="flex gap-2">
              <button class="px-3 py-2 rounded border" [class.border-primary]="mode()==='light'" (click)="setMode('light')">Claro</button>
              <button class="px-3 py-2 rounded border" [class.border-primary]="mode()==='dark'" (click)="setMode('dark')">Oscuro</button>
              <button class="px-3 py-2 rounded border" [class.border-primary]="mode()==='system'" (click)="setMode('system')">Sistema</button>
            </div>
          </div>
          <div>
            <div class="text-sm mb-2">Esquema de color</div>
            <div class="flex flex-wrap gap-2">
              <button *ngFor="let s of schemes" class="px-3 py-2 rounded border" [class.border-primary]="scheme()===s" (click)="setScheme(s)">{{ s }}</button>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-lg border p-4">
        <h3 class="font-semibold mb-3">Perfil</h3>
        <div class="flex items-center gap-4">
          <img [src]="avatar() || placeholder" alt="Avatar" class="w-16 h-16 rounded-full object-cover border"/>
          <div class="space-y-2">
            <input type="file" accept="image/*" (change)="onFile($event)" />
            <button class="px-3 py-2 rounded border" (click)="clearAvatar()">Quitar</button>
          </div>
        </div>
      </section>
    </div>
  `
})
export class SettingsComponent {
  schemes: ColorScheme[] = ['purple', 'blue', 'green', 'orange', 'pink', 'cyan'];
  mode = signal<'light'|'dark'|'system'>(this.theme.currentMode);
  scheme = signal<ColorScheme>(this.theme.currentScheme);
  avatar = signal<string | null>(localStorage.getItem('profile.avatar'));
  placeholder = 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'64\' height=\'64\'><rect width=\'100%\' height=\'100%\' fill=\'%23e5e7eb\'/></svg>';

  constructor(private theme: ThemeService) {
    effect(() => {
      this.theme.setMode(this.mode());
      this.theme.setScheme(this.scheme());
    });
  }

  setMode(m: 'light'|'dark'|'system') { this.mode.set(m); }
  setScheme(s: ColorScheme) { this.scheme.set(s); }

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      this.avatar.set(data);
      localStorage.setItem('profile.avatar', data);
    };
    reader.readAsDataURL(file);
  }
  clearAvatar() {
    this.avatar.set(null);
    localStorage.removeItem('profile.avatar');
  }
}
