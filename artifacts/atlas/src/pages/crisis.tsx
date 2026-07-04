import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Volume2, VolumeX, Check,
  BookMarked, RotateCcw, Sparkles, Loader2, Heart,
  ChevronRight, Play, Pause, Clock,
} from "lucide-react";
import { AtlasLogoMark } from "@/components/AtlasLogo";
import { Button } from "@/components/ui/button";
import { loadWhatWorks, saveWhatWorks, WhatWorksEntry } from "./what-works";

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

interface Strategy {
  id: string;
  title: string;
  description: string;
  steps: string[];
  voiceIntro: string;
}

interface CrisisResponse {
  acknowledgment: string;
  strategies: Strategy[];
}

const TRIGGER_CHIPS = [
  "Transition / change", "Sensory overload", "Routine was disrupted",
  "Tired or hungry", "Something at school", "I don't know",
];
const TRIED_CHIPS = [
  "Talking to them", "Redirecting", "Giving space", "Offering a choice",
  "Waiting it out", "Nothing yet",
];

function ChipGroup({
  chips, selected, onToggle,
}: { chips: string[]; selected: string[]; onToggle: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {chips.map((c) => {
        const on = selected.includes(c);
        return (
          <button
            key={c}
            onClick={() => onToggle(c)}
            className={`px-3.5 py-2 rounded-full text-sm font-medium transition border
              ${on
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}

function speak(text: string, onEnd?: () => void) {
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.92;
  utt.pitch = 1;
  if (onEnd) utt.onend = onEnd;
  window.speechSynthesis.speak(utt);
}

export default function Crisis() {
  const [, nav] = useLocation();
  const [step, setStep] = useState<
    "situation" | "trigger" | "tried" | "loading" | "strategies" | "coaching" | "save"
  >("situation");

  // Intake
  const [situation, setSituation] = useState("");
  const [triggerChips, setTriggerChips] = useState<string[]>([]);
  const [triggerText, setTriggerText] = useState("");
  const [triedChips, setTriedChips] = useState<string[]>([]);
  const [triedText, setTriedText] = useState("");

  // AI result
  const [acknowledgment, setAcknowledgment] = useState("");
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Coaching
  const [activeStrategy, setActiveStrategy] = useState<Strategy | null>(null);
  const [coachStep, setCoachStep] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [timerSec, setTimerSec] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save
  const [saveNotes, setSaveNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => () => window.speechSynthesis.cancel(), []);
  useEffect(() => {
    if (timerRunning && timerSec > 0) {
      timerRef.current = setInterval(() => {
        setTimerSec((t) => { if (t <= 1) { setTimerRunning(false); return 0; } return t - 1; });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  function toggleChip(list: string[], setList: (v: string[]) => void, chip: string) {
    setList(list.includes(chip) ? list.filter((c) => c !== chip) : [...list, chip]);
  }

  function combinedTrigger() {
    const parts = [...triggerChips];
    if (triggerText.trim()) parts.push(triggerText.trim());
    return parts.join(", ") || "Not sure";
  }
  function combinedTried() {
    const parts = [...triedChips];
    if (triedText.trim()) parts.push(triedText.trim());
    return parts.join(", ") || "Nothing yet";
  }

  async function fetchStrategies() {
    setStep("loading");
    setLoadError(null);
    try {
      const res = await fetch("/api/atlas/crisis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation,
          trigger: combinedTrigger(),
          tried: combinedTried(),
        }),
      });
      if (!res.ok) throw new Error("request failed");
      const data: CrisisResponse = await res.json();
      setAcknowledgment(data.acknowledgment ?? "");
      setStrategies(data.strategies ?? []);
      setStep("strategies");
    } catch {
      setLoadError("Atlas couldn't respond right now. Try again in a moment.");
      setStep("tried");
    }
  }

  function startCoaching(strategy: Strategy) {
    window.speechSynthesis.cancel();
    setActiveStrategy(strategy);
    setCoachStep(0);
    setTimerSec(120);
    setTimerRunning(false);
    setStep("coaching");
    setTimeout(() => speak(strategy.voiceIntro), 300);
  }

  function speakCurrentStep() {
    if (!activeStrategy) return;
    const text = activeStrategy.steps[coachStep];
    setSpeaking(true);
    speak(text, () => setSpeaking(false));
  }
  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  function formatTime(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function handleSaveWhatWorked() {
    if (!activeStrategy) return;
    const entries = loadWhatWorks();
    const newEntry: WhatWorksEntry = {
      id: generateId(),
      situation,
      strategyTitle: activeStrategy.title,
      steps: activeStrategy.steps,
      savedAt: new Date().toISOString(),
      notes: saveNotes.trim() || undefined,
    };
    saveWhatWorks([...entries, newEntry]);
    setSaved(true);
    setTimeout(() => nav("/what-works"), 900);
  }

  const STEP_CONFIGS = {
    situation: { num: 1, label: "What's happening" },
    trigger: { num: 2, label: "What triggered it" },
    tried: { num: 3, label: "What you've tried" },
    loading: { num: 4, label: "Atlas is thinking" },
    strategies: { num: 4, label: "Strategies" },
    coaching: { num: 5, label: "Coaching" },
    save: { num: 6, label: "Save what helped" },
  };
  const stepNums = ["situation", "trigger", "tried", "strategies", "coaching"];
  const currentStepNum = STEP_CONFIGS[step]?.num ?? 1;

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto pb-12 relative">
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-primary/12 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-8 relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              window.speechSynthesis.cancel();
              if (step === "situation") nav("/");
              else if (step === "trigger") setStep("situation");
              else if (step === "tried") setStep("trigger");
              else if (step === "strategies") setStep("tried");
              else if (step === "coaching") setStep("strategies");
              else if (step === "save") setStep("coaching");
              else nav("/");
            }}
            className="w-9 h-9 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="font-rajdhani text-2xl text-foreground leading-none">Crisis Help</h1>
            <p className="text-muted-foreground text-xs mt-0.5">Atlas is with you</p>
          </div>
        </div>
        <AtlasLogoMark size={30} className="opacity-60" />
      </header>

      {/* Progress bar (intake steps only) */}
      {["situation", "trigger", "tried"].includes(step) && (
        <div className="px-6 mb-6 relative z-10">
          <div className="flex gap-2">
            {["situation", "trigger", "tried"].map((s, i) => {
              const idx = ["situation", "trigger", "tried"].indexOf(step);
              return (
                <div key={s} className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full bg-primary transition-all duration-500 ${i <= idx ? "w-full" : "w-0"}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-6 relative z-10">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Situation ── */}
          {step === "situation" && (
            <motion.div key="situation" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-5">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Step 1 of 3</p>
                <h2 className="font-rajdhani text-2xl text-foreground mb-1">Tell me what's happening</h2>
                <p className="text-muted-foreground text-sm mb-5">A few words is enough — just describe what you're seeing right now.</p>
                <textarea
                  autoFocus
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="e.g. She's screaming and won't get in the car…"
                  rows={4}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
              <Button
                size="xl"
                className="w-full shadow-md shadow-primary/15"
                disabled={!situation.trim()}
                onClick={() => setStep("trigger")}
              >
                Next <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* ── STEP 2: Trigger ── */}
          {step === "trigger" && (
            <motion.div key="trigger" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-5">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Step 2 of 3</p>
                <h2 className="font-rajdhani text-2xl text-foreground mb-1">What might have triggered it?</h2>
                <p className="text-muted-foreground text-sm mb-4">Tap all that apply, or type your own.</p>
                <ChipGroup
                  chips={TRIGGER_CHIPS}
                  selected={triggerChips}
                  onToggle={(c) => toggleChip(triggerChips, setTriggerChips, c)}
                />
                <textarea
                  value={triggerText}
                  onChange={(e) => setTriggerText(e.target.value)}
                  placeholder="Anything else? (optional)"
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none mt-2"
                />
              </div>
              <Button size="xl" className="w-full shadow-md shadow-primary/15" onClick={() => setStep("tried")}>
                Next <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* ── STEP 3: Tried ── */}
          {step === "tried" && (
            <motion.div key="tried" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-5">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Step 3 of 3</p>
                <h2 className="font-rajdhani text-2xl text-foreground mb-1">What have you already tried?</h2>
                <p className="text-muted-foreground text-sm mb-4">So Atlas doesn't suggest something that didn't work.</p>
                <ChipGroup
                  chips={TRIED_CHIPS}
                  selected={triedChips}
                  onToggle={(c) => toggleChip(triedChips, setTriedChips, c)}
                />
                <textarea
                  value={triedText}
                  onChange={(e) => setTriedText(e.target.value)}
                  placeholder="Anything else? (optional)"
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none mt-2"
                />
                {loadError && <p className="text-xs text-red-500 mt-3 text-center">{loadError}</p>}
              </div>
              <Button size="xl" className="w-full shadow-md shadow-primary/15" onClick={fetchStrategies}>
                <Sparkles className="w-5 h-5 mr-2" />
                Get Strategies
              </Button>
            </motion.div>
          )}

          {/* ── LOADING ── */}
          {step === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center pt-20 gap-6"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <div>
                <h2 className="font-rajdhani text-2xl text-foreground mb-1">Atlas is thinking…</h2>
                <p className="text-muted-foreground text-sm">Finding strategies just for this moment</p>
              </div>
            </motion.div>
          )}

          {/* ── STRATEGIES ── */}
          {step === "strategies" && (
            <motion.div key="strategies" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Acknowledgment */}
              {acknowledgment && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/8 border border-primary/20 rounded-2xl px-5 py-4 mb-5 flex gap-3 items-start"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-foreground text-sm leading-relaxed pt-1">{acknowledgment}</p>
                </motion.div>
              )}

              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Try one of these now</p>

              <div className="space-y-4">
                {strategies.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card border border-border rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-bold">{i + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-rajdhani text-xl text-foreground">{s.title}</h3>
                        <p className="text-muted-foreground text-sm mt-0.5">{s.description}</p>
                      </div>
                    </div>
                    <ol className="space-y-1.5 mb-4 ml-11">
                      {s.steps.map((step, si) => (
                        <li key={si} className="text-sm text-foreground flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-secondary text-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{si + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                    <Button size="lg" className="w-full" onClick={() => startCoaching(s)}>
                      <Play className="w-4 h-4 mr-2" />
                      Coach me through this
                    </Button>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setStep("tried")}
                  className="text-sm text-muted-foreground hover:text-primary transition"
                >
                  ← Back and try different answers
                </button>
              </div>
            </motion.div>
          )}

          {/* ── COACHING ── */}
          {step === "coaching" && activeStrategy && (
            <motion.div key="coaching" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Strategy name */}
              <div className="bg-primary/8 border border-primary/20 rounded-2xl px-5 py-4 mb-5">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-0.5">Now trying</p>
                <p className="font-rajdhani text-2xl text-foreground">{activeStrategy.title}</p>
              </div>

              {/* Timer */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">2-Minute Timer</span>
                  </div>
                  <span className="font-rajdhani text-3xl text-foreground">{formatTime(timerSec)}</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-primary transition-all duration-1000 rounded-full"
                    style={{ width: `${(timerSec / 120) * 100}%` }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimerRunning((r) => !r)}
                    disabled={timerSec === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary transition disabled:opacity-40"
                  >
                    {timerRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> {timerSec === 120 ? "Start" : "Resume"}</>}
                  </button>
                  <button
                    onClick={() => { setTimerSec(120); setTimerRunning(false); }}
                    className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition"
                  >
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Step-by-step coaching */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Step {coachStep + 1} of {activeStrategy.steps.length}
                  </p>
                  <button
                    onClick={() => { speaking ? stopSpeaking() : speakCurrentStep(); setSpeaking(!speaking); }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition
                      ${speaking ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                  >
                    {speaking ? <><VolumeX className="w-3.5 h-3.5" /> Stop</> : <><Volume2 className="w-3.5 h-3.5" /> Read aloud</>}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={coachStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-foreground text-xl font-medium leading-snug mb-5"
                  >
                    {activeStrategy.steps[coachStep]}
                  </motion.p>
                </AnimatePresence>

                {/* Step dots */}
                <div className="flex gap-2 mb-5">
                  {activeStrategy.steps.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setCoachStep(i)}
                      className={`h-2 rounded-full cursor-pointer transition-all ${i === coachStep ? "bg-primary flex-[2]" : i < coachStep ? "bg-primary/40 flex-1" : "bg-border flex-1"}`}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  {coachStep > 0 && (
                    <button
                      onClick={() => { stopSpeaking(); setCoachStep((s) => s - 1); }}
                      className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition"
                    >
                      ← Back
                    </button>
                  )}
                  {coachStep < activeStrategy.steps.length - 1 ? (
                    <button
                      onClick={() => { stopSpeaking(); setCoachStep((s) => s + 1); }}
                      className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:opacity-90 transition"
                    >
                      Next step →
                    </button>
                  ) : (
                    <div className="flex-1 flex flex-col gap-2">
                      <button
                        onClick={() => { stopSpeaking(); setStep("save"); }}
                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:opacity-90 transition"
                      >
                        <Check className="w-4 h-4 inline mr-1.5" />This helped!
                      </button>
                      <button
                        onClick={() => { stopSpeaking(); setStep("strategies"); }}
                        className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition"
                      >
                        Try a different strategy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SAVE WHAT WORKED ── */}
          {step === "save" && activeStrategy && (
            <motion.div key="save" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-rajdhani text-3xl text-foreground mb-1">You got through it.</h2>
                <p className="text-muted-foreground text-sm">That took real strength.</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-5">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Save to your playbook</p>
                <div className="bg-secondary/60 rounded-xl px-4 py-3 mb-4">
                  <p className="text-xs text-muted-foreground mb-0.5">When this happened:</p>
                  <p className="text-sm text-foreground font-medium">{situation}</p>
                </div>
                <div className="bg-secondary/60 rounded-xl px-4 py-3 mb-4">
                  <p className="text-xs text-muted-foreground mb-0.5">What helped:</p>
                  <p className="text-sm text-foreground font-semibold">{activeStrategy.title}</p>
                </div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Anything to remember? (optional)
                </label>
                <textarea
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  placeholder="e.g. Works best when I stay calm and give it a full minute…"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              <div className="space-y-3">
                <Button
                  size="xl"
                  className="w-full shadow-md shadow-primary/15"
                  onClick={handleSaveWhatWorked}
                  disabled={saved}
                >
                  {saved ? (
                    <><Check className="w-5 h-5 mr-2" /> Saved to playbook!</>
                  ) : (
                    <><BookMarked className="w-5 h-5 mr-2" /> Save to my playbook</>
                  )}
                </Button>
                <Link href="/" className="block">
                  <button className="w-full py-3.5 rounded-2xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition">
                    Done — back to home
                  </button>
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
