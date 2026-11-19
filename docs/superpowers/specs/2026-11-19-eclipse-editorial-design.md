# Eclipse Editorial — Site-Wide Style, Shader & Motion Redesign Spec

**Date:** 2026-11-19  
**Project:** Glory Hinody (`glory-hinody.pages.dev`) — Hugo Extended + PaperMod Bilingual Engineering Portfolio & Technical Logbook  
**Status:** Draft for approval  

---

## 1. Intent & Why

Glory Hinody currently uses the "Nausmind Dark Cosmic Luxury" theme: a deep dark background accented heavily with neon violet (`#8b7cf6`), warm gold (`#c8a96e`), 5 separate font families (including sci-fi `Orbitron`), heavy glassmorphism blur, and a standalone Gargantua WebGL black hole.

While visually ambitious, three issues hold it back from feeling truly authoritative and editorial:
1. **Visual noise & "sci-fi template" tells:** Mixing `Orbitron` + `DM Sans` + `Inter` + `Cormorant Garamond` + `JetBrains Mono`, heavy neon-purple glows/shadows, alternating purple/gold pills, infinite pulsing `text-shadow` (`dreameridle`), and ~380 lines of duplicated inline `<style>` in `layouts/about.html`.
2. **Shader & lighting disconnected from the desired atmosphere:** The current Gargantua shader outputs salmon-orange (`vec3(1.0, 0.65, 0.50)`) without filmic tone mapping (causing harsh highlight clipping) over purple nebula clouds. The two user-provided reference frames establish a far more refined **Interstellar Planetary Eclipse** aesthetic: deep obsidian-midnight blue space, a dark curving planetary limb with a razor-thin silver-white atmospheric rim light, and an incandescent ivory-to-champagne-gold accretion horizon.
3. **Motion friction & repaint bottlenecks:** Animating `filter: blur(6px)` on text lines/words causes per-frame blur repaints; a rigid `850ms` wheel lock (`SNAP_COOLDOWN_MS`) feels stiff on trackpads; `reading-progress.js` animates layout property `width` instead of GPU `scaleX`; `nausmind-motion.js` spins an idle `requestAnimationFrame` loop forever; and `#page-transition-overlay` injects an artificial `220ms` delay on every internal link click.

**Goal:** Elevate the entire website (homepage, `/posts/`, `/posts/<slug>/`, `/about/`, `/tags/`, `/search/`, `/404.html`, both VI and EN) into a cohesive, refined, cinema-grade **Eclipse Editorial** aesthetic with buttery-smooth 60/120fps motion while keeping the existing site architecture, Stargazing + 5-section homepage flow, and all existing content/features intact.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- Translate the **Planetary Eclipse** reference lighting (deep obsidian-midnight `#05070e`, cool twilight slate `#0c1322`, crisp atmospheric lunar silver-blue `#9cb8e2`, warm champagne-gold `#e2be84`, warm alabaster text `#edeae3`) across every page, component, code block, and Mermaid diagram.
- Upgrade the homepage WebGL shader (`static/js/nausmind-cosmos.js`) into a refined **Planetary Eclipse of Gargantua** featuring ACES filmic tone mapping, incandescent ivory-gold accretion disk, subtle horizontal anamorphic bloom, and an atmospheric foreground planetary limb with Rayleigh rim light that gracefully yields framing to typography when entering content.
- Upgrade the 2D starfield (`#starCanvas`) for inner pages and mobile to calm midnight-cobalt + warm horizon atmosphere with pre-rendered offscreen glow sprites (eliminating per-frame radial gradient allocations).
- Consolidate typography from 5 fonts down to **3 disciplined families** (`Cormorant Garamond`, `Inter`, `JetBrains Mono`), replacing `Orbitron` with a crisp geometric `Inter` wordmark + minimalist eclipse crest mark.
- Overhaul motion (`static/js/nausmind-motion.js`, `static/js/reading-progress.js`, CSS transitions) to be strictly GPU-composited (`transform`, `opacity`), frame-rate independent (`dt` exponential damping), inertia-aware on trackpads, auto-sleeping when idle, and instantaneous across page navigations via CSS View Transitions (`@view-transition`).
- Eliminate CSS duplication by removing the ~380-line inline `<style>` block in `layouts/about.html` and consolidating all page styles into `assets/css/extended/90-pages.css`.

