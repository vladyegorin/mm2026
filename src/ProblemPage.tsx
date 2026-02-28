import { useState, useEffect, useRef } from "react";

// ============================================================================
// MUSIC PLACEHOLDERS
// Drop audio files in /public/sounds/ and uncomment the implementation
// ============================================================================
function playTrack(_key: string) {
  // const map: Record<string,string> = {
  //   ghostFight:       "/sounds/ghost_fight.mp3",        // S1: bad submit → Vibey rants
  //   home:             "/sounds/home.mp3",                // S1: Cleany hashmap hint
  //   sans:             "/sounds/sans.mp3",                // S1: comment added, Vibey reacts
  //   nyehHehHeh:       "/sounds/nyeh_heh_heh.mp3",        // S1: Vibey complains about comments
  //   snowdinTown:      "/sounds/snowdin_town.mp3",        // S1: final dialogue
  //   bonetrousle:      "/sounds/bonetrousle.mp3",         // S2: Vibey growing & pulsing
  //   hotel:            "/sounds/hotel.mp3",               // S2: Cleany reacts to Vibey line
  //   heartache:        "/sounds/heartache.mp3",           // S2: arguing after submit
  //   strongerMonsters: "/sounds/stronger_monsters.mp3",   // S3: flicker, Vibey appears
  //   megalovania:      "/sounds/megalovania.mp3",         // S3: code fight scene
  //   hisTheme:         "/sounds/his_theme.mp3",           // S3: final resolution
  // };
  // ... load and play
}
function stopAllTracks() { /* TODO */ }

// ============================================================================
// WEB AUDIO — blips & SFX
// ============================================================================
let _ac: AudioContext | null = null;
function getAC() {
  if (!_ac) _ac = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (_ac.state === "suspended") _ac.resume();
  return _ac;
}
function blip(pitch = 480, vol = 0.045) {
  try {
    const c = getAC(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = "square"; o.frequency.value = pitch;
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);
    o.start(); o.stop(c.currentTime + 0.07);
  } catch {}
}
function sfxSuccess() {
  try {
    const c = getAC();
    [523,659,784,1047].forEach((f,i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = "triangle"; o.frequency.value = f;
      const t = c.currentTime + i*0.12;
      g.gain.setValueAtTime(0.12,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.35);
      o.start(t); o.stop(t+0.38);
    });
  } catch {}
}
function sfxBad() {
  try {
    const c = getAC();
    [200,160,130].forEach((f,i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = "sawtooth"; o.frequency.value = f;
      const t = c.currentTime + i*0.09;
      g.gain.setValueAtTime(0.1,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.3);
      o.start(t); o.stop(t+0.35);
    });
  } catch {}
}
function sfxChime() {
  try {
    const c = getAC();
    [659,784,880].forEach((f,i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = "triangle"; o.frequency.value = f;
      const t = c.currentTime + i*0.1;
      g.gain.setValueAtTime(0.08,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.4);
      o.start(t); o.stop(t+0.45);
    });
  } catch {}
}

// ============================================================================
// TYPES & DIALOGUE DATA
// ============================================================================
type Speaker = "vibey"|"cleany"|"system";
interface DLine { speaker: Speaker; text: string; effect?: "shake"|"glitch"|"calm"|"flash"; onEnter?: ()=>void; }

const S1_BAD: DLine[] = [
  { speaker:"vibey", text:"N²? Seriously?", effect:"glitch", onEnter: ()=>{ sfxBad(); playTrack("ghostFight"); } },
  { speaker:"vibey", text:"There is a MUCH better way.", effect:"glitch" },
  { speaker:"vibey", text:"Do you even need to understand this?", effect:"shake" },
  { speaker:"vibey", text:"In this era?", effect:"shake" },
  { speaker:"vibey", text:"Move aside. I'll solve it in a split second.", effect:"glitch" },
];
const S1_CLEANY: DLine[] = [
  { speaker:"cleany", text:"Wait.", effect:"calm", onEnter: ()=>{ stopAllTracks(); sfxChime(); playTrack("home"); } },
  { speaker:"cleany", text:"Maybe… think about lookups?", effect:"calm" },
  { speaker:"cleany", text:"What data structure gives O(1) access?", effect:"calm" },
];
const S1_COMMENT: DLine[] = [
  { speaker:"cleany", text:"Good. Clear logic. Helpful comments.", effect:"calm", onEnter: ()=>{ stopAllTracks(); playTrack("sans"); } },
  { speaker:"vibey", text:"Comments? POINTLESS.", effect:"shake", onEnter: ()=>{ stopAllTracks(); playTrack("nyehHehHeh"); } },
  { speaker:"vibey", text:"If I did this, I'd generate 10 pages of documentation.", effect:"glitch" },
  { speaker:"vibey", text:"Let me handle it next time.", effect:"glitch" },
];
const S1_FINAL: DLine[] = [
  { speaker:"cleany", text:"You solved it yourself.", effect:"calm", onEnter: ()=>{ stopAllTracks(); sfxChime(); playTrack("snowdinTown"); } },
  { speaker:"vibey", text:"…Fine. But I was faster." },
];
const S2_VIBEY_DLG: DLine[] = [
  { speaker:"vibey", text:"You're wasting time.", effect:"shake", onEnter: ()=>playTrack("bonetrousle") },
  { speaker:"vibey", text:"Fine." },
];
const S2_CLEANY_DLG: DLine[] = [
  { speaker:"cleany", text:"It's okay to ask for help.", effect:"calm", onEnter: ()=>{ stopAllTracks(); sfxChime(); playTrack("hotel"); } },
  { speaker:"cleany", text:"But do you understand why this condition works?", effect:"calm" },
  { speaker:"cleany", text:"Two pointers converge. That's the invariant.", effect:"calm" },
];
const S2_FINAL: DLine[] = [
  { speaker:"vibey", text:"You could've finished in 3 seconds.", effect:"shake", onEnter: ()=>{ stopAllTracks(); playTrack("heartache"); } },
  { speaker:"vibey", text:"Why struggle?", effect:"shake" },
  { speaker:"cleany", text:"Because struggle builds intuition.", effect:"calm" },
  { speaker:"cleany", text:"AI won't sit beside you in the interview.", effect:"calm" },
  { speaker:"cleany", text:"Understanding will.", effect:"calm" },
];
const S3_VIBEY_APP: DLine[] = [
  { speaker:"vibey", text:"Oh?", effect:"glitch", onEnter: ()=>{ stopAllTracks(); playTrack("strongerMonsters"); } },
  { speaker:"vibey", text:"We're thinking now?", effect:"glitch" },
  { speaker:"vibey", text:"Adorable.", effect:"glitch" },
];
const S3_FIGHT: DLine[] = [
  { speaker:"cleany", text:"Stop.", effect:"flash", onEnter: ()=>{ stopAllTracks(); playTrack("megalovania"); } },
  { speaker:"cleany", text:"Do you understand ANY of this?", effect:"flash" },
];
const S3_FINAL: DLine[] = [
  { speaker:"vibey", text:"…You'll use me anyway.", onEnter: ()=>{ stopAllTracks(); playTrack("hisTheme"); } },
  { speaker:"cleany", text:"And that's okay.", effect:"calm" },
  { speaker:"vibey", text:"You can't escape AI." },
  { speaker:"cleany", text:"But you can control how you use it.", effect:"calm" },
  { speaker:"cleany", text:"Understand what you write.", effect:"calm" },
  { speaker:"system", text:"Stay determined." },
];

