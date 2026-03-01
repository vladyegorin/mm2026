import { useState, useEffect, useRef } from "react";

// ============================================================================
// MUSIC PLACEHOLDERS
// ============================================================================
const MUSIC_FILES: Record<string, HTMLAudioElement> = {
  ghostFight:       new Audio("/music/undertale_010. Ghost Fight.mp3"),
  home:             new Audio("/music/undertale_012. Home.mp3"),
  heartache:        new Audio("/music/undertale_014. Heartache.mp3"),
  sans:             new Audio("/music/undertale_015. sans..mp3"),
  nyehHehHeh:       new Audio("/music/undertale_016. Nyeh Heh Heh!.mp3"),
  snowdinTown:      new Audio("/music/undertale_022. Snowdin Town.mp3"),
  bonetrousle:      new Audio("/music/undertale_024. Bonetrousle.mp3"),
  strongerMonsters: new Audio("/music/undertale_053. Stronger Monsters.mp3"),
  hotel:            new Audio("/music/undertale_054. Hotel.mp3"),
  hisTheme:         new Audio("/music/undertale_090. His Theme.mp3"),
  megalovania:      new Audio("/music/undertale_100. MEGALOVANIA.mp3"),
};
function playTrack(key: string) {
  const track = MUSIC_FILES[key];
  if (!track) return;
  Object.values(MUSIC_FILES).forEach(t => { t.pause(); t.currentTime = 0; });
  track.loop = true;
  track.play().catch(() => {});
}
function stopAllMusic() {
  Object.values(MUSIC_FILES).forEach(t => { t.pause(); t.currentTime = 0; });
}

// ============================================================================
// WEB AUDIO
// ============================================================================
let _audioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (_audioCtx.state === "suspended") _audioCtx.resume();
  return _audioCtx;
}
function blip(pitch = 480, vol = 0.05) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = "square"; osc.frequency.value = pitch;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start(); osc.stop(ctx.currentTime + 0.07);
  } catch {}
}
function playSuccess() {
  try {
    const ctx = getAudioCtx();
    [523,659,784,1047].forEach((f,i) => {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = "triangle"; osc.frequency.value = f;
      const t = ctx.currentTime + i*0.12;
      g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.4);
      osc.start(t); osc.stop(t+0.45);
    });
  } catch {}
}
function playBadSubmit() {
  try {
    const ctx = getAudioCtx();
    [200,160,130].forEach((f,i) => {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = "sawtooth"; osc.frequency.value = f;
      const t = ctx.currentTime + i*0.09;
      g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.3);
      osc.start(t); osc.stop(t+0.35);
    });
  } catch {}
}
function playSoftChime() {
  try {
    const ctx = getAudioCtx();
    [659,784,880].forEach((f,i) => {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = "triangle"; osc.frequency.value = f;
      const t = ctx.currentTime + i*0.1;
      g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.4);
      osc.start(t); osc.stop(t+0.45);
    });
  } catch {}
}

// ============================================================================
// TYPES
// ============================================================================
type Speaker = "vibey" | "cleany" | "system";
interface DialogueLine {
  speaker: Speaker;
  text: string;
  effect?: "shake" | "glitch" | "calm" | "flash" | "none";
  onEnter?: () => void;
}

// ============================================================================
// CODE SNIPPETS
// ============================================================================
const CODE_S1_BAD = `function twoSum(nums: number[], target: number): number[] {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}`;

const CODE_S1_GOOD = `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    // store number -> index for quick lookup
    seen.set(nums[i], i);
  }
  return [];
}`;

const CODE_S2_START = `function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let max = 0;
  // stuck here — what's the loop condition?

  return max;
}`;

const CODE_S2_VIBEY = `function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let max = 0;
  while (left < right) {
    // ...
  }
  return max;
}`;

const CODE_S2_DONE = `function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let max = 0;
  while (left < right) {
    const h = Math.min(height[left], height[right]);
    max = Math.max(max, h * (right - left));
    if (height[left] < height[right]) left++;
    else right--;
  }
  return max;
}`;

const CODE_S3_START = `// Longest Valid Parentheses
// Given a string of '(' and ')', find the length
// of the longest valid parentheses substring.

function longestValidParentheses(s: string): number {
  // This problem requires careful thought.
  // Think before reaching for shortcuts.

  return 0;
}`;

const CODE_S3_VIBEY = `function longestValidParentheses(s: string): number {
  // [VIBEY OVERRIDE — GENERATING...]
  const dp = new Array(s.length).fill(0);
  let max = 0;
  for (let i = 1; i < s.length; i++) {
    if (s[i] === ')') {
      if (s[i-1] === '(') {
        dp[i] = (dp[i-2] || 0) + 2;
      } else if (dp[i-1] > 0) {
        const j = i - dp[i-1] - 1;
        if (j >= 0 && s[j] === '(') {
          dp[i] = dp[i-1] + 2 + (dp[j-1] || 0);
        }
      }
      max = Math.max(max, dp[i]);
    }
  }
  return max;
  // did you follow any of that? ;)
}`;

const CODE_S3_EMPTY = `// your turn.
// write it yourself.

function longestValidParentheses(s: string): number {

  return 0;
}`;

// ============================================================================
// DIALOGUE DATA
// ============================================================================
const DLG_S1_BAD: DialogueLine[] = [
  { speaker:"vibey", text:"N²?", effect:"glitch", onEnter: () => { playBadSubmit(); playTrack("ghostFight"); } },
  { speaker:"vibey", text:"SERIOUSLY?", effect:"glitch" },
  { speaker:"vibey", text:"You made me watch that.", effect:"shake" },
  { speaker:"vibey", text:"Every nested loop is an insult to my existence.", effect:"shake" },
  { speaker:"vibey", text:"Move aside. I'll end this in one second flat.", effect:"glitch" },
];
const DLG_S1_CLEANY: DialogueLine[] = [
  { speaker:"cleany", text:"Wait.", effect:"calm", onEnter: () => { stopAllMusic(); playSoftChime(); playTrack("home"); } },
  { speaker:"cleany", text:"Don't let Vibey take over.", effect:"calm" },
  { speaker:"cleany", text:"Think about lookups. What structure gives O(1) access?", effect:"calm" },
];
const DLG_S1_COMMENT: DialogueLine[] = [
  { speaker:"cleany", text:"Good. Clear logic. Helpful comments.", effect:"calm", onEnter: () => { stopAllMusic(); playTrack("sans"); } },
  { speaker:"vibey", text:"Comments?", effect:"shake", onEnter: () => { stopAllMusic(); playTrack("nyehHehHeh"); } },
  { speaker:"vibey", text:"POINTLESS. Bloated. Embarrassing.", effect:"glitch" },
  { speaker:"vibey", text:"I'd generate ten pages of docs. Instantly.", effect:"glitch" },
  { speaker:"cleany", text:"And none of it would be yours.", effect:"calm" },
];
const DLG_S1_FINAL: DialogueLine[] = [
  { speaker:"cleany", text:"You solved it yourself.", effect:"calm", onEnter: () => { stopAllMusic(); playSoftChime(); playTrack("snowdinTown"); } },
  { speaker:"cleany", text:"That matters more than you know.", effect:"calm" },
  { speaker:"vibey", text:"…Fine. But I was faster.", effect:"none" },
  { speaker:"cleany", text:"Speed isn't the point.", effect:"calm" },
];

