// src/context/contexts.tsx
// ============================================================
//  CONTEXTS — Export unifié des contextes
// ============================================================

// Theme Context
export { ThemeProvider, useTheme } from './ThemeContext';
export type { Theme, ThemeColors } from './ThemeContext';
export { lightColors, darkColors } from './ThemeContext';

// Bible Context
export { BibleProvider, useBible } from './BibleContext';