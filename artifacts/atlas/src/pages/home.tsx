import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useMode } from "@/lib/mode-context";
import { ArrowRightLeft, LifeBuoy, MessageSquare, Leaf, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AtlasLogoMark } from "@/components/AtlasLogo";

export default function Home() {
  const { mode, toggleMode } = useMode();
  const isCrisis = mode === "crisis";

  return (
    <div className="min-h-screen w-full flex flex-col px-6 py-8 sm:px-8 max-w-lg mx-auto relative overflow-hidden">
      {/* Soft background blobs */}
      <div className="absolute top-[-8%] left-[-8%] w-[55%] h-[55%] rounded-full bg-primary/8 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-8%] right-[-8%] w-[55%] h-[55%] rounded-full bg-accent/40 blur-[90px] pointer-events-none" />

      {/* Header — logo only */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex items-center gap-3 mb-8 relative z-10"
      >
        <AtlasLogoMark size={44} />
        <div>
          <h1 className="text-2xl font-rajdhani text-foreground leading-none">Atlas</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Caregiver Support</p>
        </div>
      </motion.header>

      {/* Central mode toggle */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full mb-10 relative z-10"
      >
        <div className="flex items-center bg-secondary rounded-2xl p-1 gap-1 shadow-inner">
          <button
            onClick={() => !isCrisis ? null : toggleMode()}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300
              ${!isCrisis
                ? "bg-white text-foreground shadow-sm shadow-black/5"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Leaf className="w-4 h-4" />
            Calm Mode
          </button>
          <button
            onClick={() => isCrisis ? null : toggleMode()}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300
              ${isCrisis
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Crisis Mode
          </button>
        </div>
      </motion.div>

      {/* Main content area */}
      <main className="flex-1 flex flex-col justify-center gap-5 relative z-10 w-full">
        <AnimatePresence mode="wait">
          {isCrisis ? (
            /* ── CRISIS MODE: single big button, minimal text ── */
            <motion.div
              key="crisis"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-6 text-center"
            >
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  You've got this.
                </h2>
                <p className="text-muted-foreground text-sm">
                  Take a breath. Help is right here.
                </p>
              </div>

              <Link href="/help" className="w-full block">
                <Button
                  size="xl"
                  className="w-full py-8 text-xl shadow-lg shadow-primary/20"
                >
                  <LifeBuoy className="w-7 h-7 mr-3" />
                  Transition Help & Tips
                </Button>
              </Link>
            </motion.div>
          ) : (
            /* ── CALM MODE: full three-button layout ── */
            <motion.div
              key="calm"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-5"
            >
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-center mb-2"
              >
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
                  Atlas is here to support you.
                </h2>
                <p className="text-muted-foreground text-sm">
                  You're not alone in this.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Link href="/prepare" className="w-full block">
                  <Button size="xl" className="w-full text-base shadow-md shadow-primary/15 group">
                    <ArrowRightLeft className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Prepare for Transition
                  </Button>
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Link href="/help" className="w-full block">
                  <Button size="xl" variant="outline" className="w-full text-base border-2 border-border bg-card hover:border-primary/40">
                    <LifeBuoy className="w-5 h-5 mr-2" />
                    Transition Help & Tips
                  </Button>
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Link href="/practice" className="w-full block">
                  <Button size="xl" variant="outline" className="w-full text-base border-2 border-border bg-card hover:border-primary/40">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Practice a Phrase
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