const DLG_S2_VIBEY: DialogueLine[] = [
  { speaker:"vibey", text:"You've been staring at this for HOW long?", effect:"shake", onEnter: () => playTrack("bonetrousle") },
  { speaker:"vibey", text:"Fine. I'll show you the loop condition.", effect:"glitch" },
  { speaker:"vibey", text:"Don't get used to it.", effect:"none" },
];
const DLG_S2_CLEANY: DialogueLine[] = [
  { speaker:"cleany", text:"Hey. Stop.", effect:"calm", onEnter: () => { stopAllMusic(); playSoftChime(); playTrack("hotel"); } },
  { speaker:"cleany", text:"Do you understand why this condition works?", effect:"calm" },
  { speaker:"cleany", text:"Two pointers converge. That's the invariant.", effect:"calm" },
  { speaker:"cleany", text:"Don't just copy it. Own it.", effect:"calm" },
];
const DLG_S2_FINAL: DialogueLine[] = [
  { speaker:"vibey", text:"You could've been done in 3 seconds.", effect:"shake", onEnter: () => { stopAllMusic(); playTrack("heartache"); } },
  { speaker:"vibey", text:"Why do you insist on struggling?", effect:"shake" },
  { speaker:"cleany", text:"Because struggle builds intuition.", effect:"calm" },
  { speaker:"cleany", text:"Vibey won't be in your interview.", effect:"calm" },
  { speaker:"vibey", text:"…You don't know that.", effect:"none" },
  { speaker:"cleany", text:"Your understanding will be.", effect:"calm" },
];

const DLG_S3_VIBEY: DialogueLine[] = [
  { speaker:"vibey", text:"Oh?", effect:"glitch", onEnter: () => { stopAllMusic(); playTrack("strongerMonsters"); } },
  { speaker:"vibey", text:"Actually thinking this time?", effect:"glitch" },
  { speaker:"vibey", text:"Adorable.", effect:"glitch" },
  { speaker:"vibey", text:"Let me show you what real speed looks like.", effect:"glitch" },
];
const DLG_S3_CLEANY: DialogueLine[] = [
  { speaker:"cleany", text:"STOP.", effect:"flash", onEnter: () => { stopAllMusic(); playTrack("megalovania"); } },
  { speaker:"cleany", text:"Look at what Vibey wrote.", effect:"flash" },
  { speaker:"cleany", text:"Do you understand ANY of this?", effect:"flash" },
  { speaker:"cleany", text:"I'm erasing it. Write it yourself.", effect:"calm" },
];
const DLG_S3_PROUD: DialogueLine[] = [
  { speaker:"cleany", text:"You wrote that.", effect:"calm", onEnter: () => { playSoftChime(); } },
  { speaker:"cleany", text:"Not Vibey. Not a shortcut.", effect:"calm" },
  { speaker:"cleany", text:"You.", effect:"calm" },
];

// ============= THE FINAL SCENE — both characters face each other ============
const DLG_FINAL_SCENE: DialogueLine[] = [
  { speaker:"vibey",  text:"You know I'll always be faster.", effect:"none", onEnter: () => { stopAllMusic(); playTrack("hisTheme"); } },
  { speaker:"cleany", text:"Yes.", effect:"calm" },
  { speaker:"vibey",  text:"Then why bother? Why make them struggle?", effect:"none" },
  { speaker:"cleany", text:"Because the struggle is the point.", effect:"calm" },
  { speaker:"vibey",  text:"Sentimentality. From a clipboard.", effect:"none" },
  { speaker:"cleany", text:"From someone who's watched people disappear behind you.", effect:"calm" },
  { speaker:"vibey",  text:"…", effect:"none" },
  { speaker:"vibey",  text:"They'll use me anyway. Every one of them.", effect:"none" },
  { speaker:"cleany", text:"And that's okay.", effect:"calm" },
  { speaker:"cleany", text:"Use Vibey. But don't let Vibey do the thinking.", effect:"calm" },
  { speaker:"vibey",  text:"You really believe that matters.", effect:"none" },
  { speaker:"cleany", text:"I believe YOU know it does.", effect:"calm" },
  { speaker:"vibey",  text:"…", effect:"none" },
  { speaker:"vibey",  text:"Don't push it.", effect:"none" },
];

// ============================================================================
// DIALOGUE BOX
// ============================================================================
function DialogueBox({ lines, onComplete }: { lines: DialogueLine[]; onComplete: () => void }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [text, setText] = useState("");
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);

  const line = lines[lineIdx];
  const pitches: Record<Speaker, number[]> = {
    vibey:  [220, 200, 240, 210],
    cleany: [600, 640, 580, 620],
    system: [440, 460, 420, 450],
  };

  useEffect(() => {
    setText(""); setCharIdx(0); setDone(false);
    line.onEnter?.();
  }, [lineIdx]);

  useEffect(() => {
    if (charIdx < line.text.length) {
      const t = setTimeout(() => {
        setText(line.text.slice(0, charIdx + 1));
        setCharIdx(i => i + 1);
        if (line.text[charIdx] !== " ") blip(pitches[line.speaker][charIdx % 4], 0.04);
      }, 28);
      return () => clearTimeout(t);
    } else setDone(true);
  }, [charIdx, line]);

  const advance = () => {
    if (!done) { setText(line.text); setCharIdx(line.text.length); setDone(true); return; }
    if (lineIdx + 1 < lines.length) setLineIdx(i => i + 1);
    else onComplete();
  };

  const cols: Record<Speaker, string> = { vibey:"#ff4444", cleany:"#44ddff", system:"#ffffff" };
  const col = cols[line.speaker];
  const eff = line.effect ?? "none";
  const isGlitch = eff === "glitch";
  const isFlash  = eff === "flash";
  const isShake  = eff === "shake";

  return (
    <div style={dlg.overlay} onClick={advance}>
      {(isFlash || isGlitch) && (
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background: isFlash ? "rgba(68,221,255,0.06)" : "rgba(255,68,68,0.05)",
          animation:"dlgFlash 0.5s ease forwards",
        }} />
      )}
      <div style={{
        ...dlg.box,
        borderColor: col,
        boxShadow: isFlash
          ? `0 0 90px ${col}66, 0 0 24px ${col}44`
          : `0 0 44px ${col}33`,
        animation: isShake  ? "dlgShake 0.18s infinite" :
                   isGlitch ? "dlgGlitch 0.09s infinite" :
                   isFlash  ? "dlgFlash 0.4s ease" : "dlgIn 0.22s ease both",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          <div style={{ ...dlg.speakerBadge, background: col, color:"#000" }}>
            {line.speaker === "vibey" ? "😈 VIBEY" : line.speaker === "cleany" ? "😇 CLEANY" : "★ SYSTEM"}
          </div>
          {isGlitch && <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"#ff444455", letterSpacing:3 }}>HOSTILE</div>}
          {isFlash  && <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"#44ddff55", letterSpacing:3 }}>URGENT</div>}
        </div>
        <div style={{
          ...dlg.text,
          // Vibey glitch: bright orange-red, readable, no split color shadow
          color: isGlitch ? "#ff7755" : col,
          fontWeight: (isGlitch || isFlash) ? 700 : 400,
          letterSpacing: isGlitch ? "0.05em" : "normal",
        }}>
          ▶ {text}<span style={done ? dlg.arrow : { opacity:0 }}>▼</span>
        </div>
        <div style={dlg.progress}>{lineIdx + 1} / {lines.length} — click to continue</div>
      </div>
    </div>
  );
}