### Non-Goals
- Do **not** alter the Hugo + PaperMod stack, URL routes, bilingual content (`.md` / `.en.md`), Giscus comments, Fuse.js search index, KaTeX math rendering, or `blog-stats.js` localStorage keys/interaction semantics.
- Do **not** replace the homepage's signature 2-phase Stargazing → 5-section fullpage snap experience (`#hero`, `#motivation`, `#works`, `#quote`, `#cta`) with a conventional long-scroll landing page.
- Do **not** add external npm packages, JS animation libraries (GSAP/Lenis), or third-party CDN hosts outside existing CSP whitelist.

### Anti-Goals (Failure Conditions)
- Any leftover neon violet/purple (`#8b7cf6`, `rgba(139, 124, 246, ...)`, `rgba(91, 61, 158, ...)`) bleeding through buttons, shadows, Mermaid diagrams, scrollbars, or hover states.
- Heavy unreadable text over the WebGL eclipse (contrast failure or cluttered background competing with prose/headings).
- Choppy motion, stuck trackpad scroll lock, invisible `.reveal-on-scroll` content, broken KaTeX/Mermaid/Giscus/Search/Stats, or stale cached JS on Cloudflare Pages due to `immutable` headers.
- Any edits inside `themes/PaperMod/` or corrupted UTF-8 Vietnamese diacritics.

---

## 3. Hard Constraints

1. **Theme boundary:** Never edit `themes/PaperMod/`. All template/style overrides stay in `layouts/`, `assets/css/extended/`, `static/js/`, and `hugo.yaml`.
2. **Goldmark & SRI preservation:** Keep `markup.goldmark.renderer.unsafe: true` and all existing KaTeX/Mermaid SRI hashes intact.
3. **Strict CSP & Security Guard compatibility:** No new external domains. Only existing whitelisted origins (`fonts.googleapis.com`, `fonts.gstatic.com`, `cdn.jsdelivr.net`, `giscus.app`). Keep `header`, `footer`, `main` landmarks valid for `security-guard.v4.js`.
4. **Immutable JS cache-busting:** `static/_headers` sets `Cache-Control: public, max-age=31536000, immutable` on `/js/nausmind-cosmos.js`, `/js/nausmind-motion.js`, and `/js/reading-progress.js`. Every modified JS script URL referenced in `layouts/partials/extend_footer.html` MUST include a version query string (e.g., `?v=2`) so browsers & edge caches fetch the updated scripts immediately.
5. **UTF-8 no-BOM encoding:** Edit all files exclusively through clean UTF-8 file tools (never PowerShell `Set-Content`).
6. **Reduced-motion & Mobile responsiveness:** Full `prefers-reduced-motion: reduce` fallback (zero travel, static single-frame WebGL/canvas render, immediate visibility). Zero horizontal overflow across 390px, 768px, and 1440px viewports.

---

## 4. Approaches Considered

| Approach | Summary | Trade-offs |
|---|---|---|
| **1. Eclipse Editorial (Selected)** | Full visual shift to Obsidian Midnight + Lunar Silver + Champagne Gold; upgrade WebGL Gargantua into a Planetary Eclipse scene with ACES filmic tone mapping; replace heavy blur glassmorphism with architectural tone-stepped surfaces + specular rim light; consolidate to 3 fonts; rewrite motion physics & remove 220ms page curtain delay. | Distinct visual evolution away from generic purple sci-fi glassmorphism toward cinema-grade editorial craft. |
| **2. Refined Gargantua Minimal** | Same typography, surface, palette, and motion overhaul as Approach 1, but keeps Gargantua centered solo without foreground planetary limb eclipse. | Safer/more familiar, but leaves the signature planetary-eclipse composition from the reference images unrealized. |
| **3. Atmospheric Glass Evolution** | Keeps current frosted-glass aesthetic and glow intensity, only swapping violet to slate-blue/gold and optimizing motion. | Lowest deviation from previous design, but retains dated heavy-glassmorphism feel. |

