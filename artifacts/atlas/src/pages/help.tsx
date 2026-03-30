import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles, ArrowRightLeft } from "lucide-react";
import { AtlasLogoMark } from "@/components/AtlasLogo";
import { Button } from "@/components/ui/button";

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

export default function Help() {
  const plan = loadPlan();

  // TTS state
  const [speaking, setSpeaking] = useState(false);

  // Timer state
  const totalSeconds = (plan?.timerMinutes ?? 5) * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pct = timeLeft / totalSeconds;

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

  // Cleanup TTS on unmount
  useEffect(() => () => window.speechSynthesis.cancel(), []);

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

  const circumference = 2 * Math.PI * 54;

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

      <div className="px-6 space-y-5 relative z-10">

        {/* Transition banner */}
        {plan.comingUp && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border border-primary/20 rounded-2xl px-5 py-4 flex items-center gap-3"
          >
            <ArrowRightLeft className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-0.5">Transition</p>
              <p className="text-foreground font-medium text-sm">{plan.comingUp}</p>
            </div>
          </motion.div>
        )}

        {/* Section 1 — Say this now */}
        {plan.phrase && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-4">Say this now</p>
            <p className="font-rajdhani text-2xl text-foreground leading-snug mb-6">
              "{plan.phrase}"
            </p>
            <button
              onClick={speakPhrase}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200
                ${speaking
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-background border-border text-foreground hover:border-primary/40"
                }`}
            >
              {speaking ? (
                <>
                  <VolumeX className="w-5 h-5" />
                  Stop reading
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  Read aloud
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Section 2 — Visual timer */}
        {plan.timerMinutes && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-5">Visual timer</p>

            {/* Circular progress */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  {/* Track */}
                  <circle
                    cx="60" cy="60" r="54"
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="8"
                  />
                  {/* Progress */}
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
                  <span className="font-rajdhani text-3xl text-foreground">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 shadow-md shadow-primary/15"
                onClick={toggleTimer}
                disabled={timeLeft === 0}
              >
                {running ? (
                  <><Pause className="w-5 h-5 mr-2" /> Pause</>
                ) : (
                  <><Play className="w-5 h-5 mr-2" /> {timeLeft === totalSeconds ? "Start Timer" : "Resume"}</>
                )}
              </Button>
              <button
                onClick={resetTimer}
                className="w-12 h-12 rounded-xl border-2 border-border bg-background flex items-center justify-center hover:border-primary/40 transition"
                aria-label="Reset timer"
              >
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {timeLeft === 0 && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-primary font-semibold mt-4"
              >
                Time's up — transition time!
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Section 3 — Remind them */}
        {plan.motivation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Remind them</p>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <p className="text-foreground font-medium text-base leading-relaxed pt-1.5">
                {plan.motivation}
              </p>
            </div>
          </motion.div>
        )}

        {/* Link to edit plan */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="text-center pt-2"
        >
          <Link href="/prepare" className="text-xs text-muted-foreground hover:text-primary transition underline underline-offset-2">
            Edit transition plan
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
