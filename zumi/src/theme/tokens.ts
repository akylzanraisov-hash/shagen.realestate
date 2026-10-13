/**
 * Zumi design language — "Glass Night".
 *
 * Graphite-teal gradient canvas, frosted glass panels, two signal colours:
 * mint (action / live / done) and lilac (AI / voice). The voice wave that
 * blends lilac → mint is the brand's signature element.
 */
export const color = {
  // canvas
  ink: '#0C1214',
  ink2: '#121B1E',
  ink3: '#1A2427',
  bgTop: '#1C2B2F',
  bgBottom: '#0A0F11',

  // glass
  glass: 'rgba(255,255,255,0.055)',
  glassStrong: 'rgba(255,255,255,0.09)',
  glassBorder: 'rgba(255,255,255,0.10)',
  line: 'rgba(255,255,255,0.07)',
  lineStrong: 'rgba(255,255,255,0.14)',

  text: '#F3F6F5',
  textDim: 'rgba(243,246,245,0.62)',
  textMute: 'rgba(243,246,245,0.38)',

  // signals
  volt: '#6EE7A8', // mint — primary action, "live", active tab
  ultra: '#B18CFF', // lilac — AI / voice
  flare: '#FF7A6B', // urgent / recording
  aqua: '#5ED6E8', // calendar / info
  rose: '#F59AD8', // people
  sun: '#FFD36B', // money / deals
} as const;

export const kindColor = {
  event: color.volt,
  reminder: color.flare,
  task: color.aqua,
  note: color.ultra,
  client: color.rose,
  broadcast: color.sun,
} as const;

export const font = {
  logo: 'Unbounded_700Bold',
  display: 'Manrope_800ExtraBold',
  displayBlack: 'Manrope_800ExtraBold',
  displayLight: 'Manrope_500Medium',
  displayMed: 'Manrope_700Bold',
  body: 'Manrope_500Medium',
  bodyBold: 'Manrope_700Bold',
  bodyHeavy: 'Manrope_800ExtraBold',
} as const;

export const space = (n: number) => n * 4;

export const radius = {
  pill: 999,
  lg: 26,
  md: 18,
  sm: 12,
} as const;
