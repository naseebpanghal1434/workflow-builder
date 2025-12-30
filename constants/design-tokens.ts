/**
 * @fileoverview Design tokens as TypeScript constants
 * @module Constants/DesignTokens
 */

/**
 * Color palette for the application
 */
export const COLORS = {
  /** Main canvas and sidebar background */
  canvas: '#0E0E13',
  /** Node background color */
  node: '#212126',
  /** Selected node background color */
  nodeSelected: '#2B2B2F',
  /** Active button background color */
  buttonActive: '#FAFFC7',

  /** Text/Prompt handle color (pink) */
  handleText: '#F1A0FA',
  /** Image handle color (teal) */
  handleImage: '#6EDDB3',
  /** File output handle color (white) */
  handleFile: '#FFFFFF',

  /** Canvas dot grid color */
  dotGrid: '#65616b',
  /** Connection edge color */
  edge: '#F1A0FA',

  /** Primary text color (RGBA) */
  textPrimary: 'rgba(255, 255, 255, 0.8)',
  /** Secondary text color (RGBA) */
  textSecondary: 'rgba(255, 255, 255, 0.64)',
  /** Disabled text color (RGBA) */
  textDisabled: 'rgba(255, 255, 255, 0.4)',

  /** Subtle border color (RGBA) */
  borderSubtle: 'rgba(255, 255, 255, 0.04)',
  /** Light border color (RGBA) */
  borderLight: 'rgba(255, 255, 255, 0.08)',
  /** Medium border color (RGBA) */
  borderMedium: 'rgba(255, 255, 255, 0.16)',
  /** Strong border color (RGBA) */
  borderStrong: 'rgba(255, 255, 255, 0.4)',
} as const;

/**
 * Dimensions in pixels for layout components
 */
export const DIMENSIONS = {
  /** Collapsed sidebar width */
  sidebarCollapsed: 56,
  /** Expanded sidebar width */
  sidebarExpanded: 280,
  /** Fixed node width */
  nodeWidth: 460,
  /** Internal node padding */
  nodePadding: 16,
  /** Node corner border radius */
  nodeBorderRadius: 16,
  /** Top header height */
  headerHeight: 56,
  /** Bottom toolbar height */
  toolbarHeight: 48,
  /** Right properties panel width */
  panelWidth: 280,
  /** Handle size (width and height) */
  handleSize: 32,
  /** Handle border thickness */
  handleBorder: 8,
  /** Sidebar item button size */
  sidebarItemSize: 100,
  /** Gap between sidebar items */
  sidebarItemGap: 8,
  /** Canvas dot diameter */
  dotSize: 1,
  /** Space between canvas dots */
  dotGap: 20,
} as const;

/**
 * Typography settings
 */
export const TYPOGRAPHY = {
  /** Primary font family */
  fontSans: "'DM Sans', system-ui, sans-serif",
  /** Monospace font family */
  fontMono: "'DM Mono', monospace",

  /** Extra small font size */
  sizeXs: '12px',
  /** Small font size */
  sizeSm: '14px',
  /** Base font size */
  sizeBase: '16px',

  /** Normal font weight */
  weightNormal: 400,
  /** Medium font weight */
  weightMedium: 500,
} as const;

/**
 * Z-index scale for layering
 */
export const Z_INDEX = {
  /** Canvas base layer */
  canvas: 0,
  /** Normal nodes */
  node: 1,
  /** Selected nodes */
  nodeSelected: 10,
  /** Sidebar layer */
  sidebar: 100,
  /** Bottom toolbar layer */
  toolbar: 100,
  /** Properties panel layer */
  panel: 100,
  /** Dropdowns and menus */
  dropdown: 200,
  /** Modal dialogs */
  modal: 300,
} as const;

/**
 * Transition durations for animations
 */
export const TRANSITIONS = {
  /** Fast transitions (hover states) */
  fast: '150ms ease',
  /** Normal transitions (expand/collapse) */
  normal: '200ms ease',
  /** Slow transitions (page transitions) */
  slow: '300ms ease',
} as const;
