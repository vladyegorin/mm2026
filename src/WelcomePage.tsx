import { useState, useEffect, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Web Audio helpers — no external files needed
// ---------------------------------------------------------------------------
function createAudioCtx(): AudioContext {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
}

/** Undertale-style blip: short sine burst */
function playBlip(ctx: AudioContext, pitch = 520) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "square";
  osc.frequency.setValueAtTime(pitch, ctx.currentTime);
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.07);
}

/**
 * "Once Upon a Time" — Undertale's opening theme.
 * Simplified 8-bar melody recreation via Web Audio oscillators.
 */
function playOnceUponATime(ctx: AudioContext): () => void {
  // Melody notes in Hz (approximate): C5 D5 E5 G5 A5 pattern
  const C4=261.6, D4=293.7, E4=329.6, G4=392, A4=440,
        C5=523.3, D5=587.3, E5=659.3, G5=784, A5=880, B4=493.9, F4=349.2;

  // Melody: [ [hz, startBeat, durationBeats] ]
  const BPM = 90;
  const beat = 60 / BPM;

  const melody: [number, number, number][] = [
    [E5,0,1],[D5,1,1],[C5,2,1],[D5,3,1],
    [E5,4,1],[E5,5,1],[E5,6,2],
    [D5,8,1],[D5,9,1],[D5,10,2],
    [E5,12,1],[G5,13,1],[G5,14,2],
    [E5,16,1],[D5,17,1],[C5,18,1],[D5,19,1],
    [E5,20,1],[E5,21,1],[E5,22,1],[E5,23,0.5],
    [D5,23.5,0.5],[D5,24,1],[E5,25,1],[D5,26,1],[C5,27,2],
    // repeat with harmony
    [E5,30,1],[D5,31,1],[C5,32,1],[D5,33,1],
    [E5,34,2],[D5,36,2],[C5,38,4],
  ];

  // Bass line
  const bass: [number, number, number][] = [
    [C4,0,2],[G4,2,2],[A4,4,2],[E4,6,2],
    [F4,8,2],[C4,10,2],[G4,12,4],
    [C4,16,2],[G4,18,2],[A4,20,2],[E4,22,2],
    [F4,24,2],[G4,26,2],[C4,28,4],
    [C4,30,2],[G4,32,2],[A4,34,2],[G4,36,2],[C4,38,4],
  ];

  const nodes: AudioNode[] = [];

  function scheduleNote(freq: number, startBeat: number, durBeats: number, type: OscillatorType, vol: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = ctx.currentTime + startBeat * beat;
    const t1 = t0 + durBeats * beat - 0.02;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.setValueAtTime(vol, t1 - 0.05);
    gain.gain.linearRampToValueAtTime(0, t1);
    osc.start(t0);
    osc.stop(t1 + 0.05);
    nodes.push(osc, gain);
  }

  melody.forEach(([f, s, d]) => scheduleNote(f, s, d, "triangle", 0.12));
  bass.forEach(([f, s, d]) => scheduleNote(f, s, d, "sine", 0.06));

  return () => { nodes.forEach(n => { try { (n as any).stop?.(); } catch {} }); };
}

// ---------------------------------------------------------------------------
// Typing phrases (the decoy AI-tool copy)
// ---------------------------------------------------------------------------
const TYPING_PHRASES = [
  "Solve LeetCode with AI assistance",
  "Ace your technical interviews",
  "Master DSA with smart hints",
  "Code smarter, not harder",
];

