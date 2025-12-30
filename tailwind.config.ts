/**
 * @fileoverview Tailwind CSS configuration with Weavy design tokens
 * @module Config/Tailwind
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        canvas: '#0E0E13',
        node: {
          DEFAULT: '#212126',
          selected: '#2B2B2F',
        },

        // Handles
        handle: {
          system: '#F5D547',
          text: '#F1A0FA',
          image: '#6EDDB3',
          file: '#FFFFFF',
        },

        // Other
        'dot-grid': '#65616b',
        'button-active': '#F7FFA8',
        edge: '#F1A0FA',
      },

      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },

      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
      },

      spacing: {
        'sidebar-collapsed': '56px',
        'sidebar-expanded': '280px',
        'node-width': '460px',
        'header-height': '56px',
        'toolbar-height': '48px',
        'panel-width': '280px',
      },

      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        node: '16px',
      },

      borderWidth: {
        node: '1.6px',
        sidebar: '0.8px',
      },

      boxShadow: {
        dropdown: '0 4px 12px rgba(0, 0, 0, 0.3)',
      },

      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
      },

      zIndex: {
        canvas: '0',
        node: '1',
        'node-selected': '10',
        sidebar: '100',
        toolbar: '100',
        panel: '100',
        dropdown: '200',
        modal: '300',
      },
    },
  },
  plugins: [],
};

export default config;
