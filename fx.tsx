import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { sound } from "@/lib/sound";

export function useSoundOn() {
  const [on, setOn] = useState(false);
  useEffect(() => sound.subscribe(setOn), []);
  return on;
}

/** Adds .in when element enters view */
export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "h2" | "p" | "section" | "span" }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const El = Tag as "div";
  return <El ref={ref as React.RefObject<HTMLDivElement>} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</El>;
}

/** Splits text into masked lines that slide up */
export function SplitLines({ lines, className = "", stagger = 110 }: { lines: ReactNode[]; className?: string; stagger?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <span ref={ref} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="line-mask block"><span style={{ transitionDelay: `${i * stagger}ms` }}>{l}</span></span>
      ))}
    </span>
  );
}

export function Magnetic({ children, strength = 0.35, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`inline-block transition-transform duration-300 ease-out ${className}`}
      onMouseMove={(e) => {
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength}px)`;
      }}
      onMouseEnter={() => sound.hover()}
      onMouseLeave={() => { if (ref.current) ref.current.style.transform = ""; }}
    >
      {children}
    </div>
  );
}

export function Tilt({ children, className = "", max = 10, style }: { children: ReactNode; className?: string; max?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      style={{ transformStyle: "preserve-3d", transition: "transform .5s cubic-bezier(.2,.7,.1,1)", ...style }}
      className={className}
      onMouseMove={(e) => {
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) scale(1.02)`;
        el.style.setProperty("--mx", `${x * 100}%`); el.style.setProperty("--my", `${y * 100}%`);
      }}
      onMouseEnter={() => sound.hover()}
      onMouseLeave={() => { if (ref.current) ref.current.style.transform = ""; }}
    >
      {children}
    </div>
  );
}

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.body.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;
    const move = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY;
      const t = (e.target as HTMLElement).closest<HTMLElement>("a,button,[data-cursor]");
      setActive(!!t); setLabel(t?.dataset["cursor"] ?? "");
    };
    const loop = () => {
      rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
      if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("mousemove", move); loop();
    return () => { removeEventListener("mousemove", move); cancelAnimationFrame(raf); document.body.classList.remove("has-cursor"); };
  }, []);
  return (
    <>
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[100] hidden md:block">
        <div className="-translate-x-1/2 -translate-y-1/2 size-1.5 rounded-full bg-primary" />
      </div>
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[100] hidden md:block">
        <div className={`-translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-primary/70 transition-all duration-300 ${active ? (label ? "size-24 bg-primary text-primary-foreground" : "size-14 bg-primary/10") : "size-9"}`}>
          {/* viewfinder ticks */}
          {!label && <span className="absolute inset-0 rounded-full border border-dashed border-primary/30 spin-slow" />}
          {label && <span className="font-mono text-[10px] uppercase tracking-widest">{label}</span>}
        </div>
      </div>
    </>
  );
}

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = () => {
      const p = scrollY / (document.documentElement.scrollHeight - innerHeight || 1);
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    addEventListener("scroll", on, { passive: true }); on();
    return () => removeEventListener("scroll", on);
  }, []);
  return <div ref={ref} className="fixed left-0 top-0 z-[95] h-[2px] w-full origin-left bg-gold" style={{ transform: "scaleX(0)" }} />;
}

/** Live timecode HH:MM:SS:FF at 24fps */
export function Timecode({ className = "" }: { className?: string }) {
  const [tc, setTc] = useState("00:00:00:00");
  useEffect(() => {
    const start = performance.now(); let raf = 0;
    const loop = () => {
      const s = (performance.now() - start) / 1000;
      const f = Math.floor((s % 1) * 24), p = (n: number) => String(n).padStart(2, "0");
      setTc(`${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(Math.floor(s) % 60)}:${p(f)}`);
      raf = requestAnimationFrame(loop);
    };
    loop(); return () => cancelAnimationFrame(raf);
  }, []);
  return <span className={`tabular-nums ${className}`}>{tc}</span>;
}

/** Number that counts up on view */
export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return; io.disconnect();
      const s = performance.now();
      const step = () => { const p = Math.min(1, (performance.now() - s) / 1600); setN(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
      step();
    });
    io.observe(el); return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/** Scrambles text on hover */
export function Scramble({ text, className = "" }: { text: string; className?: string }) {
  const [out, setOut] = useState(text);
  const run = () => {
    const chars = "!<>-_\\/[]{}—=+*^?#ABCDEFGHJKLMNOPQRSTUVWXYZ";
    let i = 0;
    const id = setInterval(() => {
      setOut(text.split("").map((c, k) => (k < i ? c : c === " " ? " " : chars[Math.floor(Math.random() * chars.length)])).join(""));
      i += 0.5; if (i > text.length) { clearInterval(id); setOut(text); }
    }, 28);
    sound.tick();
  };
  return <span className={className} onMouseEnter={run}>{out}</span>;
}
