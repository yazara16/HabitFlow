import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'indigo';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });
  
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('colorScheme') as ColorScheme) || 'purple';
    }
    return 'purple';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Function to get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Update actual theme based on theme setting
  useEffect(() => {
    const updateActualTheme = () => {
      if (theme === 'system') {
        setActualTheme(getSystemTheme());
      } else {
        setActualTheme(theme);
      }
    };

    updateActualTheme();

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateActualTheme();
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  // Apply theme and color scheme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply dark/light theme
    if (actualTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply color scheme by updating CSS variables
    const colorSchemes = {
      purple: {
        primary: '262 83% 58%',
        accent: '262 83% 95%'
      },
      blue: {
        primary: '221 83% 53%',
        accent: '221 83% 95%'
      },
      green: {
        primary: '142 76% 36%',
        accent: '142 76% 95%'
      },
      orange: {
        primary: '25 95% 53%',
        accent: '25 95% 95%'
      },
      pink: {
        primary: '330 81% 60%',
        accent: '330 81% 95%'
      },
      indigo: {
        primary: '263 70% 50%',
        accent: '263 70% 95%'
      }
    };

    const colors = colorSchemes[colorScheme];
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--accent', colors.accent);
  }, [actualTheme, colorScheme]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('colorScheme', colorScheme);
  }, [colorScheme]);

  const value: ThemeContextType = {
    theme,
    colorScheme,
    actualTheme,
    setTheme,
    setColorScheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