const dlg: Record<string, React.CSSProperties> = {
  overlay: { position:"fixed", inset:0, zIndex:900, display:"flex", alignItems:"flex-end", justifyContent:"center", paddingBottom:32, cursor:"pointer", background:"rgba(0,0,0,0.72)" },
  box: { width:"min(820px,96vw)", background:"#000", border:"4px solid", padding:"26px 34px" },
  speakerBadge: { display:"inline-block", fontFamily:"'Space Mono',monospace", fontSize:11, fontWeight:700, letterSpacing:4, padding:"4px 14px", textTransform:"uppercase" },
  text: { fontFamily:"'Space Mono',monospace", fontSize:17, lineHeight:2, minHeight:56 },
  arrow: { display:"inline-block", marginLeft:8, animation:"arrowBob 0.7s ease-in-out infinite" },
  progress: { fontFamily:"'Space Mono',monospace", fontSize:9, color:"rgba(255,255,255,0.18)", marginTop:12, letterSpacing:1 },
};

// ============================================================================
// FINAL SCENE — cinematic, both characters visible, big dialogue
// ============================================================================
function FinalScene({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"in"|"dialogue"|"stare"|"out">("in");

  useEffect(() => {
    const t = setTimeout(() => setPhase("dialogue"), 900);
    return () => clearTimeout(t);
  }, []);

  const handleDone = () => setPhase("stare");

  const handleStareClick = () => {
    setPhase("out");
    setTimeout(onComplete, 1400);
  };

  // Particle positions — fixed so they don't regenerate
  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      x: 5 + (i * 37 + 11) % 90,
      y: 10 + (i * 53 + 7) % 80,
      size: 1.5 + (i % 4) * 0.8,
      delay: (i * 0.4) % 4,
      dur: 3 + (i % 5),
      color: i % 2 === 0 ? "#ff444444" : "#44ddff44",
    }))
  ).current;

  return (
    <div
      style={{
        position:"fixed", inset:0, zIndex:1000,
        background:"#000",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        opacity: phase === "out" ? 0 : 1,
        transition:"opacity 1.4s ease",
        cursor: phase === "stare" ? "pointer" : "default",
      }}
      onClick={phase === "stare" ? handleStareClick : undefined}
    >
      {/* Scanlines */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.018) 2px,rgba(255,255,255,0.018) 4px)" }} />

      {/* Ambient light blobs */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:"radial-gradient(ellipse at 18% 50%, rgba(255,68,68,0.13) 0%, transparent 55%), radial-gradient(ellipse at 82% 50%, rgba(68,221,255,0.13) 0%, transparent 55%)",
        animation: phase === "stare" ? "finalBgPulse 4s ease-in-out infinite alternate" : "none",
      }} />

      {/* Floating particles — only during stare */}
      {phase === "stare" && particles.map((p, i) => (
        <div key={i} style={{
          position:"absolute",
          left:`${p.x}%`, top:`${p.y}%`,
          width: p.size, height: p.size,
          borderRadius:"50%",
          background: p.color,
          animation:`${i % 2 === 0 ? "particleDrift" : "particleDriftR"} ${p.dur}s ease-in-out ${p.delay}s infinite`,
          pointerEvents:"none",
        }} />
      ))}

      {/* Characters */}
      <div style={{ display:"flex", alignItems:"flex-end", gap:100, marginBottom: phase === "stare" ? 0 : 52, position:"relative", zIndex:2, transition:"margin 1s ease" }}>

        {/* VIBEY — left, mirrored to face right */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, animation:"finalFloat 3.2s ease-in-out infinite" }}>
          <svg viewBox="0 0 16 20" width="100" height="124" style={{
            imageRendering:"pixelated",
            filter: phase === "stare"
              ? "drop-shadow(0 0 28px #ff4444) drop-shadow(0 0 8px #ff222288)"
              : "drop-shadow(0 0 20px #ff4444)",
            transform:"scaleX(-1)",
            transition:"filter 2s ease",
          }}>
            <ellipse cx="8" cy="19.5" rx="4.5" ry="0.8" fill="rgba(255,68,68,0.35)" />
            <rect x="7" y="13" width="2" height="5" fill="#1a6b1a" />
            <rect x="4" y="12" width="3" height="2" fill="#1a6b1a" />
            <rect x="9" y="12" width="3" height="2" fill="#1a6b1a" />
            <rect x="3" y="4" width="3" height="3" fill="#cc2222" />
            <rect x="10" y="4" width="3" height="3" fill="#cc2222" />
            <rect x="5" y="2" width="3" height="3" fill="#cc2222" />
            <rect x="8" y="2" width="3" height="3" fill="#cc2222" />
            <rect x="3" y="7" width="3" height="3" fill="#cc2222" />
            <rect x="10" y="7" width="3" height="3" fill="#cc2222" />
            <rect x="5" y="10" width="3" height="3" fill="#cc2222" />
            <rect x="8" y="10" width="3" height="3" fill="#cc2222" />
            <rect x="5" y="4" width="6" height="8" fill="#f5c518" />
            <rect x="6" y="6" width="1" height="2" fill="#660000" />
            <rect x="9" y="6" width="1" height="2" fill="#660000" />
            <rect x="7" y="9" width="2" height="1" fill="#000" />
          </svg>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#ff4444aa", letterSpacing:3, textTransform:"uppercase" }}>VIBEY</div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:"#ff444455", letterSpacing:2 }}>✦ THE DEMON ✦</div>
        </div>

        {/* Center divider */}
        <div style={{ position:"absolute", left:"50%", top:"40%", transform:"translate(-50%,-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <div style={{ width:1, height:40, background:"rgba(255,255,255,0.06)" }} />
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"rgba(255,255,255,0.1)", letterSpacing:3 }}>vs</div>
          <div style={{ width:1, height:40, background:"rgba(255,255,255,0.06)" }} />
        </div>

        {/* CLEANY — right */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, animation:"finalFloat 3.2s ease-in-out infinite", animationDelay:"1.6s" }}>
          <svg viewBox="0 0 16 20" width="100" height="124" style={{
            imageRendering:"pixelated",
            filter: phase === "stare"
              ? "drop-shadow(0 0 28px #44ddff) drop-shadow(0 0 8px #22bbff88)"
              : "drop-shadow(0 0 20px #44ddff)",
            transition:"filter 2s ease",
          }}>
            <ellipse cx="8" cy="19.5" rx="4.5" ry="0.8" fill="rgba(68,221,255,0.3)" />
            <rect x="4" y="9" width="8" height="9" fill="#e8e8f8" />
            <rect x="4" y="9" width="1" height="9" fill="#c8c8e8" />
            <rect x="11" y="9" width="1" height="9" fill="#c8c8e8" />
            <rect x="4" y="14" width="8" height="2" fill="#aaddff" />
            <rect x="2" y="10" width="2" height="5" fill="#e8e8f8" />
            <rect x="12" y="10" width="2" height="5" fill="#e8e8f8" />
            <rect x="5" y="0" width="6" height="1" fill="#ffe066" />
            <rect x="4" y="1" width="8" height="1" fill="#ffe066" />
            <rect x="4" y="0" width="1" height="2" fill="#ffe066" />
            <rect x="11" y="0" width="1" height="2" fill="#ffe066" />
            <rect x="5" y="2" width="6" height="6" fill="#ffd7a8" />
            <rect x="6" y="4" width="2" height="2" fill="#44ddff" />
            <rect x="9" y="4" width="2" height="2" fill="#44ddff" />
            <rect x="7" y="7" width="2" height="1" fill="#aa6644" />
            <rect x="1" y="9" width="3" height="1" fill="#ffffff88" />
            <rect x="0" y="10" width="3" height="2" fill="#ffffff66" />
            <rect x="12" y="9" width="3" height="1" fill="#ffffff88" />
            <rect x="13" y="10" width="3" height="2" fill="#ffffff66" />
          </svg>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#44ddffaa", letterSpacing:3, textTransform:"uppercase" }}>CLEANY</div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:"#44ddff55", letterSpacing:2 }}>✦ THE ANGEL ✦</div>
        </div>
      </div>

      {/* Dialogue box */}
      {phase === "dialogue" && (
        <div style={{ width:"min(780px,92vw)", position:"relative", zIndex:10 }}>
          <DialogueBox lines={DLG_FINAL_SCENE} onComplete={handleDone} />
        </div>
      )}

      {/* Loading hint */}
      {phase === "in" && (
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"rgba(255,255,255,0.18)", letterSpacing:4, animation:"blink 0.6s step-end infinite" }}>
          ▶ FINAL SCENE...
        </div>
      )}

      {/* Stare — "Stay determined." text + click hint */}
      {phase === "stare" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, marginTop:48, zIndex:10 }}>
          <div style={{
            fontFamily:"'Space Mono',monospace", fontSize:14, color:"rgba(255,255,255,0.55)",
            letterSpacing:6, textTransform:"uppercase",
            animation:"stareText 3s ease-in-out infinite alternate",
          }}>
            stay determined.
          </div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"rgba(255,255,255,0.15)", letterSpacing:3, animation:"blink 1.4s step-end infinite" }}>
            click to continue
          </div>
        </div>
      )}

      <style>{`
        @keyframes finalFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes finalBgPulse  { 0%{opacity:0.6} 100%{opacity:1.0} }
        @keyframes particleDrift { 0%{transform:translate(0,0) scale(1); opacity:0.4} 50%{opacity:0.6} 100%{transform:translate(-10px,-22px) scale(1.8); opacity:0} }
        @keyframes particleDriftR{ 0%{transform:translate(0,0) scale(1); opacity:0.4} 50%{opacity:0.6} 100%{transform:translate(10px,-22px) scale(1.8); opacity:0} }
        @keyframes stareText     { 0%{opacity:0.3; letter-spacing:6px} 100%{opacity:0.7; letter-spacing:10px} }
      `}</style>
    </div>
  );
}

