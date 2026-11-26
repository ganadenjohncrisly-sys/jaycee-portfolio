import { useEffect, useRef, useState } from "react";
import portrait from "@/assets/portrait.jpg";
import { sound } from "@/lib/sound";
import { CountUp, Magnetic, Reveal, Scramble, SplitLines, Tilt, Timecode, useSoundOn } from "./fx";

const EMAIL = "ganadenjohncrisly@gmail.com";

/* ───────── Loader ───────── */
export function Loader({ onEnter }: { onEnter: () => void }) {
  const [p, setP] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const msgs = ["CALIBRATING LENS · 24MM", "SETTING WHITE BALANCE · 5600K", "SYNCING VISUALS", "FOCUS LOCKED"];
  useEffect(() => {
    let v = 0;
    const id = setInterval(() => { v = Math.min(100, v + Math.random() * 7 + 1); setP(Math.floor(v)); if (v >= 100) clearInterval(id); }, 70);
    return () => clearInterval(id);
  }, []);
  const ready = p >= 100;
  const enter = (withSound: boolean) => {
    if (!ready || leaving) return;
    if (withSound) { sound.setEnabled(true); sound.shutter(); setTimeout(() => sound.boot(), 250); }
    setLeaving(true);
    setTimeout(onEnter, 900);
  };
  const C = 2 * Math.PI * 120;
  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-background scanlines ${leaving ? "shutter-out" : ""}`}>
      <div className="absolute left-1/2 top-1/2 size-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 aurora" />
      <Corners />
      <div className="absolute left-6 top-6 flex items-center gap-2 font-mono text-[11px] tracking-widest md:left-16 md:top-16">
        <span className="size-2 rounded-full bg-rec blink" /> REC
      </div>
      <div className="absolute right-6 top-6 font-mono text-[11px] tracking-widest text-muted-foreground md:right-16 md:top-16">ISO 400 · f/1.8</div>
      <div className="absolute bottom-6 left-6 font-mono text-[11px] tracking-widest text-muted-foreground md:bottom-16 md:left-16"><Timecode /></div>
      <div className="absolute bottom-6 right-6 font-mono text-[11px] tracking-widest text-muted-foreground md:bottom-16 md:right-16">4K · 24FPS</div>

      <div className="relative flex flex-col items-center">
        <button onClick={() => enter(true)} className="group relative size-64 md:size-72" aria-label="Enter with sound">
          <svg viewBox="0 0 280 280" className="absolute inset-0 size-full -rotate-90">
            <circle cx="140" cy="140" r="120" fill="none" stroke="currentColor" className="text-border" strokeWidth="2" />
            <circle cx="140" cy="140" r="120" fill="none" stroke="url(#g)" strokeWidth="3" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p / 100)} style={{ transition: "stroke-dashoffset .2s" }} />
            <circle cx="140" cy="140" r="100" fill="none" stroke="currentColor" className="text-primary/30 origin-center spin-slow" strokeDasharray="2 8" />
            <defs><linearGradient id="g"><stop offset="0" stopColor="oklch(0.86 0.15 85)" /><stop offset="1" stopColor="oklch(0.66 0.19 40)" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {ready ? (
              <>
                <span className="font-display text-2xl font-bold tracking-tight transition-transform group-hover:scale-110">◉ Enter</span>
                <span className="eyebrow mt-2">tap to roll</span>
              </>
            ) : (
              <>
                <span className="font-display text-7xl font-extrabold text-gold tabular-nums">{p}</span>
                <span className="eyebrow mt-1">percent</span>
              </>
            )}
          </div>
          {ready && <span className="absolute inset-0 rounded-full glow-gold animate-pulse" />}
        </button>
        <p className="mt-10 font-mono text-[11px] tracking-[0.35em] text-primary">{msgs[Math.min(3, Math.floor(p / 26))]}<span className="blink">_</span></p>
        <div className={`mt-6 flex flex-col items-center gap-3 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}>
          <p className="text-xs text-muted-foreground">🔊 Sound on for the full experience</p>
          <button onClick={() => enter(false)} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">enter silently</button>
        </div>
      </div>
    </div>
  );
}

