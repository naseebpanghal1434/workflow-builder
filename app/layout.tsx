/**
 * @fileoverview Root layout component with DM Sans and DM Mono fonts
 * @module App/Layout
 */

import type { Metadata } from 'next';
import { DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';

/**
 * DM Sans font configuration for primary text
 */
const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500'],
});

/**
 * DM Mono font configuration for monospace text
 */
const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

/**
 * Application metadata
 */
export const metadata: Metadata = {
  title: 'Workflow Builder',
  description: 'Visual workflow builder for LLM workflows - Weavy.ai clone',
};

/**
 * RootLayout - Root layout wrapper with fonts and global styles
 *
 * @component
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {React.ReactElement} Rendered layout
 *
 * @example
 * <RootLayout>
 *   <Page />
 * </RootLayout>
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${dmMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