**Decision:** User approved **Approach 1 (Eclipse Editorial)**.

---

## 5. Architecture & Detailed Design

### 5.1 Design Tokens (`assets/css/extended/00-tokens.css` & `hugo.yaml`)

- **Core Surfaces (Stepped Obsidian & Midnight Slate):**
  - `--bg-void: #03050a`
  - `--bg: #05070e` (also update `hugo.yaml` `theme_color` & `msapplication_TileColor` to `#05070e`)
  - `--surface-1` / `--panel`: `rgba(10, 15, 28, 0.76)` (translucent over cosmos) & `--panel-solid: #0a0f1c`
  - `--surface-2` / `--panel-hover`: `rgba(16, 23, 41, 0.90)`
  - `--surface-3`: `#141e35`
  - `--code-block`: `#080c17`
- **Ink Hierarchy (High Contrast Warm Alabaster & Cool Twilight Slate):**
  - `--text-bright`: `#faf8f3`
  - `--text` / `--text-primary`: `#edeae2`
  - `--content`: `#e3dfd6`
  - `--muted` / `--text-muted`: `#9ca8bf`
  - `--muted-dim`: `#818fa8` (verified >= 5.5:1 on `#05070e`)
- **Celestial Accents (Zero Neon Violet):**
  - **Primary (Solar Champagne Gold):** `--accent-gold: #e2be84`, `--accent-gold-bright: #f4dfb9`, `--accent-gold-dim: rgba(226, 190, 132, 0.11)`, `--accent-gold-border: rgba(226, 190, 132, 0.32)`
  - **Secondary (Atmospheric Lunar Silver-Blue):** `--accent-lunar: #9bb7e0`, `--accent-lunar-dim: rgba(155, 183, 224, 0.10)`, `--accent-lunar-border: rgba(155, 183, 224, 0.28)`
  - **Backward-compatibility aliases:** Map `--accent-purple` → `var(--accent-lunar)`, `--accent-purple-dim` → `var(--accent-lunar-dim)`, `--accent-purple-border` → `var(--accent-lunar-border)` so any legacy class remains cohesive.
  - **Status:** `--green-status: #5fd39a`, `--green-status-dim: rgba(95, 211, 154, 0.09)`, `--green-status-border: rgba(95, 211, 154, 0.28)`
- **Atmospheric Rim Borders:**
  - `--line-subtle: rgba(196, 214, 242, 0.06)`
  - `--line: rgba(196, 214, 242, 0.11)`
  - `--line-strong: rgba(226, 190, 132, 0.34)`
  - `--rim-top: inset 0 1px 0 rgba(224, 236, 255, 0.12)` (signature subtle crescent rim highlight on cards/panels)
- **Typography Tokens:**
  - `--font-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif`
  - `--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
  - `--font-label: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
  - `--font-logo: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
  - `--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
  - Update Google Fonts link in `layouts/partials/extend_head.html` to load **only** `Cormorant Garamond` (300, 400, 500, 600 + italic 300, 400), `Inter` (400, 500, 600), and `JetBrains Mono` (400, 500).
- **Motion Curve Tokens:**
  - `--ease: cubic-bezier(0.22, 1, 0.36, 1)` (refined quint/expo-like deceleration)
  - `--ease-swift: cubic-bezier(0.16, 1, 0.3, 1)`
  - `--dur-fast: 180ms`, `--dur: 280ms`, `--dur-slow: 620ms`