// ============================================================================
// CODE SNIPPETS
// ============================================================================
const CODE_S1 = `function twoSum(nums: number[], target: number): number[] {
  // your code here
  return [];
}`;
const CODE_S2 = `function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let max = 0;

  return max;
}`;
const CODE_S2_LOOP = `function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let max = 0;
  while (left < right) {
    // your logic here
  }
  return max;
}`;
const CODE_S3 = `// Longest Valid Parentheses
// Given a string of '(' and ')', return the length
// of the longest valid parentheses substring.

function longestValidParentheses(s: string): number {
  // Think carefully before reaching for shortcuts.
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
  return max; // did you follow any of that? ;)
}`;
const CODE_S3_FINAL = `function longestValidParentheses(s: string): number {
  // Stack: track unmatched bracket indices
  const stack: number[] = [-1];
  let max = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i);
    } else {
      stack.pop();
      if (stack.length === 0) stack.push(i);
      else max = Math.max(max, i - stack[stack.length - 1]);
    }
  }
  return max;
}`;

// ============================================================================
// MOCK TEST RUNNER (Screen 1 only)
// ============================================================================
const TEST_CASES = [
  { label:"nums=[2,7,11,15], target=9", expected:"[0,1]", nums:[2,7,11,15], target:9 },
  { label:"nums=[3,2,4], target=6",     expected:"[1,2]", nums:[3,2,4],     target:6 },
  { label:"nums=[3,3], target=6",       expected:"[0,1]", nums:[3,3],       target:6 },
];
function runCode(code: string, nums: number[], target: number): number[]|string {
  try {
    const fn = new Function(`${code}\nreturn twoSum(arguments[0],arguments[1]);`);
    return fn(nums, target);
  } catch(e) { return String(e); }
}
function checkResult(r: number[]|string, exp: string): boolean {
  if (typeof r === "string") return false;
  return JSON.stringify([...r].sort((a,b)=>a-b)) === JSON.stringify(JSON.parse(exp).sort((a:number,b:number)=>a-b));
}

// ============================================================================
// DIALOGUE BOX — centered overlay, large, readable
// ============================================================================
function DialogueBox({ lines, onComplete }: { lines: DLine[]; onComplete: ()=>void }) {
  const [li, setLi] = useState(0);
  const [txt, setTxt] = useState("");
  const [ci, setCi] = useState(0);
  const [done, setDone] = useState(false);
  const line = lines[li];
  const pitchMap: Record<Speaker,number[]> = {
    vibey:  [252,235,272,242],
    cleany: [615,655,595,635],
    system: [440,460,420,450],
  };

  useEffect(() => { setTxt(""); setCi(0); setDone(false); line.onEnter?.(); }, [li]);
  useEffect(() => {
    if (ci < line.text.length) {
      const t = setTimeout(() => {
        setTxt(line.text.slice(0,ci+1)); setCi(i=>i+1);
        if (line.text[ci] !== " ") blip(pitchMap[line.speaker][ci%4], 0.045);
      }, 26);
      return () => clearTimeout(t);
    } else setDone(true);
  }, [ci, line]);

  const advance = () => {
    if (!done) { setTxt(line.text); setCi(line.text.length); setDone(true); return; }
    if (li+1 < lines.length) setLi(i=>i+1); else onComplete();
  };

  const col: Record<Speaker,string> = { vibey:"#ff3333", cleany:"#33ddff", system:"#ffffff" };
  const c = col[line.speaker];
  const eff = line.effect;

  return (
    <div style={dlg.backdrop} onClick={advance}>
      <div
        onClick={e=>e.stopPropagation()}
        style={{
          ...dlg.box,
          borderColor: c,
          boxShadow: `0 0 0 5px #000, 0 0 60px ${c}44`,
          animation:
            eff==="shake" ? "dlgShake 0.2s infinite" :
            eff==="glitch" ? "dlgGlitch 0.1s infinite" :
            eff==="flash" ? "dlgFlash 0.4s ease" : "dlgIn 0.2s ease both",
        }}
      >
        {/* Speaker strip */}
        <div style={{ ...dlg.strip, borderBottom:`3px solid ${c}55`, background:`${c}12` }}>
          <span style={{ ...dlg.speakerIcon, filter:`drop-shadow(0 0 10px ${c})` }}>
            {line.speaker==="vibey" ? "😈" : line.speaker==="cleany" ? "😇" : "★"}
          </span>
          <span style={{ ...dlg.speakerName, color:c }}>
            {line.speaker==="vibey" ? "VIBEY" : line.speaker==="cleany" ? "CLEANY" : "SYSTEM"}
          </span>
          <span style={dlg.counter}>{li+1}/{lines.length}</span>
        </div>
        {/* Text */}
        <div style={dlg.body}>
          <span style={{
            ...dlg.text, color:c,
            textShadow: eff==="glitch" ? `4px 0 #ff0000, -4px 0 #00ffff` : "none",
          }}>* {txt}</span>
          {done && <span style={dlg.arrow}>▼</span>}
        </div>
        <div style={dlg.hint}>click to continue</div>
      </div>
    </div>
  );
}