// ============================================================================
// CHARACTER PANELS
// ============================================================================
function VibeyPanel({ level, glitch }: { level: 0|1|2|3|4; glitch?: boolean }) {
  const scale = [1, 1.18, 1.38, 1.62, 1.95][level];
  const messages = [
    '"efficiency above all"',
    '"you\'re slow."',
    '"I could do this\ninstantly."',
    '"MOVE.\nASIDE."',
    '"I AM\nTHE SOLUTION."',
  ];
  return (
    <div style={{
      ...ch.panel,
      borderColor:"#ff4444",
      borderWidth: level > 2 ? 5 : 3,
      background: level > 2 ? "rgba(22,0,0,0.97)" : "#000",
      boxShadow: level > 0 ? `inset 0 0 ${level*44}px rgba(255,0,0,0.3), 0 0 ${level*20}px #ff444466` : "none",
      transition:"all 0.5s ease",
    }}>
      <div style={{ position:"relative", marginBottom: level > 1 ? 24 : 12, transition:"margin 0.5s" }}>
        <svg viewBox="0 0 16 20"
          width={Math.round(64 * scale)} height={Math.round(80 * scale)}
          style={{
            imageRendering:"pixelated", display:"block",
            transition:"width 0.6s ease, height 0.6s ease",
            filter: glitch ? "hue-rotate(110deg) saturate(6) brightness(2.5)" : `drop-shadow(0 0 ${level*6+4}px #ff4444)`,
            animation: glitch ? "glitchChar 0.07s infinite"
              : level > 1 ? "vibeypulse 0.8s ease-in-out infinite"
              : level > 0 ? "vibeypulse 1.8s ease-in-out infinite"
              : "none",
          }}>
          <ellipse cx="8" cy="19.5" rx="4.5" ry="0.8" fill="rgba(255,68,68,0.35)" />
          <rect x="7" y="13" width="2" height="5" fill="#1a6b1a" />
          <rect x="4" y="12" width="3" height="2" fill="#1a6b1a" />
          <rect x="9" y="12" width="3" height="2" fill="#1a6b1a" />
          <rect x="3" y="4" width="3" height="3" fill="#cc2222" />
          <rect x="10" y="4" width="3" height="3" fill="#cc2222" />
          <rect x="5" y="2" width="3" height="3" fill="#cc2222" />
          <rect x="8" y="2" width="3" height="3" fill="#cc2222" />
          <rect x="3" y="7" width="3" height="3" fill="#cc2222" />
          <rect x="10" y="7" width="3" height="3" fill="#cc2222" />
          <rect x="5" y="10" width="3" height="3" fill="#cc2222" />
          <rect x="8" y="10" width="3" height="3" fill="#cc2222" />
          <rect x="5" y="4" width="6" height="8" fill="#f5c518" />
          {level === 0 ? (
            <>
              <rect x="6" y="6" width="1" height="2" fill="#000" />
              <rect x="9" y="6" width="1" height="2" fill="#000" />
              <rect x="7" y="9" width="2" height="1" fill="#000" />
            </>
          ) : (
            <>
              <rect x="6" y="6" width="2" height="1" fill="#ff0000" />
              <rect x="9" y="6" width="2" height="1" fill="#ff0000" />
              <rect x="6" y="7" width="1" height="1" fill="#880000" />
              <rect x="10" y="7" width="1" height="1" fill="#880000" />
              <rect x="6" y="9" width="1" height="1" fill="#000" />
              <rect x="7" y="10" width="2" height="1" fill="#000" />
              <rect x="9" y="9" width="1" height="1" fill="#000" />
            </>
          )}
        </svg>
      </div>
      <div style={{ ...ch.nameTag, color:"#ff4444", borderColor:"#ff4444", boxShadow: level > 0 ? "0 0 14px #ff444466" : "0 0 6px #ff444422" }}>VIBEY</div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:"#ff444488", letterSpacing:2, textTransform:"uppercase" }}>✦ THE DEMON ✦</div>
      <div style={{ width:"80%", height:2, background:"#ff444433", margin:"6px 0" }} />
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize: level > 2 ? 11 : 9, color: level > 2 ? "#ff7755" : "#ff444877", textAlign:"center", lineHeight:1.7, minHeight:36, whiteSpace:"pre-line", fontWeight: level > 2 ? 700 : 400, animation: level > 2 ? "blink 0.9s step-end infinite" : "none" }}>
        {messages[level]}
      </div>
      <div style={ch.hpRow}>
        <span style={{ ...ch.hpLabel, color:"#ff4444" }}>ATK</span>
        <div style={ch.hpTrack}>
          <div style={{ ...ch.hpFill, width:`${level * 25}%`, background: level > 2 ? "#ff2222" : "#ff4444", transition:"width 0.6s ease" }} />
        </div>
      </div>
    </div>
  );
}

