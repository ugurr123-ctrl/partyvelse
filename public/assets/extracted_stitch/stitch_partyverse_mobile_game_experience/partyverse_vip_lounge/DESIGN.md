---
name: Partyverse VIP Lounge
colors:
  surface: '#141123'
  surface-dim: '#141123'
  surface-bright: '#3a374b'
  surface-container-lowest: '#0f0c1e'
  surface-container-low: '#1c192c'
  surface-container: '#201d30'
  surface-container-high: '#2b273b'
  surface-container-highest: '#363246'
  on-surface: '#e6dff9'
  on-surface-variant: '#d5c4ac'
  inverse-surface: '#e6dff9'
  inverse-on-surface: '#312e42'
  outline: '#9e8f78'
  outline-variant: '#514532'
  surface-tint: '#ffba27'
  primary: '#ffdba0'
  on-primary: '#422c00'
  primary-container: '#ffb703'
  on-primary-container: '#6b4b00'
  inverse-primary: '#7d5800'
  secondary: '#d3fbff'
  on-secondary: '#00363a'
  secondary-container: '#00eefc'
  on-secondary-container: '#00686f'
  tertiary: '#eed8ff'
  on-tertiary: '#480081'
  tertiary-container: '#dab5ff'
  on-tertiary-container: '#7500cc'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdea9'
  primary-fixed-dim: '#ffba27'
  on-primary-fixed: '#271900'
  on-primary-fixed-variant: '#5e4100'
  secondary-fixed: '#7df4ff'
  secondary-fixed-dim: '#00dbe9'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#efdbff'
  tertiary-fixed-dim: '#dcb8ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6700b5'
  background: '#141123'
  on-background: '#e6dff9'
  surface-variant: '#363246'
typography:
  display-hero:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 54px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Sora
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Sora
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-telemetry:
    fontFamily: Sora
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
  label-status:
    fontFamily: Sora
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1.25rem
  margin-tablet: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system establishes a high-stakes, VIP lounge atmosphere built for competitive social gaming. It bridges hyper-refined cyber telemetry with the tactile excess of high-end entertainment hubs. Deep midnight tones frame illuminated holographic readouts, warm gold markers, and razor-sharp geometric data layers. 

The target audience seeks prestige, electric momentum, and seamless party coordination. The experience blends luxury hospitality aesthetics with arcade precision: weighted 2.5D surfaces, bevel-edged control nodes, and ultra-crisp typographic hierarchy. The aesthetic avoids toy-like playfulness, committing instead to an exclusive, midnight-lit cyber venue where every match feels consequential.

## Colors
The palette balances an interstellar midnight substrate with high-intensity accent channels.

- **Primary (`#FFB703` - Radiant Amber Gold):** Reserved for high-value VIP telemetry, tier ranks, primary interactive triggers, match wins, and currency balances.
- **Secondary (`#00F0FF` - Hyper Cyan):** Used for cooperative telemetry, player radar arrays, tactical readouts, and live system signals.
- **Tertiary (`#8A2BE2` - Electric Violet) & Accent (`#FF007F` - Neon Pink):** Power level indicators, active room invites, celebration bursts, and special game modifiers.
- **Neutral Substrates (`#0B081A` to `#120F2D`):** Deep interstellar navy and midnight purple, delivering near-infinite contrast without washing out translucent glow fields.
- **Surface Elevation Steps:**
  - Base Floor: `#0B081A`
  - Raised Surface: `#120F2D`
  - High Panel Surface: `#1A163B`
  - Highlight Overlay: `rgba(255, 183, 3, 0.08)`

## Typography
Typographic scale unites dynamic headline presence with crystalline data legibility. 

- **Headlines (`Sora`):** Geometry is strict and punchy. Used across Turkish action phrases (*"OYUNA BAŞLA"*, *"KAYIP SİNYAL"*, *"LOBİ HAZIR"*), room banners, and rank displays. Uppercase configurations rely on widened letter spacing (+0.05em to +0.08em) for telemetry labels.
- **Body & Dialogue (`Manrope`):** Delivers clean readability for chat, tactical instructions, game objectives, and rule descriptions. Manrope avoids fatigue during extended match sessions.
- **Metrics & Currency:** Always rendered in bold `Sora` with monospace numeric tabular alignment (`font-variant-numeric: tabular-nums`).

