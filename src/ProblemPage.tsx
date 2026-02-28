import { useState, useEffect, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Intervention {
  type: "angel" | "demon";
  character: string;
  portrait: string;
  message: string;
  codeModification?: (code: string) => string;
}

// ---------------------------------------------------------------------------
// Web Audio
// ---------------------------------------------------------------------------
function createCtx(): AudioContext {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
}
function playBlip(ctx: AudioContext, pitch = 480, vol = 0.05) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  osc.type = "square";
  osc.frequency.value = pitch;
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
  osc.start(); osc.stop(ctx.currentTime + 0.07);
}
function playAccept(ctx: AudioContext) {
  [440, 554, 659].forEach((f, i) => {
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = "triangle"; osc.frequency.value = f;
    const t = ctx.currentTime + i * 0.08;
    g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t); osc.stop(t + 0.22);
  });
}
function playEvil(ctx: AudioContext) {
  [220, 185, 155].forEach((f, i) => {
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = "sawtooth"; osc.frequency.value = f;
    const t = ctx.currentTime + i * 0.1;
    g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.start(t); osc.stop(t + 0.28);
  });
}
function playSuccess(ctx: AudioContext) {
  [523, 659, 784, 1047].forEach((f, i) => {
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = "triangle"; osc.frequency.value = f;
    const t = ctx.currentTime + i * 0.12;
    g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.start(t); osc.stop(t + 0.35);
  });
}

// ---------------------------------------------------------------------------
// Problem data
// ---------------------------------------------------------------------------
const TWO_SUM_DESCRIPTION = [
  "* ...",
  "* heya.",
  "* i'm sans. sans the skeleton.",
  "* you look like you need a coding problem.",
  "* don't worry. it's an easy one.",
  "* well. easy for some people.",
  "* Given an array of integers 'nums' and an integer 'target',",
  "* return indices of the two numbers that add up to target.",
  "* You may assume each input has exactly one solution.",
  "* and you can't use the same element twice.",
  "* pretty straightforward.",
  "* unless you make it weird.",
  "* which you probably will.",
  "* ...good luck.",
];

const STARTER_CODE = `function twoSum(nums: number[], target: number): number[] {
  // your code here
  return [];
}`;

