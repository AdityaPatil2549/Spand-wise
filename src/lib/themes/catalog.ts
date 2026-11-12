export interface ThemeDefinition {
  id: string;
  name: string;
  badge: string;
  isDark: boolean;
  displayFont: string;
  bodyFont: string;
  radiusLabel: string;
  ideology: string;
  psychology: string;
  swatches: {
    base: string;
    surface: string;
    primary: string;
    accent: string;
  };
  iconKey:
    | 'sparkles'
    | 'moon'
    | 'scroll'
    | 'crown'
    | 'terminal'
    | 'zap'
    | 'anchor'
    | 'flask'
    | 'sun'
    | 'leaf'
    | 'flower'
    | 'flame'
    | 'compass'
    | 'waves'
    | 'tree'
    | 'cpu'
    | 'snowflake'
    | 'gem'
    | 'sunset'
    | 'hexagon';
  pillClass: string;
}

export const THEME_CATALOG: ThemeDefinition[] = [
  {
    id: 'light',
    name: 'Porcelain',
    badge: 'Swiss Minimal',
    isDark: false,
    displayFont: 'Outfit',
    bodyFont: 'Inter',
    radiusLabel: '16px Clean',
    ideology: '1950s Swiss International Typographic Style built for razor clarity.',
    psychology: 'High-luminance white lowers friction while indigo triggers disciplined rationality.',
    swatches: { base: '#F8FAFC', surface: '#FFFFFF', primary: '#09090B', accent: '#4338CA' },
    iconKey: 'sparkles',
    pillClass: 'bg-[#4338CA]/15 text-[#4338CA]',
  },
  {
    id: 'dark',
    name: 'Midnight',
    badge: 'Night Cockpit',
    isDark: true,
    displayFont: 'Space Grotesk',
    bodyFont: 'DM Sans',
    radiusLabel: '16px Precision',
    ideology: 'Aviation instrument panel calibrated for zero glare after sunset.',
    psychology: 'Sapphire blue suppresses stress cortisol while sky-cyan draws rapid focus to limits.',
    swatches: { base: '#091124', surface: '#101B36', primary: '#F1F5F9', accent: '#38BDF8' },
    iconKey: 'moon',
    pillClass: 'bg-[#38BDF8]/15 text-[#38BDF8]',
  },
  {
    id: 'atelier-paper',
    name: 'Warm Paper',
    badge: 'Print Editorial',
    isDark: false,
    displayFont: 'Fraunces',
    bodyFont: 'Work Sans',
    radiusLabel: '14px Book',
    ideology: 'Japanese hand-laid washi stationery paired with artisan vermilion ink seals.',
    psychology: 'Warm cream slows knee-jerk reactions and encourages thoughtful reflection on spending.',
    swatches: { base: '#F6F0E4', surface: '#FCF9F2', primary: '#1C1917', accent: '#C44116' },
    iconKey: 'scroll',
    pillClass: 'bg-[#C44116]/15 text-[#C44116]',
  },
  {
    id: 'savile-rebel',
    name: 'Navy Rose',
    badge: 'Tailored Bold',
    isDark: true,
    displayFont: 'Cinzel',
    bodyFont: 'Manrope',
    radiusLabel: '12px Bespoke',
    ideology: 'Savile Row bespoke wool suiting cut open to reveal a silk crimson lining.',
    psychology: 'Structured navy commands stability while vivid rose highlights decisive financial moves.',
    swatches: { base: '#070E1E', surface: '#0E1935', primary: '#FFFFFF', accent: '#FF3B8D' },
    iconKey: 'crown',
    pillClass: 'bg-[#FF3B8D]/15 text-[#FF3B8D]',
  },
  {
    id: 'dune-terminal',
    name: 'Sand Blue',
    badge: 'Field Quant',
    isDark: true,
    displayFont: 'JetBrains Mono',
    bodyFont: 'Work Sans',
    radiusLabel: '10px Hardware',
    ideology: 'Tactile hardware field computer blending warm desert stone with cobalt readouts.',
    psychology: 'Warm umber avoids cold blue fatigue while monospace numerals enforce ledger accountability.',
    swatches: { base: '#181613', surface: '#221F1B', primary: '#F3EBDC', accent: '#4D94FF' },
    iconKey: 'terminal',
    pillClass: 'bg-[#4D94FF]/15 text-[#4D94FF]',
  },
  {
    id: 'cyber-velocity',
    name: 'Volt Black',
    badge: 'Track telemetry',
    isDark: true,
    displayFont: 'Anton',
    bodyFont: 'Space Grotesk',
    radiusLabel: '12px Kinetic',
    ideology: 'Pit-wall Formula telemetry stripping ornamentation down to pure velocity.',
    psychology: 'Stark black contrast + electric volt lime creates high alertness for 3-second logging.',
    swatches: { base: '#050505', surface: '#0E0E12', primary: '#FFFFFF', accent: '#16E865' },
    iconKey: 'zap',
    pillClass: 'bg-[#16E865]/15 text-[#16E865]',
  },
  {
    id: 'riviera-maritime',
    name: 'Riviera',
    badge: 'Sunlit Coast',
    isDark: false,
    displayFont: 'Fraunces',
    bodyFont: 'DM Sans',
    radiusLabel: '18px Regatta',
    ideology: '1960s Côte d’Azur regatta posters on sunlit limestone canvas.',
    psychology: 'Breezy ivory and crisp navy feel optimistic and orderly rather than restrictive.',
    swatches: { base: '#FAF6EE', surface: '#FFFFFF', primary: '#0D2847', accent: '#C93A22' },
    iconKey: 'anchor',
    pillClass: 'bg-[#C93A22]/15 text-[#C93A22]',
  },
  {
    id: 'bio-alchemical',
    name: 'Moss Gold',
    badge: 'Royal Jewel',
    isDark: true,
    displayFont: 'Syne',
    bodyFont: 'Manrope',
    radiusLabel: '18px Velvet',
    ideology: 'Renaissance botanical apothecary paired with rare imperial amethyst pigment.',
    psychology: 'Deep forest emerald induces wealth composure while amethyst isolates priority goals.',
    swatches: { base: '#061812', surface: '#0D281E', primary: '#E6F7EE', accent: '#C084FC' },
    iconKey: 'flask',
    pillClass: 'bg-[#C084FC]/15 text-[#C084FC]',
  },
  {
    id: 'earthy',
    name: 'Clay Cream',
    badge: 'Ceramic Studio',
    isDark: false,
    displayFont: 'Merriweather',
    bodyFont: 'Nunito',
    radiusLabel: '20px Organic',
    ideology: 'Tuscan kiln-baked stoneware pottery with roasted espresso typography.',
    psychology: 'Earthy ochre and soft rounded cards nurture patient, grounded budgeting habits.',
    swatches: { base: '#EFE5D8', surface: '#FAF6F0', primary: '#2B1C14', accent: '#B33F1B' },
    iconKey: 'sun',
    pillClass: 'bg-[#B33F1B]/15 text-[#B33F1B]',
  },
  {
    id: 'matcha',
    name: 'Matcha',
    badge: 'Kyoto Zen',
    isDark: false,
    displayFont: 'Comfortaa',
    bodyFont: 'Nunito',
    radiusLabel: '20px Gentle',
    ideology: 'Ceremonial Kyoto tea room calm brewed in muted Uji sage and forest green.',
    psychology: 'Chlorophyll greens reduce money anxiety and curb impulsive discretionary splurges.',
    swatches: { base: '#F0F5EC', surface: '#FFFFFF', primary: '#192A1E', accent: '#246A42' },
    iconKey: 'leaf',
    pillClass: 'bg-[#246A42]/15 text-[#246A42]',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    badge: 'Spring Petal',
    isDark: false,
    displayFont: 'Comfortaa',
    bodyFont: 'DM Sans',
    radiusLabel: '20px Petal',
    ideology: 'Hanami morning cherry blossom wash inscribed with deep plum calligraphy ink.',
    psychology: 'Airy rose daylight feels welcoming and bright while maintaining sharp ink contrast.',
    swatches: { base: '#FDF4F7', surface: '#FFFFFF', primary: '#2E1120', accent: '#BF215F' },
    iconKey: 'flower',
    pillClass: 'bg-[#BF215F]/15 text-[#BF215F]',
  },
  {
    id: 'solaris',
    name: 'Gold Dark',
    badge: 'Bullion Vault',
    isDark: true,
    displayFont: 'Cinzel',
    bodyFont: 'Inter',
    radiusLabel: '14px Treasury',
    ideology: 'Ancient observatory vaults carved in desert obsidian and burnished gold bullion.',
    psychology: 'Golden ochre signals permanence and frames every saved rupee as guarded value.',
    swatches: { base: '#120C06', surface: '#1E150B', primary: '#FEF3C7', accent: '#F59E0B' },
    iconKey: 'flame',
    pillClass: 'bg-[#F59E0B]/15 text-[#F59E0B]',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    badge: 'Nordic Fjord',
    isDark: true,
    displayFont: 'Outfit',
    bodyFont: 'Manrope',
    radiusLabel: '18px Glacial',
    ideology: 'Polar night above tranquil Norwegian fjords lit by teal solar winds.',
    psychology: 'Muted arctic blue-grey eases late-night cognitive strain during monthly reconciliation.',
    swatches: { base: '#08121B', surface: '#101F2E', primary: '#ECFEFF', accent: '#2DD4BF' },
    iconKey: 'compass',
    pillClass: 'bg-[#2DD4BF]/15 text-[#2DD4BF]',
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    badge: 'Bathysphere',
    isDark: true,
    displayFont: 'Rubik',
    bodyFont: 'DM Sans',
    radiusLabel: '16px Dive',
    ideology: 'Deep-sea research bathyscaphe lit cleanly by bioluminescent cyan gauges.',
    psychology: 'Immersive pelagic navy blocks external clutter for uninterrupted cashflow focus.',
    swatches: { base: '#04111F', surface: '#0A1D33', primary: '#E0F2FE', accent: '#22D3EE' },
    iconKey: 'waves',
    pillClass: 'bg-[#22D3EE]/15 text-[#22D3EE]',
  },
  {
    id: 'forest',
    name: 'Pine',
    badge: 'Timber Cabin',
    isDark: true,
    displayFont: 'Merriweather',
    bodyFont: 'Work Sans',
    radiusLabel: '16px Woodland',
    ideology: 'Quiet Pacific Northwest timberline at dusk lit by fresh spring citron.',
    psychology: 'Conifer green anchors steady, compound long-horizon savings goals.',
    swatches: { base: '#121D18', surface: '#1B2A23', primary: '#EDF2E7', accent: '#B6E054' },
    iconKey: 'tree',
    pillClass: 'bg-[#B6E054]/15 text-[#B6E054]',
  },
  {
    id: 'cyberpunk',
    name: 'Neon Plum',
    badge: 'Synth Arcade',
    isDark: true,
    displayFont: 'Orbitron',
    bodyFont: 'Space Grotesk',
    radiusLabel: '10px Synth',
    ideology: '1982 sci-fi vector HUD rendered in deep plum violet and laser magenta.',
    psychology: 'High-energy cyberpunk contrast transforms mundane expense tracking into an arcade run.',
    swatches: { base: '#0A0314', surface: '#140826', primary: '#F5E8FF', accent: '#FF3D9A' },
    iconKey: 'cpu',
    pillClass: 'bg-[#FF3D9A]/15 text-[#FF3D9A]',
  },
  {
    id: 'arctic',
    name: 'Glacier',
    badge: 'Ice Station',
    isDark: false,
    displayFont: 'Space Grotesk',
    bodyFont: 'Inter',
    radiusLabel: '14px Crystalline',
    ideology: 'Scandinavian sub-zero laboratory built for emotionless arithmetic clarity.',
    psychology: 'Cool glacier blue removes emotional heat from overspending alerts.',
    swatches: { base: '#EFF6FC', surface: '#FFFFFF', primary: '#0F172A', accent: '#0369A1' },
    iconKey: 'snowflake',
    pillClass: 'bg-[#0369A1]/15 text-[#0369A1]',
  },
  {
    id: 'oled-pro',
    name: 'Pitch Black',
    badge: '0% AMOLED',
    isDark: true,
    displayFont: 'JetBrains Mono',
    bodyFont: 'Inter',
    radiusLabel: '10px Terminal',
    ideology: 'Zero-emission AMOLED carbon pixels honoring classic quant terminal screens.',
    psychology: 'Pure pitch black saves battery while phosphor emerald makes positive runway pop.',
    swatches: { base: '#000000', surface: '#0A0A0A', primary: '#FFFFFF', accent: '#00EA90' },
    iconKey: 'gem',
    pillClass: 'bg-[#00EA90]/15 text-[#00EA90]',
  },
  {
    id: 'neon-sunset',
    name: 'Sunset',
    badge: 'California 80s',
    isDark: true,
    displayFont: 'Bungee',
    bodyFont: 'Rubik',
    radiusLabel: '18px Retro',
    ideology: 'Dusk grape horizon meeting molten Pacific tangerine poster gradients.',
    psychology: 'Warm dusk coral injects vibrant optimism into end-of-month settlement tasks.',
    swatches: { base: '#180924', surface: '#261038', primary: '#FFEAE0', accent: '#FF6B4A' },
    iconKey: 'sunset',
    pillClass: 'bg-[#FF6B4A]/15 text-[#FF6B4A]',
  },
  {
    id: 'graphite',
    name: 'Graphite',
    badge: 'Bauhaus Gray',
    isDark: true,
    displayFont: 'Syne',
    bodyFont: 'Inter',
    radiusLabel: '12px Brutalist',
    ideology: 'Achromatic Bauhaus industrial drafting board with zero chromatic noise.',
    psychology: 'Zero hue bias forces attention purely onto structural contrast and raw ledger numbers.',
    swatches: { base: '#121212', surface: '#1C1C1C', primary: '#EAEAEA', accent: '#FFFFFF' },
    iconKey: 'hexagon',
    pillClass: 'bg-white/15 text-white',
  },
];

export const LIGHT_THEME_IDS = new Set(
  THEME_CATALOG.filter((t) => !t.isDark).map((t) => t.id)
);

export const DARK_THEME_IDS = new Set(
  THEME_CATALOG.filter((t) => t.isDark).map((t) => t.id)
);

export function isLightTheme(themeId?: string): boolean {
  if (!themeId) return false;
  return LIGHT_THEME_IDS.has(themeId) || themeId === 'porcelain';
}

export function getThemeDefinition(themeId?: string): ThemeDefinition {
  return THEME_CATALOG.find((t) => t.id === themeId) ?? THEME_CATALOG[1];
}