const dlg: Record<string, React.CSSProperties> = {
  backdrop: { position:"fixed", inset:0, zIndex:900, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.75)", cursor:"pointer" },
  box: { width:"min(800px,90vw)", background:"#000", border:"4px solid", cursor:"default" },
  strip: { display:"flex", alignItems:"center", gap:18, padding:"16px 28px" },
  speakerIcon: { fontSize:48, lineHeight:1 },
  speakerName: { fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:16, letterSpacing:3, textTransform:"uppercase", flex:1 },
  counter: { fontFamily:"'Space Mono',monospace", fontSize:11, color:"rgba(255,255,255,0.25)", letterSpacing:1 },
  body: { padding:"24px 28px 12px", minHeight:100 },
  text: { fontFamily:"'Space Mono',monospace", fontSize:20, lineHeight:1.85 },
  arrow: { display:"inline-block", marginLeft:12, animation:"arrowBob 0.7s ease-in-out infinite", color:"rgba(255,255,255,0.5)", fontSize:16, verticalAlign:"middle" },
  hint: { fontFamily:"'Space Mono',monospace", fontSize:10, color:"rgba(255,255,255,0.15)", letterSpacing:1, padding:"8px 28px 18px", textAlign:"right" },
};

// ============================================================================
// VIBEY PANEL — right side, hidden until triggered
// ============================================================================
function VibeyPanel({ level, glitch }: { level:0|1|2|3|4; glitch?:boolean }) {
  // sizes: idle=120, growing progressively up to 340
  const w = [120,160,210,270,340][level];
  const h = Math.round(w*1.25);
  return (
    <div style={{
      width: 200, flexShrink:0,
      background:"#000",
      borderLeft:`3px solid #ff4444`,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end",
      paddingBottom:28, overflow:"hidden", position:"relative",
      boxShadow: level>0 ? `inset -${level*14}px 0 ${level*24}px rgba(255,0,0,0.18)` : "none",
      transition:"box-shadow 0.8s",
    }}>
      {level>1 && (
        <div style={{
          position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)",
          width:w*1.5, height:h*0.6,
          background:"radial-gradient(ellipse, rgba(255,0,0,0.35) 0%, transparent 70%)",
          pointerEvents:"none",
        }}/>
      )}
      <svg
        viewBox="0 0 16 20" width={w} height={h}
        style={{
          imageRendering:"pixelated", display:"block",
          transition:"width 0.7s ease, height 0.7s ease",
          transformOrigin:"bottom center",
          filter: glitch
            ? "hue-rotate(120deg) saturate(6) brightness(2.2)"
            : `drop-shadow(0 0 ${level*7+5}px #ff4444)`,
          animation: glitch ? "glitchChar 0.08s infinite"
            : level>=3 ? "vibeybig 0.65s ease-in-out infinite alternate"
            : level>0 ? "vibeypulse 1.3s ease-in-out infinite" : "none",
        }}
      >
        <ellipse cx="8" cy="19.5" rx="4.5" ry="0.8" fill="rgba(255,68,68,0.45)"/>
        <rect x="7" y="13" width="2" height="5" fill="#1a6b1a"/>
        <rect x="4" y="12" width="3" height="2" fill="#1a6b1a"/>
        <rect x="9" y="12" width="3" height="2" fill="#1a6b1a"/>
        {/* petals */}
        <rect x="3" y="3" width="3" height="3" fill="#cc2222"/>
        <rect x="10" y="3" width="3" height="3" fill="#cc2222"/>
        <rect x="5" y="1" width="3" height="3" fill="#cc2222"/>
        <rect x="8" y="1" width="3" height="3" fill="#cc2222"/>
        <rect x="3" y="7" width="3" height="3" fill="#cc2222"/>
        <rect x="10" y="7" width="3" height="3" fill="#cc2222"/>
        <rect x="5" y="10" width="3" height="3" fill="#cc2222"/>
        <rect x="8" y="10" width="3" height="3" fill="#cc2222"/>
        {/* face */}
        <rect x="5" y="4" width="6" height="8" fill="#f5c518"/>
        {level===0 ? (
          <>
            <rect x="6" y="6" width="1" height="2" fill="#000"/>
            <rect x="9" y="6" width="1" height="2" fill="#000"/>
            <rect x="7" y="9" width="2" height="1" fill="#000"/>
          </>
        ) : (
          <>
            <rect x="6" y="6" width="2" height="1" fill="#ff0000"/>
            <rect x="9" y="6" width="2" height="1" fill="#ff0000"/>
            <rect x="6" y="7" width="1" height="1" fill="#880000"/>
            <rect x="10" y="7" width="1" height="1" fill="#880000"/>
            <rect x="6" y="9" width="1" height="1" fill="#000"/>
            <rect x="7" y="10" width="2" height="1" fill="#000"/>
            <rect x="9" y="9" width="1" height="1" fill="#000"/>
          </>
        )}
      </svg>
      <div style={{ fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:11, color:"#ff4444",
        letterSpacing:3, border:"2px solid #ff4444", padding:"2px 10px", marginTop:18,
        boxShadow: level>0?"0 0 10px #ff444488":"none" }}>VIBEY</div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:"#ff444477", letterSpacing:2, marginTop:4 }}>✦ THE DEMON ✦</div>
    </div>
  );
}

