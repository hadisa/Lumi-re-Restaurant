# ✦ Lumière — Cinematic Restaurant Landing Page

> *A luxury restaurant experience built with React, Vite, and Tailwind CSS — powered by scroll-controlled WebP frame morphing on HTML Canvas.*

<br />

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![WebP](https://img.shields.io/badge/Animation-WebP_Frames-FF6B35?style=flat-square)
![Canvas API](https://img.shields.io/badge/Rendering-HTML_Canvas-E34F26?style=flat-square)

<br />

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo Sections](#-live-demo-sections)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Frame Animation System](#-frame-animation-system)
- [Why WebP? Not PNG or JPG](#-why-webp-not-png-or-jpg)
- [Creating Your Frame Sequence with ezgif](#-creating-your-frame-sequence-with-ezgif)
- [Tailwind Configuration](#-tailwind-configuration)
- [Performance](#-performance)
- [Customization Guide](#-customization-guide)
- [Browser Support](#-browser-support)
- [License](#-license)

<br />

---

## 🎬 Overview

**Lumière** is a high-end, cinematic restaurant landing page that uses **scroll-controlled frame morphing** to create an immersive experience. Instead of a traditional scrolling webpage, the user moves through a living film — each scroll position maps to a specific animation frame rendered live on an HTML `<canvas>`.

The design philosophy is rooted in a single idea:

> *"A luxury restaurant website should feel like entering the restaurant itself — not clicking through one."*

**Key highlights:**
- 173 WebP frames rendered on `<canvas>` via `requestAnimationFrame`
- Smooth easing via lerp interpolation (not linear scrubbing)
- Three-layer persistent dark overlay system ensuring text readability on any frame
- Nine fully animated sections with Intersection Observer scroll reveals
- Fully responsive — desktop and mobile
- Built entirely with React, Vite, and Tailwind CSS

<br />

---

## 🗂 Live Demo Sections

| # | Section | Description |
|---|---------|-------------|
| 01 | **Hero** | Cinematic opener with animated headline and dual CTAs |
| 02 | **Our Story** | Brand philosophy, stats, and chef quote panel |
| 03 | **Awards & Recognition** | Michelin stars, World's 50 Best, Forbes, Wine Spectator |
| 04 | **Meet the Chef** | Biography, training, and philosophy of Chef Élise Moreau |
| 05 | **Signature Dishes** | Six-item tasting menu with corner-bracket cards |
| 06 | **Wine Cellar** | Tabbed wine list (Burgundy / Bordeaux / Champagne / Natural) |
| 07 | **Private Dining** | Six bespoke private experience offerings |
| 08 | **Press & Testimonials** | Media quotes and guest reviews with star ratings |
| 09 | **Reservation** | Full booking form with experience selector |

<br />

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev) | 18+ | UI framework and component architecture |
| [Vite](https://vitejs.dev) | 5+ | Build tool, dev server, HMR |
| [Tailwind CSS](https://tailwindcss.com) | 3+ | Utility-first styling — all layout, color, spacing |
| HTML Canvas API | Native | Frame-by-frame WebP rendering |
| `requestAnimationFrame` | Native | 60fps easing loop |
| Intersection Observer API | Native | Scroll-triggered reveal animations |
| [Google Fonts](https://fonts.google.com) | CDN | Cormorant Garamond + Josefin Sans |

<br />

---

## 📁 Project Structure

```
lumiere/
│
├── public/
│   └── frames/                        # ← Your WebP frame sequence lives here
│       ├── frame_072_delay-0.04s.webp
│       ├── frame_073_delay-0.04s.webp
│       ├── frame_074_delay-0.04s.webp
│       ├── ...
│       └── frame_244_delay-0.04s.webp
│
├── src/
│   ├── App.jsx                        # ← Main component (all sections)
│   ├── main.jsx                       # React entry point
│   └── index.css                      # Tailwind directives
│
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

> **Important:** The `public/frames/` folder must be inside `/public` — Vite serves this directory statically. Files here are available at `/frames/frame_XXX_delay-0.04s.webp` at runtime.

<br />

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** `18+` — [Download](https://nodejs.org)
- **npm** `9+` or **yarn** `1.22+`

### Installation

**Step 1 — Clone or download the project**

```bash
git clone https://github.com/yourusername/lumiere.git
cd lumiere
```

**Step 2 — Install dependencies**

```bash
npm install
```

**Step 3 — Add your WebP frames**

Place all your WebP animation frames inside `public/frames/`. They must follow this exact naming pattern:

```
frame_072_delay-0.04s.webp
frame_073_delay-0.04s.webp
...
frame_244_delay-0.04s.webp
```

> See the [Frame Animation System](#-frame-animation-system) and [Creating Your Frame Sequence](#-creating-your-frame-sequence-with-ezgif) sections for how to generate these.

**Step 4 — Start the development server**

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

**Step 5 — Build for production**

```bash
npm run build
```

The optimized output will be in the `/dist` folder, ready to deploy to Vercel, Netlify, or any static host.

<br />

---

## 🎞 Frame Animation System

### How It Works

The animation is powered by three core concepts working together:

#### 1. Frame Preloading

On mount, all 173 frames (072 → 244) are preloaded as `Image` objects stored in a ref array. Hero frames (072–120) are loaded first as a priority batch, so the page is interactive immediately while the remaining frames load in the background.

```js
// Priority batch — hero frames first
const heroCount = 49; // frames 072–120
Promise.all(heroFrames).then(() => loadRemainingFrames());
```

#### 2. Scroll-to-Frame Mapping

As the user scrolls, the scroll position is mapped linearly to a frame index:

```js
const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
targetFrame = Math.round(progress * (TOTAL_FRAMES - 1)); // 0 → 172
```

#### 3. Easing via Lerp

Rather than snapping directly to the target frame, the current frame value eases toward the target at 10% per animation tick. This creates the smooth, cinematic glide effect:

```js
// In requestAnimationFrame loop
currentFrame += (targetFrame - currentFrame) * 0.10;
canvas.drawFrame(Math.round(currentFrame));
```

### Frame Naming Convention

Frames must follow this exact pattern to be resolved correctly:

```
frame_XXX_delay-0.04s.webp
```

Where `XXX` is zero-padded to 3 digits: `072`, `073`, `100`, `200`, etc.

The `framePath()` helper handles padding automatically:

```js
const pad = (n) => String(n).padStart(3, "0");
const framePath = (n) => `public/frames/frame_${pad(n)}_delay-0.04s.webp`;
```

### Frame Range Configuration

To change the frame range, update the constants at the top of `App.jsx`:

```js
const FRAME_START  = 72;   // First frame number
const FRAME_END    = 244;  // Last frame number
const TOTAL_FRAMES = FRAME_END - FRAME_START + 1; // 173 frames
```

### Dark Overlay System

To ensure text is always readable regardless of which frame is playing, three overlay layers are applied:

| Layer | Type | Opacity | Purpose |
|-------|------|---------|---------|
| Canvas Layer 1 | Flat fill `rgba(3,1,0,0.62)` | 62% | Base darkness applied directly on canvas |
| Canvas Layer 2 | Radial gradient | 0→58% | Darkens edges, keeps center lighter |
| Canvas Layer 3 | Bottom linear gradient | 0→65% | Ensures text near bottom always readable |
| Fixed Div (z:1) | `bg-[rgba(3,1,0,0.52)]` | 52% | Persistent global dim over all frames |
| Fixed Div (z:2) | Radial CSS gradient | 0→70% | CSS vignette layer |
| Fixed Div (z:3) | Film grain SVG texture | 30% | Cinematic grain overlay |

<br />

---

## 🖼 Why WebP? Not PNG or JPG

This is one of the most important decisions in this project. Here is the full breakdown:

### The Problem with PNG

PNG uses **lossless compression** — every pixel is preserved perfectly. This sounds ideal, but for photographic animation frames, it creates enormous file sizes.

```
Average PNG frame:    ~1.2 MB
× 173 frames:         ~207 MB total
```

A 207 MB initial payload is not a website. It is unusable for real users on real connections.

### The Problem with JPG

JPG solves the size problem with **lossy compression** — but it destroys fine gradients, subtle lighting transitions, and warm cinematic tones. For a luxury brand where visual quality is the entire point, degraded images are not acceptable.

JPG also **does not support transparency**, which limits compositional flexibility.

### Why WebP Wins

WebP, developed by Google, combines the best of both formats:

| Feature | PNG | JPG | WebP |
|---------|-----|-----|------|
| Transparency (alpha) | ✅ | ❌ | ✅ |
| Lossless mode | ✅ | ❌ | ✅ |
| Lossy mode | ❌ | ✅ | ✅ |
| File size (typical) | Large | Medium | **Small** |
| Quality at same size | High | Medium | **High** |
| Animation support | ❌ | ❌ | ✅ |

**The result for this project:**

```
PNG:  ~207 MB  (173 frames × ~1.2 MB)
JPG:  ~85 MB   (173 frames × ~0.5 MB) — but quality degraded
WebP: ~52 MB   (173 frames × ~0.3 MB) — same quality as PNG
```

> **WebP reduces file size by ~75% compared to PNG and ~40% compared to JPG — with no perceptible quality loss.**

This is why WebP is the only correct choice for a frame-sequence animation system.

<br />

---

## 🛠 Creating Your Frame Sequence with ezgif

[ezgif.com](https://ezgif.com) is a free, browser-based tool that makes it easy to extract and convert frames from any animation.

### Step-by-Step Workflow

**Step 1 — Go to ezgif.com**

Navigate to [https://ezgif.com/split](https://ezgif.com/split) or use the **GIF to Frames** tool.

**Step 2 — Upload your animation**

You can upload:
- An animated GIF
- An MP4 video clip
- An existing WebP animation

**Step 3 — Split into frames**

Click **Split** — ezgif will extract every individual frame as a separate image.

**Step 4 — Convert to WebP**

This is the critical step most people skip:
- Select all frames
- Use the **Convert to WebP** option
- Set quality to `85` (balances size and quality perfectly)
- Download the ZIP

**Step 5 — Rename frames sequentially**

Rename your files to match the naming convention:

```
frame_072_delay-0.04s.webp
frame_073_delay-0.04s.webp
frame_074_delay-0.04s.webp
```

You can do this quickly with a batch rename script:

```bash
# macOS / Linux — rename frames sequentially starting from 072
n=72
for f in *.webp; do
  mv "$f" "$(printf 'frame_%03d_delay-0.04s.webp' $n)"
  ((n++))
done
```

```powershell
# Windows PowerShell
$n = 72
Get-ChildItem *.webp | ForEach-Object {
  Rename-Item $_ ("frame_{0:D3}_delay-0.04s.webp" -f $n)
  $n++
}
```

**Step 6 — Drop into `/public/frames/`**

Copy all renamed `.webp` files into your project:

```
lumiere/public/frames/frame_072_delay-0.04s.webp
lumiere/public/frames/frame_073_delay-0.04s.webp
...
```

**Step 7 — Update frame range constants**

If your sequence starts or ends at different numbers, update `App.jsx`:

```js
const FRAME_START = 72;   // Change to your first frame number
const FRAME_END   = 244;  // Change to your last frame number
```

<br />

---

## 🎨 Tailwind Configuration

This project uses standard Tailwind CSS v3 with no custom plugins required. However, some design tokens are defined as CSS custom values inside Tailwind utility classes.

### Required `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Required `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Custom Fonts

Fonts are loaded via Google Fonts CDN inside a `<style>` tag in `App.jsx`. No additional configuration is needed:

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Josefin+Sans:wght@200;300;400;600&display=swap');
```

- **Cormorant Garamond** — all serif headings and display text
- **Josefin Sans** — all body copy, labels, buttons, and UI text

### Color Reference

The design uses a carefully considered palette. All colors are defined inline as Tailwind arbitrary values:

| Token | Value | Usage |
|-------|-------|-------|
| Gold | `#c9a96e` / `text-amber-400` | Accents, headings, icons |
| Cream | `#e8dcc8` / `text-[#e8dcc8]` | Primary body text |
| Background | `#050301` / `bg-[#050301]` | Page background |
| Glass panel | `bg-black/65` to `bg-black/70` | Frosted card backgrounds |
| Border | `border-amber-400/10` to `border-amber-400/35` | Card and section borders |

<br />

---

## ⚡ Performance

### Loading Strategy

| Phase | What Loads | When |
|-------|-----------|------|
| Priority | Frames 072–120 (hero) | Immediately on mount |
| Background | Frames 121–244 | After hero frames complete |
| Fallback | Error frames are skipped | Silently, no crashes |

### Canvas Rendering Optimizations

- Frames are drawn with `cover`-style scaling (preserves aspect ratio)
- Only redraws when `currentFrame` changes by more than `0.05`
- Canvas is sized once on mount and on resize — not every frame
- `willChange: transform` applied to animated elements

### Recommended Production Settings

```bash
# Build with optimizations
npm run build

# Preview the production build locally before deploying
npm run preview
```

For the best performance in production:
- Serve from a CDN (Vercel, Netlify, Cloudflare Pages all work perfectly)
- Enable HTTP/2 on your server — this allows the browser to load multiple `.webp` frames in parallel
- Set `Cache-Control: public, max-age=31536000, immutable` on the `/frames/` directory

<br />

---

## 🎛 Customization Guide

### Change the Restaurant Name and Content

All content is hardcoded in `App.jsx`. Search for `Lumière` to find and replace the brand name throughout.

### Change Section Colors

The gold accent color is `text-amber-400` / `border-amber-400` throughout. To change to a different accent color, do a find-and-replace of `amber-400` with any Tailwind color (e.g., `rose-400`, `sky-400`).

### Add or Remove Sections

Each section has a unique `id` and is registered in the `SECTIONS` array at the top of `App.jsx`:

```js
const SECTIONS = [
  { id: "hero",        nav: "Home" },
  { id: "story",       nav: "Our Story" },
  // Add your section here:
  { id: "gallery",     nav: "Gallery" },
];
```

Then add the corresponding `<section id="gallery">` block in the JSX.

### Adjust Animation Easing

The easing factor `0.10` controls how quickly the canvas catches up to the target frame. Higher = snappier. Lower = more lag/cinematic:

```js
// In the RAF loop inside App.jsx
currentFrameRef.current += diff * 0.10; // Change 0.10 to adjust feel
//                                ↑
//   0.05 = very slow, dreamy
//   0.10 = default, cinematic
//   0.20 = fast and responsive
//   0.35 = almost instant
```

### Adjust Overlay Darkness

To make the background brighter or darker, change the opacity values on the three persistent overlay divs in `App.jsx`:

```jsx
{/* Layer 1 — base dim: increase opacity to darken */}
<div className="fixed inset-0 z-[1] bg-[rgba(3,1,0,0.52)] pointer-events-none" />

{/* Layer 2 — radial vignette: change 0.70 to adjust edge darkness */}
<div style={{ background: "radial-gradient(ellipse at 50% 42%, transparent 28%, rgba(0,0,0,0.70) 100%)" }} />
```

<br />

---

## 🌐 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 80+ | ✅ Full | WebP + Canvas fully supported |
| Firefox 75+ | ✅ Full | WebP + Canvas fully supported |
| Safari 14+ | ✅ Full | WebP support added in Safari 14 |
| Edge 80+ | ✅ Full | Chromium-based, full support |
| Safari 13 and below | ⚠️ Partial | No WebP support — frames won't load |
| Internet Explorer | ❌ None | Not supported |

> For Safari 13 and below, consider adding a fallback using a static background image when `Image.onerror` fires for the first frame.

<br />

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.0.0",
    "vite": "^5.0.0"
  }
}
```

No additional runtime libraries are required. The entire animation engine, easing system, and scroll observer are built with native browser APIs.

<br />

---

## 🗒 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `localhost:5173` |
| `npm run build` | Build optimized production bundle to `/dist` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint (if configured) |

<br />

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Drag and drop the /dist folder to netlify.com/drop
```

### Cloudflare Pages

Connect your GitHub repository in the Cloudflare dashboard:
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node version:** `18`

> **Important:** The `/public/frames/` directory contains your WebP files. Make sure your deployment platform copies the entire `/public` folder into the output. Vite handles this automatically — the `/dist` folder will contain your frames at `/dist/frames/`.

<br />

---

## 📄 License

This project is released for personal and commercial use. Attribution appreciated but not required.

---

<br />

<div align="center">

**✦ LUMIÈRE ✦**

*Built with React · Vite · Tailwind CSS · WebP · Canvas API*

*An experience beyond taste.*

</div>