// ---------------------------------------------------------------------------
// Undertale-style dialogue for the start screen
// ---------------------------------------------------------------------------
const UNDERTALE_LINES = [
  "* Howdy! I'm FLOWEY. FLOWEY the FLOWER!",
  "* You're new to the INTERNET, aren't ya?",
  "* Well, as your best friend, I'll teach you how things work around here!",
  "* In this world... it's SOLVE or be SOLVED.",
  "* And I have ABSOLUTELY NO IDEA what I'm doing.",
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function WelcomePage({ onStart }: { onStart?: () => void }) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  // Undertale dialogue
  const [dlgLine, setDlgLine] = useState(0);
  const [dlgText, setDlgText] = useState("");
  const [dlgCharIdx, setDlgCharIdx] = useState(0);
  const [dlgDone, setDlgDone] = useState(false);

  // Audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopMusicRef = useRef<(() => void) | null>(null);
  const [musicStarted, setMusicStarted] = useState(false);
  const blipPitches = [520, 560, 490, 540, 510]; // slight variation per char

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = createAudioCtx();
    }
    return audioCtxRef.current;
  }, []);

  // Hero typing animation (no sound — that's for the Undertale box)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = TYPING_PHRASES[phraseIndex];
      if (!deleting) {
        setDisplayed(current.slice(0, charIndex + 1));
        setCharIndex(c => c + 1);
        if (charIndex + 1 === current.length) setTimeout(() => setDeleting(true), 1600);
      } else {
        setDisplayed(current.slice(0, charIndex - 1));
        setCharIndex(c => c - 1);
        if (charIndex - 1 === 0) {
          setDeleting(false);
          setPhraseIndex(i => (i + 1) % TYPING_PHRASES.length);
        }
      }
    }, deleting ? 38 : 72);
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, phraseIndex]);

  useEffect(() => {
    const t = setTimeout(() => setStatsVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Undertale dialogue typing with blip sound
  useEffect(() => {
    if (!musicStarted) return;
    const line = UNDERTALE_LINES[dlgLine];
    if (dlgCharIdx < line.length) {
      const t = setTimeout(() => {
        setDlgText(line.slice(0, dlgCharIdx + 1));
        setDlgCharIdx(i => i + 1);
        // play blip for non-space chars
        if (line[dlgCharIdx] !== " ") {
          const ctx = getCtx();
          playBlip(ctx, blipPitches[dlgCharIdx % blipPitches.length]);
        }
      }, 38);
      return () => clearTimeout(t);
    } else {
      setDlgDone(true);
    }
  }, [dlgCharIdx, dlgLine, musicStarted, getCtx]);

  const advanceDialogue = () => {
    if (!dlgDone) {
      // skip to end of line
      setDlgText(UNDERTALE_LINES[dlgLine]);
      setDlgCharIdx(UNDERTALE_LINES[dlgLine].length);
      setDlgDone(true);
    } else {
      const next = dlgLine + 1;
      if (next < UNDERTALE_LINES.length) {
        setDlgLine(next);
        setDlgText("");
        setDlgCharIdx(0);
        setDlgDone(false);
      } else {
        onStart?.();
      }
    }
  };

  const handleStart = () => {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    if (!musicStarted) {
      stopMusicRef.current = playOnceUponATime(ctx);
      setMusicStarted(true);
    }
  };

  return (
    <div style={s.root}>
      <div style={s.noise} />

      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.logo}>
          <span style={s.logoIcon}>⚡</span>
          <span style={s.logoText}>SheetCode</span>
          <span style={s.logoBadge}>AI</span>
        </div>
        <div style={s.navLinks}>
          {["Problems","Roadmap","Pricing","Blog"].map(l => (
            <a key={l} href="#" style={s.navLink}>{l}</a>
          ))}
        </div>
        <div style={s.navActions}>
          <button style={s.btnGhost}>Sign In</button>
          <button style={s.btnPrimary}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroBadge}>
          <span style={s.heroBadgeDot} />
          Powered by Advanced AI Technology™
        </div>
        <h1 style={s.heroTitle}>
          The <span style={s.heroAccent}>AI-Powered</span><br />Coding Interview Platform
        </h1>
        <p style={s.heroSubtitle}>
          <span style={s.typingText}>{displayed}</span>
          <span style={s.cursor}>|</span>
        </p>
        <p style={s.heroDesc}>
          Our proprietary AI engine analyzes your code in real time, providing
          intelligent suggestions to help you crack any technical interview.
        </p>
        <div style={s.heroActions}>
          <button style={{ ...s.heroCta, fontSize: 20, padding: "18px 52px", letterSpacing: 1 }} onClick={() => onStart?.()}>
            Start Coding
          </button>
        </div>
        <p style={s.heroSocial}>
          Trusted by <strong>47,000+</strong> engineers at Google, Meta, Amazon &amp; more
        </p>
      </section>

      {/* Undertale dialogue box */}
      {musicStarted && (
        <div style={s.dlgWrapper} onClick={advanceDialogue}>
          <div style={s.dlgBox}>
            <div style={s.dlgPortrait}>🌸</div>
            <div style={s.dlgContent}>
              <div style={s.dlgName}>FLOWEY</div>
              <div style={s.dlgText}>{dlgText}<span style={dlgDone ? s.dlgArrow : s.dlgArrowHidden}>▼</span></div>
            </div>
          </div>
          <div style={s.dlgHint}>[ Click to continue ]</div>
        </div>
      )}

      {/* Stats bar */}
      <div style={{ ...s.statsBar, opacity: statsVisible ? 1 : 0 }}>
        {[
          { n: "3,400+", label: "Problems" },
          { n: "47K+", label: "Users" },
          { n: "94%", label: "Offer Rate" },
          { n: "GPT-∞", label: "AI Engine" },
        ].map(({ n, label }) => (
          <div key={label} style={s.statItem}>
            <span style={s.statNum}>{n}</span>
            <span style={s.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <section style={s.features}>
        <h2 style={s.sectionTitle}>Everything you need to <span style={s.heroAccent}>land the job</span></h2>
        <div style={s.cardGrid}>
          {[
            { icon: "🤖", title: "AI Code Assistant", desc: "Our state-of-the-art AI reviews your solution and suggests optimizations in real time." },
            { icon: "🗺️", title: "Smart Roadmap", desc: "AI-curated learning paths tailored to your target company and role." },
            { icon: "📊", title: "Performance Analytics", desc: "Deep insights into your strengths and weaknesses with AI-powered breakdowns." },
            { icon: "🧠", title: "Pattern Recognition", desc: "Our AI identifies which algorithmic patterns you haven't mastered yet." },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={s.card}>
              <div style={s.cardIcon}>{icon}</div>
              <h3 style={s.cardTitle}>{title}</h3>
              <p style={s.cardDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={s.ctaBanner}>
        <h2 style={s.ctaTitle}>Ready to get started?</h2>
        <p style={s.ctaDesc}>Join thousands of engineers who cracked FAANG with SheetCode AI.</p>
        <button style={s.heroCta}>Create Free Account</button>
      </section>

      <footer style={s.footer}>
        <span style={s.logoText}>⚡ SheetCode</span>
        <span style={s.footerNote}>© 2025 SheetCode Inc. All rights reserved.</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0d0f; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes dlgIn { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
        @keyframes arrowBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight:"100vh", background:"#0d0d0f", color:"#e8e8ec", fontFamily:"'DM Sans', sans-serif", overflowX:"hidden", position:"relative" },
  noise: { position:"fixed", inset:0, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, backgroundRepeat:"repeat", backgroundSize:"128px", pointerEvents:"none", zIndex:0 },
  nav: { position:"sticky", top:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 40px", height:60, background:"rgba(13,13,15,0.85)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.06)" },
  logo: { display:"flex", alignItems:"center", gap:8 },
  logoIcon: { fontSize:20 },
  logoText: { fontFamily:"'Space Mono', monospace", fontWeight:700, fontSize:17, color:"#fff", letterSpacing:"-0.3px" },
  logoBadge: { background:"linear-gradient(135deg,#3b82f6,#6366f1)", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:4, letterSpacing:0.5 },
  navLinks: { display:"flex", gap:28 },
  navLink: { color:"#9ca3af", textDecoration:"none", fontSize:14, fontWeight:500 },
  navActions: { display:"flex", gap:10, alignItems:"center" },
  btnGhost: { background:"none", border:"1px solid rgba(255,255,255,0.12)", color:"#d1d5db", borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans', sans-serif" },
  btnPrimary: { background:"linear-gradient(135deg,#3b82f6,#6366f1)", border:"none", color:"#fff", borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans', sans-serif" },
  hero: { position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", padding:"100px 24px 60px", animation:"fadeUp 0.6s ease both" },
  heroBadge: { display:"inline-flex", alignItems:"center", gap:7, background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.3)", color:"#a5b4fc", fontSize:12, fontWeight:600, padding:"5px 14px", borderRadius:99, marginBottom:28, letterSpacing:0.3 },
  heroBadgeDot: { width:7, height:7, borderRadius:"50%", background:"#6ee7b7", boxShadow:"0 0 8px #6ee7b7", animation:"blink 1.6s infinite", display:"inline-block" },
  heroTitle: { fontSize:"clamp(40px,6vw,72px)", fontWeight:700, lineHeight:1.1, letterSpacing:"-2px", color:"#fff", marginBottom:24 },
  heroAccent: { background:"linear-gradient(90deg,#3b82f6,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
  heroSubtitle: { fontSize:22, color:"#9ca3af", fontFamily:"'Space Mono', monospace", marginBottom:20, minHeight:32 },
  typingText: { color:"#c4b5fd" },
  cursor: { color:"#6366f1", animation:"blink 0.9s step-end infinite", marginLeft:2 },
  heroDesc: { maxWidth:560, fontSize:16, color:"#6b7280", lineHeight:1.7, marginBottom:36 },
  heroActions: { display:"flex", gap:14, marginBottom:28 },
  heroCta: { background:"linear-gradient(135deg,#3b82f6,#6366f1)", border:"none", color:"#fff", borderRadius:10, padding:"13px 28px", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans', sans-serif", boxShadow:"0 4px 24px rgba(99,102,241,0.35)" },
  heroCtaGhost: { background:"none", border:"1px solid rgba(255,255,255,0.1)", color:"#d1d5db", borderRadius:10, padding:"13px 24px", fontSize:15, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans', sans-serif" },
  heroSocial: { fontSize:13, color:"#4b5563" },

  // Undertale dialogue
  dlgWrapper: { position:"fixed", bottom:32, left:"50%", transform:"translateX(-50%)", zIndex:200, width:"min(700px, 95vw)", cursor:"pointer", animation:"dlgIn 0.4s ease both" },
  dlgBox: { background:"#000", border:"3px solid #fff", borderRadius:0, padding:"18px 22px", display:"flex", gap:18, alignItems:"flex-start", imageRendering:"pixelated" },
  dlgPortrait: { fontSize:48, lineHeight:1, minWidth:60, textAlign:"center", filter:"drop-shadow(0 0 8px #fff8)" },
  dlgContent: { flex:1 },
  dlgName: { fontFamily:"'Space Mono', monospace", fontSize:11, fontWeight:700, color:"#fff", letterSpacing:2, marginBottom:8, textTransform:"uppercase" },
  dlgText: { fontFamily:"'Space Mono', monospace", fontSize:15, color:"#fff", lineHeight:1.7, minHeight:48 },
  dlgArrow: { display:"inline-block", marginLeft:6, animation:"arrowBob 0.7s ease-in-out infinite", color:"#fff" },
  dlgArrowHidden: { display:"inline-block", marginLeft:6, opacity:0 },
  dlgHint: { textAlign:"center", fontFamily:"'Space Mono', monospace", fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:6, letterSpacing:1 },

  statsBar: { position:"relative", zIndex:1, display:"flex", justifyContent:"center", margin:"0 auto 80px", maxWidth:680, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, overflow:"hidden", transition:"opacity 0.8s ease 0.4s" },
  statItem: { flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"20px 0", borderRight:"1px solid rgba(255,255,255,0.06)" },
  statNum: { fontFamily:"'Space Mono', monospace", fontWeight:700, fontSize:22, color:"#fff" },
  statLabel: { fontSize:12, color:"#6b7280", marginTop:4, fontWeight:500 },
  features: { position:"relative", zIndex:1, maxWidth:1100, margin:"0 auto 100px", padding:"0 24px", textAlign:"center" },
  sectionTitle: { fontSize:"clamp(26px,4vw,40px)", fontWeight:700, letterSpacing:"-1px", marginBottom:48, color:"#fff" },
  cardGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(230px, 1fr))", gap:20 },
  card: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"32px 24px", textAlign:"left" },
  cardIcon: { fontSize:28, marginBottom:16 },
  cardTitle: { fontSize:16, fontWeight:700, color:"#f3f4f6", marginBottom:10 },
  cardDesc: { fontSize:14, color:"#6b7280", lineHeight:1.65 },
  ctaBanner: { position:"relative", zIndex:1, textAlign:"center", padding:"80px 24px", background:"linear-gradient(180deg,transparent,rgba(99,102,241,0.06),transparent)", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)", marginBottom:60 },
  ctaTitle: { fontSize:"clamp(28px,4vw,44px)", fontWeight:700, letterSpacing:"-1px", color:"#fff", marginBottom:14 },
  ctaDesc: { fontSize:16, color:"#6b7280", marginBottom:32 },
  footer: { position:"relative", zIndex:1, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"24px 40px", borderTop:"1px solid rgba(255,255,255,0.06)" },
  footerNote: { fontSize:13, color:"#374151" },
};