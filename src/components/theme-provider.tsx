import { ThemeProvider as NextThemesProvider, ThemeProviderProps as NextThemesProviderProps } from 'next-themes';
import { ReactNode } from 'react';

interface ThemeProviderProps extends NextThemesProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children, attribute, defaultTheme, enableSystem }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute={attribute} defaultTheme={defaultTheme} enableSystem={enableSystem}>
      {children}
    </NextThemesProvider>
  );
}