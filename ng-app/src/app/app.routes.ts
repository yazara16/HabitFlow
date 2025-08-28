import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HabitsComponent } from './pages/habits/habits.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { NotificationDetailComponent } from './pages/notification-detail/notification-detail.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'habits', component: HabitsComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'notifications/:id', component: NotificationDetailComponent },
  // Legacy capitalized paths support
  { path: 'Habits', redirectTo: 'habits', pathMatch: 'full' },
  { path: 'Calendar', redirectTo: 'calendar', pathMatch: 'full' },
  { path: 'Settings', redirectTo: 'settings', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