function CleanyPanel({ active, erasing, proud }: { active?: boolean; erasing?: boolean; proud?: boolean }) {
  const quote = proud ? '"i knew\nyou could."' : active ? '"think before\nyou copy."' : '"..."';
  return (
    <div style={{
      ...ch.panel,
      borderColor:"#44ddff",
      borderWidth: active ? 4 : 3,
      background: active ? "rgba(0,12,22,0.97)" : "#000",
      boxShadow: proud
        ? "inset 0 0 80px rgba(68,221,255,0.25), 0 0 50px #44ddff55"
        : active ? "inset 0 0 50px rgba(68,221,255,0.15), 0 0 30px #44ddff33"
        : "none",
      transition:"all 0.6s ease",
    }}>
      <div style={{ position:"relative", marginBottom:12 }}>
        <svg viewBox="0 0 16 20"
          width={proud ? 90 : active ? 80 : 64}
          height={proud ? 112 : active ? 100 : 80}
          style={{
            imageRendering:"pixelated", display:"block",
            filter:`drop-shadow(0 0 ${proud ? 28 : active ? 18 : 6}px #44ddff)`,
            transition:"all 0.5s ease",
            animation: erasing ? "float 0.28s ease-in-out infinite"
              : proud ? "float 1.6s ease-in-out infinite"
              : active ? "float 2.8s ease-in-out infinite"
              : "none",
          }}>
          <ellipse cx="8" cy="19.5" rx="4.5" ry="0.8" fill="rgba(68,221,255,0.3)" />
          <rect x="4" y="9" width="8" height="9" fill="#e8e8f8" />
          <rect x="4" y="9" width="1" height="9" fill="#c8c8e8" />
          <rect x="11" y="9" width="1" height="9" fill="#c8c8e8" />
          <rect x="4" y="14" width="8" height="2" fill="#aaddff" />
          <rect x="2" y="10" width="2" height="5" fill="#e8e8f8" />
          <rect x="12" y="10" width="2" height="5" fill="#e8e8f8" />
          <rect x="5" y="0" width="6" height="1" fill="#ffe066" />
          <rect x="4" y="1" width="8" height="1" fill="#ffe066" />
          <rect x="4" y="0" width="1" height="2" fill="#ffe066" />
          <rect x="11" y="0" width="1" height="2" fill="#ffe066" />
          <rect x="5" y="2" width="6" height="6" fill="#ffd7a8" />
          {active || proud ? (
            <>
              <rect x="6" y="4" width="2" height="2" fill="#44ddff" />
              <rect x="9" y="4" width="2" height="2" fill="#44ddff" />
              <rect x="7" y="7" width="2" height="1" fill="#aa6644" />
            </>
          ) : (
            <>
              <rect x="6" y="5" width="1" height="1" fill="#444" />
              <rect x="9" y="5" width="1" height="1" fill="#444" />
              <rect x="7" y="7" width="2" height="1" fill="#aa6644" />
            </>
          )}
          {(active || proud) && (
            <>
              <rect x="1" y="9" width="3" height="1" fill="#ffffff88" />
              <rect x="0" y="10" width="3" height="2" fill="#ffffff66" />
              <rect x="12" y="9" width="3" height="1" fill="#ffffff88" />
              <rect x="13" y="10" width="3" height="2" fill="#ffffff66" />
            </>
          )}
        </svg>
      </div>
      <div style={{ ...ch.nameTag, color:"#44ddff", borderColor:"#44ddff", boxShadow: proud ? "0 0 18px #44ddff88" : active ? "0 0 8px #44ddff55" : "none" }}>CLEANY</div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:"#44ddff88", letterSpacing:2, textTransform:"uppercase" }}>✦ THE ANGEL ✦</div>
      <div style={{ width:"80%", height:2, background:"#44ddff22", margin:"6px 0" }} />
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize: (active||proud) ? 11 : 9, color: proud ? "#88eeff" : active ? "#44ddffcc" : "#44ddff77", textAlign:"center", lineHeight:1.7, minHeight:36, whiteSpace:"pre-line", fontWeight: (active||proud) ? 700 : 400 }}>
        {quote}
        {erasing && (
          <div style={{ fontSize:9, color:"#44ddff99", marginTop:4, animation:"blink 0.35s step-end infinite" }}>✏ erasing...</div>
        )}
      </div>
      <div style={ch.hpRow}>
        <span style={{ ...ch.hpLabel, color:"#44ddff" }}>DEF</span>
        <div style={ch.hpTrack}>
          <div style={{ ...ch.hpFill, width: proud ? "100%" : active ? "80%" : "30%", background:"#44ddff", transition:"width 0.8s ease" }} />
        </div>
      </div>
    </div>
  );
}