function Corners() {
  const c = "absolute size-8 border-primary md:size-10";
  return (
    <>
      <span className={`${c} left-3 top-3 border-l-2 border-t-2 md:left-10 md:top-10`} />
      <span className={`${c} right-3 top-3 border-r-2 border-t-2 md:right-10 md:top-10`} />
      <span className={`${c} bottom-3 left-3 border-b-2 border-l-2 md:bottom-10 md:left-10`} />
      <span className={`${c} bottom-3 right-3 border-b-2 border-r-2 md:bottom-10 md:right-10`} />
    </>
  );
}

/* ───────── Nav ───────── */
const NAV = [["01", "About", "#about"], ["02", "Tools", "#tools"], ["03", "Work", "#work"], ["04", "Journey", "#journey"], ["05", "Contact", "#contact"]] as const;

export function SoundToggle() {
  const on = useSoundOn();
  return (
    <button onClick={() => { sound.toggle(); setTimeout(() => sound.click(), 30); }} data-cursor={on ? "mute" : "sound"} aria-label="Toggle sound"
      className="glass flex h-11 items-center gap-2 rounded-full px-4 font-mono text-[10px] uppercase tracking-widest">
      <span className="flex h-4 items-end gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="w-[2px] rounded-full bg-primary" style={{ height: on ? undefined : 3, animation: on ? `eq ${0.5 + i * 0.15}s ease-in-out ${i * 0.1}s infinite alternate` : "none" }} />
        ))}
      </span>
      {on ? "On" : "Off"}
      <style>{`@keyframes eq{from{height:3px}to{height:16px}}`}</style>
    </button>
  );
}

