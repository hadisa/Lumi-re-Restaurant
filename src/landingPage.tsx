import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const FRAME_START  = 72;
const FRAME_END    = 244;
const TOTAL_FRAMES = FRAME_END - FRAME_START + 1;

const SECTIONS = [
  { id: "hero",        nav: "Home" },
  { id: "story",       nav: "Our Story" },
  { id: "awards",      nav: "Awards" },
  { id: "chef",        nav: "Chef" },
  { id: "dishes",      nav: "Menu" },
  { id: "wine",        nav: "Wine" },
  { id: "private",     nav: "Private" },
  { id: "press",       nav: "Press" },
  { id: "reservation", nav: "Reserve" },
];

function pad(n)       { return String(n).padStart(3, "0"); }
function framePath(n) { return `/frames/frame_${pad(n)}_delay-0.04s.webp`; }

// ─── INTERSECTION REVEAL HOOK ─────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".will-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

// ─── GOLD LINE DIVIDER ────────────────────────────────────────────────────────
function GoldLine({ vertical = false, className = "" }) {
  if (vertical) return <div className={`w-px bg-gradient-to-b from-amber-400 to-transparent ${className}`} />;
  return <div className={`h-px bg-gradient-to-r from-amber-400 to-transparent ${className}`} />;
}

// ─── LABEL ────────────────────────────────────────────────────────────────────
function Label({ children, className = "" }) {
  return (
    <p className={`font-sans text-amber-400 text-xs tracking-[0.5em] uppercase mb-5 ${className}`}>
      {children}
    </p>
  );
}

// ─── GLASS PANEL ─────────────────────────────────────────────────────────────
function Panel({ children, className = "" }) {
  return (
    <div className={`bg-black/70 backdrop-blur-xl border border-amber-400/10 ${className}`}>
      {children}
    </div>
  );
}