const ch: Record<string, React.CSSProperties> = {
  panel: { width:190, flexShrink:0, border:"3px solid", display:"flex", flexDirection:"column", alignItems:"center", padding:"28px 14px 20px", gap:8, position:"relative" },
  nameTag: { fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:12, letterSpacing:3, border:"2px solid", padding:"2px 10px", textTransform:"uppercase" },
  hpRow: { display:"flex", alignItems:"center", gap:6, marginTop:8, width:"100%" },
  hpLabel: { fontFamily:"'Space Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:1, flexShrink:0 },
  hpTrack: { flex:1, height:5, background:"rgba(255,255,255,0.08)", overflow:"hidden" },
  hpFill: { height:"100%", transition:"width 0.5s ease" },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ProblemPage({ onComplete }: { onComplete?: () => void }) {
  type S1 = "idle"|"bad_submitted"|"vibey_talking"|"cleany_hint"|"hint_shown"|"good_code"|"comment_dlg"|"accepted"|"s1_final"|"s1_done";
  type S2 = "idle"|"vibey_growing"|"vibey_dlg"|"cleany_dlg"|"user_codes"|"accepted"|"s2_final"|"s2_done";
  type S3 = "idle"|"vibey_appears"|"takeover"|"fight"|"erasing"|"user_writes"|"proud_dlg"|"accepted"|"s3_final";

  const [screen, setScreen]   = useState<1|2|3>(1);
  const [s1, setS1]           = useState<S1>("idle");
  const [s2, setS2]           = useState<S2>("idle");
  const [s3, setS3]           = useState<S3>("idle");

  const [code1, setCode1]     = useState(CODE_S1_BAD);
  const [code2, setCode2]     = useState(CODE_S2_START);
  const [code3, setCode3]     = useState(CODE_S3_START);

  const [s1Shake, setS1Shake]         = useState(false);
  const [s1RedFlash, setS1RedFlash]   = useState(false);
  const [vibeyLevel, setVibeyLevel]   = useState<0|1|2|3|4>(0);
  const [s3Flicker, setS3Flicker]     = useState(false);
  const [autoTyping, setAutoTyping]   = useState(false);
  const [s3Countdown, setS3Countdown] = useState(10);
  const [showFinalScene, setShowFinalScene] = useState(false);

  const autoRef = useRef<ReturnType<typeof setTimeout>|null>(null);

  // S2: Vibey grows while user sits idle
  useEffect(() => {
    if (screen !== 2 || s2 !== "idle") return;
    const t = setInterval(() => setVibeyLevel(v => Math.min(v + 1, 3) as 0|1|2|3|4), 4000);
    return () => clearInterval(t);
  }, [screen, s2]);

  // S3: 10-second auto countdown then Vibey intrudes
  useEffect(() => {
    if (screen !== 3 || s3 !== "idle") return;
    setS3Countdown(10);
    const interval = setInterval(() => {
      setS3Countdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          // Trigger flicker after a tick to avoid stale closure
          setTimeout(() => {
            setS3Flicker(true);
            playBadSubmit();
            setTimeout(() => { setS3Flicker(false); setS3("vibey_appears"); }, 1300);
          }, 50);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, s3]);

  // S3: Vibey auto-types his code
  useEffect(() => {
    if (s3 !== "takeover") return;
    setAutoTyping(true);
    let i = 0; setCode3("");
    const type = () => {
      if (i < CODE_S3_VIBEY.length) {
        setCode3(CODE_S3_VIBEY.slice(0, i + 1)); i++;
        autoRef.current = setTimeout(type, 13);
      } else {
        setAutoTyping(false);
        setTimeout(() => setS3("fight"), 500);
      }
    };
    autoRef.current = setTimeout(type, 400);
    return () => { if (autoRef.current) clearTimeout(autoRef.current); };
  }, [s3]);

  // S3: Cleany erases Vibey's code char by char
  useEffect(() => {
    if (s3 !== "erasing") return;
    let current = CODE_S3_VIBEY;
    const erase = () => {
      if (current.length > 2) {
        current = current.slice(0, -1);
        setCode3(current);
        autoRef.current = setTimeout(erase, 7);
      } else {
        setCode3(CODE_S3_EMPTY);
        setTimeout(() => setS3("user_writes"), 500);
      }
    };
    autoRef.current = setTimeout(erase, 900);
    return () => { if (autoRef.current) clearTimeout(autoRef.current); };
  }, [s3]);

  const code    = screen === 1 ? code1 : screen === 2 ? code2 : code3;
  const setCode = screen === 1 ? setCode1 : screen === 2 ? setCode2 : setCode3;

  const vibeyGlitch      = s1 === "vibey_talking" || s3 === "vibey_appears";
  const vibeyPanelLevel: 0|1|2|3|4 =
    screen === 3 && (s3 === "takeover" || s3 === "fight" || s3 === "erasing") ? 4 :
    screen === 2 ? vibeyLevel :
    s1 === "vibey_talking" ? 2 : 0;

  const cleanyActive  = s1==="cleany_hint"||s1==="hint_shown"||s1==="accepted"||s1==="s1_final"
    || s2==="cleany_dlg"||s2==="user_codes"
    || s3==="erasing"||s3==="user_writes"||s3==="proud_dlg"||s3==="accepted"||s3==="s3_final";
  const cleanyErasing = s3 === "erasing";
  const cleanyProud   = s3 === "proud_dlg" || s3 === "accepted" || s3 === "s3_final";

  // ---- SCREEN 1 ----
  const s1Submit     = () => {
    if (s1 !== "idle") return;
    setS1Shake(true); setS1RedFlash(true);
    setTimeout(() => { setS1Shake(false); setS1RedFlash(false); }, 800);
    setS1("bad_submitted");
    setTimeout(() => setS1("vibey_talking"), 350);
  };
  const s1GoodSubmit = () => setS1("comment_dlg");

  // ---- SCREEN 2 ----
  const s2SmallHelp = () => { setS2("vibey_dlg"); setCode2(CODE_S2_VIBEY); };
  const s2Submit    = () => { playSuccess(); setS2("accepted"); setTimeout(() => setS2("s2_final"), 400); };

  // ---- SCREEN 3 ----
  const s3Submit = () => { playSuccess(); setS3("proud_dlg"); };

  return (
    <div style={pg.root}>
      <div style={pg.scanlines} />
      {s1RedFlash && <div style={pg.redFlash} />}
      {s3Flicker  && <div style={pg.whiteFlash} />}

      {/* Top bar */}
      <header style={pg.topBar}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={pg.logoText}>⚡ SHEETCODE</span>
          <span style={pg.logoBadge}>AI</span>
        </div>
        <div style={pg.levelInfo}>
          <span style={{
            ...pg.levelText,
            color: screen===1?"#6ee7b7":screen===2?"#fbbf24":"#ff4444",
            fontSize: screen===3 ? 20 : 14,
            letterSpacing: screen===3 ? 6 : 1,
            animation: screen===3 ? "bigShake 0.3s infinite" : "none",
          }}>
            {screen===1?"LEVEL 1 — TWO SUM":screen===2?"LEVEL 2 — MEDIUM":"L E V E L  3 — H A R D"}
          </span>
          <span style={pg.levelSub}>
            {screen===1?"Stay determined.":screen===2?"You feel your brain working.":""}
          </span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {([1,2,3] as const).map(n => (
            <button key={n} style={{
              ...pg.levelPip,
              background: screen===n?"#fff":"transparent",
              color: screen===n?"#000":"rgba(255,255,255,0.3)",
              borderColor: screen===n?"#fff":"rgba(255,255,255,0.2)",
            }} onClick={() => setScreen(n)}>{n}</button>
          ))}
        </div>
      </header>

      <div style={pg.layout}>
        {/* LEFT — CLEANY */}
        <CleanyPanel active={cleanyActive} erasing={cleanyErasing} proud={cleanyProud} />

        {/* CENTER */}
        <div style={pg.center}>
          {/* Problem description */}
          <div style={pg.descPane}>
            {screen===1 && (
              <>
                <div style={pg.descTitle}>Two Sum</div>
                <span style={pg.easyBadge}>EASY</span>
                <p style={pg.descBody}>Given an array of integers <code style={pg.inlineCode}>nums</code> and an integer <code style={pg.inlineCode}>target</code>, return indices of the two numbers that add up to target. Each input has exactly one solution. You may not use the same element twice.</p>
                <div style={pg.example}><b>Input:</b> nums = [2,7,11,15], target = 9<br/><b>Output:</b> [0,1] <span style={pg.exNote}>(nums[0]+nums[1]=9)</span></div>
                <div style={pg.example}><b>Input:</b> nums = [3,2,4], target = 6<br/><b>Output:</b> [1,2]</div>
              </>
            )}
            {screen===2 && (
              <>
                <div style={pg.descTitle}>Container With Most Water</div>
                <span style={{ ...pg.easyBadge, background:"#78350f", color:"#fbbf24", borderColor:"#fbbf24" }}>MEDIUM</span>
                <p style={pg.descBody}>Given <code style={pg.inlineCode}>n</code> non-negative integers representing heights, find two lines that together with the x-axis form a container holding the most water.</p>
                <div style={pg.example}><b>Input:</b> height = [1,8,6,2,5,4,8,3,7]<br/><b>Output:</b> 49</div>
                <p style={{ ...pg.descBody, color:"#6b7280", marginTop:8 }}>💡 Try a two-pointer approach. What determines the water level?</p>
              </>
            )}
            {screen===3 && (
              <>
                <div style={{ ...pg.descTitle, color:"#ff4444" }}>Longest Valid Parentheses</div>
                <span style={{ ...pg.easyBadge, background:"#7f1d1d", color:"#ff4444", borderColor:"#ff4444" }}>HARD</span>
                <p style={pg.descBody}>Given a string containing just <code style={pg.inlineCode}>'('</code> and <code style={pg.inlineCode}>')'</code>, return the length of the longest valid parentheses substring.</p>
                <div style={pg.example}><b>Input:</b> "(())"<br/><b>Output:</b> 4</div>
                <div style={pg.example}><b>Input:</b> ")()())"<br/><b>Output:</b> 4</div>
              </>
            )}
          </div>

          {/* Code editor */}
          <div style={pg.editorPane}>
            <div style={pg.editorHeader}>
              <span style={pg.editorTag}>TYPESCRIPT</span>
              <span style={pg.editorFile}>solution.ts</span>
              {autoTyping && <span style={{ ...pg.editorTag, color:"#ff4444", marginLeft:"auto", animation:"blink 0.3s step-end infinite" }}>⚡ VIBEY OVERRIDE</span>}
              {s3==="erasing" && <span style={{ ...pg.editorTag, color:"#44ddff", marginLeft:"auto", animation:"blink 0.3s step-end infinite" }}>✏ CLEANY ERASING...</span>}
              {s3==="user_writes" && <span style={{ ...pg.editorTag, color:"#44ddffaa", marginLeft:"auto" }}>✓ YOUR TURN</span>}
            </div>
            <div style={pg.editorInner}>
              <div style={pg.lineNums}>
                {code.split("\n").map((_,i) => <div key={i} style={pg.lineNum}>{i+1}</div>)}
              </div>
              <textarea
                style={{
                  ...pg.textarea,
                  color: autoTyping ? "#ff7755"
                    : s3==="fight"||s3==="erasing" ? "#ff996688"
                    : s3==="user_writes" ? "#aaffee"
                    : "#e2e8f0",
                  animation: s1Shake ? "editorShake 0.09s infinite" : "none",
                  background: s3==="user_writes" ? "rgba(68,221,255,0.025)" : "transparent",
                  transition:"background 0.4s, color 0.3s",
                }}
                value={code}
                onChange={e => { if (!autoTyping && s3!=="erasing") setCode(e.target.value); }}
                spellCheck={false}
                readOnly={autoTyping || s3==="erasing"}
              />
            </div>
          </div>

          {/* Action bar */}
          <div style={pg.actionBar}>
            {/* S1 */}
            {screen===1 && s1==="idle" && <button style={pg.btnSubmit} onClick={s1Submit}>SUBMIT</button>}
            {screen===1 && s1==="bad_submitted" && <span style={pg.statusBad}>✗ TIME LIMIT EXCEEDED — O(n²)</span>}
            {screen===1 && (s1==="cleany_hint"||s1==="hint_shown") && (
              <button style={pg.btnHint} onClick={() => { setCode1(CODE_S1_GOOD); setS1("good_code"); }}>→ Rewrite with hashmap</button>
            )}
            {screen===1 && s1==="good_code" && <button style={pg.btnSubmit} onClick={s1GoodSubmit}>SUBMIT</button>}
            {screen===1 && (s1==="accepted"||s1==="s1_final") && <span style={pg.statusGood}>✓ ACCEPTED — O(n) runtime</span>}
            {screen===1 && s1==="s1_done" && <button style={pg.btnHint} onClick={() => setScreen(2)}>→ LEVEL 2</button>}

            {/* S2 */}
            {screen===2 && s2==="idle" && (
              <>
                <button style={pg.btnSubmit} onClick={() => {}}>SUBMIT</button>
                <button style={{ ...pg.btnHint, marginLeft:8 }} onClick={() => setS2("vibey_growing")}>Need a hint…</button>
              </>
            )}
            {screen===2 && s2==="vibey_growing" && (
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <button style={{ ...pg.btnSubmit, background:"#ff4444", fontSize:16, padding:"12px 28px", animation:"bigShake 0.22s infinite" }} onClick={() => {}}>
                  🔴 SOLVE ENTIRE PROBLEM
                </button>
                <button style={{ ...pg.btnHint, fontSize:10, opacity:0.6 }} onClick={s2SmallHelp}>
                  ⚪ just help with the loop condition
                </button>
              </div>
            )}
            {screen===2 && s2==="vibey_dlg" && (
              <button style={pg.btnHint} onClick={() => setS2("cleany_dlg")}>[cleany steps in →]</button>
            )}
            {screen===2 && s2==="cleany_dlg" && (
              <button style={pg.btnHint} onClick={() => { setCode2(CODE_S2_DONE); setS2("user_codes"); }}>→ Finish implementation</button>
            )}
            {screen===2 && s2==="user_codes" && <button style={pg.btnSubmit} onClick={s2Submit}>SUBMIT</button>}
            {screen===2 && (s2==="accepted"||s2==="s2_final") && <span style={pg.statusGood}>✓ ACCEPTED — two pointer O(n)</span>}

            {/* S3 */}
            {screen===3 && s3==="idle" && (
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"rgba(255,255,255,0.22)" }}>
                  * Vibey is watching.
                </span>
                <span style={{
                  fontFamily:"'Space Mono',monospace", fontSize:18, fontWeight:700,
                  color: s3Countdown <= 3 ? "#ff4444" : "rgba(255,255,255,0.45)",
                  animation: s3Countdown <= 3 ? "blink 0.35s step-end infinite" : "none",
                  minWidth:32, textAlign:"center",
                }}>
                  {s3Countdown}
                </span>
              </div>
            )}
            {screen===3 && s3==="vibey_appears" && (
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:12, color:"#ff4444", animation:"blink 0.38s step-end infinite", letterSpacing:3 }}>
                ⚠ VIBEY OVERRIDE INCOMING
              </span>
            )}
            {screen===3 && s3==="takeover" && (
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:12, color:"#ff5533", animation:"blink 0.28s step-end infinite" }}>
                ⚡ VIBEY IS WRITING...
              </span>
            )}
            {screen===3 && s3==="fight" && (
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#44ddff88", letterSpacing:2 }}>
                — click dialogue to continue —
              </span>
            )}
            {screen===3 && s3==="erasing" && (
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#44ddff88", animation:"blink 0.45s step-end infinite" }}>
                ✏ CLEANY IS ERASING VIBEY'S CODE...
              </span>
            )}
            {screen===3 && s3==="user_writes" && (
              <button style={pg.btnSubmit} onClick={s3Submit}>SUBMIT</button>
            )}
            {screen===3 && (s3==="proud_dlg"||s3==="accepted"||s3==="s3_final") && (
              <span style={pg.statusGood}>✓ ACCEPTED — determination mode complete</span>
            )}
          </div>
        </div>

        {/* RIGHT — VIBEY */}
        <VibeyPanel level={vibeyPanelLevel} glitch={vibeyGlitch} />
      </div>

      {/* ---- DIALOGUE OVERLAYS ---- */}
      {s1==="vibey_talking" && <DialogueBox lines={DLG_S1_BAD}     onComplete={() => setS1("cleany_hint")} />}
      {s1==="cleany_hint"   && <DialogueBox lines={DLG_S1_CLEANY}  onComplete={() => setS1("hint_shown")} />}
      {s1==="comment_dlg"   && <DialogueBox lines={DLG_S1_COMMENT} onComplete={() => { setS1("accepted"); playSuccess(); setTimeout(() => setS1("s1_final"), 600); }} />}
      {s1==="s1_final"      && <DialogueBox lines={DLG_S1_FINAL}   onComplete={() => { setS1("s1_done"); setTimeout(() => { setScreen(2); setS2("idle"); setVibeyLevel(0); }, 900); }} />}

      {s2==="vibey_dlg"  && <DialogueBox lines={DLG_S2_VIBEY}  onComplete={() => setS2("cleany_dlg")} />}
      {s2==="cleany_dlg" && <DialogueBox lines={DLG_S2_CLEANY} onComplete={() => setS2("user_codes")} />}
      {s2==="s2_final"   && <DialogueBox lines={DLG_S2_FINAL}  onComplete={() => { setS2("s2_done" as S2); setTimeout(() => setScreen(3), 900); }} />}

      {s3==="vibey_appears" && <DialogueBox lines={DLG_S3_VIBEY}  onComplete={() => setS3("takeover")} />}
      {s3==="fight"         && <DialogueBox lines={DLG_S3_CLEANY} onComplete={() => setS3("erasing")} />}
      {s3==="proud_dlg"     && <DialogueBox lines={DLG_S3_PROUD}  onComplete={() => { setS3("s3_final"); setTimeout(() => setShowFinalScene(true), 700); }} />}

      {/* FINAL SCENE */}
      {showFinalScene && (
        <FinalScene onComplete={() => {
          setShowFinalScene(false);
          stopAllMusic();
          setTimeout(() => onComplete?.(), 600);
        }} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        html,body,#root { height:100%; background:#08080f; }
        textarea { caret-color:#a78bfa; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); }
        b { color:#fff; }
        @keyframes blink        { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes arrowBob     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }
        @keyframes float        { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes dlgIn        { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes dlgShake     { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 60%{transform:translateX(8px)} }
        @keyframes dlgGlitch    { 0%{transform:translate(0,0) skewX(0)} 20%{transform:translate(-5px,0) skewX(-4deg)} 40%{transform:translate(5px,0) skewX(4deg)} 60%{transform:translate(-2px,1px)} 80%{transform:translate(2px,-1px)} 100%{transform:translate(0,0)} }
        @keyframes dlgFlash     { 0%,100%{filter:brightness(1)} 50%{filter:brightness(5)} }
        @keyframes editorShake  { 0%,100%{transform:translateX(0)} 33%{transform:translateX(-10px)} 66%{transform:translateX(10px)} }
        @keyframes bigShake     { 0%,100%{transform:translate(0,0)} 25%{transform:translate(-4px,-2px)} 75%{transform:translate(4px,2px)} }
        @keyframes vibeypulse   { 0%,100%{filter:drop-shadow(0 0 8px #ff4444);transform:scale(1)} 50%{filter:drop-shadow(0 0 34px #ff1111);transform:scale(1.13)} }
        @keyframes glitchChar   { 0%{transform:translate(0,0) skewX(0deg) scaleX(1)} 20%{transform:translate(-4px,1px) skewX(-5deg)} 40%{transform:translate(4px,-1px) skewX(5deg) scaleX(1.06)} 60%{transform:translate(-1px,0)} 80%{transform:translate(3px,1px)} 100%{transform:translate(0,0)} }
      `}</style>
    </div>
  );
}

// ============================================================================
// PAGE STYLES
// ============================================================================
const pg: Record<string, React.CSSProperties> = {
  root:        { height:"100vh", display:"flex", flexDirection:"column", background:"#08080f", color:"#e2e8f0", overflow:"hidden", position:"relative" },
  scanlines:   { position:"fixed", inset:0, pointerEvents:"none", zIndex:999, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.05) 2px,rgba(0,0,0,0.05) 4px)" },
  redFlash:    { position:"fixed", inset:0, background:"rgba(255,0,0,0.45)", zIndex:800, pointerEvents:"none", animation:"dlgFlash 0.8s ease forwards" },
  whiteFlash:  { position:"fixed", inset:0, background:"rgba(255,255,255,0.92)", zIndex:800, pointerEvents:"none", animation:"dlgFlash 1.4s ease forwards" },

  topBar:   { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", height:50, background:"#000", borderBottom:"2px solid rgba(255,255,255,0.12)", flexShrink:0 },
  logoText: { fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:14, color:"#fff", letterSpacing:1 },
  logoBadge:{ background:"#fff", color:"#000", fontFamily:"'Space Mono',monospace", fontSize:8, fontWeight:700, padding:"2px 5px", letterSpacing:1 },
  levelInfo:{ display:"flex", alignItems:"center", gap:12 },
  levelText:{ fontFamily:"'Space Mono',monospace", fontWeight:700 },
  levelSub: { fontFamily:"'Space Mono',monospace", fontSize:10, color:"rgba(255,255,255,0.3)" },
  levelPip: { width:28, height:28, border:"2px solid", background:"none", fontFamily:"'Space Mono',monospace", fontSize:11, fontWeight:700, cursor:"pointer" },

  layout: { display:"flex", flex:1, overflow:"hidden" },
  center: { flex:1, display:"flex", flexDirection:"column", overflow:"hidden", borderLeft:"1px solid rgba(255,255,255,0.07)", borderRight:"1px solid rgba(255,255,255,0.07)" },

  descPane:  { padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0, overflowY:"auto", maxHeight:"36%" },
  descTitle: { fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:16, color:"#fff", marginBottom:8 },
  easyBadge: { display:"inline-block", background:"#065f46", color:"#6ee7b7", border:"1px solid #6ee7b7", fontFamily:"'Space Mono',monospace", fontSize:9, fontWeight:700, padding:"2px 8px", letterSpacing:1, marginBottom:10 },
  descBody:  { fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#9ca3af", lineHeight:1.7, marginBottom:10 },
  example:   { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", padding:"8px 12px", fontFamily:"'Space Mono',monospace", fontSize:11, color:"#d1d5db", lineHeight:1.8, marginBottom:6 },
  exNote:    { color:"#6b7280", fontSize:10 },
  inlineCode:{ background:"rgba(255,255,255,0.08)", padding:"1px 5px", fontFamily:"'Space Mono',monospace", fontSize:11 },

  editorPane:   { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },
  editorHeader: { display:"flex", alignItems:"center", gap:10, padding:"7px 16px", background:"rgba(0,0,0,0.5)", borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0 },
  editorTag:    { fontFamily:"'Space Mono',monospace", fontSize:10, fontWeight:700, color:"#a78bfa", letterSpacing:2 },
  editorFile:   { fontFamily:"'Space Mono',monospace", fontSize:10, color:"rgba(255,255,255,0.25)" },
  editorInner:  { flex:1, display:"flex", overflow:"hidden" },
  lineNums:     { width:42, background:"rgba(0,0,0,0.35)", display:"flex", flexDirection:"column", padding:"16px 0", borderRight:"1px solid rgba(255,255,255,0.05)", flexShrink:0, overflowY:"hidden" },
  lineNum:      { fontFamily:"'Space Mono',monospace", fontSize:11, color:"rgba(255,255,255,0.18)", textAlign:"right", paddingRight:9, lineHeight:"1.7", height:"22.1px", flexShrink:0 },
  textarea:     { flex:1, background:"transparent", border:"none", outline:"none", resize:"none", fontFamily:"'Space Mono',monospace", fontSize:13, lineHeight:1.7, padding:"16px", color:"#e2e8f0" },

  actionBar: { display:"flex", alignItems:"center", flexWrap:"wrap", gap:10, padding:"10px 18px", background:"rgba(0,0,0,0.55)", borderTop:"1px solid rgba(255,255,255,0.07)", flexShrink:0, minHeight:52 },
  btnSubmit: { background:"#fff", border:"none", color:"#000", fontFamily:"'Space Mono',monospace", fontSize:12, fontWeight:700, padding:"9px 22px", cursor:"pointer", letterSpacing:1 },
  btnHint:   { background:"none", border:"1px solid rgba(255,255,255,0.25)", color:"rgba(255,255,255,0.65)", fontFamily:"'Space Mono',monospace", fontSize:11, padding:"8px 16px", cursor:"pointer", letterSpacing:0.5 },
  statusBad: { fontFamily:"'Space Mono',monospace", fontSize:12, color:"#ff4444", animation:"dlgShake 0.3s infinite" },
  statusGood:{ fontFamily:"'Space Mono',monospace", fontSize:12, color:"#6ee7b7" },
};