// ============================================================================
// CLEANY PANEL — left side, hidden until triggered
// ============================================================================
function CleanyPanel({ active, erasing }: { active?:boolean; erasing?:boolean }) {
  return (
    <div style={{
      width:200, flexShrink:0,
      background:"#000",
      borderRight:`3px solid #33ddff`,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end",
      paddingBottom:28, overflow:"hidden", position:"relative",
      boxShadow: active ? "inset 14px 0 48px rgba(51,221,255,0.12)" : "none",
      transition:"box-shadow 0.8s",
    }}>
      {active && (
        <div style={{
          position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)",
          width:260, height:180,
          background:"radial-gradient(ellipse, rgba(51,221,255,0.22) 0%, transparent 70%)",
          pointerEvents:"none",
        }}/>
      )}
      <svg viewBox="0 0 16 20" width="150" height="188"
        style={{
          imageRendering:"pixelated", display:"block",
          filter:`drop-shadow(0 0 ${active?22:7}px #33ddff)`,
          transition:"filter 0.5s",
          animation: erasing ? "float 0.3s ease-in-out infinite"
            : active ? "float 2.8s ease-in-out infinite" : "none",
        }}
      >
        <ellipse cx="8" cy="19.5" rx="4.5" ry="0.8" fill="rgba(51,221,255,0.35)"/>
        <rect x="4" y="9" width="8" height="9" fill="#e8e8f8"/>
        <rect x="4" y="9" width="1" height="9" fill="#c8c8e8"/>
        <rect x="11" y="9" width="1" height="9" fill="#c8c8e8"/>
        <rect x="4" y="14" width="8" height="2" fill="#99ccff"/>
        <rect x="2" y="10" width="2" height="5" fill="#e8e8f8"/>
        <rect x="12" y="10" width="2" height="5" fill="#e8e8f8"/>
        {/* halo */}
        <rect x="5" y="0" width="6" height="1" fill="#ffe066"/>
        <rect x="4" y="1" width="8" height="1" fill="#ffe066"/>
        <rect x="4" y="0" width="1" height="2" fill="#ffe066"/>
        <rect x="11" y="0" width="1" height="2" fill="#ffe066"/>
        {/* head */}
        <rect x="5" y="2" width="6" height="6" fill="#ffd7a8"/>
        {active ? (
          <>
            <rect x="6" y="4" width="2" height="2" fill="#33ddff"/>
            <rect x="9" y="4" width="2" height="2" fill="#33ddff"/>
            <rect x="7" y="7" width="2" height="1" fill="#aa6644"/>
            {/* wings */}
            <rect x="1" y="9" width="3" height="1" fill="rgba(255,255,255,0.65)"/>
            <rect x="0" y="10" width="3" height="3" fill="rgba(255,255,255,0.45)"/>
            <rect x="12" y="9" width="3" height="1" fill="rgba(255,255,255,0.65)"/>
            <rect x="13" y="10" width="3" height="3" fill="rgba(255,255,255,0.45)"/>
          </>
        ) : (
          <>
            <rect x="6" y="5" width="1" height="1" fill="#555"/>
            <rect x="9" y="5" width="1" height="1" fill="#555"/>
            <rect x="7" y="7" width="2" height="1" fill="#aa6644"/>
          </>
        )}
      </svg>
      <div style={{ fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:11, color:"#33ddff",
        letterSpacing:3, border:"2px solid #33ddff", padding:"2px 10px", marginTop:18,
        boxShadow: active?"0 0 10px #33ddff88":"none", transition:"box-shadow 0.5s" }}>CLEANY</div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:"#33ddff77", letterSpacing:2, marginTop:4 }}>✦ THE ANGEL ✦</div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function ProblemPage() {
  const [screen, setScreen] = useState<1|2|3>(1);

  // ---- SCREEN 1 ----
  type S1 = "clean"|"bad_flash"|"vibey_rant"|"cleany_hint"|"awaiting_good"|"comment_dlg"|"accepted"|"final_dlg"|"done";
  const [s1, setS1] = useState<S1>("clean");
  const [code1, setCode1] = useState(CODE_S1);
  const [s1Shake, setS1Shake] = useState(false);
  const [s1Flash, setS1Flash] = useState(false);
  const [testRes, setTestRes] = useState<{passed:boolean;out:string;exp:string}[]|null>(null);
  const [allPass, setAllPass] = useState(false);
  const [running, setRunning] = useState(false);
  const prevCode1 = useRef(CODE_S1);

  // ---- SCREEN 2 ----
  type S2 = "clean"|"vibey_growing"|"vibey_dlg"|"cleany_dlg"|"finishing"|"accepted"|"final_dlg";
  const [s2, setS2] = useState<S2>("clean");
  const [code2, setCode2] = useState(CODE_S2);
  const [vibeyLvl, setVibeyLvl] = useState<0|1|2|3|4>(0);

  // ---- SCREEN 3 ----
  type S3 = "clean"|"flicker"|"vibey_app"|"vibey_dlg"|"takeover"|"fight"|"fight_dlg"|"cleany_dlg"|"accepted"|"final_dlg";
  const [s3, setS3] = useState<S3>("clean");
  const [code3, setCode3] = useState(CODE_S3);
  const [s3Flicker, setS3Flicker] = useState(false);
  const [autoTyping, setAutoTyping] = useState(false);

  const autoRef = useRef<ReturnType<typeof setTimeout>|null>(null);

  // ---- S2: Vibey grows automatically every 4s ----
  useEffect(() => {
    if (screen!==2 || s2!=="clean") return;
    if (vibeyLvl>=3) return;
    const t = setTimeout(() => setVibeyLvl(v=>Math.min(v+1,3) as 0|1|2|3|4), 4000);
    return ()=>clearTimeout(t);
  }, [screen, s2, vibeyLvl]);

  useEffect(() => {
    if (screen===2 && s2==="clean" && vibeyLvl>=1) {
      playTrack("bonetrousle");
      setS2("vibey_growing");
    }
  }, [vibeyLvl, s2, screen]);

  // ---- S3: Auto-trigger after 10s of silence ----
  useEffect(() => {
    if (screen!==3 || s3!=="clean") return;
    const t = setTimeout(()=>{
      setS3Flicker(true); sfxBad();
      setTimeout(()=>{ setS3Flicker(false); setS3("vibey_app"); }, 1200);
    }, 10000);
    return ()=>clearTimeout(t);
  }, [screen, s3]);

  // ---- S3: Vibey auto-types ----
  useEffect(()=>{
    if (s3!=="takeover") return;
    setAutoTyping(true); let i=0; setCode3("");
    const type=()=>{
      if (i<CODE_S3_VIBEY.length) {
        setCode3(CODE_S3_VIBEY.slice(0,i+1)); i++;
        autoRef.current=setTimeout(type,14);
      } else { setAutoTyping(false); setTimeout(()=>setS3("fight"),500); }
    };
    autoRef.current=setTimeout(type,400);
    return ()=>{ if(autoRef.current) clearTimeout(autoRef.current); };
  }, [s3]);

  // ---- S1: detect comment written on new line ----
  useEffect(()=>{
    if (s1!=="awaiting_good") return;
    const prev=prevCode1.current, curr=code1;
    const prevLines=prev.split("\n"), currLines=curr.split("\n");
    if (currLines.length>prevLines.length) {
      const hadComment=prevLines.some(l=>l.trim().startsWith("//"));
      const hasComment=currLines.some(l=>l.trim().startsWith("//"));
      if (!hadComment && hasComment) setTimeout(()=>setS1("comment_dlg"),200);
    }
    prevCode1.current=curr;
  }, [code1, s1]);

  // ---- S1: Run tests ----
  const runTests1=()=>{
    setRunning(true); getAC();
    setTimeout(()=>{
      const results=TEST_CASES.map(tc=>{
        const r=runCode(code1,tc.nums,tc.target);
        return { passed:checkResult(r,tc.expected), out:typeof r==="string"?r:JSON.stringify(r), exp:tc.expected };
      });
      setTestRes(results);
      const pass=results.every(r=>r.passed);
      setAllPass(pass); setRunning(false);
      if (s1==="clean") {
        const badPattern=(code1.match(/for/g)||[]).length>=2 || code1.includes("return []");
        if (badPattern||!pass) {
          setS1Flash(true); setS1Shake(true);
          setTimeout(()=>{ setS1Flash(false); setS1Shake(false); }, 700);
          setTimeout(()=>setS1("vibey_rant"), 500);
        } else if (pass) {
          sfxSuccess(); setS1("awaiting_good");
        }
      } else if (s1==="awaiting_good" && pass) {
        sfxSuccess(); setS1("comment_dlg");
      }
    }, 600);
  };

  // ---- Derived state ----
  const showVibey = s1!=="clean" || screen===2 || screen===3;
  const showCleany = ["cleany_hint","awaiting_good","comment_dlg","accepted","final_dlg","done"].includes(s1) || ["cleany_dlg","finishing","accepted","final_dlg"].includes(s2) || ["fight","fight_dlg","cleany_dlg","accepted","final_dlg"].includes(s3);
  const vibeyGlitch = s1==="vibey_rant" || ["vibey_app","vibey_dlg"].includes(s3);
  const vibeyLevel: 0|1|2|3|4 =
    screen===3 && ["takeover","fight","fight_dlg","cleany_dlg"].includes(s3) ? 4 :
    screen===2 ? vibeyLvl :
    s1==="vibey_rant" ? 2 :
    showVibey ? 1 : 0;
  const cleanyActive = showCleany;
  const cleanyErasing = ["fight","fight_dlg","cleany_dlg"].includes(s3);

  const activeCode = screen===1?code1:screen===2?code2:code3;
  const setActiveCode = screen===1?(v:string)=>setCode1(v):screen===2?(v:string)=>setCode2(v):(v:string)=>setCode3(v);

  return (
    <div style={p.root}>
      <div style={p.scanlines}/>
      {s1Flash && <div style={p.redFlash}/>}
      {s3Flicker && <div style={p.whiteFlash}/>}

      {/* TOP BAR */}
      <header style={p.topBar}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={p.logoTxt}>⚡ SHEETCODE</span>
          <span style={p.logoBadge}>AI</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <span style={p.probNum}># 00{screen}</span>
          <span style={p.probTitle}>{screen===1?"Two Sum":screen===2?"Container With Most Water":"Longest Valid Parentheses"}</span>
          <span style={{...p.diffBadge,
            background:screen===1?"#065f46":screen===2?"#78350f":"#7f1d1d",
            color:screen===1?"#6ee7b7":screen===2?"#fbbf24":"#ff4444",
            borderColor:screen===1?"#6ee7b7":screen===2?"#fbbf24":"#ff4444",
          }}>{screen===1?"EASY":screen===2?"MEDIUM":"HARD"}</span>
        </div>
        <div style={{display:"flex",gap:6}}>
          {([1,2,3] as const).map(n=>(
            <button key={n} style={{...p.pip,
              background:screen===n?"#fff":"transparent",
              color:screen===n?"#000":"rgba(255,255,255,0.3)",
              borderColor:screen===n?"#fff":"rgba(255,255,255,0.2)",
            }} onClick={()=>setScreen(n)}>{n}</button>
          ))}
        </div>
      </header>

      {/* 3-COLUMN */}
      <div style={p.layout}>

        {/* LEFT: CLEANY (hidden until triggered) */}
        {showCleany
          ? <CleanyPanel active={cleanyActive} erasing={cleanyErasing}/>
          : <div style={{width:200,flexShrink:0}}/>
        }

        {/* CENTER */}
        <div style={p.center}>

          {/* Problem description */}
          <div style={p.desc}>
            {screen===1 && <>
              <p style={p.descTxt}>Given an array of integers <code style={p.ic}>nums</code> and an integer <code style={p.ic}>target</code>, return indices of the two numbers that add up to target. Each input has exactly one solution. You may not use the same element twice.</p>
              <div style={p.ex}><b>Input:</b> nums = [2,7,11,15], target = 9 &nbsp;→&nbsp; <b>Output:</b> [0,1]</div>
              <div style={p.ex}><b>Input:</b> nums = [3,2,4], target = 6 &nbsp;→&nbsp; <b>Output:</b> [1,2]</div>
              <div style={p.constraint}>2 ≤ nums.length ≤ 10⁴ &nbsp;|&nbsp; −10⁹ ≤ nums[i] ≤ 10⁹ &nbsp;|&nbsp; exactly one solution</div>
            </>}
            {screen===2 && <>
              <p style={p.descTxt}>Given <code style={p.ic}>n</code> non-negative integers representing heights, find two lines forming a container that holds the most water. Return the maximum water amount.</p>
              <div style={p.ex}><b>Input:</b> height = [1,8,6,2,5,4,8,3,7] &nbsp;→&nbsp; <b>Output:</b> 49</div>
              <div style={p.constraint}>n ≥ 2 &nbsp;|&nbsp; 0 ≤ height[i] ≤ 10⁴</div>
            </>}
            {screen===3 && <>
              <p style={{...p.descTxt, animation:s3==="clean"?"none":"bigShake 0.3s infinite"}}>
                Given a string of <code style={p.ic}>'('</code> and <code style={p.ic}>')'</code>, return the length of the longest valid parentheses substring.
              </p>
              <div style={p.ex}><b>"(()"</b> → 2 &nbsp;|&nbsp; <b>")()())"</b> → 4 &nbsp;|&nbsp; <b>""</b> → 0</div>
              <div style={p.constraint}>0 ≤ s.length ≤ 3×10⁴ &nbsp;|&nbsp; s[i] is '(' or ')'</div>
            </>}
          </div>

          {/* Editor */}
          <div style={p.editor}>
            <div style={p.edHdr}>
              <span style={p.edLang}>TYPESCRIPT</span>
              <span style={p.edFile}>solution.ts</span>
              {autoTyping && <span style={{...p.edLang,color:"#ff4444",marginLeft:"auto",animation:"blink 0.4s step-end infinite"}}>⚡ VIBEY OVERRIDE</span>}
              <button style={{...p.resetBtn,marginLeft:autoTyping?4:"auto"}} onClick={()=>{
                if(screen===1)setCode1(CODE_S1);
                if(screen===2)setCode2(CODE_S2);
                if(screen===3)setCode3(CODE_S3);
              }}>RESET</button>
            </div>
            <div style={p.edBody}>
              <div style={p.lineNums}>
                {activeCode.split("\n").map((_,i)=><div key={i} style={p.lineNum}>{i+1}</div>)}
              </div>
              <textarea
                style={{...p.textarea,
                  color:autoTyping?"#ff5555":"#e2e8f0",
                  animation:s1Shake?"editorShake 0.1s infinite":"none",
                }}
                value={activeCode}
                onChange={e=>{ if(!autoTyping) setActiveCode(e.target.value); }}
                spellCheck={false}
                readOnly={autoTyping}
                onClick={()=>getAC()}
              />
            </div>
          </div>

          {/* Bottom pane */}
          <div style={p.bottomPane}>
            <div style={p.bottomHdr}>
              <span style={p.bottomHdrTxt}>
                {screen===1?"TEST CASES":screen===2?"NOTES":"OUTPUT"}
              </span>
              {screen===1 && testRes && (
                <span style={{...p.bottomHdrTxt,color:allPass?"#6ee7b7":"#fca5a5"}}>
                  {allPass?"✓ ALL PASSED":`✗ ${testRes.filter(r=>!r.passed).length} FAILED`}
                </span>
              )}
            </div>
            <div style={p.bottomBody}>

              {/* SCREEN 1 */}
              {screen===1 && (
                <>
                  {!testRes
                    ? <div style={p.idleTxt}>* run your code to see results.</div>
                    : <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {testRes.map((r,i)=>(
                          <div key={i} style={{...p.testItem,borderColor:r.passed?"#065f46":"#7f1d1d",background:r.passed?"rgba(6,95,70,0.15)":"rgba(127,29,29,0.15)"}}>
                            <div style={{display:"flex",alignItems:"center",gap:12}}>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:12,fontWeight:700,color:r.passed?"#6ee7b7":"#fca5a5"}}>{r.passed?"✓":"✗"} Case {i+1}</span>
                              <span style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.35)"}}>{TEST_CASES[i].label}</span>
                            </div>
                            <div style={{display:"flex",gap:8,fontFamily:"'Space Mono',monospace",fontSize:11}}>
                              <span style={{color:"rgba(255,255,255,0.3)",width:64}}>Expected:</span>
                              <span style={{color:"#d1d5db"}}>{r.exp}</span>
                            </div>
                            <div style={{display:"flex",gap:8,fontFamily:"'Space Mono',monospace",fontSize:11}}>
                              <span style={{color:"rgba(255,255,255,0.3)",width:64}}>Got:</span>
                              <span style={{color:r.passed?"#6ee7b7":"#fca5a5"}}>{r.out}</span>
                            </div>
                          </div>
                        ))}
                        {allPass && s1==="done" && (
                          <div style={{border:"2px solid #6ee7b7",background:"rgba(6,95,70,0.2)",padding:"12px 14px"}}>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:13,color:"#6ee7b7",lineHeight:1.8}}>* wow. you actually did it.</div>
                            <div style={{fontFamily:"'Space Mono',monospace",fontSize:13,color:"#6ee7b7",lineHeight:1.8}}>* don't let it go to your head.</div>
                          </div>
                        )}
                      </div>
                  }
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <button style={p.runBtn} onClick={runTests1} disabled={running}>{running?"RUNNING...":"▶ RUN TESTS"}</button>
                    <button style={{...p.runBtn,...p.submitBtn}} onClick={runTests1} disabled={running}>SUBMIT</button>
                    {["final_dlg","done"].includes(s1) && (
                      <button style={{...p.runBtn,background:"rgba(255,255,255,0.08)"}} onClick={()=>setScreen(2)}>→ LEVEL 2</button>
                    )}
                  </div>
                </>
              )}

              {/* SCREEN 2 */}
              {screen===2 && (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {s2==="clean" && <div style={p.idleTxt}>* implement your solution. two pointers.</div>}
                  {s2==="vibey_growing" && (
                    <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                      <button style={{...p.runBtn,background:"#ff4444",borderColor:"#ff4444",color:"#000",fontSize:16,padding:"10px 24px",animation:"bigShake 0.3s infinite"}}>
                        🔴 SOLVE ENTIRE PROBLEM
                      </button>
                      <button style={{...p.runBtn,fontSize:10,opacity:0.55}} onClick={()=>{ setCode2(CODE_S2_LOOP); setS2("vibey_dlg"); }}>
                        ⚪ just help with the loop condition
                      </button>
                    </div>
                  )}
                  {s2==="cleany_dlg" && <div style={p.idleTxt}>* finish the implementation.</div>}
                  {s2==="finishing" && (
                    <div style={{display:"flex",gap:8}}>
                      <button style={p.runBtn}>▶ RUN TESTS</button>
                      <button style={{...p.runBtn,...p.submitBtn}} onClick={()=>{ sfxSuccess(); setS2("accepted"); setTimeout(()=>setS2("final_dlg"),400); }}>SUBMIT</button>
                    </div>
                  )}
                  {["accepted","final_dlg"].includes(s2) && <>
                    <span style={{fontFamily:"'Space Mono',monospace",fontSize:12,color:"#6ee7b7"}}>✓ ACCEPTED</span>
                    {s2==="final_dlg" && <button style={{...p.runBtn,background:"rgba(255,255,255,0.08)",marginTop:4}} onClick={()=>setScreen(3)}>→ LEVEL 3</button>}
                  </>}
                </div>
              )}

              {/* SCREEN 3 */}
              {screen===3 && (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {s3==="clean" && (
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"rgba(255,255,255,0.18)",lineHeight:2.2}}>
                      * you stare at the problem.<br/>* 10 seconds pass.<br/>* no typing.
                    </div>
                  )}
                  {s3==="vibey_app" && (
                    <button style={{...p.runBtn,background:"#ff4444",borderColor:"#ff4444",color:"#000",fontSize:16,animation:"bigShake 0.2s infinite",padding:"12px 24px"}}
                      onClick={()=>setS3("takeover")}>
                      🔴 I'LL SOLVE IT MYSELF.
                    </button>
                  )}
                  {s3==="fight" && (
                    <button style={p.runBtn} onClick={()=>{ setCode3(CODE_S3_FINAL); setS3("cleany_dlg"); }}>
                      ✏ Reclaim control — rewrite
                    </button>
                  )}
                  {s3==="cleany_dlg" && (
                    <button style={{...p.runBtn,...p.submitBtn}} onClick={()=>{ sfxSuccess(); setS3("accepted"); setTimeout(()=>setS3("final_dlg"),400); }}>
                      SUBMIT
                    </button>
                  )}
                  {["accepted","final_dlg"].includes(s3) && (
                    <span style={{fontFamily:"'Space Mono',monospace",fontSize:12,color:"#6ee7b7"}}>✓ ACCEPTED — determination mode complete</span>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT: VIBEY (hidden until triggered) */}
        {showVibey
          ? <VibeyPanel level={vibeyLevel} glitch={vibeyGlitch}/>
          : <div style={{width:200,flexShrink:0}}/>
        }
      </div>

      {/* DIALOGUE OVERLAYS */}
      {s1==="vibey_rant"   && <DialogueBox lines={S1_BAD}     onComplete={()=>setS1("cleany_hint")}/>}
      {s1==="cleany_hint"  && <DialogueBox lines={S1_CLEANY}  onComplete={()=>setS1("awaiting_good")}/>}
      {s1==="comment_dlg"  && <DialogueBox lines={S1_COMMENT} onComplete={()=>{ setS1("accepted"); sfxSuccess(); setTimeout(()=>setS1("final_dlg"),500); }}/>}
      {s1==="final_dlg"    && <DialogueBox lines={S1_FINAL}   onComplete={()=>setS1("done")}/>}

      {s2==="vibey_dlg"    && <DialogueBox lines={S2_VIBEY_DLG}  onComplete={()=>setS2("cleany_dlg")}/>}
      {s2==="cleany_dlg"   && <DialogueBox lines={S2_CLEANY_DLG} onComplete={()=>setS2("finishing")}/>}
      {s2==="final_dlg"    && <DialogueBox lines={S2_FINAL}      onComplete={()=>{}}/>}

      {s3==="vibey_app"    && <DialogueBox lines={S3_VIBEY_APP}  onComplete={()=>setS3("takeover")}/>}
      {s3==="fight"        && <DialogueBox lines={S3_FIGHT}      onComplete={()=>{}}/>}
      {s3==="final_dlg"    && <DialogueBox lines={S3_FINAL}      onComplete={()=>{}}/>}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        html,body,#root { height:100%; background:#08080f; }
        textarea { caret-color:#a78bfa; }
        textarea::selection { background:rgba(167,139,250,0.25); }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); }
        b { color:#fff; }
        @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes arrowBob  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes dlgIn     { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        @keyframes dlgShake  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-7px)} 75%{transform:translateX(7px)} }
        @keyframes dlgGlitch { 0%{transform:translate(0,0) skewX(0)} 20%{transform:translate(-5px,0) skewX(-4deg)} 40%{transform:translate(5px,0) skewX(4deg)} 60%{transform:translate(-2px,1px)} 80%{transform:translate(2px,-1px)} 100%{transform:none} }
        @keyframes dlgFlash  { 0%,100%{filter:brightness(1)} 50%{filter:brightness(5)} }
        @keyframes editorShake { 0%,100%{transform:translateX(0)} 33%{transform:translateX(-8px)} 66%{transform:translateX(8px)} }
        @keyframes bigShake  { 0%,100%{transform:translate(0,0)} 25%{transform:translate(-3px,-2px)} 75%{transform:translate(3px,2px)} }
        @keyframes vibeypulse { 0%,100%{filter:drop-shadow(0 0 6px #ff4444);transform:scale(1)} 50%{filter:drop-shadow(0 0 28px #ff2200);transform:scale(1.07)} }
        @keyframes vibeybig  { 0%{filter:drop-shadow(0 0 20px #ff4444);transform:scale(1)} 100%{filter:drop-shadow(0 0 70px #ff0000);transform:scale(1.14)} }
        @keyframes glitchChar { 0%{transform:translate(0,0) skewX(0)} 20%{transform:translate(-4px,1px) skewX(-4deg)} 40%{transform:translate(4px,-1px) skewX(4deg) scaleX(1.05)} 60%{transform:translate(-2px,0)} 80%{transform:translate(2px,1px)} 100%{transform:none} }
      `}</style>
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const p: Record<string, React.CSSProperties> = {
  root:      { height:"100vh", display:"flex", flexDirection:"column", background:"#08080f", color:"#e2e8f0", overflow:"hidden", position:"relative" },
  scanlines: { position:"fixed", inset:0, pointerEvents:"none", zIndex:999, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)" },
  redFlash:  { position:"fixed", inset:0, background:"rgba(255,0,0,0.4)", zIndex:800, pointerEvents:"none", animation:"dlgFlash 0.7s ease forwards" },
  whiteFlash:{ position:"fixed", inset:0, background:"#fff", zIndex:800, pointerEvents:"none", animation:"dlgFlash 1.2s ease forwards" },

  topBar:    { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", height:50, background:"#000", borderBottom:"2px solid rgba(255,255,255,0.12)", flexShrink:0 },
  logoTxt:   { fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:14, color:"#fff", letterSpacing:1 },
  logoBadge: { background:"#fff", color:"#000", fontFamily:"'Space Mono',monospace", fontSize:8, fontWeight:700, padding:"2px 5px", letterSpacing:1 },
  probNum:   { fontFamily:"'Space Mono',monospace", fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:1 },
  probTitle: { fontFamily:"'Space Mono',monospace", fontSize:14, fontWeight:700, color:"#fff" },
  diffBadge: { fontFamily:"'Space Mono',monospace", fontSize:9, fontWeight:700, padding:"2px 8px", letterSpacing:1, border:"1px solid" },
  pip:       { width:28, height:28, border:"2px solid", background:"none", fontFamily:"'Space Mono',monospace", fontSize:11, fontWeight:700, cursor:"pointer" },

  layout:    { display:"flex", flex:1, overflow:"hidden" },
  center:    { flex:1, display:"flex", flexDirection:"column", overflow:"hidden", borderLeft:"1px solid rgba(255,255,255,0.06)", borderRight:"1px solid rgba(255,255,255,0.06)" },

  desc:       { padding:"10px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0 },
  descTxt:    { fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#9ca3af", lineHeight:1.7, marginBottom:7 },
  ex:         { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)", padding:"5px 12px", fontFamily:"'Space Mono',monospace", fontSize:11, color:"#d1d5db", lineHeight:1.8, marginBottom:4 },
  constraint: { fontFamily:"'Space Mono',monospace", fontSize:9, color:"rgba(255,255,255,0.22)", marginTop:3, letterSpacing:0.5 },
  ic:         { background:"rgba(255,255,255,0.08)", padding:"1px 5px", fontFamily:"'Space Mono',monospace", fontSize:11 },

  editor:    { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },
  edHdr:     { display:"flex", alignItems:"center", gap:10, padding:"7px 14px", background:"rgba(0,0,0,0.5)", borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0 },
  edLang:    { fontFamily:"'Space Mono',monospace", fontSize:10, fontWeight:700, color:"#a78bfa", letterSpacing:2 },
  edFile:    { fontFamily:"'Space Mono',monospace", fontSize:10, color:"rgba(255,255,255,0.25)" },
  resetBtn:  { background:"none", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.3)", fontFamily:"'Space Mono',monospace", fontSize:9, padding:"3px 8px", cursor:"pointer", letterSpacing:1 },
  edBody:    { flex:1, display:"flex", overflow:"hidden" },
  lineNums:  { width:40, background:"rgba(0,0,0,0.35)", display:"flex", flexDirection:"column", padding:"14px 0", borderRight:"1px solid rgba(255,255,255,0.05)", flexShrink:0, overflowY:"hidden" },
  lineNum:   { fontFamily:"'Space Mono',monospace", fontSize:11, color:"rgba(255,255,255,0.18)", textAlign:"right", paddingRight:8, lineHeight:"1.7", height:"22.1px", flexShrink:0 },
  textarea:  { flex:1, background:"transparent", border:"none", outline:"none", resize:"none", fontFamily:"'Space Mono',monospace", fontSize:13, lineHeight:1.7, padding:"14px 16px", color:"#e2e8f0" },

  bottomPane:  { height:190, flexShrink:0, display:"flex", flexDirection:"column", overflow:"hidden", borderTop:"1px solid rgba(255,255,255,0.07)" },
  bottomHdr:   { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 14px", background:"rgba(0,0,0,0.5)", borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0 },
  bottomHdrTxt:{ fontFamily:"'Space Mono',monospace", fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:2 },
  bottomBody:  { flex:1, overflow:"auto", padding:"10px 14px" },
  idleTxt:     { fontFamily:"'Space Mono',monospace", fontSize:11, color:"rgba(255,255,255,0.25)", lineHeight:1.9 },
  testItem:    { border:"1px solid", padding:"8px 12px", display:"flex", flexDirection:"column", gap:4 },

  runBtn:    { background:"none", border:"2px solid #fff", color:"#fff", fontFamily:"'Space Mono',monospace", fontSize:11, fontWeight:700, padding:"7px 18px", cursor:"pointer", letterSpacing:1 },
  submitBtn: { background:"#fff", color:"#000" },
};