export function Nav() {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive("#" + e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    NAV.forEach(([, , h]) => { const el = document.querySelector(h); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <header className="fixed inset-x-0 top-0 z-[80] flex items-center justify-between px-4 py-4 md:px-8">
      <a href="#top" onClick={() => sound.click()} className="glass flex h-11 items-center gap-2 rounded-full px-4 font-display text-sm font-bold" data-cursor="top">
        <span className="size-2 rounded-full bg-rec blink" /> JAYCEE<span className="text-primary">.</span>
      </a>
      <nav className="glass hidden items-center gap-1 rounded-full p-1 md:flex">
        {NAV.map(([n, l, h]) => (
          <a key={h} href={h} onMouseEnter={() => sound.hover()} onClick={() => sound.click()}
            className={`relative rounded-full px-4 py-2 text-xs font-semibold transition-colors ${active === h ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <span className="mr-1 font-mono text-[9px] opacity-60">{n}</span>{l}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <SoundToggle />
        <button className="glass flex size-11 items-center justify-center rounded-full md:hidden" aria-label="Menu" onClick={() => { setOpen(!open); sound.whoosh(); }}>
          <span className="relative block h-3 w-5">
            <span className={`absolute left-0 h-[2px] w-5 bg-foreground transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 h-[2px] w-5 bg-foreground transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>
      <div className={`fixed inset-0 -z-10 flex flex-col justify-center gap-2 bg-background/95 px-8 backdrop-blur-xl transition-all duration-500 md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        {NAV.map(([n, l, h], i) => (
          <a key={h} href={h} onClick={() => { setOpen(false); sound.click(); }} className="flex items-baseline gap-4 border-b border-line py-4 transition-all duration-500"
            style={{ transform: open ? "none" : "translateY(30px)", opacity: open ? 1 : 0, transitionDelay: `${i * 60}ms` }}>
            <span className="font-mono text-xs text-primary">{n}</span>
            <span className="font-display text-4xl font-bold">{l}</span>
          </a>
        ))}
      </div>
    </header>
  );
}

/* ───────── Hero ───────── */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [m, setM] = useState({ x: 0, y: 0 });
  const [sy, setSy] = useState(0);
  useEffect(() => {
    const on = () => setSy(scrollY);
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return (
    <section id="top" ref={ref} onMouseMove={(e) => setM({ x: e.clientX / innerWidth - 0.5, y: e.clientY / innerHeight - 0.5 })}
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-10 pt-28 md:px-10 md:pb-14">
      <div className="pointer-events-none absolute -left-40 top-10 size-[60vmax] rounded-full bg-primary/15 aurora" />
      <div className="pointer-events-none absolute -right-40 bottom-0 size-[50vmax] rounded-full bg-ember/15 aurora" style={{ animationDelay: "-8s" }} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent sweep" />

      {/* floating portrait */}
      <div className="pointer-events-none absolute right-[6%] top-[16%] w-[42vw] max-w-[340px] md:right-[10%] md:top-[14%]"
        style={{ transform: `translate(${m.x * -30}px, ${m.y * -30 + sy * 0.25}px) rotate(${4 + m.x * 4}deg)` }}>
        <div className="floaty relative overflow-hidden rounded-2xl border border-border shadow-2xl">
          <img src={portrait} alt="Jaycee portrait" className="aspect-[3/4] w-full object-cover grayscale-[30%] sepia-[20%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute left-3 top-3 flex items-center gap-1.5 font-mono text-[9px] tracking-widest"><span className="size-1.5 rounded-full bg-rec blink" />REC</div>
          <div className="absolute bottom-3 left-3 font-mono text-[9px] tracking-widest text-primary"><Timecode /></div>
          <div className="absolute inset-6 border border-foreground/20" />
          <div className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2">
            <span className="absolute left-1/2 top-0 h-full w-px bg-foreground/50" /><span className="absolute left-0 top-1/2 h-px w-full bg-foreground/50" />
          </div>
        </div>
      </div>

      <div className="relative z-10" style={{ transform: `translateY(${sy * -0.15}px)`, opacity: Math.max(0, 1 - sy / 700) }}>
        <Reveal><p className="eyebrow mb-6 flex items-center gap-3"><span className="h-px w-10 bg-primary" /> Creative · Philippines · Est. 2026</p></Reveal>
        <h1 className="font-display font-extrabold leading-[0.82] tracking-[-0.04em]">
          <SplitLines className="block" lines={[
            <span key="a" className="text-[15.5vw] md:text-[12vw]">Frame</span>,
            <span key="b" className="flex items-baseline gap-[2vw] text-[15.5vw] md:text-[12vw]"><span className="font-serif font-normal italic text-gold">by</span><span className="text-outline">frame</span></span>,
          ]} />
        </h1>
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <Reveal delay={300}>
            <p className="max-w-md text-base text-muted-foreground md:text-lg">
              I'm <span className="text-foreground">Jaycee</span> — a visual explorer working across <span className="font-serif text-xl italic text-primary">design, video & photography</span>. Turning ideas into frames that feel intentional.
            </p>
          </Reveal>
          <Reveal delay={450} className="flex items-center gap-4">
            <Magnetic><a href="#work" onClick={() => sound.click()} data-cursor="view" className="group flex h-14 items-center gap-3 rounded-full bg-gold px-7 font-semibold text-primary-foreground glow-gold">See the work <span className="transition-transform group-hover:translate-x-1">→</span></a></Magnetic>
            <a href="#about" className="flex size-14 items-center justify-center rounded-full border border-border" aria-label="Scroll down">
              <span className="animate-bounce">↓</span>
            </a>
          </Reveal>
        </div>
      </div>
      <div className="relative z-10 mt-10 flex justify-between border-t border-line pt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>JC—001</span><span className="hidden md:inline">Scroll to roll film</span><Timecode className="text-primary" />
      </div>
    </section>
  );
}

/* ───────── Marquee ───────── */
export function Marquees() {
  const a = ["Design", "Video Editing", "Photography", "Videography", "Visual Direction"];
  const b = ["Always learning", "Visual thinker", "Stay curious", "Form follows feeling"];
  const row = (items: string[], cls: string, rev = false) => (
    <div className={`flex overflow-hidden whitespace-nowrap py-4 ${cls}`}>
      <div className={`flex shrink-0 ${rev ? "marquee-rev" : "marquee"}`}>
        {[...items, ...items, ...items, ...items].map((t, i) => (
          <span key={i} className="mx-6 flex items-center gap-6">{t}<span className="text-primary">✦</span></span>
        ))}
      </div>
    </div>
  );
  return (
    <div className="relative my-10 -rotate-2 select-none">
      {row(a, "bg-gold font-display text-3xl font-bold text-primary-foreground md:text-5xl")}
      {row(b, "border-y border-line bg-card font-serif text-2xl italic text-muted-foreground md:text-4xl", true)}
    </div>
  );
}

function SectionHead({ n, label, lines }: { n: string; label: string; lines: React.ReactNode[] }) {
  return (
    <div className="mb-14 md:mb-20">
      <Reveal><p className="eyebrow mb-5 flex items-center gap-3"><span className="font-display text-primary">{n}</span><span className="h-px w-8 bg-border" />{label}</p></Reveal>
      <h2 className="font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-8xl"><SplitLines lines={lines} /></h2>
    </div>
  );
}

/* ───────── About ───────── */
export function About() {
  const facts = [["Based in", "Philippines 🇵🇭"], ["Focus", "Design & Media"], ["Status", "Learning & building"], ["Approach", "Curiosity first"]];
  return (
    <section id="about" className="relative px-5 py-24 md:px-10 md:py-36">
      <SectionHead n="01" label="About" lines={["The person", <span key="b">behind the <span className="font-serif font-normal italic text-gold">pixels.</span></span>]} />
      <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
        <Reveal>
          <Tilt className="group relative" max={8}>
            <div className="relative overflow-hidden rounded-3xl border border-border">
              <img src={portrait} alt="Jaycee" loading="lazy" className="aspect-[4/5] w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" />
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: "radial-gradient(circle at var(--mx) var(--my), oklch(0.8 0.16 72 / 0.35), transparent 40%)" }} />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full glass px-4 py-2 font-mono text-[10px] uppercase tracking-widest">
                <span>Hover me ✦</span><span className="text-primary">f/1.8 · 1/250</span>
              </div>
            </div>
            <div className="absolute -right-4 -top-4 flex size-24 items-center justify-center md:-right-8 md:-top-8 md:size-28">
              <svg viewBox="0 0 100 100" className="absolute inset-0 spin-slow"><defs><path id="c" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs>
                <text className="fill-primary font-mono text-[9px] uppercase tracking-[0.3em]"><textPath href="#c">· visual thinker · stay curious </textPath></text></svg>
              <span className="text-2xl text-primary">✦</span>
            </div>
          </Tilt>
        </Reveal>
        <div className="flex flex-col justify-center">
          <Reveal><blockquote className="font-serif text-4xl italic leading-tight md:text-6xl">"Every idea deserves a <span className="text-gold">visual voice.</span>"</blockquote></Reveal>
          <Reveal delay={150}><p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground">I explore creativity through digital tools, visuals, and technology. Still learning, experimenting, and discovering my own style — one project at a time. The goal isn't to be perfect. It's to keep improving and make work that feels intentional.</p></Reveal>
          <Reveal delay={250} className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-6"><div className="font-display text-5xl font-bold text-gold"><CountUp to={6} suffix="+" /></div><div className="eyebrow mt-2">Creative skills</div></div>
            <div className="rounded-2xl border border-border bg-card p-6"><div className="font-display text-5xl font-bold text-gold"><CountUp to={100} suffix="%" /></div><div className="eyebrow mt-2">Curiosity</div></div>
          </Reveal>
          <Reveal delay={350} className="mt-8 divide-y divide-line border-y border-line">
            {facts.map(([k, v]) => (
              <div key={k} className="group flex items-center justify-between py-4 transition-all hover:px-2" onMouseEnter={() => sound.hover()}>
                <span className="eyebrow">{k}</span><span className="font-semibold transition-colors group-hover:text-primary">{v}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ───────── Tools ───────── */
const TOOLS = [
  { i: "▧", t: "Graphic Design", d: "Layouts, visual composition, color, and content that communicates clearly.", x: ["Typography", "Layout", "Color theory", "Posters"] },
  { i: "▶", t: "Video Editing", d: "Clips, timing, sound and transitions put together into a visual story.", x: ["Cutting on beat", "Color grade", "Transitions", "Sound design"] },
  { i: "⌘", t: "Digital Creativity", d: "Exploring digital tools and testing ideas through hands-on experiments.", x: ["Experiments", "AI tools", "Prototyping", "Motion"] },
  { i: "✳", t: "Visual Direction", d: "Finding a mood, building a visual identity, keeping a design consistent.", x: ["Moodboards", "Identity", "Art direction", "Consistency"] },
  { i: "◎", t: "Photography", d: "Capturing moments, details and everyday scenes through thoughtful framing.", x: ["Composition", "Natural light", "Street", "Portraits"] },
  { i: "◉", t: "Videography", d: "Visual stories through camera movement, shot planning and cinematic sequences.", x: ["Shot lists", "Camera motion", "B-roll", "Cinematic"] },
];

export function Tools() {
  const [open, setOpen] = useState<number | null>(null);
  const t = open !== null ? TOOLS[open] : null;
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, []);
  return (
    <section id="tools" className="relative px-5 py-24 md:px-10 md:py-36">
      <SectionHead n="02" label="Tools of creation" lines={["Tap a tool.", <span key="b" className="font-serif font-normal italic text-gold">See the craft.</span>]} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool, i) => (
          <Reveal key={tool.t} delay={i * 80}>
            <Tilt className="h-full">
              <button onClick={() => { setOpen(i); sound.shutter(); }} data-cursor="open"
                className="group relative flex h-full min-h-64 w-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 text-left transition-colors hover:border-primary/50">
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(400px circle at var(--mx) var(--my), oklch(0.8 0.16 72 / 0.15), transparent 50%)" }} />
                <span className="absolute -bottom-10 -right-4 font-display text-[11rem] leading-none text-foreground/[0.03] transition-all duration-700 group-hover:-translate-y-4 group-hover:text-primary/10">{tool.i}</span>
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl border border-border text-xl text-primary transition-all duration-500 group-hover:rotate-[360deg] group-hover:bg-primary group-hover:text-primary-foreground">{tool.i}</span>
                  <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="mt-auto pt-10 font-display text-2xl font-bold"><Scramble text={tool.t} /></h3>
                <p className="mt-2 text-sm text-muted-foreground">{tool.d}</p>
                <span className="mt-5 font-mono text-[10px] uppercase tracking-widest text-primary">Open <span className="inline-block transition-transform group-hover:translate-x-2">→</span></span>
              </button>
            </Tilt>
          </Reveal>
        ))}
      </div>

      <div className={`fixed inset-0 z-[150] flex items-end justify-center p-4 transition-all duration-500 md:items-center ${t ? "visible" : "invisible"}`}>
        <div onClick={() => setOpen(null)} className={`absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity ${t ? "opacity-100" : "opacity-0"}`} />
        {open !== null && t && (
          <div key={open} className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card p-8 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500">
            <div className="absolute inset-0 scanlines opacity-50" />
            <div className="relative">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-rec blink" />Clip 0{open + 1} / 06</span>
                <button onClick={() => { setOpen(null); sound.click(); }} className="flex size-9 items-center justify-center rounded-full border border-border hover:bg-secondary" aria-label="Close">✕</button>
              </div>
              <div className="mt-8 text-6xl text-gold">{t.i}</div>
              <h3 className="mt-4 font-display text-4xl font-bold">{t.t}</h3>
              <p className="mt-3 text-muted-foreground">{t.d}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {t.x.map((s, k) => <span key={s} className="rounded-full border border-border px-3 py-1.5 text-xs animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${150 + k * 70}ms`, animationFillMode: "both" }}>{s}</span>)}
              </div>
              <div className="mt-8 flex gap-2">
                <button onClick={() => { setOpen((open + 5) % 6); sound.whoosh(); }} className="flex-1 rounded-full border border-border py-3 text-sm hover:bg-secondary">← Prev</button>
                <button onClick={() => { setOpen((open + 1) % 6); sound.whoosh(); }} className="flex-1 rounded-full bg-gold py-3 text-sm font-semibold text-primary-foreground">Next →</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ───────── Work ───────── */
const WORK = [
  { n: "01", c: "Design Concept", t: "Visual Identity Study", s: "Form follows feeling.", img: true, sym: "" },
  { n: "02", c: "Video Editing", t: "Motion & Rhythm", s: "Frame 024 — motion in progress.", img: false, sym: "▶" },
  { n: "03", c: "Photography", t: "Street Frames", s: "Everyday scenes, honest light.", img: true, sym: "" },
  { n: "04", c: "Digital Concept", t: "Digital Space", s: "Interface 001.", img: false, sym: "⌘" },
];

export function Work() {
  const track = useRef<HTMLDivElement>(null);
  const [prog, setProg] = useState(0);
  return (
    <section id="work" className="relative py-24 md:py-36">
      <div className="px-5 md:px-10"><SectionHead n="03" label="Selected work" lines={["Ideas into", <span key="b" className="font-serif font-normal italic text-gold">projects.</span>]} /></div>
      <div ref={track} onScroll={(e) => { const el = e.currentTarget; setProg(el.scrollLeft / (el.scrollWidth - el.clientWidth || 1)); }}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 [scrollbar-width:none] md:px-10">
        {WORK.map((w, i) => (
          <a key={w.n} href="#contact" onClick={() => sound.click()} data-cursor="view"
            className="group relative w-[82vw] shrink-0 snap-center md:w-[42vw]">
            <Reveal delay={i * 100}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-card md:aspect-[4/3]">
                {w.img ? (
                  <img src={portrait} alt={w.t} loading="lazy" className={`size-full object-cover transition-transform duration-[1.2s] group-hover:scale-110 ${i === 2 ? "grayscale contrast-125" : "sepia-[40%]"}`} />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-secondary to-background">
                    <div className="absolute inset-0 scanlines" />
                    <span className="font-display text-[10rem] text-gold transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12">{w.sym}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
                <span className="absolute right-5 top-5 flex size-12 items-center justify-center rounded-full glass text-lg transition-all duration-500 group-hover:rotate-45 group-hover:bg-primary group-hover:text-primary-foreground">↗</span>
                <span className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-widest"><span className="text-primary">●</span> {w.n} / 04</span>
                <div className="absolute inset-x-5 bottom-5">
                  <p className="eyebrow">{w.c} · 2026</p>
                  <h3 className="mt-2 font-display text-3xl font-bold md:text-4xl">{w.t}</h3>
                  <p className="mt-1 font-serif text-lg italic text-muted-foreground">{w.s}</p>
                </div>
              </div>
            </Reveal>
          </a>
        ))}
      </div>
      <div className="mx-5 mt-4 flex items-center gap-4 md:mx-10">
        <div className="h-px flex-1 bg-border"><div className="h-px bg-gold transition-all" style={{ width: `${25 + prog * 75}%` }} /></div>
        <div className="flex gap-2">
          {["←", "→"].map((a, k) => (
            <button key={a} aria-label={k ? "Next" : "Previous"} onClick={() => { track.current?.scrollBy({ left: (k ? 1 : -1) * innerWidth * 0.5, behavior: "smooth" }); sound.whoosh(); }}
              className="flex size-11 items-center justify-center rounded-full border border-border hover:bg-primary hover:text-primary-foreground">{a}</button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Journey ───────── */
const STEPS = [
  { n: "01", tag: "Foundation", t: "Curious by nature", d: "Interest in digital content, creative visuals, and how design shapes an experience." },
  { n: "02", tag: "● In Progress", t: "Learning by doing", d: "Exploring creative software, practicing fundamentals, building confidence through projects." },
  { n: "03", tag: "Up Next", t: "Building a creative future", d: "Turning practice into stronger work and a personal style worth sharing." },
];
export function Journey() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      setP(Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height)));
    };
    addEventListener("scroll", on, { passive: true }); on();
    return () => removeEventListener("scroll", on);
  }, []);
  return (
    <section id="journey" className="relative px-5 py-24 md:px-10 md:py-36">
      <SectionHead n="04" label="The process" lines={["Still loading.", <span key="b" className="font-serif font-normal italic text-gold">Still growing.</span>]} />
      <div ref={ref} className="relative ml-3 md:ml-[30%]">
        <div className="absolute left-0 top-0 h-full w-px bg-border" />
        <div className="absolute left-0 top-0 w-px bg-gold shadow-[var(--glow-gold)]" style={{ height: `${p * 100}%` }} />
        {STEPS.map((s, i) => {
          const lit = p > i / STEPS.length + 0.05;
          return (
            <Reveal key={s.n} className="relative pb-16 pl-10 last:pb-0 md:pl-16">
              <span className={`absolute -left-[7px] top-2 size-[15px] rounded-full border-2 transition-all duration-500 ${lit ? "border-primary bg-primary glow-gold" : "border-border bg-background"}`} />
              <div className="flex items-center gap-4">
                <span className="font-display text-6xl font-bold text-outline md:text-8xl">{s.n}</span>
                <span className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${i === 1 ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{s.tag}</span>
              </div>
              <h3 className="mt-3 font-display text-3xl font-bold md:text-4xl">{s.t}</h3>
              <p className="mt-2 max-w-md text-muted-foreground">{s.d}</p>
              {i === 1 && (
                <div className="mt-5 max-w-md">
                  <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground"><span>Rendering skills</span><span className="text-primary"><CountUp to={64} suffix="%" /></span></div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary"><div className="h-full w-[64%] rounded-full bg-gold" /></div>
                </div>
              )}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ───────── Contact ───────── */
export function Contact() {
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState("");
  useEffect(() => {
    const f = () => setTime(new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit" }));
    f(); const id = setInterval(f, 10000); return () => clearInterval(id);
  }, []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(EMAIL); } catch { /* ignore */ }
    setCopied(true); sound.chime(); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <section id="contact" className="relative overflow-hidden px-5 pb-10 pt-24 md:px-10 md:pt-36">
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[80vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 aurora" />
      <div className="relative">
        <Reveal><p className="eyebrow mb-6 flex items-center gap-3"><span className="font-display text-primary">05</span><span className="h-px w-8 bg-border" />Your turn</p></Reveal>
        <h2 className="glitch font-display text-[22vw] font-extrabold leading-[0.8] tracking-[-0.05em] md:text-[15vw]">
          <SplitLines lines={["Let's", <span key="b" className="font-serif font-normal italic text-gold">create.</span>]} />
        </h2>
        <div className="mt-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Magnetic strength={0.4}>
            <a href={`mailto:${EMAIL}`} onClick={() => sound.shutter()} data-cursor="hello"
              className="group relative flex size-44 items-center justify-center overflow-hidden rounded-full bg-gold font-display text-lg font-bold text-primary-foreground glow-gold md:size-52">
              <span className="relative z-10 transition-transform group-hover:scale-110">Say hello ↗</span>
              <span className="absolute inset-0 scale-0 rounded-full bg-foreground transition-transform duration-500 group-hover:scale-100" />
              <span className="absolute z-10 opacity-0 transition-opacity group-hover:opacity-100 text-background">Say hello ↗</span>
            </a>
          </Magnetic>
          <button onClick={copy} data-cursor="copy" className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-card/60 p-5 text-left backdrop-blur transition-colors hover:border-primary md:w-auto md:min-w-[26rem]">
            <span>
              <span className="eyebrow block">Email</span>
              <span className="mt-1 block break-all font-semibold md:text-lg">{EMAIL}</span>
            </span>
            <span className={`shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-all ${copied ? "bg-primary text-primary-foreground" : "border border-border"}`}>{copied ? "✓ Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
      <footer className="relative mt-24 flex flex-col gap-3 border-t border-line pt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:flex-row md:justify-between">
        <span>© 2026 Jaycee · John Crisly Ganaden</span>
        <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary blink" />Manila · {time}</span>
        <a href="#top" onClick={() => sound.whoosh()} className="hover:text-primary">Back to top ↑</a>
      </footer>
    </section>
  );
}