### 5.2 Surface Language & Visual Polish Across All Modules
- **Architectural Panels (replacing heavy glassmorphism):**
  - Cards (`.glass-card`, `.log-entry`, `.post-author-card`, `.post-nav-card`, `.toc-card`, `.nm-pub-card`, `.nm-skill-card`, `.nm-contact-card`) use stepped dark slate surface `rgba(10, 15, 28, 0.78)` with subtle `backdrop-filter: blur(8px)`, hairline border `var(--line)`, and top-edge lunar rim highlight `box-shadow: var(--rim-top)`.
  - Hover state: restrained `translate3d(0, -3px, 0)` lift (or `translate3d(4px, 0, 0)` for list rows), smooth border shift to `var(--accent-gold-border)`, surface step to `var(--panel-hover)`, subtle dark depth shadow `0 16px 40px rgba(2, 4, 10, 0.55)` — zero neon purple halos.
- **Header & Brand Emblem (`layouts/partials/header.html`, `20-header.css`):**
  - Replace plain Orbitron text with a minimalist inline SVG **Eclipse Crescent Mark** (18×18, geometric planet silhouette + champagne ring arc) paired with tracked `Inter 600` (`0.78rem`, `letter-spacing: 0.26em`) `GLORY HINODY`.
  - Add smooth underline glide (`::after` with `transform: scaleX(0) → scaleX(1)`, `transform-origin: left`) on desktop nav links and champagne-gold active indicator.
  - Add passive scroll listener on inner pages to toggle `.is-scrolled` cleanly on `#site-nav`.
  - Update cosmic toggle button label to `ECLIPSE` / `STARFIELD` (preserving `data-cosmic-toggle`, `data-mode="blackhole" | "star"`, and `window.setCosmicMode` API).
