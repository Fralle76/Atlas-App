import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, CheckCircle2 } from "lucide-react";
import { loadSchedules, Schedule, ScheduleStep } from "./schedule";

export default function SchedulePreview() {
  const params = useParams<{ id: string }>();
  const [, nav] = useLocation();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    const all = loadSchedules();
    const found = all.find((s) => s.id === params.id) ?? null;
    setSchedule(found);
  }, [params.id]);

  if (!schedule) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary/5">
        <p className="text-muted-foreground">Schedule not found.</p>
      </div>
    );
  }

  const steps = schedule.steps;
  const step = steps[current];
  const isFirst = current === 0;
  const isLast = current === steps.length - 1;

  function goNext() {
    if (isLast) { setDone(true); return; }
    setDirection(1);
    setCurrent((c) => c + 1);
  }
  function goPrev() {
    if (isFirst) return;
    setDirection(-1);
    setCurrent((c) => c - 1);
  }

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 120 : -120 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -120 : 120 }),
  };

  if (done) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-8 px-8 bg-gradient-to-b from-primary/10 to-background">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center">
            <CheckCircle2 className="w-14 h-14 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-rajdhani text-5xl text-foreground leading-none">All Done!</h1>
          <p className="text-xl text-muted-foreground font-medium">
            Great job finishing <span className="text-foreground font-semibold">{schedule.name}</span>!
          </p>
        </motion.div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => { setDone(false); setCurrent(0); }}
            className="w-full py-5 rounded-2xl bg-primary text-primary-foreground text-xl font-bold shadow-lg shadow-primary/25 hover:opacity-90 transition active:scale-95"
          >
            Start Over
          </button>
          <button
            onClick={() => nav("/schedule")}
            className="w-full py-5 rounded-2xl border-2 border-border text-foreground text-xl font-bold hover:bg-secondary transition active:scale-95"
          >
            All Schedules
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-primary/10 to-background overflow-hidden">
      {/* Close button */}
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => nav("/schedule")}
          className="w-12 h-12 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition active:scale-95"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="font-rajdhani text-xl text-foreground">{schedule.name}</h2>
        <div className="w-12" />
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2.5 pb-6">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === current ? 28 : 10,
              backgroundColor: i === current
                ? "hsl(var(--primary))"
                : i < current
                ? "hsl(var(--primary) / 0.4)"
                : "hsl(var(--border))",
            }}
            transition={{ duration: 0.3 }}
            className="h-2.5 rounded-full"
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="w-full flex flex-col items-center gap-7 text-center"
          >
            {/* Step number badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
              <span className="text-primary text-sm font-bold">
                Step {current + 1} of {steps.length}
              </span>
            </div>

            {/* Image */}
            {step.imageDataUrl ? (
              <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl shadow-black/15 border-4 border-white">
                <img
                  src={step.imageDataUrl}
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-primary/10 border-4 border-primary/20 flex items-center justify-center shadow-xl">
                <span className="text-8xl font-black text-primary/30">
                  {step.title.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="font-rajdhani text-5xl sm:text-6xl text-foreground leading-none px-4">
              {step.title || "—"}
            </h1>

            {/* Time */}
            {step.time && (
              <p className="text-2xl text-muted-foreground font-semibold">
                🕐 {step.time}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="px-6 pb-10 pt-4 flex gap-4">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className="flex-1 flex items-center justify-center gap-2 py-6 rounded-2xl border-2 border-border text-foreground text-2xl font-bold disabled:opacity-30 hover:bg-secondary transition active:scale-95"
        >
          <ChevronLeft className="w-8 h-8" />
          Back
        </button>
        <button
          onClick={goNext}
          className="flex-1 flex items-center justify-center gap-2 py-6 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-xl shadow-primary/25 hover:opacity-90 transition active:scale-95"
        >
          {isLast ? "Done ✓" : <>Next <ChevronRight className="w-8 h-8" /></>}
        </button>
      </div>
    </div>
  );
}
