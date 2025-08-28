import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HabitsService, Habit } from '../../services/habits.service';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold">Hábitos</h2>
      <button class="rounded-md bg-primary text-white px-3 py-2 text-sm" (click)="openCreate()">Nuevo Hábito</button>
    </div>

    <div class="space-y-3">
      <div *ngFor="let h of habits()" class="flex items-center justify-between p-4 rounded-lg border border-border/50">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg" [ngClass]="h.color">🏷️</div>
          <div>
            <div class="font-medium">{{ h.name }}</div>
            <div class="text-xs text-muted-foreground">{{ h.completed }}/{{ h.target }} {{ h.unit }} • {{ h.frequency }}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-2 py-1 text-sm rounded border" (click)="startEdit(h)">Editar</button>
          <button class="px-2 py-1 text-sm rounded border border-red-500 text-red-600" (click)="confirmDelete(h)">Borrar</button>
        </div>
      </div>
    </div>

    <div *ngIf="dialogOpen()" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div class="w-full max-w-lg rounded-lg bg-background border p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="font-semibold">{{ editing() ? 'Editar Hábito' : 'Nuevo Hábito' }}</div>
          <button class="text-muted-foreground" (click)="closeDialog()">✕</button>
        </div>

        <form [formGroup]="form" class="space-y-3" (ngSubmit)="save()">
          <div>
            <label class="text-sm">Nombre</label>
            <input formControlName="name" class="w-full rounded-md border px-3 py-2 bg-background" />
          </div>
          <div>
            <label class="text-sm">Categoría</label>
            <select formControlName="category" class="w-full rounded-md border px-3 py-2 bg-background">
              <option value="exercise">Ejercicio</option>
              <option value="hydration">Hidratación</option>
              <option value="finance">Finanzas</option>
              <option value="shopping">Compras</option>
              <option value="custom">Personal</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm">Meta</label>
              <input type="number" min="1" formControlName="target" class="w-full rounded-md border px-3 py-2 bg-background" />
            </div>
            <div>
              <label class="text-sm">Unidad</label>
              <input formControlName="unit" class="w-full rounded-md border px-3 py-2 bg-background" />
            </div>
          </div>
          <div>
            <label class="text-sm">Frecuencia</label>
            <select formControlName="frequency" class="w-full rounded-md border px-3 py-2 bg-background">
              <option value="daily">Diaria</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="custom">Personalizada</option>
            </select>
          </div>

          <div *ngIf="form.value.frequency === 'monthly'" class="space-y-3">
            <div>
              <label class="text-sm">Meses</label>
              <div class="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                <button type="button" *ngFor="let m of months; let i = index" (click)="toggleMonth(i+1)"
                  class="px-3 py-2 rounded-md text-sm"
                  [class.bg-primary]="selectedMonths().includes(i+1)" [class.text-white]="selectedMonths().includes(i+1)"
                  [class.bg-muted]="!selectedMonths().includes(i+1)" [class.text-muted-foreground]="!selectedMonths().includes(i+1)">
                  {{ m }}
                </button>
              </div>
            </div>
            <div>
              <label class="text-sm">Días del mes</label>
              <div class="grid grid-cols-7 gap-1 mt-2">
                <button type="button" *ngFor="let d of days"
                  (click)="toggleDay(d)"
                  class="px-2 py-1 rounded text-xs"
                  [class.bg-primary]="selectedDays().includes(d)" [class.text-white]="selectedDays().includes(d)"
                  [class.bg-muted]="!selectedDays().includes(d)" [class.text-muted-foreground]="!selectedDays().includes(d)">{{ d }}</button>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" class="px-3 py-2 rounded border" (click)="closeDialog()">Cancelar</button>
            <button type="submit" class="px-3 py-2 rounded bg-primary text-white">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <div *ngIf="deleteConfirm()" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div class="w-full max-w-sm rounded-lg bg-background border p-4">
        <div class="mb-4">¿Borrar "{{ toDelete()?.name }}"?</div>
        <div class="flex items-center justify-end gap-2">
          <button class="px-3 py-2 rounded border" (click)="deleteConfirm.set(false)">Cancelar</button>
          <button class="px-3 py-2 rounded border border-red-500 text-red-600" (click)="performDelete()">Borrar</button>
        </div>
      </div>
    </div>
  `
})
export class HabitsComponent {
  habits = computed(() => this.svc.value);

  dialogOpen = signal(false);
  editing = signal<Habit | null>(null);
  deleteConfirm = signal(false);
  toDelete = signal<Habit | null>(null);

  form: FormGroup;
  months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  days = Array.from({ length: 31 }, (_, i) => i + 1);

  constructor(private svc: HabitsService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      category: ['custom', Validators.required],
      target: [1, [Validators.required, Validators.min(1)]],
      unit: ['sesión', Validators.required],
      frequency: ['daily', Validators.required],
      monthlyDays: [[]],
      monthlyMonths: [[]],
      color: ['text-purple-500 bg-purple-500/10']
    });
  }

  openCreate() {
    this.editing.set(null);
    this.form.reset({ name: '', category: 'custom', target: 1, unit: 'sesión', frequency: 'daily', monthlyDays: [], monthlyMonths: [], color: 'text-purple-500 bg-purple-500/10' });
    this.dialogOpen.set(true);
  }

  startEdit(h: Habit) {
    this.editing.set(h);
    this.form.reset({ ...h });
    this.dialogOpen.set(true);
  }

  closeDialog() { this.dialogOpen.set(false); }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value;
    if (this.editing()) {
      this.svc.update(this.editing()!.id, v as Partial<Habit>);
    } else {
      this.svc.add(v as any);
    }
    this.dialogOpen.set(false);
  }

  confirmDelete(h: Habit) {
    this.toDelete.set(h);
    this.deleteConfirm.set(true);
  }
  performDelete() {
    const h = this.toDelete();
    if (h) this.svc.remove(h.id);
    this.deleteConfirm.set(false);
  }

  selectedMonths = signal<number[]>([]);
  selectedDays = signal<number[]>([]);

  toggleMonth(m: number) {
    const arr = this.form.value.monthlyMonths as number[] ?? [];
    const has = arr.includes(m);
    const next = has ? arr.filter(x => x !== m) : [...arr, m].sort((a,b)=>a-b);
    this.form.patchValue({ monthlyMonths: next });
    this.selectedMonths.set(next);
  }
  toggleDay(d: number) {
    const arr = this.form.value.monthlyDays as number[] ?? [];
    const has = arr.includes(d);
    const next = has ? arr.filter(x => x !== d) : [...arr, d].sort((a,b)=>a-b);
    this.form.patchValue({ monthlyDays: next });
    this.selectedDays.set(next);
  }
}
