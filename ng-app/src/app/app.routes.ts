import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HabitsComponent } from './pages/habits/habits.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'habits', component: HabitsComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' }
];
