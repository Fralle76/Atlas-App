import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CalendarDays, Plus, Play, Pencil, Trash2, Clock, ChevronRight } from "lucide-react";
import { AtlasLogoMark } from "@/components/AtlasLogo";
import { Button } from "@/components/ui/button";

export const SCHEDULES_KEY = "atlas_schedules";

export interface ScheduleStep {
  id: string;
  title: string;
  imageDataUrl?: string;
  time?: string;
}

export interface Schedule {
  id: string;
  name: string;
  steps: ScheduleStep[];
  createdAt: string;
}

export function loadSchedules(): Schedule[] {
  try {
    const raw = localStorage.getItem(SCHEDULES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSchedules(schedules: Schedule[]) {
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
}

const EMOJI_COLORS = [
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-orange-400 to-rose-500",
  "from-sky-400 to-blue-500",
  "from-pink-400 to-fuchsia-500",
  "from-amber-400 to-yellow-500",
];

function scheduleColor(id: string) {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return EMOJI_COLORS[sum % EMOJI_COLORS.length];
}

export default function Schedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [, nav] = useLocation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setSchedules(loadSchedules());
  }, []);

  function handleDelete(id: string) {
    const updated = schedules.filter((s) => s.id !== id);
    saveSchedules(updated);
    setSchedules(updated);
    setDeletingId(null);
  }

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto pb-12 relative">
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-8 relative z-10">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="w-9 h-9 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
          </Link>
          <div>
            <h1 className="font-rajdhani text-2xl text-foreground leading-none">Visual Schedules</h1>
            <p className="text-muted-foreground text-xs mt-0.5">{schedules.length} saved</p>
          </div>
        </div>
        <AtlasLogoMark size={30} className="opacity-60" />
      </header>

      <div className="px-6 relative z-10">
        {/* Create button */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/schedule/new">
            <Button size="xl" className="w-full shadow-md shadow-primary/15 mb-8">
              <Plus className="w-5 h-5 mr-2" />
              Create New Schedule
            </Button>
          </Link>
        </motion.div>

        {/* Empty state */}
        {schedules.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <CalendarDays className="w-10 h-10 text-primary/60" />
            </div>
            <h2 className="font-rajdhani text-2xl text-foreground mb-2">No schedules yet</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              Create a visual schedule with pictures to help your child know what's coming up.
            </p>
          </motion.div>
        )}

        {/* Schedule list */}
        <div className="space-y-4">
          <AnimatePresence>
            {schedules.map((sched, i) => (
              <motion.div
                key={sched.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Color bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${scheduleColor(sched.id)}`} />

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Step image previews */}
                    <div className="flex -space-x-2">
                      {sched.steps.slice(0, 3).map((step) =>
                        step.imageDataUrl ? (
                          <div
                            key={step.id}
                            className="w-12 h-12 rounded-xl border-2 border-white overflow-hidden flex-shrink-0 shadow-sm"
                          >
                            <img src={step.imageDataUrl} alt={step.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div
                            key={step.id}
                            className={`w-12 h-12 rounded-xl border-2 border-white bg-gradient-to-br ${scheduleColor(sched.id)} flex items-center justify-center flex-shrink-0 shadow-sm`}
                          >
                            <span className="text-white text-lg font-bold">{step.title.charAt(0).toUpperCase()}</span>
                          </div>
                        )
                      )}
                      {sched.steps.length > 3 && (
                        <div className="w-12 h-12 rounded-xl border-2 border-white bg-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-muted-foreground text-xs font-bold">+{sched.steps.length - 3}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-rajdhani text-xl text-foreground leading-tight truncate">{sched.name}</h3>
                      <p className="text-muted-foreground text-sm mt-0.5">
                        {sched.steps.length} step{sched.steps.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Link href={`/schedule/preview/${sched.id}`} className="flex-1">
                      <button className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${scheduleColor(sched.id)} shadow-md hover:opacity-90 transition`}>
                        <Play className="w-4 h-4" />
                        Preview
                      </button>
                    </Link>
                    <Link href={`/schedule/edit/${sched.id}`}>
                      <button className="w-10 h-10 rounded-xl border border-border bg-background flex items-center justify-center hover:border-primary/40 hover:bg-secondary transition">
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </Link>
                    {deletingId === sched.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(sched.id)}
                          className="px-3 h-10 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-3 h-10 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-secondary transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(sched.id)}
                        className="w-10 h-10 rounded-xl border border-border bg-background flex items-center justify-center hover:border-red-300 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