// ─── CORNER CARD ─────────────────────────────────────────────────────────────
function CornerCard({ children, className = "" }) {
  return (
    <div className={`relative bg-black/65 backdrop-blur-xl border border-amber-400/10 p-8 
      transition-all duration-500 hover:-translate-y-1 hover:border-amber-400/35 hover:bg-amber-400/5
      before:content-[''] before:absolute before:top-[-1px] before:left-[-1px] before:w-6 before:h-6 before:border-t before:border-l before:border-amber-400
      after:content-[''] after:absolute after:bottom-[-1px] after:right-[-1px] after:w-6 after:h-6 after:border-b after:border-r after:border-amber-400
      ${className}`}>
      {children}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const canvasRef       = useRef(null);
  const framesRef       = useRef([]);
  const loadedCountRef  = useRef(0);
  const currentFrameRef = useRef(0);
  const targetFrameRef  = useRef(0);
  const rafRef          = useRef(null);

  const [loadProgress,  setLoadProgress]  = useState(0);
  const [loaded,        setLoaded]        = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [formData,      setFormData]      = useState({ name: "", email: "", date: "", guests: "2", note: "", experience: "Dining Room" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeWine,    setActiveWine]    = useState(0);

  useReveal();

  // ── Preload ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const images = Array.from({ length: TOTAL_FRAMES }, () => new Image());
    framesRef.current = images;
    const loadFrame = (i) => new Promise((res) => {
      const img = images[i];
      const done = () => {
        loadedCountRef.current++;
        setLoadProgress(Math.round((loadedCountRef.current / TOTAL_FRAMES) * 100));
        if (loadedCountRef.current === TOTAL_FRAMES) setLoaded(true);
        res();
      };
      img.onload = done; img.onerror = done;
      img.src = framePath(FRAME_START + i);
    });
    const heroCount = 49;
    Promise.all(Array.from({ length: heroCount }, (_, i) => loadFrame(i))).then(() =>
      Array.from({ length: TOTAL_FRAMES - heroCount }, (_, i) => loadFrame(heroCount + i))
    );
  }, []);

  // ── Draw ──────────────────────────────────────────────────────────────────
  const drawFrame = useCallback((idx) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = framesRef.current[idx];
    if (!img?.complete || !img.naturalWidth) return;
    const { width: cw, height: ch } = canvas;
    const ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
    let dw, dh, dx, dy;
    if (ir > cr) { dh = ch; dw = ch * ir; dx = (cw - dw) / 2; dy = 0; }
    else          { dw = cw; dh = cw / ir; dx = 0; dy = (ch - dh) / 2; }
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
    // ★ STRONG multi-layer dark overlay
    ctx.fillStyle = "rgba(3,1,0,0.62)"; ctx.fillRect(0, 0, cw, ch);
    const radial = ctx.createRadialGradient(cw / 2, ch / 2, cw * 0.2, cw / 2, ch / 2, cw * 0.9);
    radial.addColorStop(0, "rgba(0,0,0,0)"); radial.addColorStop(1, "rgba(0,0,0,0.58)");
    ctx.fillStyle = radial; ctx.fillRect(0, 0, cw, ch);
    const btm = ctx.createLinearGradient(0, ch * 0.35, 0, ch);
    btm.addColorStop(0, "rgba(0,0,0,0)"); btm.addColorStop(1, "rgba(3,1,0,0.65)");
    ctx.fillStyle = btm; ctx.fillRect(0, 0, cw, ch);
  }, []);

  // ── RAF easing ────────────────────────────────────────────────────────────
  useEffect(() => {
    const loop = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.05) { currentFrameRef.current += diff * 0.10; drawFrame(Math.round(currentFrameRef.current)); }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawFrame]);

  // ── Resize ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current; if (!c) return;
      c.width = window.innerWidth; c.height = window.innerHeight;
      drawFrame(Math.round(currentFrameRef.current));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawFrame]);

  // ── Scroll ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const docH = document.body.scrollHeight - window.innerHeight;
      targetFrameRef.current = Math.round((window.scrollY / docH) * (TOTAL_FRAMES - 1));
      SECTIONS.forEach((s, i) => {
        const el = document.getElementById(s.id); if (!el) return;
        const { top, bottom } = el.getBoundingClientRect();
        if (top <= window.innerHeight * 0.55 && bottom >= window.innerHeight * 0.45) setActiveSection(i);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // ─── WINE DATA ────────────────────────────────────────────────────────────
  const wines = [
    [
      { name: "DRC Romanée-Conti",       region: "Vosne-Romanée",   year: "2018", price: "€4,800" },
      { name: "Henri Jayer Richebourg",   region: "Grand Cru",       year: "2012", price: "€3,200" },
      { name: "Leroy Chambertin",         region: "Grand Cru",       year: "2015", price: "€2,100" },
      { name: "Rousseau Clos St-Jacques", region: "Premier Cru",     year: "2017", price: "€680"   },
    ],
    [
      { name: "Pétrus",                   region: "Pomerol",         year: "2016", price: "€5,400" },
      { name: "Château Margaux",          region: "1er Grand Cru",   year: "2019", price: "€1,800" },
      { name: "Cheval Blanc",             region: "Saint-Émilion",   year: "2014", price: "€1,400" },
      { name: "Lynch Bages",              region: "5e Grand Cru",    year: "2018", price: "€240"   },
    ],
    [
      { name: "Krug Grande Cuvée",        region: "Blend",           year: "NV",   price: "€380"   },
      { name: "Dom Pérignon",             region: "Blanc",           year: "2013", price: "€320"   },
      { name: "Billecart-Salmon B.B.",    region: "Champagne",       year: "2015", price: "€210"   },
      { name: "Jacques Selosse Substance",region: "Blanc de Blancs", year: "NV",   price: "€580"   },
    ],
    [
      { name: "Overnoy Chardonnay",       region: "Jura",            year: "2020", price: "€160"   },
      { name: "Marcel Lapierre Morgon",   region: "Beaujolais",      year: "2021", price: "€80"    },
      { name: "Dard et Ribo Crozes",      region: "Rhône",           year: "2019", price: "€95"    },
      { name: "Cornelissen Contadino",    region: "Sicile",          year: "2022", price: "€70"    },
    ],
  ];

  return (
    <div className="bg-[#050301] text-[#e8dcc8] overflow-x-hidden">

      {/* ── GLOBAL FONT IMPORT + BASE STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Josefin+Sans:wght@200;300;400;600&display=swap');
        html { scroll-behavior: smooth; }
        body { font-family: 'Josefin Sans', sans-serif; }
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: #050301; }
        ::-webkit-scrollbar-thumb { background: #c9a96e; }
        .font-serif-custom { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-custom  { font-family: 'Josefin Sans', sans-serif; }

        /* Reveal animation */
        .will-reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.85s cubic-bezier(.22,1,.36,1), transform 0.85s cubic-bezier(.22,1,.36,1); }
        .will-reveal.is-visible { opacity: 1; transform: translateY(0); }
        .delay-100 { transition-delay: 0.1s; }
        .delay-200 { transition-delay: 0.2s; }
        .delay-300 { transition-delay: 0.3s; }
        .delay-400 { transition-delay: 0.4s; }
        .delay-500 { transition-delay: 0.5s; }

        /* Hero entrance */
        @keyframes fadeUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        .hero-title { animation: fadeUp 1.4s cubic-bezier(.22,1,.36,1) 0.15s both; }
        .hero-sub   { animation: fadeUp 1.4s cubic-bezier(.22,1,.36,1) 0.5s  both; }
        .hero-btns  { animation: fadeUp 1.2s cubic-bezier(.22,1,.36,1) 0.8s  both; }

        /* Spinner */
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-slow { animation: spin-slow 8s linear infinite; }
        .spin-slow-rev { animation: spin-slow 12s linear infinite reverse; }

        /* Pulse */
        @keyframes icon-pulse { 0%,100%{ opacity:.5; } 50%{ opacity:1; } }
        .icon-pulse { animation: icon-pulse 2.8s ease infinite; }

        /* Scroll cue */
        @keyframes scroll-fade { 0%,100%{ opacity:0; } 50%{ opacity:1; } }
        .scroll-cue { animation: fadeUp 1s ease 1.1s both; }
      `}</style>

      {/* ══════════════ LOADING SCREEN ══════════════ */}
      {!loaded && (
        <div className="fixed inset-0 z-[9999] bg-[#050301] flex flex-col items-center justify-center gap-9">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border border-amber-400/20 spin-slow" />
            <div className="absolute inset-2.5 rounded-full border border-amber-400/08 spin-slow-rev" />
            <div className="absolute inset-0 flex items-center justify-center font-serif-custom text-2xl text-amber-400 icon-pulse">✦</div>
          </div>
          <p className="font-serif-custom text-3xl tracking-[0.5em] text-amber-400 font-light">LUMIÈRE</p>
          <div className="w-52 h-px bg-amber-400/12 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent to-amber-400 transition-all duration-300 ease-out" style={{ width: `${loadProgress}%` }} />
          </div>
          <p className="font-sans-custom text-xs tracking-[0.45em] text-[#e8dcc8]/30 uppercase">
            {loadProgress < 100 ? `Preparing — ${loadProgress}%` : "Welcome"}
          </p>
        </div>
      )}

      {/* ══════════════ FIXED CANVAS ══════════════ */}
      <canvas
        ref={canvasRef}
        className={`fixed top-0 left-0 w-screen h-screen z-0 transition-opacity duration-[1200ms] ${loaded ? "opacity-100" : "opacity-0"}`}
      />

      {/* ══════════════ PERSISTENT DARK OVERLAYS ══════════════ */}
      {/* Layer 1: base dim */}
      {/* <div className="fixed inset-0 z-[1] bg-[rgba(3,1,0,0.52)] pointer-events-none" /> */}
      {/* Layer 2: radial vignette */}
      {/* <div className="fixed inset-0 z-[2] pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 42%, transparent 28%, rgba(0,0,0,0.70) 100%)" }} /> */}
      {/* Layer 3: film grain */}
      {/* <div className="fixed inset-0 z-[3] opacity-60 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.03'/%3E%3C/svg%3E")` }} /> */}

      {/* ══════════════ NAVIGATION ══════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-[200] px-14 py-6 flex items-center justify-between" style={{ background: "linear-gradient(to bottom, rgba(3,1,0,0.90) 0%, transparent 100%)" }}>
        <button onClick={() => go("hero")} className="font-serif-custom text-2xl font-light tracking-[0.42em] text-amber-400 hover:opacity-80 transition-opacity">
          LUMIÈRE
        </button>
        <div className="hidden lg:flex items-center gap-8">
          {["story", "dishes", "wine", "private", "reservation"].map((id) => {
            const s = SECTIONS.find((x) => x.id === id);
            return (
              <button key={id} onClick={() => go(id)}
                className={`font-sans-custom text-lg p-4 tracking-[0.3em] uppercase transition-all duration-300 ${SECTIONS[activeSection]?.id === id ? "text-amber-400 opacity-100" : "text-[#e8dcc8]/50 hover:text-[#e8dcc8] hover:opacity-100"}`}>
                {s?.nav}
              </button>
            );
          })}
        </div>
        <button onClick={() => go("reservation")}
          className="font-sans-custom text-xs tracking-[0.3em] uppercase px-6 py-3 border border-amber-400/40 text-amber-400 bg-amber-400/8 backdrop-blur-md hover:bg-amber-400/18 hover:border-amber-400 transition-all duration-300">
          Reserve a Table
        </button>
      </nav>

      {/* ══════════════ SIDE DOTS ══════════════ */}
      <div className="fixed left-7 top-1/2 -translate-y-1/2 z-[200] hidden lg:flex flex-col gap-4 items-center">
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => go(s.id)} title={s.nav}
            className={`h-px transition-all duration-500 border-none cursor-pointer ${i === activeSection ? "w-7 bg-amber-400" : "w-3 bg-[#e8dcc8]/18 hover:bg-[#e8dcc8]/40"}`} />
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          §1  HERO
      ══════════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative z-10 h-screen flex flex-col justify-end px-16 pb-[12vh]">
        {/* Bottom-up dark ramp */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(3,1,0,0.92) 0%, rgba(3,1,0,0.28) 55%, transparent 100%)" }} />

        <div className="relative max-w-5xl">
          <p className="font-sans-custom text-xs tracking-[0.65em] text-amber-400 uppercase mb-6" style={{ animation: "fadeUp 1s ease 0.05s both" }}>
            Est. 2018 — 12 Rue de la Paix, Paris
          </p>

          <h1 className="hero-title font-serif-custom font-light leading-[0.95] text-[#e8dcc8]" style={{ fontSize: "clamp(64px, 10vw, 148px)" }}>
            An Experience<br />
            <em className="text-amber-400">Beyond</em> Taste
          </h1>

          <p className="hero-sub font-sans-custom text-lg tracking-[0.15em] leading-relaxed text-[#e8dcc8]/72 max-w-xl mt-8">
            Where culinary artistry meets the poetry of the table — a journey through flavour, texture, and memory at the heart of Paris.
          </p>

          <div className="hero-btns flex flex-wrap gap-5 mt-12">
            <button onClick={() => go("reservation")}
              className="font-sans-custom text-sm tracking-[0.3em] uppercase px-10 py-5 bg-amber-400/88 text-[#050301] font-semibold hover:bg-amber-400 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(201,169,110,0.3)]">
              Reserve Your Table
            </button>
            <button onClick={() => go("dishes")}
              className="font-sans-custom text-sm tracking-[0.3em] uppercase px-10 py-5 border border-amber-400/42 text-amber-400 bg-amber-400/7 backdrop-blur-md hover:bg-amber-400/18 hover:border-amber-400 transition-all duration-300 hover:-translate-y-0.5">
              Explore the Menu →
            </button>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="scroll-cue absolute bottom-10 right-14 flex flex-col items-center gap-3">
          <span className="font-sans-custom text-[10px] tracking-[0.5em] text-[#e8dcc8]/30 uppercase [writing-mode:vertical-rl]">Scroll</span>
          <div className="w-px h-16 bg-gradient-to-b from-amber-400 to-transparent" />
        </div>
      </section>

      <div className="relative z-10 h-[22vh]" />

      {/* ══════════════════════════════════════════════════════════════
          §2  OUR STORY
      ══════════════════════════════════════════════════════════════ */}
      <section id="story" className="relative z-10 py-[14vh] px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-start">

            {/* Left */}
            <div>
              <Label className="will-reveal">02 — Our Story</Label>
              <h2 className="will-reveal delay-100 font-serif-custom font-light leading-[1.06] text-[#e8dcc8] mb-8" style={{ fontSize: "clamp(42px, 5.5vw, 80px)" }}>
                Born from a<br /><em className="text-amber-400">Singular Vision</em>
              </h2>
              <GoldLine className="will-reveal delay-200 w-20 mb-10" />
              <div className="will-reveal delay-300 flex flex-wrap gap-12">
                {[["18", "Years of Craft"], ["3", "Michelin Stars"], ["47", "Seasonal Suppliers"]].map(([n, l]) => (
                  <div key={l}>
                    <div className="font-serif-custom text-6xl font-light text-amber-400 leading-none">{n}</div>
                    <div className="font-sans-custom text-sm tracking-[0.22em] text-[#e8dcc8]/42 mt-2 uppercase">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <Panel className="p-12">
              <p className="will-reveal font-sans-custom text-base leading-[2.1] text-[#e8dcc8]/76 mb-6 tracking-wide">
                At Lumière, we believe that the finest meal is not merely consumed — it is lived. Chef Élise Moreau, trained in the kitchens of Lyon and Tokyo, returns to the elemental truth that flavour is memory made tangible.
              </p>
              <p className="will-reveal delay-100 font-sans-custom text-base leading-[2.1] text-[#e8dcc8]/62 tracking-wide">
                Our menus shift with the seasons, sourced from growers who share our obsession with provenance. Each plate is a conversation between land, sea, and the quiet patience of craft. Nothing is rushed. Everything is intentional.
              </p>
            </Panel>
          </div>

          {/* Quote */}
          <Panel className="will-reveal mt-16 py-14 px-16 text-center">
            <p className="font-serif-custom font-light italic leading-relaxed text-[#e8dcc8] mx-auto" style={{ fontSize: "clamp(20px, 3vw, 38px)", maxWidth: "700px" }}>
              "The table is where we remember who we are —<br />and who we wish to become."
            </p>
            <p className="font-sans-custom text-sm tracking-[0.48em] text-amber-400 mt-6 uppercase">— Chef Élise Moreau</p>
          </Panel>
        </div>
      </section>

      <div className="relative z-10 h-[18vh]" />

      {/* ══════════════════════════════════════════════════════════════
          §3  AWARDS
      ══════════════════════════════════════════════════════════════ */}
      <section id="awards" className="relative z-10 py-[14vh] px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Label className="will-reveal">03 — Recognition</Label>
            <h2 className="will-reveal delay-100 font-serif-custom font-light" style={{ fontSize: "clamp(40px, 4.5vw, 72px)" }}>
              Awarded <em className="text-amber-400">Excellence</em>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px">
            {[
              { icon: "✦✦✦", title: "Michelin Stars",    body: "Three consecutive stars since 2020 — recognition for technical mastery and singular vision.", year: "2020–2024" },
              { icon: "◈",   title: "World's 50 Best",   body: "Ranked #7 globally, the only French restaurant in the top ten of this prestigious annual list.", year: "2023" },
              { icon: "◇",   title: "Wine Spectator",    body: "Grand Award — one of only 100 restaurants worldwide to earn this cellar distinction.", year: "2022" },
              { icon: "✧",   title: "Forbes Five Stars", body: "Five stars across service, cuisine, ambiance and experience by Forbes Travel Guide.", year: "2021–2024" },
            ].map((a, i) => (
              <div key={i} className={`will-reveal delay-${(i + 1) * 100} bg-black/68 backdrop-blur-xl border border-amber-400/10 p-10 text-center hover:border-amber-400/32 transition-all duration-400 hover:-translate-y-1`}>
                <div className="font-serif-custom text-4xl text-amber-400 mb-5 icon-pulse" style={{ animationDelay: `${i * 0.5}s` }}>{a.icon}</div>
                <div className="font-sans-custom text-sm tracking-[0.35em] text-amber-400 mb-4 uppercase">{a.year}</div>
                <div className="font-serif-custom text-2xl italic font-light mb-4">{a.title}</div>
                <p className="font-sans-custom text-sm leading-relaxed text-[#e8dcc8]/52 tracking-wide">{a.body}</p>
              </div>
            ))}
          </div>

          {/* Press strip */}
          <Panel className="will-reveal mt-12 py-7 px-12 flex flex-wrap justify-center items-center gap-12">
            {["Le Monde", "Le Figaro", "Vogue Paris", "The Guardian", "New York Times", "Bon Appétit"].map((p) => (
              <span key={p} className="font-sans-custom text-sm tracking-[0.3em] text-[#e8dcc8]/28 uppercase">{p}</span>
            ))}
          </Panel>
        </div>
      </section>

      <div className="relative z-10 h-[18vh]" />

      {/* ══════════════════════════════════════════════════════════════
          §4  MEET THE CHEF
      ══════════════════════════════════════════════════════════════ */}
      <section id="chef" className="relative z-10 py-[14vh] px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* Portrait placeholder */}
            <div className="will-reveal relative" style={{ aspectRatio: "3/4" }}>
              <div className="absolute inset-0 bg-amber-400/3 border border-amber-400/12 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-serif-custom text-8xl text-amber-400/10 leading-none">✦</div>
                  <div className="font-sans-custom text-xs tracking-[0.45em] text-[#e8dcc8]/20 mt-4 uppercase">Chef Portrait</div>
                </div>
              </div>
              {/* Corners */}
              {[
                "top-0 left-0 border-t border-l",
                "top-0 right-0 border-t border-r",
                "bottom-0 left-0 border-b border-l",
                "bottom-0 right-0 border-b border-r",
              ].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 border-amber-400 ${cls}`} />
              ))}
            </div>

            {/* Bio */}
            <div>
              <Label className="will-reveal">04 — Culinary Director</Label>
              <h2 className="will-reveal delay-100 font-serif-custom font-light leading-[1.08]" style={{ fontSize: "clamp(40px, 4.5vw, 72px)" }}>
                Chef<br /><em className="text-amber-400">Élise Moreau</em>
              </h2>
              <GoldLine className="will-reveal delay-200 w-20 mt-6 mb-8" />
              <p className="will-reveal delay-200 font-sans-custom text-base leading-[2.1] text-[#e8dcc8]/72 mb-5 tracking-wide">
                Élise began her career at sixteen in her grandmother's kitchen in Lyon. By thirty she had earned her first Michelin star. A decade in Tokyo with kaiseki masters transformed her understanding of restraint, seasonality, and the art of the single perfect bite.
              </p>
              <p className="will-reveal delay-300 font-sans-custom text-base leading-[2.1] text-[#e8dcc8]/58 mb-10 tracking-wide">
                She founded Lumière in 2018 with a single mandate: that every guest should leave transformed — not full, but awake to something.
              </p>

              <div className="will-reveal delay-400 grid grid-cols-2 gap-5">
                {[
                  ["Training",    "Institut Paul Bocuse, Lyon\nNishida Kitchen, Tokyo"],
                  ["Philosophy",  "French rigour × Japanese soul"],
                  ["Signature",   "Minimalism with maximum depth"],
                  ["Accolades",   "3× Michelin · Grand Chef Relais"],
                ].map(([k, v]) => (
                  <div key={k} className="border-l border-amber-400/25 pl-4">
                    <div className="font-sans-custom text-xs tracking-[0.4em] text-amber-400 mb-2 uppercase">{k}</div>
                    <div className="font-sans-custom text-sm leading-relaxed text-[#e8dcc8]/62 tracking-wide whitespace-pre-line">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 h-[18vh]" />

      {/* ══════════════════════════════════════════════════════════════
          §5  SIGNATURE DISHES
      ══════════════════════════════════════════════════════════════ */}
      <section id="dishes" className="relative z-10 py-[14vh] px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Label className="will-reveal">05 — Menu de Dégustation</Label>
            <h2 className="will-reveal delay-100 font-serif-custom font-light" style={{ fontSize: "clamp(40px, 5vw, 76px)" }}>
              The <em className="text-amber-400">Tasting</em> Journey
            </h2>
            <GoldLine vertical className="will-reveal delay-200 h-14 mx-auto mt-7" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px">
            {[
              { num: "I",   name: "Caviar en Neige",     desc: "Oscietra caviar, frozen crème fraîche, micro herbs, warm buckwheat blini",                price: "€85",  tag: "Amuse-Bouche"  },
              { num: "II",  name: "Saint-Jacques Rôties", desc: "Hand-dived scallops, celeriac velouté, truffle oil, crispy capers",                        price: "€68",  tag: "Entrée"         },
              { num: "III", name: "Pigeon de Bresse",     desc: "Bresse pigeon, wild mushroom duxelles, Périgourdine sauce, pomme dauphine",                price: "€94",  tag: "Plat Principal" },
              { num: "IV",  name: "Foie Gras Torchon",    desc: "Duck foie gras, Sauternes gelée, brioche toastée, seasonal fruit condiment",               price: "€72",  tag: "Entrée Chaude"  },
              { num: "V",   name: "Homard Bleu",           desc: "Brittany lobster, coral bisque, tarragon butter, sea vegetables",                          price: "€110", tag: "Plat de la Mer" },
              { num: "VI",  name: "Soufflé au Chocolat",   desc: "Grand Cru Valrhona soufflé, single-origin ice cream, praline veil",                        price: "€34",  tag: "Dessert"        },
            ].map((d, i) => (
              <CornerCard key={i} className={`will-reveal delay-${((i % 3) + 1) * 100}`}>
                <div className="flex justify-between items-start mb-5">
                  <span className="font-serif-custom text-5xl font-light text-amber-400/20 leading-none">{d.num}</span>
                  <span className="font-sans-custom text-xs tracking-[0.3em] text-amber-400 uppercase">{d.tag}</span>
                </div>
                <h3 className="font-serif-custom text-2xl italic font-light mb-3">{d.name}</h3>
                <p className="font-sans-custom text-sm leading-relaxed text-[#e8dcc8]/50 tracking-wide mb-6">{d.desc}</p>
                <div className="font-serif-custom text-2xl text-amber-400 font-light">{d.price}</div>
              </CornerCard>
            ))}
          </div>

          <Panel className="will-reveal mt-12 p-10 flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="font-sans-custom text-sm tracking-[0.4em] text-amber-400 mb-2 uppercase">Full Tasting Menu</div>
              <div className="font-serif-custom text-2xl font-light">
                7 courses · <em className="text-amber-400">€185</em> per person &nbsp;·&nbsp; Wine pairing <em className="text-amber-400">+€95</em>
              </div>
            </div>
            <button onClick={() => go("reservation")}
              className="font-sans-custom text-sm tracking-[0.3em] uppercase px-8 py-4 border border-amber-400/42 text-amber-400 bg-amber-400/7 backdrop-blur-md hover:bg-amber-400/18 hover:border-amber-400 transition-all duration-300">
              Reserve for This Evening →
            </button>
          </Panel>
        </div>
      </section>

      <div className="relative z-10 h-[18vh]" />

      {/* ══════════════════════════════════════════════════════════════
          §6  WINE CELLAR
      ══════════════════════════════════════════════════════════════ */}
      <section id="wine" className="relative z-10 py-[14vh] px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-start">

            {/* Left */}
            <div>
              <Label className="will-reveal">06 — La Cave</Label>
              <h2 className="will-reveal delay-100 font-serif-custom font-light leading-[1.08] mb-6" style={{ fontSize: "clamp(38px, 4.5vw, 70px)" }}>
                An Extraordinary<br /><em className="text-amber-400">Wine Cellar</em>
              </h2>
              <p className="will-reveal delay-200 font-sans-custom text-base leading-[2.1] text-[#e8dcc8]/68 mb-10 tracking-wide">
                Our cellar of 4,200 references spans six decades of Burgundian Pinots, Bordeaux first growths, rare Rhône bottles, and an exceptional collection of natural wines curated personally by Sommelier Jean-Baptiste Hurel.
              </p>
              <div className="will-reveal delay-300 grid grid-cols-2 gap-4">
                {[["4,200", "References"], ["62", "Vintage Years"], ["340", "Natural Wines"], ["18", "Champagne Houses"]].map(([n, l]) => (
                  <Panel key={l} className="p-6">
                    <div className="font-serif-custom text-4xl font-light text-amber-400 leading-none">{n}</div>
                    <div className="font-sans-custom text-sm tracking-[0.24em] text-[#e8dcc8]/42 mt-2 uppercase">{l}</div>
                  </Panel>
                ))}
              </div>
            </div>

            {/* Right — Wine list */}
            <Panel className="p-10">
              {/* Tabs */}
              <div className="flex flex-wrap gap-7 border-b border-amber-400/10 mb-8">
                {["Burgundy", "Bordeaux", "Champagne", "Natural"].map((tab, i) => (
                  <button key={tab} onClick={() => setActiveWine(i)}
                    className={`font-sans-custom text-sm tracking-[0.3em] uppercase pb-3 border-b transition-all duration-300 ${activeWine === i ? "text-amber-400 border-amber-400" : "text-[#e8dcc8]/45 border-transparent hover:text-[#e8dcc8]/70"}`}>
                    {tab}
                  </button>
                ))}
              </div>

              {wines[activeWine].map((w, i) => (
                <div key={i} className="flex justify-between items-center py-5 border-b border-amber-400/8 last:border-0">
                  <div>
                    <div className="font-serif-custom text-xl font-light mb-1">{w.name}</div>
                    <div className="font-sans-custom text-sm tracking-[0.28em] text-[#e8dcc8]/38 uppercase">{w.region} · {w.year}</div>
                  </div>
                  <div className="font-serif-custom text-xl text-amber-400 font-light pl-6 whitespace-nowrap">{w.price}</div>
                </div>
              ))}

              <button onClick={() => go("reservation")}
                className="w-full mt-8 font-sans-custom text-sm tracking-[0.3em] uppercase py-4 border border-amber-400/42 text-amber-400 bg-amber-400/7 hover:bg-amber-400/18 hover:border-amber-400 transition-all duration-300">
                Request Sommelier Pairing
              </button>
            </Panel>
          </div>
        </div>
      </section>

      <div className="relative z-10 h-[18vh]" />

      {/* ══════════════════════════════════════════════════════════════
          §7  PRIVATE DINING
      ══════════════════════════════════════════════════════════════ */}
      <section id="private" className="relative z-10 py-[14vh] px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Label className="will-reveal">07 — Private Experiences</Label>
            <h2 className="will-reveal delay-100 font-serif-custom font-light" style={{ fontSize: "clamp(38px, 4.5vw, 70px)" }}>
              Beyond the <em className="text-amber-400">Dining Room</em>
            </h2>
            <p className="will-reveal delay-200 font-sans-custom text-base tracking-[0.16em] leading-relaxed text-[#e8dcc8]/55 max-w-xl mx-auto mt-6">
              From intimate celebrations to immersive culinary retreats — Lumière offers bespoke experiences for those who seek the extraordinary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px">
            {[
              { icon: "◈", title: "Salon Privé",        sub: "Up to 14 guests", desc: "Our intimate private room with personal chef table, dedicated sommelier, and a menu curated around your history.", price: "From €360 pp" },
              { icon: "✦", title: "Chef's Table",        sub: "Up to 8 guests",  desc: "Dine in the heart of the kitchen. Watch as Chef Élise composes each course — an unfiltered view into culinary craft.", price: "From €420 pp" },
              { icon: "◇", title: "Cave Particulière",   sub: "Up to 6 guests",  desc: "A unique evening beneath the original stone vaults of our cellar. A vertical tasting dinner, curated by our Sommelier.", price: "From €580 pp" },
              { icon: "∞", title: "Culinary Journey",    sub: "Up to 12 guests", desc: "A full-day experience: market visit at dawn, kitchen workshop with the brigade, followed by a bespoke eight-course dinner.", price: "From €680 pp" },
              { icon: "✧", title: "Celebration Package", sub: "Up to 20 guests", desc: "Birthdays, proposals, anniversaries — let us design a flawless evening with menus, floristry, and gifts.", price: "From €280 pp" },
              { icon: "⬡", title: "Corporate Dining",    sub: "Up to 30 guests", desc: "Entertain clients or reward your team with an evening that speaks louder than any boardroom. Discreet, impeccable.", price: "From €240 pp" },
            ].map((p, i) => (
              <CornerCard key={i} className={`will-reveal delay-${((i % 3) + 1) * 100}`}>
                <div className="font-serif-custom text-3xl text-amber-400/72 mb-5">{p.icon}</div>
                <div className="font-sans-custom text-xs tracking-[0.35em] text-[#e8dcc8]/35 mb-2 uppercase">{p.sub}</div>
                <h3 className="font-serif-custom text-2xl italic font-light mb-3">{p.title}</h3>
                <p className="font-sans-custom text-sm leading-relaxed text-[#e8dcc8]/50 tracking-wide mb-5">{p.desc}</p>
                <div className="font-serif-custom text-xl text-amber-400">{p.price}</div>
              </CornerCard>
            ))}
          </div>

          <div className="text-center mt-14">
            <button onClick={() => go("reservation")}
              className="will-reveal font-sans-custom text-sm tracking-[0.3em] uppercase px-10 py-5 border border-amber-400/42 text-amber-400 bg-amber-400/7 backdrop-blur-md hover:bg-amber-400/18 hover:border-amber-400 transition-all duration-300">
              Enquire About Private Events
            </button>
          </div>
        </div>
      </section>

      <div className="relative z-10 h-[18vh]" />

      {/* ══════════════════════════════════════════════════════════════
          §8  PRESS & TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <section id="press" className="relative z-10 py-[14vh] px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Label className="will-reveal">08 — Press & Voices</Label>
            <h2 className="will-reveal delay-100 font-serif-custom font-light" style={{ fontSize: "clamp(38px, 4.5vw, 70px)" }}>
              What the World <em className="text-amber-400">Says</em>
            </h2>
          </div>

          {/* Press quotes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px mb-px">
            {[
              { quote: "A meal at Lumière is not a restaurant experience. It is a private conversation between a chef and your deepest memories of pleasure.",  source: "Le Monde" },
              { quote: "Moreau has constructed something rare: a cuisine that is simultaneously radical and deeply comforting. An achievement of a lifetime.",    source: "The Guardian" },
              { quote: "The greatest restaurant in France is also its most quietly revolutionary. Every detail is a choice, and every choice is correct.",          source: "Bon Appétit" },
            ].map((q, i) => (
              <div key={i} className={`will-reveal delay-${(i + 1) * 100} bg-black/65 backdrop-blur-xl border border-amber-400/10 p-10 hover:border-amber-400/28 transition-all duration-400`}>
                <div className="font-serif-custom text-5xl text-amber-400/22 leading-none mb-5">"</div>
                <p className="font-serif-custom text-xl italic leading-relaxed text-[#e8dcc8]/80 mb-7">{q.quote}</p>
                <div className="font-sans-custom text-sm tracking-[0.35em] text-amber-400 uppercase">{q.source}</div>
              </div>
            ))}
          </div>

          {/* Guest testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px">
            {[
              { quote: "We celebrated our tenth anniversary at Lumière. I have never seen my wife cry tears of joy over food before that evening. We return every year.", name: "James & Sophie R.", city: "London" },
              { quote: "As a chef myself, I expected to be critical. Instead I was humbled. This is cooking at a level I aspire to — and may never reach.",               name: "Marco T.",          city: "Milan" },
              { quote: "The chef's table was the most memorable evening of my professional life. I came for dinner and left with a philosophy.",                           name: "Dr. Amara F.",      city: "New York" },
              { quote: "From the moment you are greeted at the door, every second is choreographed without feeling staged. That is the miracle of this place.",           name: "Yuki & Takeshi N.", city: "Tokyo" },
            ].map((t, i) => (
              <div key={i} className={`will-reveal delay-${((i % 2) + 1) * 100} bg-black/65 backdrop-blur-xl border border-amber-400/10 p-10 hover:border-amber-400/28 transition-all duration-400`}>
                <div className="flex gap-1 mb-5">{[1, 2, 3, 4, 5].map((s) => <span key={s} className="text-amber-400 text-base">★</span>)}</div>
                <p className="font-serif-custom text-xl italic leading-relaxed text-[#e8dcc8]/75 mb-6">"{t.quote}"</p>
                <div className="font-sans-custom text-sm tracking-[0.28em] text-[#e8dcc8]/55">{t.name}</div>
                <div className="font-sans-custom text-xs tracking-[0.24em] text-[#e8dcc8]/28 mt-1">{t.city}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10 h-[18vh]" />

      {/* ══════════════════════════════════════════════════════════════
          §9  RESERVATION
      ══════════════════════════════════════════════════════════════ */}
      <section id="reservation" className="relative z-10 py-[14vh] pb-[20vh] px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-start">

            {/* Left */}
            <div>
              <Label className="will-reveal">09 — Réservation</Label>
              <h2 className="will-reveal delay-100 font-serif-custom font-light leading-[1.08] mb-8" style={{ fontSize: "clamp(40px, 4.5vw, 72px)" }}>
                Reserve Your<br /><em className="text-amber-400">Evening</em>
              </h2>
              <p className="will-reveal delay-200 font-sans-custom text-base leading-[2.1] text-[#e8dcc8]/62 mb-12 tracking-wide">
                Tables are limited — each service is curated for intimacy and perfection. We invite you to join us for an evening unlike any other.
              </p>

              {[
                ["Hours",   "Tuesday – Saturday · 19:00 – 22:30\nSunday Lunch · 12:00 – 15:00"],
                ["Address", "12 Rue de la Paix, 75002 Paris\nNear Opéra · Valet available"],
                ["Contact", "+33 1 42 68 50 00\nreservations@lumiere.paris"],
                ["Dress",   "Smart elegant attire requested\nJacket preferred for gentlemen"],
              ].map(([t, v], i) => (
                <div key={t} className={`will-reveal delay-${(i + 1) * 100} mb-7 pb-7 border-b border-amber-400/9`}>
                  <div className="font-sans-custom text-xs tracking-[0.45em] text-amber-400 mb-2 uppercase">{t}</div>
                  <div className="font-sans-custom text-sm leading-relaxed text-[#e8dcc8]/65 whitespace-pre-line tracking-wide">{v}</div>
                </div>
              ))}
            </div>

            {/* Form */}
            <Panel className="will-reveal p-12">
              {formSubmitted ? (
                <div className="text-center py-20">
                  <div className="font-serif-custom text-7xl text-amber-400 mb-6 icon-pulse">✦</div>
                  <h3 className="font-serif-custom text-3xl font-light mb-4">Reservation Received</h3>
                  <p className="font-sans-custom text-base tracking-[0.14em] text-[#e8dcc8]/58 leading-relaxed">
                    A confirmation has been sent to<br />
                    <em className="text-amber-400 not-italic">{formData.email}</em>.<br /><br />
                    We look forward to welcoming you to Lumière.
                  </p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }}>
                  <h3 className="font-serif-custom text-3xl font-light italic mb-8">Make a Reservation</h3>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="font-sans-custom text-xs tracking-[0.38em] text-amber-400 block mb-2 uppercase">Full Name</label>
                      <input type="text" placeholder="Your name" required
                        className="w-full bg-white/4 border border-amber-400/22 text-[#e8dcc8] font-sans-custom text-sm tracking-wide px-4 py-3.5 outline-none focus:border-amber-400 focus:bg-amber-400/4 transition-all duration-300 placeholder:text-[#e8dcc8]/25 placeholder:uppercase placeholder:tracking-widest placeholder:text-xs"
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="font-sans-custom text-xs tracking-[0.38em] text-amber-400 block mb-2 uppercase">Guests</label>
                      <select value={formData.guests} onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        className="w-full bg-white/4 border border-amber-400/22 text-[#e8dcc8] font-sans-custom text-sm tracking-wide px-4 py-3.5 outline-none focus:border-amber-400 transition-all duration-300 appearance-none cursor-pointer" style={{ background: "rgba(255,255,255,0.04)" }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} style={{ background: "#120e08" }}>{n} Guest{n > 1 ? "s" : ""}</option>)}
                      </select>
                    </div>
                  </div>

                  {[
                    { label: "Email Address", type: "email",         key: "email", ph: "your@email.com" },
                  ].map(({ label, type, key, ph }) => (
                    <div key={key} className="mb-3">
                      <label className="font-sans-custom text-xs tracking-[0.38em] text-amber-400 block mb-2 uppercase">{label}</label>
                      <input type={type} placeholder={ph} required
                        className="w-full bg-white/4 border border-amber-400/22 text-[#e8dcc8] font-sans-custom text-sm tracking-wide px-4 py-3.5 outline-none focus:border-amber-400 focus:bg-amber-400/4 transition-all duration-300 placeholder:text-[#e8dcc8]/25 placeholder:uppercase placeholder:tracking-widest placeholder:text-xs"
                        value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} />
                    </div>
                  ))}

                  <div className="mb-3">
                    <label className="font-sans-custom text-xs tracking-[0.38em] text-amber-400 block mb-2 uppercase">Preferred Date & Time</label>
                    <input type="datetime-local" required style={{ colorScheme: "dark" }}
                      className="w-full bg-white/4 border border-amber-400/22 text-[#e8dcc8] font-sans-custom text-sm tracking-wide px-4 py-3.5 outline-none focus:border-amber-400 transition-all duration-300"
                      value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  </div>

                  <div className="mb-3">
                    <label className="font-sans-custom text-xs tracking-[0.38em] text-amber-400 block mb-2 uppercase">Special Requests</label>
                    <textarea rows={3} placeholder="Allergies, occasions, dietary needs..."
                      className="w-full bg-white/4 border border-amber-400/22 text-[#e8dcc8] font-sans-custom text-sm tracking-wide px-4 py-3.5 outline-none focus:border-amber-400 focus:bg-amber-400/4 transition-all duration-300 resize-none placeholder:text-[#e8dcc8]/25 placeholder:uppercase placeholder:tracking-widest placeholder:text-xs"
                      value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
                  </div>

                  {/* Experience selector */}
                  <div className="mb-7 p-4 bg-amber-400/4 border border-amber-400/10">
                    <div className="font-sans-custom text-xs tracking-[0.38em] text-amber-400 mb-4 uppercase">Experience</div>
                    <div className="flex flex-wrap gap-3">
                      {["Dining Room", "Chef's Table", "Salon Privé", "Cave Particulière"].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="exp" value={opt} checked={formData.experience === opt}
                            onChange={() => setFormData({ ...formData, experience: opt })}
                            className="accent-amber-400" />
                          <span className="font-sans-custom text-sm tracking-wide text-[#e8dcc8]/58">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button type="submit"
                    className="w-full font-sans-custom text-sm tracking-[0.3em] uppercase py-5 bg-amber-400/88 text-[#050301] font-semibold hover:bg-amber-400 transition-all duration-300 hover:-translate-y-0.5">
                    Confirm Reservation
                  </button>
                  <p className="font-sans-custom text-xs tracking-[0.14em] text-[#e8dcc8]/26 mt-5 text-center leading-relaxed">
                    48-hour cancellation policy applies.<br />For parties of 7+, please telephone directly.
                  </p>
                </form>
              )}
            </Panel>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="relative z-10 border-t border-amber-400/9 bg-[rgba(3,1,0,0.94)] backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-16 pt-16 pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1">
              <div className="font-serif-custom text-3xl tracking-[0.42em] text-amber-400 font-light mb-5">LUMIÈRE</div>
              <p className="font-sans-custom text-sm leading-relaxed text-[#e8dcc8]/40 tracking-wide max-w-[240px] mb-7">
                A three-Michelin-star restaurant at the heart of Paris. An experience beyond taste.
              </p>
              <div className="flex gap-3">
                {["IG", "FB", "TW"].map((s) => (
                  <button key={s}
                    className="font-sans-custom text-xs tracking-[0.28em] px-4 py-2.5 border border-amber-400/38 text-amber-400 bg-amber-400/6 hover:bg-amber-400/16 transition-all duration-300">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {[
              ["Navigate",  ["Home", "Our Story", "Awards", "Chef", "Menu", "Wine", "Private", "Press", "Reserve"]],
              ["Visit",     ["Tues–Sat 19:00–22:30", "Sunday Lunch 12:00", "12 Rue de la Paix", "75002 Paris", "Valet Available"]],
              ["Contact",   ["+33 1 42 68 50 00", "reservations@lumiere.paris", "Private Events", "Gift Certificates", "Press & Media"]],
            ].map(([h, items]) => (
              <div key={h}>
                <div className="font-sans-custom text-xs tracking-[0.46em] text-amber-400 mb-5 uppercase">{h}</div>
                {(items as string[]).map((item) => (
                  <div key={item}
                    className="font-sans-custom text-sm leading-[2.25] text-[#e8dcc8]/34 tracking-wide cursor-pointer hover:text-amber-400/78 transition-colors duration-200">{item}</div>
                ))}
              </div>
            ))}
          </div>

          <div className="border-t border-amber-400/7 pt-6 flex flex-wrap justify-between items-center gap-4">
            <div className="font-sans-custom text-sm tracking-[0.2em] text-[#e8dcc8]/22">© 2024 LUMIÈRE PARIS. ALL RIGHTS RESERVED.</div>
            <div className="flex gap-8">
              {["Privacy", "Terms", "Accessibility"].map((l) => (
                <span key={l} className="font-sans-custom text-sm tracking-[0.2em] text-[#e8dcc8]/22 cursor-pointer hover:text-amber-400 transition-colors duration-200">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}