## Layout & Spacing
The layout follows a fluid 4-column system on mobile and an 8-column layout on tablet/foldables, optimized for vertical thumb zones and dual-thumb horizontal game orientations.

- **Safe Zones & Offsets:** Screen margins (`margin: 1.25rem`) respect edge displays and bottom navigation shells. 
- **Rhythm Rules:** Telemetry groups (health, signal gauges, score trackers) enforce compact 4px (`space-xs`) internal gaps. Interactive modular cards and panels use 16px (`space-md`) spacing to avoid accidental tap events during gameplay.
- **Reflow Behavior:** On landscape viewports, telemetry panels lock to bilateral rails, freeing the central 2.5D game view with a fluid center stage.

## Elevation & Depth
Depth is realized through physical 2.5D layering, subtle edge illumination, and back-lit surfaces rather than uniform drop shadows.

- **Level 0 (Void):** Solid `#0B081A` background with faint isometric grid vector textures.
- **Level 1 (Sub-Panels & Hub Consoles):** `#120F2D` at 85% opacity with `backdrop-filter: blur(16px)` and a 1px top border of `rgba(255, 255, 255, 0.08)`.
- **Level 2 (Active Cards & Floating Pods):** `#1A163B` complemented by a 3D bottom bevel shelf (`box-shadow: 0 4px 0 #080614`) and perimeter rim-lights (`0 0 12px rgba(0, 240, 255, 0.2)`).
- **Level 3 (Modal Overlays & Rewards):** Layered glass panels flanked by dynamic outer radiance (`box-shadow: 0 12px 32px rgba(255, 183, 3, 0.25)`), creating an energized, suspended presence above the interface.

## Shapes
A controlled, softened geometric profile (`roundedness: 1`) preserves architectural discipline without aggressive bluntness.

- **Micro Components (Pills, Badges, Status Dots):** Rely on 4px (`0.25rem`) corner radiances for an angular, high-tech flight-deck vibe.
- **Cards & Terminal Surfaces:** Utilize `rounded-lg` (`0.5rem`), matching hardware edge bevels.
- **Touch Action Nodes:** Feature cropped or beveled corners via layered clipping, maintaining tactile arcade feedback. Circular rings are reserved strictly for telemetry gauges and user avatars.

## Components

### Buttons & Arcade Push Triggers
- **Primary Arcade Action:** Background gradient from `#FFB703` to `#FF8C00`. Structured with a physical bottom bevel (`border-bottom: 4px solid #B26A00`) and inset highlight (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4)`). Active tap transforms button by `translateY(3px)` and collapses the bottom bevel to 1px.
- **Secondary Telemetry Action:** Dark translucent fill (`rgba(0, 240, 255, 0.06)`), 1px neon perimeter (`#00F0FF`), and glowing cyan typography.

### 2.5D Multiplayer Game Cards
- **Construction:** High-density card using `#1A163B` with layered isometric elevation. Top-right corner displays real-time telemetry flags (*"CANLI"*, *"8/10 OYUNCU"*).
- **Border Treatment:** Inactive cards display subtle graphite outlines; targeted or active rooms emit dual-tone gold and electric violet rim glows.

### Status Rings & Telemetry Meters
- **Multiplayer Status Rings:** Radial tracks using `#120F2D` backing with active segments highlighted in Hyper Cyan or Radiant Gold. Avatars are nested inside the inner ring with an absolute-positioned live presence gem (green for online, violet for in-match).
- **Signal Gauge ('Kayıp Sinyal'):** Segmented horizontal meter with angular block notches. As signal degrades, segments shift down from `#00F0FF` to `#FF007F`.

### Input & Chat Consoles
- **Field Anatomy:** Grounded `#120F2D` fields with an inset bottom-edge shadow. Focus state switches border to `#00F0FF` with a localized neon floor shadow. Placeholder text rests in subdued steel lavender (`#7D78A8`).

### Rewarding & Celebration Banners
- **VIP Victory Ribbons:** Skewed banners with diagonal high-gloss sheen lines across an amber-gold core. Uses `display-hero` typography paired with Turkish celebratory copy (*"ZAFER ELDE EDİLDİ"*, *"VIP SEVİYE ATLADI"*).