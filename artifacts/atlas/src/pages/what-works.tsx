import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Trash2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { AtlasLogoMark } from "@/components/AtlasLogo";
import { Button } from "@/components/ui/button";

export const WHAT_WORKS_KEY = "atlas_what_works";

export interface WhatWorksEntry {
  id: string;
  situation: string;
  strategyTitle: string;
  steps: string[];
  savedAt: string;
  notes?: string;
}

export function loadWhatWorks(): WhatWorksEntry[] {
  try {
    const raw = localStorage.getItem(WHAT_WORKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveWhatWorks(entries: WhatWorksEntry[]) {
  localStorage.setItem(WHAT_WORKS_KEY, JSON.stringify(entries));
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
}

export default function WhatWorks() {
  const [entries, setEntries] = useState<WhatWorksEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setEntries(loadWhatWorks().sort((a, b) =>
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    ));
  }, []);

  function handleDelete(id: string) {
    const updated = entries.filter((e) => e.id !== id);
    saveWhatWorks(updated);
    setEntries(updated);
    setDeletingId(null);
  }

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto pb-12 relative">
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-primary/12 to-transparent pointer-events-none" />

      <header className="flex items-center justify-between px-6 py-8 relative z-10">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="w-9 h-9 rounded-full bg-white border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
          </Link>
          <div>
            <h1 className="font-rajdhani text-2xl text-foreground leading-none">What Works</h1>
            <p className="text-muted-foreground text-xs mt-0.5">Your personal playbook</p>
          </div>
        </div>
        <AtlasLogoMark size={30} className="opacity-60" />
      </header>

      <div className="px-6 relative z-10">
        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-10 h-10 text-primary/50" />
            </div>
            <h2 className="font-rajdhani text-2xl text-foreground mb-2">Nothing saved yet</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto mb-8">
              After you get through a tough moment with Atlas, you can save what helped. It builds a personal playbook over time.
            </p>
            <Link href="/crisis">
              <Button size="xl" className="shadow-md shadow-primary/15">Get Crisis Help</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground mb-2">
              {entries.length} saved approach{entries.length !== 1 ? "es" : ""} — tap to expand
            </p>
            <AnimatePresence>
              {entries.map((entry, i) => {
                const isOpen = expanded === entry.id;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => setExpanded(isOpen ? null : entry.id)}
                      className="w-full text-left p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-sm leading-snug">
                              {entry.strategyTitle}
                            </p>
                            <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">
                              When: {entry.situation}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">{timeAgo(entry.savedAt)}</span>
                          {isOpen
                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          }
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                            <div>
                              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">What helped</p>
                              <ol className="space-y-1.5">
                                {entry.steps.map((step, si) => (
                                  <li key={si} className="flex items-start gap-2.5 text-sm text-foreground">
                                    <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                      {si + 1}
                                    </span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                            {entry.notes && (
                              <div className="bg-secondary/60 rounded-xl px-4 py-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                                <p className="text-sm text-foreground">{entry.notes}</p>
                              </div>
                            )}
                            <div className="flex justify-end pt-1">
                              {deletingId === entry.id ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDelete(entry.id)}
                                    className="px-3 h-8 rounded-lg bg-red-500 text-white text-xs font-bold"
                                  >Delete</button>
                                  <button
                                    onClick={() => setDeletingId(null)}
                                    className="px-3 h-8 rounded-lg border border-border text-xs text-muted-foreground"
                                  >Cancel</button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingId(entry.id)}
                                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
