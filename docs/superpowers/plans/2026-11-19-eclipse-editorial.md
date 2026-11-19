# Eclipse Editorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul Glory Hinody's entire visual style, WebGL Gargantua shader, 2D starfield, and motion/scroll engine into the **Eclipse Editorial** aesthetic (Obsidian Midnight + Lunar Silver + Champagne Gold, 3 font families, compositor-only 60/120fps motion, zero neon violet).

**Architecture:** All visual changes stay inside Hugo's theme-override layers (`assets/css/extended/`, `layouts/`, `static/js/`, `hugo.yaml`). CSS tokens in `00-tokens.css` anchor every module; `layouts/about.html`'s duplicate inline `<style>` is deleted in favor of `90-pages.css`; `nausmind-cosmos.js` gains an analytical Planetary Eclipse GLSL layer with ACES filmic tone mapping and early-out optimization plus offscreen star glow sprites; `nausmind-motion.js` and `reading-progress.js` move to GPU transforms, inertia-aware trackpad snap physics, auto-sleeping rAF, and native CSS View Transitions.

**Tech Stack:** Hugo Extended v0.167.0, PaperMod (untouched submodule), vanilla CSS custom properties (11 modules), WebGL1 GLSL, Canvas 2D, vanilla ES5/ES6 JS, Headless Chrome CDP verification via Node 26.

