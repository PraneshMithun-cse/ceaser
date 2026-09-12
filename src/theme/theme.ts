// Design tokens extracted 1:1 from kidulan-food-main
// (tailwind.config.ts brand palette + app/globals.css runtime vars + font-face rules)

export const colors = {
  // tailwind.config.ts theme.extend.colors — used across component classNames
  ink: '#153f32',
  kelp: '#0d2f28',
  cream: '#f4f0df',
  butter: '#facb48',
  saffron: '#f1a23b',
  coral: '#e7654f',
  salt: '#fffaf0',
  clay: '#a8573f',
  // app/globals.css :root vars — used in raw CSS (deeper/darker variants)
  inkDeep: '#21160e',
  creamDeep: '#e6dcc7',
  butterDeep: '#d69b3e',
  coralDeep: '#c85a45',
  saltDeep: '#f2e9d9',
} as const;

export const gradients = {
  // body background: radial butter glow over cream→cream vertical gradient
  bodyBackground: {
    colors: [colors.butter, colors.cream, colors.cream] as const,
    locations: [0, 0.46, 1] as const,
  },
} as const;

export const fonts = {
  // font-family: var(--font-grotesk) — headline / uppercase / weight 900
  grotesk: 'RocGrotesk-Black',
  // font-family: var(--font-display) — italic display-script accents
  display: 'ThingsToRemember-Regular',
  // font-family: var(--font-body) — Avenir Next / Inter fallback, body copy
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

// .headline { font-weight:800(→900 face); letter-spacing:0; line-height:0.85; uppercase }
// CSS line-height:0.85 is a ratio of font-size; RN's lineHeight is an absolute
// dp value, so it must be computed per fontSize — a fixed 0.85 clips text to
// a near-zero line box (glyphs render as slivers). Call this with the
// fontSize actually used at each call site.
export function headlineStyle(fontSize: number) {
  return {
    fontFamily: fonts.grotesk,
    letterSpacing: 0,
    fontSize,
    lineHeight: Math.round(fontSize * 0.85),
    textTransform: 'uppercase' as const,
  };
}

// .display-script { italic, letter-spacing:0 }
export const displayScript = {
  fontFamily: fonts.display,
  fontStyle: 'italic' as const,
  letterSpacing: 0,
};

export const shadows = {
  // boxShadow.soft
  soft: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.16,
    shadowRadius: 80,
    elevation: 12,
  },
  // boxShadow.glow
  glow: {
    shadowColor: colors.butter,
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.3,
    shadowRadius: 70,
    elevation: 14,
  },
} as const;

export const radii = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
};
