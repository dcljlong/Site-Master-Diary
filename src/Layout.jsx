import React from 'react';
import { ThemeProvider } from './components/ui/ThemeContext';

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}