- **Homepage Stage (`30-home.css`, `layouts/home.html`, `layouts/baseof.html`):**
  - **Balanced atmospheric reading scrim *(architect's call)*:** When `.home-fullpage.content-visible` activates, apply a calibrated radial-vignette scrim (`radial-gradient(ellipse 68% 64% at 72% 48%, rgba(5, 7, 14, 0.66) 0%, rgba(5, 7, 14, 0.82) 56%, rgba(5, 7, 14, 0.90) 100%)` with `backdrop-filter: blur(8px)`) plus restrained dark halo (`text-shadow: 0 2px 18px rgba(3, 5, 10, 0.72)`) on un-carded display text (`#hero`, `#motivation`, `#quote`, `#cta`). This guarantees high WCAG contrast across both left-aligned (`#hero`), 12-column right-spanning (`#motivation`, `#works`), and centered (`#quote`, `#cta`) sections while letting the warm champagne eclipse glow breathe softly through the right-center quadrant.
  - **Hero typography:** Remove `filter: blur()` and `dreameridle`/`dreamerpulse` glow loop. Set `.hero-display-stack` in crisp `Cormorant Garamond 300`, tight leading (`0.98`), subtle warm-ivory-to-champagne contrast on the third line (`Builder.` / `Kiến tạo.`), with subtle GPU transform+opacity stagger.
  - **Snap sections & Side progress dots (`#snap-dots`):** Clean vertical hairline dots transforming smoothly into a `24px` champagne bar on the active section.
- **Archive, Search & Tags (`40-list.css`, `70-search-tags.css`, `layouts/list.html`, `layouts/taxonomy.html`):**
  - Replace alternating purple/gold primary tag badges with a consistent refined editorial hierarchy: primary topic in warm champagne-gold (`nm-badge-gold`), secondary tags in quiet lunar-slate chips.
  - Keep all `blog-stats.js` interactive controls (`.post-stats-pill`, `.stat-likes`, `.stat-comments`, `.stat-shares`) and Fuse.js `#searchbox` / `#searchInput` / `#searchResults` hooks 100% functional.
- **Single Monograph, Share Modal & Comments (`50-post.css`, `60-comments-share.css`, `layouts/partials/extend_footer.html`):**
  - Reading progress bar (`#reading-progress-bar`): fixed `width: 100%`, driven by `transform: scaleX(0)` (`transform-origin: 0 50%`) with warm champagne-to-lunar gradient.
  - Prose typography: warm alabaster `#e3dfd6`, refined `h2` champagne short bar, clean obsidian code blocks (`#080c17`) with subtle top specular hairline, refined inline code tint (lunar-slate instead of purple), clean dark tables.
  - Update **Mermaid `themeVariables`** in `layouts/partials/extend_footer.html` to Eclipse palette (`background: '#080c17'`, `primaryColor: '#10182b'`, `primaryTextColor: '#edeae2'`, `primaryBorderColor: '#9bb7e0'`, `lineColor: '#e2be84'`, `secondaryColor: '#141e35'`, `tertiaryColor: '#0a0f1c'`, `clusterBkg: '#0a0f1c'`, `clusterBorder: '#e2be84'`, `edgeLabelBackground: '#0a0f1c'`).
- **About / Portfolio (`90-pages.css`, `layouts/about.html`):**
  - Remove the ~380-line inline `<style>` block from `layouts/about.html`; ensure every rule lives cleanly in `90-pages.css`.
  - Restyle `.about-avatar-halo` into a crisp **Eclipse Crest**: deep obsidian core, fine lunar outer orbit ring, warm champagne inner crescent rim, italic `LQV` serif monogram — no heavy neon double-bloom.
  - Replace purple bullet dots (`.nm-exp-dot`) with crisp champagne-gold micro-dots; refine contact icons to lunar-slate turning champagne on hover.
- **Footer, Mobile Tabbar & 404 (`80-footer.css`, `25-tabbar.css`, `90-pages.css`):**
  - Unified midnight obsidian chrome, champagne-gold active tab bar hairline, restrained 404 monumental typography without purple double-glow.

### 5.3 WebGL Planetary Eclipse Shader & 2D Starfield (`static/js/nausmind-cosmos.js`)

**Reference Visual Contract (distilled from the 2 user-provided frames):**
- Both reference frames depict a **single** unified Interstellar planetary-eclipse composition with complementary lighting nuance: deep midnight-cobalt upper cosmos (`#040814` → `#0d1d3c`), a large smooth foreground planetary limb sweeping down the left ~35–42% of the viewport, a luminous razor-thin silver-white Rayleigh atmospheric rim hugging the limb's eastern curve, a warm champagne-sandstone illuminated lower hemisphere below the equatorial plane contrasting with deep obsidian-navy shadow above, and Gargantua's bright ivory-to-champagne-gold photon ring and horizontal accretion flare emerging directly behind the planet's eastern edge.

1. **Planetary Eclipse GLSL Layer (Desktop Home `blackhole` mode):**
   - Preserve the RK4 relativistic geodesic raymarcher and public window API (`setCameraDistance`, `getCameraDistance`, `getCameraBounds`, `setStarSpeed`, `setCosmicMode`, `getCosmicMode`).
   - **Asymmetric Framing *(architect's call)*:** In `computeFraming()`, offset `frameX` slightly right (`+0.075` on desktop `aspect >= 1.2`, tapering toward `+0.03` on narrower viewports) so Gargantua emerges naturally just east of the curving planetary limb (`x ≈ 0.56–0.60`), matching the reference balance.
   - **Camera-Coupled Eclipse Reveal (`uEclipseReveal`) *(architect's call)*:** Drive `uEclipseReveal` smoothly from `cameraDistance` (`smoothstep(D_MIN, D_STARGAZE, cameraDistance)` mapped from `1.0` at `D_STARGAZE = 28.0` down to `0.25` at `D_MIN = 1.6`). On landing Stargazing (`d = 28`), the planetary limb frames Gargantua in full eclipse; during the 1st-scroll camera dive (`28 → 1.6`), the camera physically glides past the curving limb toward Gargantua as the planet drifts gently left and softens; when content fades in on the 2nd scroll (`.content-visible`), the CSS radial scrim handles text contrast cleanly without jumping shader geometry or requiring breaking public API changes.
   - **Analytical Foreground Planetary Limb & Early-Out Optimization *(architect's call)*:**
     - Render the foreground planet as a smooth analytical screen-space arc/sphere (no noisy FBM clouds) centered off the left side (`cx ≈ -0.62`, `cy ≈ 0.42`, radius tuned in aspect-corrected coordinates so the eastern arc intersects roughly `x ≈ 0.32` at top, `x ≈ 0.40` at mid-height, and `x ≈ 0.16` at bottom in Stargazing, shifting leftward as `uEclipseReveal` decreases).
     - **Performance win:** Pixels solidly inside the opaque planetary disc (away from the thin atmospheric fringe) skip the 220-step RK4 black-hole raymarch loop entirely, shading directly with smooth upper obsidian-navy nightside (`#040812` → `#0d1526`) transitioning across the equatorial horizon line into warm diffused champagne-sandstone bounce light (`#463b2b` → `#b69b75` near the lit limb) illuminated by the accretion plane.
     - Outside/along the analytical limb boundary, composite a crisp razor-thin luminous silver-white **Rayleigh atmospheric rim** (`vec3(0.92, 0.95, 1.0)`), boosted near Gargantua's equatorial emergence point, seamlessly over the raymarched black hole.
   - **Accretion Disk & Photon Ring Color Overhaul:**
     - Shift accretion emission from salmon-orange (`vec3(1.0, 0.65, 0.50)`) to realistic blackbody **incandescent ivory-white core (`vec3(1.0, 0.96, 0.88)`) → warm champagne-amber mid-disk (`vec3(0.96, 0.76, 0.46)`) → deep burnished gold outer veil (`vec3(0.55, 0.34, 0.16)`)**.
     - Add subtle horizontal anamorphic lens bloom extending rightward along the bright equatorial accretion plane.
     - Add cool deep midnight-cobalt atmospheric scatter (`vec3(0.03, 0.07, 0.16)`) in the upper-right sky contrasting gently with warm horizon light below.
   - **ACES Filmic Tone Mapping + 8-bit Micro-Dither:**
     - Apply `acesToneMap(hdrColor)` + smooth gamma shaping + triangular micro-dither (`±0.5/255`) so dark space gradients are completely band-free and bright photon highlights roll off like cinema film.
2. **2048×1024 Procedural Sky Texture:**
   - Replace purple nebula washes with deep midnight-blue cosmic dust and faint warm champagne starlight; pinpoint crisp multi-temperature stars.
3. **2D Starfield (`#starCanvas` — Inner Pages, Mobile, and Warp Overlay):**
   - Replace purple nebula gradients with calm upper-right midnight cobalt wash and whisper-faint lower champagne horizon glow.
   - Pre-render small radial glow sprites for bright stars onto offscreen mini-canvases once during init (zero per-frame `createRadialGradient` churn for stars).
   - Frame-rate-independent damping (`1 - Math.exp(-k * dtSec)`) for pointer parallax and star warp transitions.

### 5.4 Silky-Smooth Motion & Performance Engine (`static/js/nausmind-motion.js`, `static/js/reading-progress.js`, `10-base.css`)

1. **Compositor-Only Reveals & Animations:**
   - Eliminate all animated `filter: blur(...)` rules (`.hero-line`, `@keyframes heroReveal`, `[data-word-reveal] .nm-word`). Use crisp `transform: translate3d(0, 18px, 0)` + `opacity` with `--ease` (`cubic-bezier(0.22, 1, 0.36, 1)`).
   - Shorten word-reveal stagger from `35ms` to `26ms` per word for brisker, silkier rhythm.
   - Remove infinite `dreameridle`/`dreamerpulse` `text-shadow` animation.
2. **Inertia-Aware Homepage Snap & Camera Dive:**
   - Reduce `SNAP_COOLDOWN_MS` from `850ms` to `620ms` and implement trackpad momentum-tail filtering (track peak wheel delta within a gesture window so decaying inertial events after a snap never trigger accidental double-skips, while a deliberate new flick responds crisply).
   - Smooth section transition (`620ms`, `translate3d(0, 28px, 0) scale(0.988)` → `translate3d(0, 0, 0) scale(1)`).
   - Use frame-rate-independent exponential smoothing `1 - Math.exp(-lambda * dt)` for mouse parallax, cursor sheen, and hero line parallax.
3. **Auto-Sleeping rAF Loop:**
   - Stop scheduling `requestAnimationFrame(motionFrame)` when `cameraTween === null` and pointer lerp deltas have settled (`< 0.0004`). Wake automatically on `mousemove`, `tweenCamera`, `resize`, or section enter.
   - Move `#cursor-glow` updates into the sleeping rAF loop (lerped softly with `translate3d`, warm champagne-lunar tint at subtle `0.045` alpha) instead of writing style transforms raw on every `mousemove` event.
4. **GPU Reading Progress Bar (`static/js/reading-progress.js`):**
   - Single-flight `ticking` rAF guard + `progressBar.style.transform = 'scaleX(' + ratio + ')'` instead of mutating `style.width`.
5. **Instant Cross-Page Transitions:**
   - Add `@view-transition { navigation: auto; }` with a crisp `180ms` root crossfade in `10-base.css`.
   - Remove the artificial `220ms` navigation-delay interceptor in `nausmind-motion.js` (preserve hash-link snapping on home and clean drawer closing on click).
6. **Dynamic Inner Header Scroll State:**
   - Passive scroll listener in `nausmind-motion.js` toggles `.is-scrolled` on `#site-nav` once `window.scrollY > 24`, keeping inner headers airy at the top of the page and crisp while reading.

---

## 6. Verification Plan

1. **Production Build Verification:** `hugo --gc --minify` → 0 errors, 0 warnings, clean bilingual pages count, UTF-8 Vietnamese integrity check on generated HTML.
2. **Real-Browser Visual & Interactive QA (Desktop `1440×900`, Tablet `768×1024`, Mobile `390×844`):**
   - Capture screenshots and inspect across all core views:
     - Home (Stargazing Eclipse WebGL view + Section 0 Hero + Section 2 Works + Section 4 CTA)
     - `/posts/` (Archive grid + filter bar + stats pills)
     - `/posts/<slug>/` (Single article with KaTeX, Mermaid, code block, sticky TOC, reading progress bar, Giscus container)
     - `/about/` (Portfolio, Eclipse monogram, timeline, skill matrix, contact grid)
     - `/tags/`, `/search/`, `/404.html`, and English `/en/` mirror
   - Check console for **0 JS errors**, **0 WebGL shader compile/link errors**, **0 CSP violations**, **0 horizontal overflow**, and verify `prefers-reduced-motion` renders cleanly with all content visible.
   - Verify interactive behaviors: Stargazing dive → snap sections → return to stargaze; `ECLIPSE` / `STARFIELD` toggle; `VI | EN` switch; mobile drawer & tabbar; Like/Share modal; Fuse.js search; TOC spy & `scaleX` reading progress.

---

## 7. Left to the Builder

- Exact GLSL constants for the foreground planetary curvature radius, atmospheric rim falloff exponent, and horizon bloom amplitude (tune visually against live screenshots at `1440×900` and `1280×800` until it closely captures the poise and balance of the two reference images without obscuring hero readability).
- Fine-tuning spacing, border opacity, and hover contrast steps during visual screenshot QA passes.
