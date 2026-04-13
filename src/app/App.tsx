import { useEffect, useRef, useState } from "react";

const FD = "'Unbounded', sans-serif";
const FB = "'Inter', sans-serif";
const BG = "#F8F6F2";
const ACC = "#FF4500";

/* ═══════════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════════ */
function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCountUp(target: number, started: boolean, duration = 1600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!started) return;
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(e * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);
  return value;
}

// Meta Pixel Lead event helper
const trackLead = () => {
  try { (window as any).fbq?.("track", "Lead"); } catch (_) {}
};

const CHARS = "АБВГДЕКЛМНПРСТУФХЦЧ#@%0123456789!&$";
function useScramble(final: string, started: boolean, delay = 0) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const total = 34;
    let raf: number;
    const t = setTimeout(() => {
      const tick = () => {
        const p = frame / total;
        setText(
          final.split("").map((ch, i) => {
            if (ch === " " || ch === "\n") return ch;
            if (i / final.length < p) return ch;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join("")
        );
        frame++;
        if (frame <= total) raf = requestAnimationFrame(tick);
        else setText(final);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [started, final, delay]);
  return text;
}

function useIsMobile() {
  const [mob, setMob] = useState(false);
  useEffect(() => {
    const check = () => setMob(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mob;
}

/* ═══════════════════════════════════════════════════════════
   GRAIN
═══════════════════════════════════════════════════════════ */
function GrainOverlay() {
  return (
    <div aria-hidden style={{
      position: "fixed", inset: 0, zIndex: 9990, pointerEvents: "none", opacity: 0.032,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
    }} />
  );
}

/* ═══════════════════════════════════════════════════════════
   CUSTOM CURSOR (desktop only)
═══════════════════════════════════════════════════════════ */
function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  useEffect(() => {
    if (isTouch) return;
    let x = -200, y = -200, rx = -200, ry = -200, big = false;
    const onMove = (e: MouseEvent) => { x = e.clientX; y = e.clientY; };
    const onOver = (e: MouseEvent) => { big = !!(e.target as Element)?.closest("a,button"); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    let raf: number;
    const tick = () => {
      rx += (x - rx) * 0.1; ry += (y - ry) * 0.1;
      if (dot.current) dot.current.style.transform = `translate(${x - 4}px,${y - 4}px)`;
      if (ring.current) {
        const s = big ? 26 : 18;
        ring.current.style.transform = `translate(${rx - s}px,${ry - s}px)`;
        ring.current.style.width = big ? "52px" : "36px";
        ring.current.style.height = big ? "52px" : "36px";
        ring.current.style.borderColor = big ? ACC : "rgba(255,69,0,0.4)";
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);
  if (isTouch) return null;
  return (
    <>
      <div ref={dot} aria-hidden style={{ position: "fixed", top: 0, left: 0, width: 8, height: 8, background: ACC, borderRadius: "50%", pointerEvents: "none", zIndex: 9999, mixBlendMode: "multiply" }} />
      <div ref={ring} aria-hidden style={{ position: "fixed", top: 0, left: 0, width: 36, height: 36, border: "1.5px solid rgba(255,69,0,0.4)", borderRadius: "50%", pointerEvents: "none", zIndex: 9998, transition: "width .25s cubic-bezier(.23,1,.32,1),height .25s cubic-bezier(.23,1,.32,1),border-color .2s" }} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   FLOATING WA BUTTON (mobile/tablet)
═══════════════════════════════════════════════════════════ */
function FloatingWA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 300);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <a
      href="https://wa.me/77066659056?text=Хочу%20получить%20бесплатную%20консультацию%20по%20сайту"
      target="_blank" rel="noreferrer"
      className="floating-wa"
      aria-label="WhatsApp"
      onClick={trackLead}
      style={{
        position: "fixed", bottom: 24, right: 20, zIndex: 500,
        width: 56, height: 56,
        background: ACC, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 24px rgba(255,69,0,0.45)",
        opacity: show ? 1 : 0,
        transform: show ? "scale(1)" : "scale(0.7)",
        transition: "opacity .3s, transform .3s cubic-bezier(.23,1,.32,1)",
        pointerEvents: show ? "auto" : "none",
        textDecoration: "none",
      }}>
      <WaIcon size={26} color="#fff" />
    </a>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════ */
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const links = [
    { href: "#services", label: "Услуги", num: "01" },
    { href: "#process", label: "Процесс", num: "02" },
    { href: "#pricing", label: "Тарифы", num: "03" },
    { href: "#contact", label: "Контакт", num: "04" },
  ];

  const close = () => setOpen(false);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 300,
        background: open ? "#111" : (scrolled ? "rgba(248,246,242,0.97)" : BG),
        backdropFilter: !open && scrolled ? "blur(20px)" : "none",
        borderBottom: `1px solid ${!open && scrolled ? "rgba(0,0,0,0.09)" : "transparent"}`,
        transition: "background 0.35s, border-color 0.3s",
      }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

            {/* LOGO */}
            <a href="#" onClick={close}
              onMouseEnter={() => { setGlitch(true); setTimeout(() => setGlitch(false), 500); }}
              style={{ textDecoration: "none", position: "relative" }}>
              <span style={{
                fontFamily: FD, fontWeight: 800, fontSize: 20,
                color: open ? "#fff" : "#111",
                letterSpacing: "-0.03em", position: "relative", display: "inline-block", lineHeight: 1,
                transition: "color 0.3s",
              }}>
                24FRAME
                {glitch && <>
                  <span aria-hidden style={{ position: "absolute", inset: 0, color: ACC, clipPath: "inset(35% 0 50% 0)", transform: "translateX(-2px)" }}>24FRAME</span>
                  <span aria-hidden style={{ position: "absolute", inset: 0, color: "#0ff", clipPath: "inset(60% 0 20% 0)", transform: "translateX(2px)", opacity: 0.7 }}>24FRAME</span>
                </>}
              </span>
            </a>

            {/* RIGHT */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {!open && (
                <a href="https://wa.me/77066659056?text=Хочу%20получить%20бесплатную%20консультацию%20по%20сайту"
                  target="_blank" rel="noreferrer"
                  className="nav-wa"
                  onClick={trackLead}
                  style={{ fontFamily: FB, fontWeight: 600, fontSize: 11, color: ACC, border: `1.5px solid ${ACC}`, padding: "7px 14px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, letterSpacing: "0.08em", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                  <WaIcon size={11} color="currentColor" /> WA
                </a>
              )}
              <button
                onClick={() => setOpen(o => !o)}
                aria-label={open ? "Закрыть" : "Меню"}
                style={{ background: "none", border: "none", padding: "10px 4px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 6, alignItems: "center", justifyContent: "center", width: 36 }}>
                <span style={{ display: "block", width: 24, height: 1.5, background: open ? "#fff" : "#111", transition: "all .35s cubic-bezier(.23,1,.32,1)", transformOrigin: "center", transform: open ? "rotate(45deg) translate(5.3px,5.3px)" : "none" }} />
                <span style={{ display: "block", width: 16, height: 1.5, background: open ? "#fff" : "#111", transition: "all .35s", alignSelf: "flex-start", opacity: open ? 0 : 1 }} />
                <span style={{ display: "block", width: 24, height: 1.5, background: open ? "#fff" : "#111", transition: "all .35s cubic-bezier(.23,1,.32,1)", transformOrigin: "center", transform: open ? "rotate(-45deg) translate(5.3px,-5.3px)" : "none" }} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* FULLSCREEN OVERLAY MENU */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 299,
        background: "#111",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.35s cubic-bezier(.23,1,.32,1)",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "80px 20px 48px",
        overflowY: "auto",
      }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", width: "100%" }}>
          {links.map((l, i) => (
            <a key={l.href} href={l.href} onClick={close}
              className="menu-link"
              style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
                textDecoration: "none", padding: "20px 0",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.4s ease ${i * 65 + 80}ms, transform 0.4s ease ${i * 65 + 80}ms`,
              }}>
              <span style={{ fontFamily: FD, fontWeight: 800, fontSize: "clamp(32px, 9vw, 60px)", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05 }}>
                {l.label}
              </span>
              <span style={{ fontFamily: FB, fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.22)", letterSpacing: "0.1em" }}>{l.num}</span>
            </a>
          ))}

          <div style={{
            marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap",
            opacity: open ? 1 : 0,
            transition: `opacity 0.4s ease ${links.length * 65 + 120}ms`,
          }}>
            <a href="https://wa.me/77066659056?text=Хочу%20получить%20бесплатную%20консультацию%20по%20сайту"
              target="_blank" rel="noreferrer" onClick={() => { trackLead(); close(); }}
              style={{ flex: 1, minWidth: 180, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: FB, fontWeight: 700, fontSize: 14, color: "#111", background: ACC, padding: "16px 24px", textDecoration: "none", letterSpacing: "0.04em" }}>
              <WaIcon size={16} color="#111" /> WhatsApp
            </a>
            <a href="https://t.me/tamba_studio" target="_blank" rel="noreferrer" onClick={close}
              style={{ flex: 1, minWidth: 140, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FB, fontWeight: 600, fontSize: 14, color: "rgba(255,255,255,0.45)", border: "1.5px solid rgba(255,255,255,0.12)", padding: "16px 24px", textDecoration: "none", letterSpacing: "0.04em" }}>
              Telegram →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══��═══════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════ */
const CYCLE = ["Лендинг", "Визитку", "Магазин", "Портфолио", "Корп. сайт"];

function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [cycleIdx, setCycleIdx] = useState(0);
  const [cycleVis, setCycleVis] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const { ref: statsRef, visible: sv } = useScrollReveal(0);
  const c1 = useCountUp(7, sv);
  const c2 = useCountUp(100, sv, 1800);
  const s1 = useScramble("САЙТ", loaded, 60);
  const s2 = useScramble("ЗА 24", loaded, 280);
  const s3 = useScramble("ЧАСА", loaded, 480);

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 150); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const id = setInterval(() => {
      setCycleVis(false);
      setTimeout(() => { setCycleIdx(i => (i + 1) % CYCLE.length); setCycleVis(true); }, 350);
    }, 2800);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const fade = (d: number) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(24px)",
    transition: `opacity .7s ease ${d}ms, transform .7s ease ${d}ms`,
  });

  return (
    <section style={{ minHeight: "100svh", background: BG, paddingTop: 60, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      {/* BG "24" decoration — desktop only */}
      <div aria-hidden className="bg-deco" style={{
        position: "absolute", right: "-2%", bottom: "-6%",
        fontFamily: FD, fontWeight: 800,
        fontSize: "clamp(260px, 36vw, 520px)",
        color: "transparent",
        WebkitTextStroke: "1.5px #E2DFD9",
        lineHeight: 1, userSelect: "none", pointerEvents: "none", letterSpacing: "-0.05em",
        transform: `translateY(${scrollY * -0.05}px)`,
        transition: "transform 0.06s linear",
      }}>24</div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "60px 20px 40px", width: "100%", position: "relative", zIndex: 1 }}>
        <div className="hero-layout">

          {/* LEFT / MAIN */}
          <div className="hero-main">
            {/* Eyebrow */}
            <div style={{ ...fade(0), display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 28, border: "1px solid rgba(0,0,0,0.08)", padding: "5px 12px 5px 8px" }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontFamily: FB, fontWeight: 500, fontSize: 10, color: "#555", letterSpacing: "0.12em" }}>ПРИНИМАЕМ ЗАЯВКИ</span>
            </div>

            {/* Headline */}
            <div style={{ ...fade(100) }}>
              <h1 style={{ fontFamily: FD, fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.03em", margin: "0 0 24px" }}>
                <span style={{ display: "block", fontSize: "clamp(52px, 13.5vw, 112px)", color: "#111" }}>
                  {s1 || "САЙТ"}
                </span>
                <span style={{ display: "block", fontSize: "clamp(52px, 13.5vw, 112px)", color: ACC }}>
                  {s2 || "ЗА 24"}
                </span>
                <span style={{ display: "block", fontSize: "clamp(52px, 13.5vw, 112px)", WebkitTextStroke: "clamp(4px,1vw,7px) #111", color: BG, paintOrder: "stroke fill" }}>
                  {s3 || "ЧАСА"}
                </span>
              </h1>
            </div>

            {/* Cycling type */}
            <div style={{ ...fade(360), display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontFamily: FB, fontWeight: 300, fontSize: 14, color: "#bbb" }}>Нужен →</span>
              <span style={{
                fontFamily: FD, fontWeight: 700, fontSize: "clamp(13px, 3.5vw, 17px)",
                color: "#111", letterSpacing: "-0.01em",
                opacity: cycleVis ? 1 : 0,
                transform: cycleVis ? "translateY(0)" : "translateY(8px)",
                transition: "opacity .3s ease, transform .3s ease",
                display: "inline-block", borderBottom: `2px solid ${ACC}`, paddingBottom: 2,
              }}>
                {CYCLE[cycleIdx]}
              </span>
            </div>

            <div style={{ ...fade(440) }}>
              <p style={{ fontFamily: FB, fontWeight: 300, fontSize: "clamp(14px, 3.5vw, 17px)", color: "#888", margin: "0 0 32px", lineHeight: 1.7, maxWidth: 480 }}>
                Разрабатываем с нуля — без Tilda и конструкторов.
                Чистый код, уникальный дизайн. Под ключ.
              </p>
            </div>

            {/* CTA Buttons */}
            <div style={{ ...fade(520), display: "flex", gap: 10, flexWrap: "wrap" }} className="hero-cta">
              <a href="https://wa.me/77066659056?text=Хочу%20получить%20бесплатную%20консультацию%20по%20сайту" target="_blank" rel="noreferrer"
                className="btn-primary"
                onClick={trackLead}
                style={{ fontFamily: FB, fontWeight: 700, fontSize: 14, color: "#fff", background: ACC, padding: "16px 28px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, letterSpacing: "0.04em", transition: "opacity .2s", flex: 1, justifyContent: "center", minWidth: 200 }}>
                <WaIcon size={16} color="#fff" /> Написать в WhatsApp
              </a>
              <a href="#pricing"
                style={{ fontFamily: FB, fontWeight: 600, fontSize: 14, color: "#111", border: "1.5px solid rgba(0,0,0,0.18)", padding: "16px 24px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, letterSpacing: "0.03em", transition: "all .2s", flex: 1, justifyContent: "center", minWidth: 160 }}
                className="btn-outline">
                Тарифы →
              </a>
            </div>

            {/* Stats strip */}
            <div style={{ ...fade(640), marginTop: 36, paddingTop: 24, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
              <div ref={statsRef} className="stats-row">
                {[
                  { val: c1, suf: " лет", label: "на рынке" },
                  { val: c2, suf: "+", label: "проектов" },
                  { val: 0, suf: "%", label: "шаблонов" },
                ].map((s, i) => (
                  <div key={s.label} className="stat-item" style={{ paddingRight: i < 2 ? 20 : 0, marginRight: i < 2 ? 20 : 0, borderRight: i < 2 ? "1px solid rgba(0,0,0,0.08)" : "none", flexShrink: 0 }}>
                    <div style={{ fontFamily: FD, fontWeight: 800, fontSize: "clamp(22px, 5.5vw, 36px)", color: "#111", letterSpacing: "-0.04em", lineHeight: 1 }}>
                      {s.val}{s.suf}
                    </div>
                    <div style={{ fontFamily: FB, fontWeight: 300, fontSize: 11, color: "#bbb", marginTop: 3, letterSpacing: "0.04em" }}>{s.label}</div>
                  </div>
                ))}


              </div>
            </div>
          </div>

          {/* RIGHT — Dark stats card (desktop only) */}
          <div className="hero-card" style={{ ...fade(200) }}>
            <div style={{ background: "#111", padding: "40px 32px", position: "relative", overflow: "hidden", height: "100%" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: ACC }} />
              <div style={{ fontFamily: FB, fontWeight: 500, fontSize: 10, color: ACC, letterSpacing: "0.14em", marginBottom: 28 }}>24FRAME · СТАТИСТИКА</div>
              {[
                { val: c1, suf: " лет", label: "на рынке Казахстана" },
                { val: c2, suf: "+", label: "проектов сдано в срок" },
                { val: 0, suf: "%", label: "шаблонов — никогда" },
              ].map((s, i) => (
                <div key={s.label} style={{ paddingBottom: i < 2 ? 22 : 0, marginBottom: i < 2 ? 22 : 0, borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                  <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 42, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {s.val}{s.suf}
                  </div>
                  <div style={{ fontFamily: FB, fontWeight: 300, fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
              <a href="https://wa.me/77066659056?text=Хочу%20получить%20бесплатную%20консультацию%20по%20сайту"
                target="_blank" rel="noreferrer"
                onClick={trackLead}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 28, fontFamily: FB, fontWeight: 700, fontSize: 13, color: "#111", background: ACC, padding: "14px", textDecoration: "none", textAlign: "center", letterSpacing: "0.06em", transition: "opacity .2s" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                <WaIcon size={14} color="#111" /> ОБСУДИТЬ ПРОЕКТ
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint — desktop only */}
      <div className="scroll-hint" style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", flexDirection: "column", alignItems: "center", gap: 6, opacity: loaded ? 1 : 0, transition: "opacity 1s ease 1.4s" }}>
        <span style={{ fontFamily: FB, fontSize: 9, color: "#ccc", letterSpacing: "0.16em" }}>СКРОЛЛ</span>
        <div style={{ width: 1, height: 28, background: "linear-gradient(to bottom, #bbb, transparent)", animation: "scroll-anim 2s ease-in-out infinite" }} />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   MARQUEE
═══════════════════════════════════════════════════════════ */
function Marquee() {
  const items = ["24FRAME", "Без Tilda", "Без Wix", "Чистый код", "За 24 часа", "7 лет опыта", "100+ проектов", "Не шаблон", "Казахстан", "WhatsApp заявки", "SEO базис", "Mobile First"];
  const nodes = items.flatMap((it, i) => [
    <span key={`t${i}`} style={{ fontFamily: FD, fontWeight: 600, fontSize: 11, color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{it}</span>,
    <span key={`d${i}`} style={{ color: ACC, margin: "0 18px", fontSize: 7, flexShrink: 0 }}>◆</span>,
  ]);
  return (
    <div style={{ background: "#ECEAE5", overflow: "hidden", padding: "12px 0", borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", whiteSpace: "nowrap" }}>
        <div className="marquee-track" style={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
          {nodes}{nodes}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WHAT WE DO
═══════════════════════════════════════════════════════════ */
const FEATURES = [
  { n: "01", title: "Уникальный дизайн", desc: "Под ваш бренд с нуля — без шаблонов и конструкторов. Только чистый код.", icon: "◈" },
  { n: "02", title: "Форма → WhatsApp", desc: "Каждая заявка мгновенно летит вам в мессенджер или на почту.", icon: "◉" },
  { n: "03", title: "Мобильная версия", desc: "Одинаково красиво на iPhone, Android и любом экране.", icon: "◎" },
  { n: "04", title: "Домен + хостинг", desc: "Подключаем, настраиваем и объясняем — вы просто получаете сайт.", icon: "◈" },
  { n: "05", title: "SEO и аналитика", desc: "Правильная структура, мета-теги, скорость — Google вас заметит.", icon: "◉" },
  { n: "06", title: "Поддержка после сдачи", desc: "7 дней бесплатных правок. Всегда на связи после запуска.", icon: "◎" },
];

function WhatWeDo() {
  const { ref, visible } = useScrollReveal();
  return (
    <section id="services" style={{ background: "#fff", padding: "80px 0", position: "relative", overflow: "hidden" }}>
      <div aria-hidden className="bg-deco" style={{ position: "absolute", top: -20, left: -10, fontFamily: FD, fontWeight: 800, fontSize: "clamp(80px, 18vw, 240px)", color: "transparent", WebkitTextStroke: "1px #F0EDE7", lineHeight: 1, userSelect: "none", pointerEvents: "none", letterSpacing: "-0.04em", whiteSpace: "nowrap" }}>ЧТО МЫ</div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ fontFamily: FB, fontWeight: 500, fontSize: 11, color: ACC, letterSpacing: "0.14em", display: "block", marginBottom: 12 }}>ЧТО МЫ ДЕЛАЕМ</span>
            <h2 style={{ fontFamily: FD, fontWeight: 800, fontSize: "clamp(22px, 5.5vw, 48px)", color: "#111", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
              Сайт, который<br />
              <span style={{ WebkitTextStroke: "clamp(3px,0.7vw,5px) #111", color: "#fff", paintOrder: "stroke fill" }}>работает на бизнес</span>
            </h2>
          </div>
          <a href="#pricing" style={{ fontFamily: FB, fontWeight: 600, fontSize: 13, color: ACC, textDecoration: "none", borderBottom: `1.5px solid ${ACC}`, paddingBottom: 2, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
            Смотреть тарифы →
          </a>
        </div>

        {/* Grid */}
        <div ref={ref} className="feat-grid">
          {FEATURES.map((f, i) => (
            <div key={f.n} className="feat-card"
              style={{ background: "#fff", padding: "28px 24px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: `opacity .5s ease ${i * 70}ms, transform .5s ease ${i * 70}ms`, borderBottom: "1px solid rgba(0,0,0,0.07)", borderRight: "1px solid rgba(0,0,0,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 22, color: "#F0EDE7", letterSpacing: "-0.03em", lineHeight: 1 }}>{f.n}</div>
                <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.08)" }} />
                <div style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(12px, 3vw, 15px)", color: "#111", lineHeight: 1.3 }}>{f.title}</div>
              </div>
              <div style={{ fontFamily: FB, fontWeight: 300, fontSize: 13, color: "#999", lineHeight: 1.7 }}>{f.desc}</div>
              <div style={{ marginTop: 16, width: 24, height: 2, background: ACC, opacity: 0, transition: "opacity .3s" }} className="feat-line" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROCESS
═══════════════════════════════════════════════════════════ */
function Process() {
  const { ref, visible } = useScrollReveal();
  const steps = [
    { n: "01", t: "Заявка", d: "Пишете в WA — ответ за 15 минут" },
    { n: "02", t: "Бриф", d: "Уточняем задачу и цели сайта" },
    { n: "03", t: "Дизайн", d: "Уникальный макет под ваш бренд" },
    { n: "04", t: "Код", d: "Верстаем без шаблонов" },
    { n: "05", t: "Запуск", d: "Сайт онлайн — 24FRAME готов" },
  ];
  return (
    <section id="process" style={{ background: "#111", padding: "72px 0" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: FB, fontWeight: 500, fontSize: 11, color: ACC, letterSpacing: "0.14em" }}>КАК МЫ РАБОТАЕМ</span>
          <span style={{ fontFamily: FD, fontWeight: 800, fontSize: "clamp(14px, 3.5vw, 26px)", color: "#fff", letterSpacing: "-0.02em" }}>5 ШАГОВ → 24FRAME ГОТОВ</span>
        </div>
        <div ref={ref} className="process-row">
          {steps.map((s, i) => (
            <div key={s.n} className="process-step"
              style={{ padding: "24px 20px 24px 0", opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-16px)", transition: `opacity .5s ease ${i * 90}ms, transform .5s ease ${i * 90}ms` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 11, color: ACC, letterSpacing: "0.1em", flexShrink: 0 }}>{s.n}</div>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} className="process-line" />
              </div>
              <div style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(13px, 3vw, 15px)", color: "#fff", marginBottom: 6 }}>{s.t}</div>
              <div style={{ fontFamily: FB, fontWeight: 300, fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.65 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRICING
═══════════════════════════════════════════════════════════ */
const PACKAGES = [
  {
    id: "start", name: "СТАРТ", price: "₸79 000", subprice: "разово", tag: null,
    tagline: "Для малого бизнеса и фрилансеров", timeline: "24FRAME за 24 часа",
    features: ["Лендинг до 5 секций", "Уникальный дизайн", "Мобильная адаптация", "Форма заявки в WhatsApp", "Домен + хостинг в подарок", "Базовый SEO"],
    missing: ["Обратный звонок", "Правки после сдачи"],
    cta: "Выбрать СТАРТ", highlight: false,
  },
  {
    id: "biz", name: "БИЗНЕС", price: "₸129 000", subprice: "разово", tag: "ХИТ ПРОДАЖ",
    tagline: "Для компаний и интернет-магазинов", timeline: "24FRAME за 24 часа",
    features: ["Сайт до 8 секций", "Уникальный дизайн + анимации", "WhatsApp + обратный звонок", "Домен + хостинг 1 год", "SEO-базис + Google Analytics", "7 дней бесплатных правок", "Форма + email уведомления", "Скорость загрузки < 2 сек"],
    missing: [],
    cta: "Выбрать БИЗНЕС", highlight: true,
  },
  {
    id: "pro", name: "ПРО", price: "от ₸249 000", subprice: "по проекту", tag: null,
    tagline: "Для крупных компаний и e-commerce", timeline: "Срок по согласованию",
    features: ["Многостраничный сайт / магазин", "Каталог + фильтры + корзина", "Интеграция с CRM и оплатой", "Полный SEO-аудит и продвижение", "Личный кабинет / авторизация", "Сопровожден��е 1 месяц"],
    missing: [],
    cta: "Обсудить проект", highlight: false,
  },
];

function PackageCard({ pkg, index, visible, isMob }: { pkg: typeof PACKAGES[0]; index: number; visible: boolean; isMob: boolean }) {
  const [hov, setHov] = useState(false);
  const [expanded, setExpanded] = useState(pkg.highlight);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        background: pkg.highlight ? "#111" : "#fff",
        border: pkg.highlight ? "none" : "1px solid rgba(0,0,0,0.1)",
        display: "flex", flexDirection: "column",
        opacity: visible ? 1 : 0,
        transform: visible ? (hov && !isMob ? "translateY(-5px)" : "translateY(0)") : "translateY(28px)",
        transition: `opacity .6s ease ${index * 110}ms, transform ${hov && !isMob ? ".25s" : ".6s"} ${hov && !isMob ? "0s" : `${index * 110}ms`} cubic-bezier(.23,1,.32,1)`,
        boxShadow: hov && !isMob ? (pkg.highlight ? "0 20px 60px rgba(0,0,0,0.3)" : "0 16px 48px rgba(0,0,0,0.1)") : "none",
        zIndex: pkg.highlight ? 2 : 1,
        overflow: "hidden",
      }}>
      {/* Top accent bar */}
      <div style={{ height: 3, background: pkg.highlight ? ACC : "rgba(0,0,0,0.07)", flexShrink: 0 }} />

      {/* Header - always visible */}
      <div
        style={{ padding: "24px 24px 20px", cursor: isMob ? "pointer" : "default" }}
        onClick={() => isMob && setExpanded(e => !e)}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: FD, fontWeight: 800, fontSize: 12, letterSpacing: "0.12em", color: pkg.highlight ? ACC : "#bbb" }}>{pkg.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {pkg.tag && (
              <div style={{ background: ACC, padding: "3px 8px" }}>
                <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 9, color: "#fff", letterSpacing: "0.06em" }}>{pkg.tag}</span>
              </div>
            )}
            {isMob && (
              <span style={{ fontFamily: FB, fontSize: 16, color: pkg.highlight ? "#fff" : "#999", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .3s", display: "inline-block" }}>‹</span>
            )}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <span style={{ fontFamily: FD, fontWeight: 800, fontSize: "clamp(28px, 7vw, 40px)", color: pkg.highlight ? "#fff" : "#111", letterSpacing: "-0.04em", lineHeight: 1 }}>
            {pkg.price}
          </span>
        </div>
        <div style={{ fontFamily: FB, fontWeight: 300, fontSize: 11, color: pkg.highlight ? "rgba(255,255,255,0.35)" : "#bbb", marginTop: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>{pkg.subprice} · {pkg.tagline}</div>
      </div>

      {/* Expandable body */}
      <div style={{ maxHeight: (!isMob || expanded) ? "600px" : "0px", overflow: "hidden", transition: "max-height .4s cubic-bezier(.23,1,.32,1)" }}>
        <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Divider */}
          <div style={{ height: 1, background: pkg.highlight ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", marginBottom: 18 }} />

          {/* Features */}
          <div style={{ marginBottom: 20 }}>
            {pkg.features.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 9 }}>
                <span style={{ color: ACC, fontSize: 13, lineHeight: 1.5, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontFamily: FB, fontWeight: 400, fontSize: 13, color: pkg.highlight ? "rgba(255,255,255,0.82)" : "#444", lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
            {pkg.missing.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 9, opacity: 0.3 }}>
                <span style={{ color: pkg.highlight ? "#fff" : "#999", fontSize: 13, lineHeight: 1.5, flexShrink: 0 }}>–</span>
                <span style={{ fontFamily: FB, fontWeight: 400, fontSize: 13, color: pkg.highlight ? "#fff" : "#888", lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
            <span style={{ fontFamily: FB, fontWeight: 500, fontSize: 11, color: pkg.highlight ? "rgba(255,255,255,0.45)" : "#999", letterSpacing: "0.06em" }}>{pkg.timeline}</span>
          </div>

          {/* CTA */}
          <a
            href={`https://wa.me/77066659056?text=${encodeURIComponent(`Здравствуйте! Интересует тариф 24FRAME ${pkg.name} (${pkg.price})`)}`}
            target="_blank" rel="noreferrer"
            onClick={trackLead}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: FB, fontWeight: 700, fontSize: 14, padding: "14px",
              letterSpacing: "0.04em", textDecoration: "none",
              background: pkg.highlight ? ACC : "transparent",
              color: pkg.highlight ? "#fff" : "#111",
              border: pkg.highlight ? "none" : "1.5px solid rgba(0,0,0,0.18)",
              transition: "all 0.2s ease",
            }}
            className={pkg.highlight ? "cta-accent" : "cta-outline"}>
            <WaIcon size={14} color={pkg.highlight ? "#fff" : "#111"} />
            {pkg.cta} →
          </a>
        </div>
      </div>
    </div>
  );
}

function Pricing() {
  const { ref, visible } = useScrollReveal();
  const isMob = useIsMobile();
  return (
    <section id="pricing" style={{ background: BG, padding: "80px 0", position: "relative", overflow: "hidden" }}>
      <div aria-hidden className="bg-deco" style={{ position: "absolute", bottom: -40, right: -20, fontFamily: FD, fontWeight: 800, fontSize: "clamp(70px, 16vw, 200px)", color: "transparent", WebkitTextStroke: "1px #E6E3DC", lineHeight: 1, userSelect: "none", pointerEvents: "none", letterSpacing: "-0.04em" }}>ЦЕНА</div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>
        <span style={{ fontFamily: FB, fontWeight: 500, fontSize: 11, color: ACC, letterSpacing: "0.14em", display: "block", marginBottom: 14 }}>ТАРИФЫ 24FRAME</span>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <h2 style={{ fontFamily: FD, fontWeight: 800, fontSize: "clamp(22px, 5.5vw, 52px)", color: "#111", lineHeight: 1.0, letterSpacing: "-0.03em", margin: 0 }}>
            Три пакета.<br />
            <span style={{ WebkitTextStroke: "clamp(3px,0.7vw,5px) #111", color: BG, paintOrder: "stroke fill" }}>Прозрачные цены.</span>
          </h2>
          <p style={{ fontFamily: FB, fontWeight: 300, fontSize: 14, color: "#999", maxWidth: 300, margin: 0, lineHeight: 1.6 }}>
            Никаких скрытых доплат.<br />Оплата после согласования макета.
          </p>
        </div>

        <div ref={ref} className="pricing-grid">
          {PACKAGES.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} visible={visible} isMob={isMob} />
          ))}
        </div>

        <p style={{ fontFamily: FB, fontWeight: 300, fontSize: 12, color: "#ccc", textAlign: "center", marginTop: 24 }}>
          * Дом��н и хостинг включены во все тарифы 24FRAME на 1-й год. Продление ~₸15 000/год.
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER CTA
═══════════════════════════════════════════════════════════ */
function FooterCTA() {
  const { ref, visible } = useScrollReveal();
  const [almTime, setAlmTime] = useState("");
  useEffect(() => {
    const upd = () => {
      const d = new Date();
      const alm = new Date(d.getTime() + (5 * 60 + d.getTimezoneOffset()) * 60000);
      setAlmTime(`${String(alm.getHours()).padStart(2, "0")}:${String(alm.getMinutes()).padStart(2, "0")} Алматы`);
    };
    upd(); const id = setInterval(upd, 1000); return () => clearInterval(id);
  }, []);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tStr = tomorrow.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

  return (
    <section id="contact" style={{ background: "#111", padding: "80px 0 0" }}>
      <div ref={ref} style={{ maxWidth: 1300, margin: "0 auto", padding: "0 20px" }}>
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)",
          transition: "opacity .8s ease, transform .8s ease",
          borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 60,
        }}>
          {/* Main CTA block */}
          <div className="footer-cta-layout">
            <div>
              <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 10, color: ACC, letterSpacing: "0.2em", background: "rgba(255,69,0,0.1)", padding: "5px 10px", display: "inline-block", marginBottom: 24 }}>
                24FRAME · СТАРТ
              </span>
              <h2 style={{ fontFamily: FD, fontWeight: 800, fontSize: "clamp(26px, 6.5vw, 68px)", color: "#fff", lineHeight: 0.95, letterSpacing: "-0.04em", margin: "0 0 20px" }}>
                Готовы запустить<br />
                сайт уже{" "}
                <span style={{ WebkitTextStroke: "clamp(2px,0.5vw,4px) #fff", color: "#111", paintOrder: "stroke fill" }}>{tStr}?</span>
              </h2>
              <p style={{ fontFamily: FB, fontWeight: 300, fontSize: 15, color: "rgba(255,255,255,0.3)", margin: 0 }}>
                Ответим за 15 минут · Сейчас {almTime}
              </p>
            </div>
            <div className="footer-cta-actions">
              <a href="https://wa.me/77066659056?text=Хочу%20получить%20бесплатную%20консультацию%20по%20сайту" target="_blank" rel="noreferrer"
                onClick={trackLead}
                style={{ fontFamily: FB, fontWeight: 700, fontSize: 15, color: "#111", background: ACC, padding: "18px 36px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, letterSpacing: "0.04em", transition: "opacity .2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}>
                <WaIcon size={17} color="#111" /> Написать в WhatsApp
              </a>
              <a href="https://t.me/tamba_studio" target="_blank" rel="noreferrer"
                style={{ fontFamily: FB, fontWeight: 500, fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: 2, letterSpacing: "0.04em", transition: "color .2s", textAlign: "center" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.35)"; }}>
                или в Telegram →
              </a>
            </div>
          </div>

          {/* Footer bar */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "24px 0 28px", marginTop: 56 }} className="footer-bar">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: FD, fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-0.03em" }}>24FRAME</span>
            </div>
            <span style={{ fontFamily: FB, fontWeight: 300, fontSize: 11, color: "rgba(255,255,255,0.18)", letterSpacing: "0.08em" }}>ВЕБ-СТУДИЯ С 2017 · КАЗАХСТАН</span>
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { label: "WhatsApp", href: "https://wa.me/77066659056?text=Хочу%20получить%20бесплатную%20консультацию%20по%20сайту" },
                { label: "Telegram", href: "https://t.me/tamba_studio" },
                { label: "Instagram", href: "https://instagram.com/24frame.kz" },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" style={{ fontFamily: FB, fontSize: 12, color: "rgba(255,255,255,0.28)", textDecoration: "none", letterSpacing: "0.04em", transition: "color .2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = ACC; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.28)"; }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   WA ICON
═══════════════════════════════════════════════════════════ */
function WaIcon({ size = 16, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES — MOBILE FIRST
══════════════��════════════════════════════════════════════ */
function GlobalStyles() {
  return (
    <style>{`
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
      body { background: ${BG}; overflow-x: hidden; -webkit-font-smoothing: antialiased; }

      @media (pointer: fine) { * { cursor: none !important; } }

      /* MARQUEE */
      @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      .marquee-track { animation: marquee 28s linear infinite; }
      .marquee-track:hover { animation-play-state: paused; }

      /* ANIMATIONS */
      @keyframes pulse-dot {
        0%, 100% { box-shadow: 0 0 0 2px rgba(34,197,94,0.2); }
        50% { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
      }
      .pulse-dot { animation: pulse-dot 2s infinite; }
      @keyframes scroll-anim {
        0% { opacity: 1; transform: scaleY(1); }
        100% { opacity: 0; transform: scaleY(0.2) translateY(12px); }
      }

      /* NAV */
      .nav-wa:hover { background: ${ACC} !important; color: #fff !important; }
      .menu-link:hover > span:first-child { color: ${ACC} !important; }

      /* BG DECORATIONS — hidden on mobile */
      .bg-deco { display: none; }

      /* SCROLL HINT — hidden on mobile */
      .scroll-hint { display: none; }

      /* HERO */
      .hero-layout { display: grid; grid-template-columns: 1fr; gap: 0; }
      .hero-card { display: none; }
      .stats-row { display: flex; align-items: flex-start; gap: 0; flex-wrap: wrap; }
      .hero-cta a { font-size: 13px !important; }

      /* FEATURES */
      .feat-grid { display: grid; grid-template-columns: 1fr; border-top: 1px solid rgba(0,0,0,0.07); border-left: 1px solid rgba(0,0,0,0.07); }
      .feat-card { border-bottom: 1px solid rgba(0,0,0,0.07) !important; border-right: none !important; border-left: none !important; }
      .feat-card:hover .feat-line { opacity: 1 !important; }

      /* PROCESS */
      .process-row { display: grid; grid-template-columns: 1fr; }
      .process-step { border-bottom: 1px solid rgba(255,255,255,0.06); }
      .process-step:last-child { border-bottom: none; }
      .process-line { display: none; }

      /* PRICING */
      .pricing-grid { display: grid; grid-template-columns: 1fr; gap: 2px; }
      .cta-accent:hover { opacity: 0.88 !important; }
      .cta-outline:hover { background: #111 !important; color: #fff !important; border-color: #111 !important; }

      /* FOOTER */
      .footer-cta-layout { display: flex; flex-direction: column; gap: 32px; margin-bottom: 0; }
      .footer-cta-actions { display: flex; flex-direction: column; gap: 14px; }
      .footer-bar { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }

      /* FLOATING WA — show on all devices */
      .floating-wa { display: flex; }

      /* BUTTONS */
      .btn-primary:active { opacity: 0.85; }
      .btn-outline:active { background: rgba(0,0,0,0.05); }

      /* ── TABLET: 640px+ ── */
      @media (min-width: 640px) {
        .bg-deco { display: block; }
        .scroll-hint { display: flex; }
        .feat-grid { grid-template-columns: repeat(2, 1fr); }
        .feat-card { border-right: 1px solid rgba(0,0,0,0.07) !important; }
        .feat-card:nth-child(even) { border-right: none !important; }
        .process-row { grid-template-columns: repeat(2, 1fr); }
        .process-step { border-right: 1px solid rgba(255,255,255,0.06); }
        .process-step:nth-child(even) { border-right: none; }
        .pricing-grid { grid-template-columns: 1fr; gap: 4px; }
        .footer-cta-layout { flex-direction: row; align-items: flex-end; justify-content: space-between; margin-bottom: 56px; }
        .footer-cta-actions { align-items: flex-end; }
        .footer-bar { flex-direction: row; align-items: center; justify-content: space-between; }
      }

      /* ── DESKTOP: 1024px+ ── */
      @media (min-width: 1024px) {
        .hero-layout { grid-template-columns: 1fr 360px; gap: 48px; align-items: center; }
        .hero-card { display: block; }
        .feat-grid { grid-template-columns: repeat(3, 1fr); }
        .feat-card:nth-child(even) { border-right: 1px solid rgba(0,0,0,0.07) !important; }
        .feat-card:nth-child(3n) { border-right: none !important; }
        .process-row { grid-template-columns: repeat(5, 1fr); border-left: 1px solid rgba(255,255,255,0.07); border-right: 1px solid rgba(255,255,255,0.07); }
        .process-step { border-right: 1px solid rgba(255,255,255,0.07); border-bottom: none !important; padding: 28px 24px !important; }
        .process-step:last-child { border-right: none; }
        .process-line { display: block; }
        .pricing-grid { grid-template-columns: repeat(3, 1fr); }
        .floating-wa { display: none; }
        .hero-cta a { font-size: 14px !important; flex: none !important; width: auto !important; }
      }

      /* ── LARGE: 1280px+ ── */
      @media (min-width: 1280px) {
        .hero-layout { grid-template-columns: 1fr 400px; gap: 60px; }
      }
    `}</style>
  );
}

/* ═══════════════════════════════════════════════════════════
   META PIXEL
═══════════════════════════════════════════════════════════ */
function MetaPixel() {
  useEffect(() => {
    const script = document.createElement("script");
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '1829647964396585');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    const noscript = document.createElement("noscript");
    const img = document.createElement("img");
    img.height = 1;
    img.width = 1;
    img.style.display = "none";
    img.src = "https://www.facebook.com/tr?id=1829647964396585&ev=PageView&noscript=1";
    noscript.appendChild(img);
    document.head.appendChild(noscript);

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
      if (document.head.contains(noscript)) document.head.removeChild(noscript);
    };
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  return (
    <>
      <MetaPixel />
      <GlobalStyles />
      <GrainOverlay />
      <CustomCursor />
      <FloatingWA />
      <Nav />
      <Hero />
      <Marquee />
      <WhatWeDo />
      <Process />
      <Pricing />
      <FooterCTA />
    </>
  );
}