const TEST_CASES = [
  { input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", nums: [2,7,11,15], target: 9 },
  { input: "nums = [3,2,4], target = 6", expected: "[1,2]", nums: [3,2,4], target: 6 },
  { input: "nums = [3,3], target = 6", expected: "[0,1]", nums: [3,3], target: 6 },
];

// ---------------------------------------------------------------------------
// Intervention engine
// ---------------------------------------------------------------------------
const ANGEL_INTERVENTIONS: Intervention[] = [
  {
    type: "angel", character: "CLEANY", portrait: "😇",
    message: "* hey! you should use a hash map for O(n) time. trust me on this one.",
    codeModification: (code) => code.includes("Map") ? code :
      code.replace("// your code here", "// hint: const map = new Map<number, number>();"),
  },
  {
    type: "angel", character: "CLEANY", portrait: "😇",
    message: "* psst. loop once. for each num, check if (target - num) is already in your map.",
  },
  {
    type: "angel", character: "CLEANY", portrait: "😇",
    message: "* don't forget to return early once you find the answer! no need to keep going.",
  },
];

const DEMON_INTERVENTIONS: Intervention[] = [
  {
    type: "demon", character: "VIBEY", portrait: "😈",
    message: "* heheheh... why use a Map when O(n²) works just fine? nested loops are so cozy.",
    codeModification: (code) => code.replace("return [];", "// just use two nested for loops lol\n  return [];"),
  },
  {
    type: "demon", character: "VIBEY", portrait: "😈",
    message: "* pssst... the answer is indices 1 and 2. definitely. i'm totally sure about that.",
  },
  {
    type: "demon", character: "VIBEY", portrait: "😈",
    message: "* hey what if you start your loop at index 1 instead of 0? saves time. probably.",
    codeModification: (code) => code.replace("// your code here", "for (let i = 1; i < nums.length; i++) { // definitely start at 1"),
  },
];

// ---------------------------------------------------------------------------
// Mock code execution
// ---------------------------------------------------------------------------
function runCode(code: string, nums: number[], target: number): number[] | string {
  try {
    const fn = new Function("nums", "target", code.replace(/^function twoSum.*?\{/, "").replace(/\}$/, "")) as (n: number[], t: number) => number[];
    // Actually eval the full function
    const fullFn = new Function(`
      ${code}
      return twoSum(arguments[0], arguments[1]);
    `);
    const result = fullFn(nums, target);
    return result;
  } catch (e) {
    return String(e);
  }
}

function checkResult(result: number[] | string, expected: string): boolean {
  if (typeof result === "string") return false;
  const exp = JSON.parse(expected);
  return JSON.stringify(result.sort()) === JSON.stringify(exp.sort());
}

// ---------------------------------------------------------------------------
// DialogueBox component
// ---------------------------------------------------------------------------
function DialogueBox({
  portrait, name, message, onClose, audioCtx, isAngel
}: {
  portrait: string; name: string; message: string;
  onClose: () => void; audioCtx: AudioContext | null; isAngel: boolean;
}) {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const pitches = isAngel ? [560, 600, 540, 580] : [280, 260, 300, 270];

  useEffect(() => {
    setText(""); setIdx(0); setDone(false);
  }, [message]);

  useEffect(() => {
    if (idx < message.length) {
      const t = setTimeout(() => {
        setText(message.slice(0, idx + 1));
        setIdx(i => i + 1);
        if (message[idx] !== " " && audioCtx) {
          playBlip(audioCtx, pitches[idx % pitches.length], 0.04);
        }
      }, 32);
      return () => clearTimeout(t);
    } else {
      setDone(true);
    }
  }, [idx, message, audioCtx]);

  const borderColor = isAngel ? "#a78bfa" : "#f87171";
  const nameColor = isAngel ? "#c4b5fd" : "#fca5a5";

  return (
    <div style={{ ...db.wrapper, borderColor }} onClick={() => {
      if (!done) { setText(message); setIdx(message.length); setDone(true); }
      else onClose();
    }}>
      <div style={db.portrait}>{portrait}</div>
      <div style={db.content}>
        <div style={{ ...db.name, color: nameColor }}>{name}</div>
        <div style={db.text}>{text}<span style={done ? db.arrow : db.arrowHidden}>▼</span></div>
      </div>
    </div>
  );
}

const db: Record<string, React.CSSProperties> = {
  wrapper: { display:"flex", gap:16, alignItems:"flex-start", background:"#000", border:"3px solid", padding:"16px 20px", cursor:"pointer", animation:"dlgIn 0.3s ease both" },
  portrait: { fontSize:44, lineHeight:1, minWidth:54, textAlign:"center" },
  content: { flex:1 },
  name: { fontFamily:"'Space Mono', monospace", fontSize:10, fontWeight:700, letterSpacing:2, marginBottom:6, textTransform:"uppercase" },
  text: { fontFamily:"'Space Mono', monospace", fontSize:14, color:"#fff", lineHeight:1.75, minHeight:44 },
  arrow: { display:"inline-block", marginLeft:6, animation:"arrowBob 0.7s ease-in-out infinite" },
  arrowHidden: { opacity:0, marginLeft:6 },
};

// ---------------------------------------------------------------------------
// SansNarrator — left sidebar dialogue
// ---------------------------------------------------------------------------
function SansNarrator({ audioCtx }: { audioCtx: AudioContext | null }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [text, setText] = useState("");
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);
  const pitches = [420, 440, 400, 430, 410];

  useEffect(() => {
    setText(""); setCharIdx(0); setDone(false);
  }, [lineIdx]);

  useEffect(() => {
    const line = TWO_SUM_DESCRIPTION[lineIdx];
    if (charIdx < line.length) {
      const t = setTimeout(() => {
        setText(line.slice(0, charIdx + 1));
        setCharIdx(i => i + 1);
        if (line[charIdx] !== " " && audioCtx) {
          playBlip(audioCtx, pitches[charIdx % pitches.length], 0.03);
        }
      }, 36);
      return () => clearTimeout(t);
    } else setDone(true);
  }, [charIdx, lineIdx, audioCtx]);

  const advance = () => {
    if (!done) { setText(TWO_SUM_DESCRIPTION[lineIdx]); setCharIdx(TWO_SUM_DESCRIPTION[lineIdx].length); setDone(true); }
    else if (lineIdx < TWO_SUM_DESCRIPTION.length - 1) setLineIdx(i => i + 1);
  };

  const showConstraints = lineIdx >= 7;

  return (
    <div style={sn.root}>
      {/* Character portrait area */}
      <div style={sn.portraitArea}>
        <div style={sn.skeletonPortrait}>💀</div>
        <div style={sn.charName}>SANS</div>
      </div>

      {/* Dialogue box */}
      <div style={sn.dlgBox} onClick={advance}>
        <div style={sn.dlgText}>{text}<span style={done ? sn.arrow : sn.arrowHidden}>▼</span></div>
      </div>

      {/* Problem details (revealed progressively) */}
      {showConstraints && (
        <div style={sn.details}>
          <div style={sn.detailsTitle}>PROBLEM DETAILS</div>
          <div style={sn.detailBlock}>
            <span style={sn.label}>DIFFICULTY</span>
            <span style={sn.easyBadge}>EASY</span>
          </div>
          <div style={sn.detailBlock}>
            <span style={sn.label}>CONSTRAINTS</span>
            <div style={sn.constraints}>
              <div style={sn.cRow}>2 ≤ nums.length ≤ 10⁴</div>
              <div style={sn.cRow}>-10⁹ ≤ nums[i] ≤ 10⁹</div>
              <div style={sn.cRow}>-10⁹ ≤ target ≤ 10⁹</div>
              <div style={sn.cRow}>Only one valid answer exists</div>
            </div>
          </div>
          <div style={sn.detailBlock}>
            <span style={sn.label}>EXAMPLES</span>
            <div style={sn.exampleBox}>
              <div style={sn.exLine}><span style={sn.exKey}>Input:</span> nums = [2,7,11,15], target = 9</div>
              <div style={sn.exLine}><span style={sn.exKey}>Output:</span> [0,1]</div>
              <div style={sn.exLine}><span style={sn.exKey}>Why:</span> nums[0] + nums[1] = 9</div>
            </div>
            <div style={{ ...sn.exampleBox, marginTop: 10 }}>
              <div style={sn.exLine}><span style={sn.exKey}>Input:</span> nums = [3,2,4], target = 6</div>
              <div style={sn.exLine}><span style={sn.exKey}>Output:</span> [1,2]</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const sn: Record<string, React.CSSProperties> = {
  root: { display:"flex", flexDirection:"column", gap:16, height:"100%", overflow:"auto" },
  portraitArea: { display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 0 8px" },
  skeletonPortrait: { fontSize:72, lineHeight:1, filter:"drop-shadow(0 0 12px rgba(255,255,255,0.3))", animation:"float 3s ease-in-out infinite" },
  charName: { fontFamily:"'Space Mono', monospace", fontSize:11, fontWeight:700, color:"#fff", letterSpacing:3, marginTop:8 },
  dlgBox: { background:"#000", border:"3px solid #fff", padding:"14px 16px", cursor:"pointer", flexShrink:0 },
  dlgText: { fontFamily:"'Space Mono', monospace", fontSize:13, color:"#fff", lineHeight:1.75, minHeight:52 },
  arrow: { display:"inline-block", marginLeft:4, animation:"arrowBob 0.7s ease-in-out infinite" },
  arrowHidden: { opacity:0, marginLeft:4 },
  details: { background:"rgba(0,0,0,0.6)", border:"1px solid rgba(255,255,255,0.1)", padding:"16px", display:"flex", flexDirection:"column", gap:14 },
  detailsTitle: { fontFamily:"'Space Mono', monospace", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:3 },
  detailBlock: { display:"flex", flexDirection:"column", gap:6 },
  label: { fontFamily:"'Space Mono', monospace", fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:2 },
  easyBadge: { display:"inline-block", background:"#065f46", color:"#6ee7b7", border:"1px solid #6ee7b7", fontFamily:"'Space Mono', monospace", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:0, width:"fit-content" },
  constraints: { display:"flex", flexDirection:"column", gap:3 },
  cRow: { fontFamily:"'Space Mono', monospace", fontSize:12, color:"#d1d5db" },
  exampleBox: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", padding:"10px 12px" },
  exLine: { fontFamily:"'Space Mono', monospace", fontSize:12, color:"#d1d5db", lineHeight:1.8 },
  exKey: { color:"#7dd3fc", fontWeight:700, marginRight:6 },
};

// ---------------------------------------------------------------------------
// Main ProblemPage
// ---------------------------------------------------------------------------
export default function ProblemPage() {
  const [code, setCode] = useState(STARTER_CODE);
  const [testResults, setTestResults] = useState<{ passed: boolean; output: string; expected: string }[] | null>(null);
  const [running, setRunning] = useState(false);
  const [allPassed, setAllPassed] = useState(false);

  // Intervention state
  const [activeIntervention, setActiveIntervention] = useState<Intervention | null>(null);
  const interventionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = createCtx();
    return audioCtxRef.current;
  }, []);
  const ensureCtx = () => { const c = getCtx(); if (c.state === "suspended") c.resume(); return c; };

  // Schedule interventions
  const scheduleIntervention = useCallback(() => {
    const delay = 10000 + Math.random() * 8000; // 10–18 sec
    interventionTimer.current = setTimeout(() => {
      const isAngel = Math.random() > 0.5;
      const pool = isAngel ? ANGEL_INTERVENTIONS : DEMON_INTERVENTIONS;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setActiveIntervention(pick);
      const ctx = getCtx();
      if (ctx.state !== "closed") {
        if (isAngel) playAccept(ctx);
        else playEvil(ctx);
      }
    }, delay);
  }, [getCtx]);

  useEffect(() => {
    scheduleIntervention();
    return () => { if (interventionTimer.current) clearTimeout(interventionTimer.current); };
  }, [scheduleIntervention]);

  const dismissIntervention = () => {
    if (activeIntervention?.codeModification) {
      setCode(c => activeIntervention.codeModification!(c));
    }
    setActiveIntervention(null);
    scheduleIntervention();
  };

  const runTests = () => {
    setRunning(true);
    ensureCtx();
    setTimeout(() => {
      const results = TEST_CASES.map(tc => {
        const result = runCode(code, tc.nums, tc.target);
        const passed = checkResult(result, tc.expected);
        return {
          passed,
          output: typeof result === "string" ? result : JSON.stringify(result),
          expected: tc.expected,
        };
      });
      setTestResults(results);
      const passed = results.every(r => r.passed);
      setAllPassed(passed);
      const ctx = getCtx();
      if (passed) playSuccess(ctx);
      else playEvil(ctx);
      setRunning(false);
    }, 800);
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%", height: "100%", background: "transparent", border: "none",
    outline: "none", resize: "none", color: "#e2e8f0",
    fontFamily: "'Space Mono', monospace", fontSize: 13, lineHeight: 1.7,
    padding: "16px",
  };

  return (
    <div style={p.root}>
      {/* Scanline overlay */}
      <div style={p.scanlines} />

      {/* Top bar */}
      <div style={p.topBar}>
        <div style={p.topLogo}>
          <span style={p.topLogoText}>⚡ SHEETCODE</span>
          <span style={p.topLogoBadge}>AI</span>
        </div>
        <div style={p.topMeta}>
          <span style={p.problemNum}># 001</span>
          <span style={p.problemTitle}>Two Sum</span>
          <span style={p.diffBadge}>EASY</span>
        </div>
        <div style={p.topActions}>
          <button style={p.runBtn} onClick={runTests} disabled={running}>
            {running ? "RUNNING..." : "▶ RUN TESTS"}
          </button>
          <button style={{ ...p.runBtn, ...p.submitBtn }}>SUBMIT</button>
        </div>
      </div>

      {/* Main layout */}
      <div style={p.layout}>
        {/* LEFT: Problem description */}
        <div style={p.sidebar}>
          <SansNarrator audioCtx={audioCtxRef.current} />
        </div>

        {/* RIGHT: editor + tests */}
        <div style={p.rightPane}>
          {/* Code editor */}
          <div style={p.editorPane}>
            <div style={p.editorHeader}>
              <span style={p.editorLang}>TYPESCRIPT</span>
              <span style={p.editorFile}>solution.ts</span>
              <button style={p.resetBtn} onClick={() => setCode(STARTER_CODE)}>RESET</button>
            </div>
            <div style={p.lineNumbers}>
              {code.split("\n").map((_, i) => (
                <div key={i} style={p.lineNum}>{i + 1}</div>
              ))}
            </div>
            <textarea
              style={textareaStyle}
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              onClick={() => { const c = getCtx(); if (c.state === "suspended") c.resume(); }}
            />
          </div>

          {/* Test results */}
          <div style={p.testPane}>
            <div style={p.testHeader}>
              <span style={p.testHeaderText}>TEST CASES</span>
              {testResults && (
                <span style={{ ...p.testHeaderText, color: allPassed ? "#6ee7b7" : "#fca5a5" }}>
                  {allPassed ? "✓ ALL PASSED" : `✗ ${testResults.filter(r => !r.passed).length} FAILED`}
                </span>
              )}
            </div>
            <div style={p.testBody}>
              {!testResults ? (
                <div style={p.testIdle}>
                  <div style={p.testIdleText}>* run your code to see results.</div>
                  <div style={p.testIdleText}>* or don't. i'm not your dad.</div>
                </div>
              ) : (
                <div style={p.testList}>
                  {testResults.map((r, i) => (
                    <div key={i} style={{ ...p.testItem, borderColor: r.passed ? "#065f46" : "#7f1d1d", background: r.passed ? "rgba(6,95,70,0.15)" : "rgba(127,29,29,0.15)" }}>
                      <div style={p.testItemHeader}>
                        <span style={{ ...p.testStatus, color: r.passed ? "#6ee7b7" : "#fca5a5" }}>
                          {r.passed ? "✓" : "✗"} Case {i + 1}
                        </span>
                        <span style={p.testInput}>{TEST_CASES[i].input}</span>
                      </div>
                      <div style={p.testRow}>
                        <span style={p.testKey}>Expected:</span>
                        <span style={p.testVal}>{r.expected}</span>
                      </div>
                      <div style={p.testRow}>
                        <span style={p.testKey}>Got:</span>
                        <span style={{ ...p.testVal, color: r.passed ? "#6ee7b7" : "#fca5a5" }}>{r.output}</span>
                      </div>
                    </div>
                  ))}
                  {allPassed && (
                    <div style={p.successMsg}>
                      <div style={p.successText}>* wow. you actually did it.</div>
                      <div style={p.successText}>* don't let it go to your head.</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Intervention dialogue */}
      {activeIntervention && (
        <div style={p.interventionOverlay}>
          <DialogueBox
            portrait={activeIntervention.portrait}
            name={activeIntervention.character}
            message={activeIntervention.message}
            onClose={dismissIntervention}
            audioCtx={audioCtxRef.current}
            isAngel={activeIntervention.type === "angel"}
          />
          {activeIntervention.codeModification && (
            <div style={p.interventionActions}>
              <button style={p.acceptBtn} onClick={dismissIntervention}>ACCEPT CHANGE</button>
              <button style={p.declineBtn} onClick={() => { setActiveIntervention(null); scheduleIntervention(); }}>IGNORE</button>
            </div>
          )}
          {!activeIntervention.codeModification && (
            <div style={p.interventionActions}>
              <button style={p.declineBtn} onClick={() => { setActiveIntervention(null); scheduleIntervention(); }}>OK</button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; background: #080810; }
        textarea { caret-color: #a78bfa; }
        textarea::selection { background: rgba(167,139,250,0.3); }
        ::-webkit-scrollbar { width: 6px; background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        @keyframes dlgIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes arrowBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes scanMove { from{transform:translateY(0)} to{transform:translateY(4px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const p: Record<string, React.CSSProperties> = {
  root: { height:"100vh", display:"flex", flexDirection:"column", background:"#080810", color:"#e2e8f0", overflow:"hidden", position:"relative" },

  scanlines: {
    position:"fixed", inset:0, pointerEvents:"none", zIndex:1000,
    backgroundImage:"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
    backgroundSize:"100% 4px",
  },

  topBar: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", height:52, background:"#000", borderBottom:"2px solid #fff", flexShrink:0, zIndex:10 },
  topLogo: { display:"flex", alignItems:"center", gap:8 },
  topLogoText: { fontFamily:"'Space Mono', monospace", fontWeight:700, fontSize:15, color:"#fff", letterSpacing:1 },
  topLogoBadge: { background:"#fff", color:"#000", fontSize:9, fontWeight:700, padding:"2px 6px", letterSpacing:1 },
  topMeta: { display:"flex", alignItems:"center", gap:12 },
  problemNum: { fontFamily:"'Space Mono', monospace", fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:1 },
  problemTitle: { fontFamily:"'Space Mono', monospace", fontSize:14, fontWeight:700, color:"#fff" },
  diffBadge: { background:"#065f46", color:"#6ee7b7", border:"1px solid #6ee7b7", fontFamily:"'Space Mono', monospace", fontSize:9, fontWeight:700, padding:"2px 8px", letterSpacing:1 },
  topActions: { display:"flex", gap:10 },
  runBtn: { background:"none", border:"2px solid #fff", color:"#fff", fontFamily:"'Space Mono', monospace", fontSize:11, fontWeight:700, padding:"6px 16px", cursor:"pointer", letterSpacing:1, transition:"background 0.15s, color 0.15s" },
  submitBtn: { background:"#fff", color:"#000" },

  layout: { display:"flex", flex:1, overflow:"hidden" },

  // Left sidebar
  sidebar: { width:380, flexShrink:0, borderRight:"2px solid rgba(255,255,255,0.15)", background:"#050508", overflowY:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:0 },

  // Right pane
  rightPane: { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },

  // Editor
  editorPane: { flex:"0 0 60%", display:"flex", flexDirection:"column", borderBottom:"2px solid rgba(255,255,255,0.1)", overflow:"hidden", position:"relative" },
  editorHeader: { display:"flex", alignItems:"center", gap:12, padding:"8px 16px", background:"rgba(0,0,0,0.5)", borderBottom:"1px solid rgba(255,255,255,0.08)", flexShrink:0 },
  editorLang: { fontFamily:"'Space Mono', monospace", fontSize:10, fontWeight:700, color:"#a78bfa", letterSpacing:2 },
  editorFile: { fontFamily:"'Space Mono', monospace", fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:0.5 },
  resetBtn: { marginLeft:"auto", background:"none", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.4)", fontFamily:"'Space Mono', monospace", fontSize:9, padding:"3px 10px", cursor:"pointer", letterSpacing:1 },
  lineNumbers: { position:"absolute", left:0, top:40, bottom:0, width:40, background:"rgba(0,0,0,0.3)", display:"flex", flexDirection:"column", paddingTop:16, borderRight:"1px solid rgba(255,255,255,0.05)", overflowY:"hidden", zIndex:1 },
  lineNum: { fontFamily:"'Space Mono', monospace", fontSize:11, color:"rgba(255,255,255,0.2)", textAlign:"right", paddingRight:10, lineHeight:"1.7", height:"22.1px", flexShrink:0 },

  // Test pane
  testPane: { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },
  testHeader: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 16px", background:"rgba(0,0,0,0.5)", borderBottom:"1px solid rgba(255,255,255,0.08)", flexShrink:0 },
  testHeaderText: { fontFamily:"'Space Mono', monospace", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:2 },
  testBody: { flex:1, overflow:"auto", padding:"16px" },
  testIdle: { display:"flex", flexDirection:"column", gap:6 },
  testIdleText: { fontFamily:"'Space Mono', monospace", fontSize:12, color:"rgba(255,255,255,0.3)", lineHeight:1.8 },
  testList: { display:"flex", flexDirection:"column", gap:10 },
  testItem: { border:"1px solid", padding:"12px 14px", display:"flex", flexDirection:"column", gap:6 },
  testItemHeader: { display:"flex", alignItems:"center", gap:12 },
  testStatus: { fontFamily:"'Space Mono', monospace", fontSize:12, fontWeight:700 },
  testInput: { fontFamily:"'Space Mono', monospace", fontSize:10, color:"rgba(255,255,255,0.4)" },
  testRow: { display:"flex", gap:10, alignItems:"baseline" },
  testKey: { fontFamily:"'Space Mono', monospace", fontSize:10, color:"rgba(255,255,255,0.35)", width:72, flexShrink:0 },
  testVal: { fontFamily:"'Space Mono', monospace", fontSize:12, color:"#e2e8f0" },
  successMsg: { background:"rgba(6,95,70,0.2)", border:"2px solid #6ee7b7", padding:"16px", display:"flex", flexDirection:"column", gap:4 },
  successText: { fontFamily:"'Space Mono', monospace", fontSize:13, color:"#6ee7b7", lineHeight:1.8 },

  // Intervention overlay
  interventionOverlay: { position:"fixed", bottom:24, right:24, width:"min(520px, 90vw)", zIndex:500, display:"flex", flexDirection:"column", gap:8 },
  interventionActions: { display:"flex", gap:8, justifyContent:"flex-end" },
  acceptBtn: { background:"rgba(167,139,250,0.15)", border:"2px solid #a78bfa", color:"#c4b5fd", fontFamily:"'Space Mono', monospace", fontSize:10, fontWeight:700, padding:"7px 16px", cursor:"pointer", letterSpacing:1 },
  declineBtn: { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.5)", fontFamily:"'Space Mono', monospace", fontSize:10, padding:"7px 14px", cursor:"pointer", letterSpacing:1 },
};
