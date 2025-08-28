import { Injectable } from '@angular/core';

type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'cyan';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private mode: ThemeMode = 'system';
  private scheme: ColorScheme = 'purple';

  constructor() {
    const savedMode = (localStorage.getItem('theme.mode') as ThemeMode) || 'system';
    const savedScheme = (localStorage.getItem('theme.scheme') as ColorScheme) || 'purple';
    this.setMode(savedMode, false);
    this.setScheme(savedScheme, false);
  }

  get currentMode() { return this.mode; }
  get currentScheme() { return this.scheme; }

  setMode(mode: ThemeMode, persist = true) {
    this.mode = mode;
    if (persist) localStorage.setItem('theme.mode', mode);
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const actual = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
    if (actual === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
  }

  setScheme(scheme: ColorScheme, persist = true) {
    this.scheme = scheme;
    if (persist) localStorage.setItem('theme.scheme', scheme);
    const colors: Record<ColorScheme, { primary: string; accent: string }> = {
      purple: { primary: '#7c3aed', accent: '#a78bfa' },
      blue:   { primary: '#2563eb', accent: '#60a5fa' },
      green:  { primary: '#16a34a', accent: '#86efac' },
      orange: { primary: '#f97316', accent: '#fdba74' },
      pink:   { primary: '#db2777', accent: '#f472b6' },
      cyan:   { primary: '#0891b2', accent: '#67e8f9' },
    };
    const root = document.documentElement as HTMLElement;
    const c = colors[scheme];
    root.style.setProperty('--primary-hex', c.primary);
    root.style.setProperty('--accent-hex', c.accent);
  }
}