**Spec:** [2026-11-19-eclipse-editorial-design.md](file:///D:/glory-hinody/docs/superpowers/specs/2026-11-19-eclipse-editorial-design.md)

## Global Constraints

- Never modify any file under `themes/PaperMod/`.
- Keep `markup.goldmark.renderer.unsafe: true` in `hugo.yaml` and preserve all KaTeX/Mermaid SRI hashes untouched.
- Zero new external network origins (CSP in `static/_headers` and `security-guard.v4.js` must remain 0 violations).
- Append `?v=2` to modified JS assets in `layouts/partials/extend_footer.html` to bust `immutable` 1-year `Cache-Control` in `static/_headers`.
- Preserve UTF-8 no-BOM Vietnamese diacritics across all files; never write files via PowerShell `Set-Content`.
- Preserve all DOM hooks/APIs: `window.setCameraDistance`, `getCameraDistance`, `getCameraBounds`, `setStarSpeed`, `setCosmicMode`, `getCosmicMode`, `window.NausmindMotion`, `blog-stats.js` selectors (`.post-stats-pill`, `.stat-likes`, `.stat-comments`, `.stat-shares`), Fuse.js `#searchbox`/`#searchInput`/`#searchResults`, `toc-spy.js`, Giscus `#comments`.
- Full `prefers-reduced-motion: reduce` fallback and 0px horizontal overflow at `1440px`, `768px`, and `390px`.

## Review Focus

1. **WebGL Planetary Eclipse occlusion vs. viewport aspect ratios** (`1440×900`, `1280×800`, ultrawide `1920×900`, narrow desktop `900×800`): the analytical planetary arc must never cover the entire viewport or detach awkwardly from the left edge, and Gargantua's ring must emerge cleanly behind its eastern rim.
2. **Trackpad momentum tail on homepage snap**: rapid macOS/Windows precision-touchpad inertia events after snapping must not cause double-section skips, while deliberate flicks and keyboard `ArrowDown`/`ArrowUp` must respond crisply without feeling locked.
3. **Scroll-reveal visibility on inner pages & reduced motion**: fast scrolling, hash deep-links, or `prefers-reduced-motion: reduce` must never leave `.reveal-on-scroll` or `[data-word-reveal]` stuck at `opacity: 0`.
4. **Zero neon-violet bleed & contrast compliance**: no `#8b7cf6`, `rgba(139, 124, 246`, or `rgba(91, 61, 158` anywhere in CSS, Mermaid config, or Canvas JS; all body text, metadata, and homepage scrim text remain legible.
5. **Immutable JS cache & mobile interactive parity**: updated `?v=2` scripts load cleanly with 0 console/CSP errors; mobile `390px` falls back cleanly to refined starfield, bottom tabbar, drawer, TOC fold, and share sheet.

---

### Task 1: Baseline Capture, Tokens, Fonts & Site Config

**Files:**
- Modify: `hugo.yaml` (`theme_color`, `msapplication_TileColor` → `#05070e`)
- Modify: `layouts/partials/extend_head.html` (trim Google Fonts to `Cormorant Garamond`, `Inter`, `JetBrains Mono`)
- Modify: `assets/css/extended/00-tokens.css` (Eclipse Editorial color/surface/rim/type/motion tokens, remove `dreamerpulse`/`dreameridle`, replace blur `heroReveal`)
- Modify: `assets/css/extended/10-base.css` (obsidian base, `@view-transition`, architectural `.glass-card`, crisp lunar/champagne chips/buttons, GPU-only `.reveal-on-scroll` & `[data-word-reveal]`, subtle cursor glow)

**Interfaces:**
- Produces: CSS tokens `--bg`, `--bg-void`, `--panel`, `--panel-hover`, `--panel-solid`, `--surface-3`, `--text`, `--text-bright`, `--content`, `--muted`, `--muted-dim`, `--accent-gold`, `--accent-gold-bright`, `--accent-gold-dim`, `--accent-gold-border`, `--accent-lunar`, `--accent-lunar-dim`, `--accent-lunar-border`, `--accent-purple` (aliased to `--accent-lunar`), `--rim-top`, `--line`, `--line-subtle`, `--line-strong`, `--ease`, `--ease-swift`, `--dur`, `--dur-fast`, `--dur-slow`.

- [ ] **Step 1:** Update `hugo.yaml` `theme_color` and `msapplication_TileColor` to `#05070e`.
- [ ] **Step 2:** Update `layouts/partials/extend_head.html` Google Fonts preload + stylesheet URLs to load only `Cormorant Garamond` (300..600 + ital 300,400), `Inter` (400,500,600), and `JetBrains Mono` (400,500).
- [ ] **Step 3:** Rewrite `assets/css/extended/00-tokens.css` with full Eclipse Editorial tokens, PaperMod variable bridge, clean GPU keyframes (`heroReveal`, `scrollbounce`, `statusPulse`, `mobileNavIn`), and lunar/champagne focus ring.
- [ ] **Step 4:** Rewrite `assets/css/extended/10-base.css` with `@view-transition { navigation: auto; }`, stepped obsidian surfaces, `var(--rim-top)` specular edges, zero `filter: blur()` on reveals, lunar-champagne scrollbars/selection, and refined pills/chips/back-to-top button.
- [ ] **Step 5:** Verify `hugo --gc --minify` compiles cleanly with 0 errors.

---

### Task 2: Navigation Chrome, Homepage Stage & Footer/Tabbar

**Files:**
- Modify: `layouts/partials/header.html` (minimalist inline SVG Eclipse Crescent Mark next to `GLORY HINODY`, label `ECLIPSE` on cosmic toggle)
- Modify: `layouts/partials/footer.html` (add minimalist Eclipse mark to footer brand)
- Modify: `assets/css/extended/20-header.css` (geometric `Inter` wordmark, sliding `scaleX` link underlines, crisp scrolled state, lunar/champagne controls, obsidian drawer)
- Modify: `assets/css/extended/25-tabbar.css` (obsidian glass dock, champagne active hairline indicator)
- Modify: `assets/css/extended/30-home.css` (refined Stargazing capsule, calibrated radial atmospheric scrim `0.66 → 0.90`, GPU-only hero reveal without blur or text-shadow glow loops, sleek `620ms` snap-section glide, refined Selected Writings rows, `#quote`, `#cta`, `#snap-dots`)
- Modify: `assets/css/extended/80-footer.css` (obsidian horizon footer with hairline lunar border & champagne accents)

**Interfaces:**
- Consumes: Task 1 tokens.
- Produces: Header `.site-nav.is-scrolled`, `.site-logo-mark`, `.cosmic-pill-btn[data-mode]`, `.home-fullpage.content-visible`, `.snap-section.is-active`.

- [ ] **Step 1:** Update `layouts/partials/header.html` and `layouts/partials/footer.html` with the inline SVG Eclipse Mark and updated `ECLIPSE` default toggle label.
- [ ] **Step 2:** Rewrite `20-header.css`, `25-tabbar.css`, `30-home.css`, and `80-footer.css` to Eclipse Editorial palette, architectural surfaces, and GPU-only transitions.
- [ ] **Step 3:** Verify `hugo --gc --minify` compiles cleanly.

---

### Task 3: Inner Pages — Archive, Single Monograph, Comments/Share, Search/Tags & About/404

**Files:**
- Modify: `layouts/list.html` (consistent champagne primary badge instead of alternating purple/gold checkerboard)
- Modify: `layouts/taxonomy.html` (consistent refined count badges)
- Modify: `layouts/about.html` (remove ~380-line duplicate inline `<style>` block completely; keep all bilingual HTML intact)
- Modify: `layouts/partials/extend_footer.html` (update Mermaid `themeVariables` to Eclipse Editorial palette; append `?v=2` to `nausmind-cosmos.js`, `nausmind-motion.js`, `reading-progress.js`)
- Modify: `assets/css/extended/40-list.css` (architectural dark slate cards, lunar top rim, clean topic filter bar, refined pagination)
- Modify: `assets/css/extended/50-post.css` (GPU `scaleX` `#reading-progress-bar`, alabaster editorial prose, obsidian code blocks, clean TOC rail, author crest, prev/next cards)
- Modify: `assets/css/extended/60-comments-share.css` (share bar, Giscus container, share modal/bottom sheet, toast — zero violet)
- Modify: `assets/css/extended/70-search-tags.css` (command-palette search bar, crisp result rows, constellation cards — zero violet)
- Modify: `assets/css/extended/90-pages.css` (single source of truth for `/about/` with Eclipse Orbital Crest, experience timeline, skill matrix, honors, contact grid + monumental `/404.html`)

**Interfaces:**
- Consumes: Task 1 tokens.
- Produces: `#reading-progress-bar` styled with `width: 100%; transform: scaleX(0); transform-origin: 0 50%;`, unified `90-pages.css` for `/about/`.

- [ ] **Step 1:** Clean `layouts/about.html` (remove inline `<style>` lines 7–388), refine badge classes in `layouts/list.html` & `layouts/taxonomy.html`, and update Mermaid theme + `?v=2` script tags in `layouts/partials/extend_footer.html`.
- [ ] **Step 2:** Rewrite `40-list.css`, `50-post.css`, `60-comments-share.css`, `70-search-tags.css`, and `90-pages.css` cleanly in Eclipse Editorial language.
- [ ] **Step 3:** Audit all CSS & layout files with grep to confirm 0 remaining `#8b7cf6`, `139, 124, 246`, `91, 61, 158`, `Orbitron`, or `filter: blur(` in text reveals.
- [ ] **Step 4:** Verify `hugo --gc --minify` compiles cleanly.

---

### Task 4: WebGL Planetary Eclipse Shader & Optimized 2D Starfield (`nausmind-cosmos.js`)

**Files:**
- Modify: `static/js/nausmind-cosmos.js`

**Interfaces:**
- Preserves public API: `window.setCameraDistance(d)`, `window.getCameraDistance()`, `window.getCameraBounds()`, `window.setStarSpeed(mult)`, `window.setCosmicMode(mode)`, `window.getCosmicMode()`, `nm:cosmic-mode-change` event, `[data-cosmic-toggle]` label syncing (`ECLIPSE` / `STARFIELD`).

- [ ] **Step 1:** Update `computeFraming(cssW, cssH)` to frame Gargantua slightly east (`frameX: +0.075` on desktop, tapering smoothly for narrower aspect ratios) so it pairs harmoniously with the left planetary limb.
- [ ] **Step 2:** Update `createProceduralSkyCanvas(2048, 1024)` to replace purple nebulae with deep midnight-cobalt space dust, faint warm horizon sheen, and crisp multi-temperature stars.
- [ ] **Step 3:** Upgrade `FRAGMENT_SHADER_SRC` with:
  - `uEclipseReveal` uniform coupled to `cameraDistance` (`smoothstep(D_MIN, D_STARGAZE, d)` mapped `0.25 → 1.0`).
  - Analytical screen-space foreground planetary limb (curving down left viewport edge) with **early-out bypass of RK4 loop** for interior opaque pixels, deep obsidian-navy upper hemisphere, warm champagne-sandstone illuminated lower hemisphere, and razor-thin silver-white Rayleigh atmospheric rim light peaking near Gargantua's emergence.
  - Incandescent ivory-white → solar champagne-amber → burnished gold accretion disk + horizontal equatorial anamorphic bloom + cool midnight-cobalt upper sky scatter.
  - `acesToneMap()` filmic tone mapping + smooth gamma + triangular micro-dither to eliminate dark banding.
- [ ] **Step 4:** Upgrade `#starCanvas` 2D starfield to midnight-cobalt & faint warm champagne horizon washes, pre-rendered offscreen glow sprites (zero per-frame star `createRadialGradient` allocations), and `dt`-independent exponential smoothing `1 - Math.exp(-k * dtSec)`.
- [ ] **Step 5:** Update `syncToggleButtons()` label to `'ECLIPSE'` / `'STARFIELD'` while keeping `data-mode="blackhole" | "star"`.
- [ ] **Step 6:** Syntax check with `node --check static/js/nausmind-cosmos.js`.

---

### Task 5: Silky-Smooth Motion & GPU Progress Engine (`nausmind-motion.js`, `reading-progress.js`)

**Files:**
- Modify: `static/js/nausmind-motion.js`
- Modify: `static/js/reading-progress.js`

**Interfaces:**
- Consumes: `window.setCameraDistance`, `getCameraDistance`, `getCameraBounds`, `setStarSpeed`, `getCosmicMode` from Task 4; `#reading-progress-bar` (`transform: scaleX(...)`) from Task 3; `.site-nav.is-scrolled` from Task 2.
- Produces: `window.NausmindMotion` (`enterContent`, `exitToStargaze`, `goToSnap`, `tweenCamera`, `refreshReveals`).

- [ ] **Step 1:** Rewrite `static/js/reading-progress.js` with single-flight `ticking` rAF guard and GPU `transform: scaleX(ratio)` updates.
- [ ] **Step 2:** Upgrade `static/js/nausmind-motion.js`:
  - Inertia-aware trackpad wheel filter + `620ms` snap cooldown + exponential `dt`-normalized camera dive, pointer parallax, and cursor sheen.
  - Auto-sleeping `motionFrame` rAF loop (stops when tween finishes and pointer deltas `< 0.0004`; wakes cleanly on `mousemove`, `tweenCamera`, `resize`, or section switch).
  - Passive scroll listener toggling `.is-scrolled` on `#site-nav` on inner pages (`scrollY > 24`).
  - Brisk `26ms` word-reveal stagger; remove blocking `220ms` `#page-transition-overlay` link delay (rely on native CSS `@view-transition`, while preserving home hash snapping and mobile drawer closing).
- [ ] **Step 3:** Syntax check with `node --check static/js/nausmind-motion.js` and `node --check static/js/reading-progress.js`.

---

### Task 6: Production Build, Real-Browser Visual & Interactive QA, Look-and-Fix Polish

**Files:**
- Scratch QA runner: `<artifact-dir>/scratch/qa-verify.mjs` (temporary Node + Chrome CDP verification script)
- Update: `memory-bank/activeContext.md` (document Eclipse Editorial upgrade after verification passes)

- [ ] **Step 1:** Run `hugo --gc --minify` and verify 0 errors, 0 warnings, and UTF-8 Vietnamese byte integrity in generated `public/` HTML.
- [ ] **Step 2:** Start local static server over `public/` and run headless Chrome CDP QA script across `1440×900`, `768×1024`, and `390×844` capturing screenshots and verifying:
  - 0 console errors, 0 WebGL shader errors, 0 uncaught page errors, 0 horizontal overflow.
  - WebGL canvas renders non-black Planetary Eclipse pixels on desktop home Stargazing + after dive into Section 0 Hero + Section 2 Works + Section 4 CTA.
  - Interactive checks: Stargazing dive → snap navigation → `ECLIPSE`/`STARFIELD` toggle → return to stargaze; inner header `.is-scrolled`; reading progress `scaleX` changes on scroll; TOC spy updates; Like & Share modal open/close; Fuse.js search returns results; `prefers-reduced-motion: reduce` keeps all reveals at `opacity: 1`.
  - Capture screenshots of Home (Stargazing, Hero, Works, Quote, CTA), `/posts/`, `/posts/openvideolab-video-diffusion/`, `/about/`, `/tags/`, `/search/`, `/404.html`, and Mobile `390px`.
- [ ] **Step 3:** Open and visually inspect every captured screenshot with `read_file`, critique lighting/framing/contrast/spacing against the 2 reference frames, refine any shader or CSS imperfections, rebuild, and re-verify until spotless.
- [ ] **Step 4:** Update `memory-bank/activeContext.md`, run final `hugo --gc --minify`, check `git status` & `git diff --stat`.
