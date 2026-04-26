import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Volume2, VolumeX, Play, Pause, RotateCcw,
  Sparkles, ArrowRightLeft, ArrowRight, Check, Heart, HelpCircle, Clock, MessageCircle,
} from "lucide-react";
import { AtlasLogoMark } from "@/components/AtlasLogo";
import { Button } from "@/components/ui/button";
import { AskAtlas } from "@/components/AskAtlas";

const PLAN_KEY = "atlas_transition_plan";

interface TransitionPlan {
  comingUp: string;
  usuallyHappens: string;
  wantedBehavior: string;
  phrase: string | null;
  timerMinutes: number | null;
  motivation: string;
  savedAt: string;
}

function loadPlan(): TransitionPlan | null {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const STEPS = [
  { id: 1, label: "Show the timer" },
  { id: 2, label: "Say this now" },
  { id: 3, label: "Remind them" },
  { id: 4, label: "You're doing great" },
];

export default function Help() {
  const plan = loadPlan();
  const [step, setStep] = useState(1);
  const [askOpen, setAskOpen] = useState(false);

  const [speaking, setSpeaking] = useState(false);
  const totalSeconds = (plan?.timerMinutes ?? 5) * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pct = timeLeft / totalSeconds;
  const circumference = 2 * Math.PI * 54;

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => () => window.speechSynthesis.cancel(), []);

  function toggleTimer() {
    if (timeLeft === 0) return;
    setRunning((r) => !r);
  }
  function resetTimer() {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeLeft(totalSeconds);
  }
  function speakPhrase() {
    if (!plan?.phrase) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utt = new SpeechSynthesisUtterance(plan.phrase);
    utt.rate = 0.9;
    utt.pitch = 1;
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utt);
  }

  /* ── No plan saved ── */
  if (!plan) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 text-center max-w-lg mx-auto">
        <AtlasLogoMark size={52} className="mb-6 opacity-60" />
        <h2 className="font-rajdhani text-2xl text-foreground mb-3">No plan saved yet</h2>
        <p className="text-muted-foreground text-sm mb-8">
          Build a transition plan first so Atlas knows what to help with.
        </p>
        <Link href="/prepare">
          <Button size="xl" className="shadow-md shadow-primary/15">
            <ArrowRightLeft className="w-5 h-5 mr-2" />
            Prepare a Transition
          </Button>
        </Link>
      </div>
    );
  }

  const goNext = () => setStep((s) => Math.min(4, s + 1));
  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="min-h-screen w-full pb-10 max-w-lg mx-auto relative">
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-accent/30 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-8 relative z-10">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="w-9 h-9 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
          </Link>
          <h1 className="font-rajdhani text-2xl text-foreground leading-none">
            Transition Help
          </h1>
        </div>
        <AtlasLogoMark size={30} className="opacity-60" />
      </header>

      {/* Step indicator */}
      <div className="px-6 mb-6 relative z-10">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const completed = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${completed || active ? "bg-primary" : "bg-transparent"}`}
                    style={{ width: completed ? "100%" : active ? "100%" : "0%" }}
                  />
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wide transition-colors ${active ? "text-primary" : completed ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                  Step {s.id}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="px-6 relative z-10">
        <AnimatePresence mode="wait">

          {/* STEP 1 — Timer */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Step 1</p>
              </div>
              <h2 className="font-rajdhani text-2xl text-foreground mb-5">
                Show the timer to your child
              </h2>

              <div className="flex flex-col items-center mb-6">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="54"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - pct)}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-rajdhani text-4xl text-foreground">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <Button size="lg" className="flex-1" onClick={toggleTimer} disabled={timeLeft === 0}>
                  {running ? (
                    <><Pause className="w-5 h-5 mr-2" /> Pause</>
                  ) : (
                    <><Play className="w-5 h-5 mr-2" /> {timeLeft === totalSeconds ? "Start Timer" : "Resume"}</>
                  )}
                </Button>
                <button
                  onClick={resetTimer}
                  aria-label="Reset timer"
                  className="w-12 h-12 rounded-xl border-2 border-border bg-background flex items-center justify-center hover:border-primary/40 transition"
                >
                  <RotateCcw className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <Button size="xl" variant="outline" className="w-full border-2 border-primary/30 text-primary hover:bg-primary/5" onClick={goNext}>
                Next Step <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2 — Phrase */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Step 2</p>
              </div>
              <h2 className="font-rajdhani text-2xl text-foreground mb-5">
                Say this now
              </h2>

              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 mb-6 text-center">
                <p className="font-rajdhani text-3xl text-foreground leading-snug mb-5">
                  "{plan.phrase || "—"}"
                </p>
                <button
                  onClick={speakPhrase}
                  disabled={!plan.phrase}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200
                    ${speaking
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border text-foreground hover:border-primary/50"
                    } disabled:opacity-50`}
                >
                  {speaking ? (
                    <><VolumeX className="w-5 h-5" /> Stop</>
                  ) : (
                    <><Volume2 className="w-5 h-5" /> Read aloud</>
                  )}
                </button>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={goPrev} className="flex-shrink-0">
                  Back
                </Button>
                <Button size="xl" className="flex-1 shadow-md shadow-primary/15" onClick={goNext}>
                  Next Step <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — Motivator */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Step 3</p>
              </div>
              <h2 className="font-rajdhani text-2xl text-foreground mb-5">
                Remind them about this
              </h2>

              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-foreground font-medium text-lg leading-relaxed pt-1.5">
                    {plan.motivation || "—"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={goPrev} className="flex-shrink-0">
                  Back
                </Button>
                <Button size="xl" className="flex-1 shadow-md shadow-primary/15" onClick={goNext}>
                  Next Step <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4 — You're doing great + Need more help */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="bg-card border border-border rounded-2xl p-7 shadow-sm text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-rajdhani text-3xl text-foreground leading-snug mb-3">
                  Stay consistent.<br />You are doing great.
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Transitions get easier with repetition. Trust the plan.
                </p>
              </div>

              <Link href="/" className="w-full block">
                <Button size="xl" className="w-full shadow-md shadow-primary/15">
                  <Check className="w-5 h-5 mr-2" />
                  Done
                </Button>
              </Link>

              {/* Need more help — only AI entry point on this screen */}
              <div className="pt-2">
                {!askOpen ? (
                  <button
                    onClick={() => setAskOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary border border-border rounded-2xl px-5 py-3 bg-card/60 hover:border-primary/40 transition"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Need more help?
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3 text-center">
                      Ask Atlas
                    </p>
                    <AskAtlas variant="compact" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
