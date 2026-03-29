import { Link } from "wouter";
import { motion } from "framer-motion";
import { useMode } from "@/lib/mode-context";
import { ArrowRightLeft, LifeBuoy, Moon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AtlasLogoMark } from "@/components/AtlasLogo";

export default function Home() {
  const { mode, toggleMode } = useMode();
  const isCrisis = mode === "crisis";

  return (
    <div className="min-h-screen w-full flex flex-col px-6 py-8 sm:px-8 max-w-lg mx-auto relative overflow-hidden">
      {/* Soft background decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/30 blur-[100px] pointer-events-none" />

      <header className="w-full flex justify-between items-center mb-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <AtlasLogoMark size={48} />
          <div className="flex flex-col">
            <h1 className="text-3xl font-display font-bold text-foreground leading-none">Atlas</h1>
            <p className="text-muted-foreground text-xs mt-1">Caregiver Support</p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={toggleMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 shadow-sm
            ${isCrisis 
              ? 'bg-primary/10 text-primary border border-primary/20' 
              : 'bg-white border border-border text-muted-foreground hover:bg-secondary'
            }`}
        >
          {isCrisis ? (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span>Crisis Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              <span>Calm Mode</span>
            </>
          )}
        </motion.button>
      </header>

      <main className="flex-1 flex flex-col justify-center gap-6 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <h2 className={`text-2xl sm:text-3xl font-display font-bold mb-3 ${isCrisis ? 'text-primary' : 'text-foreground'}`}>
            {isCrisis ? "We are here. You can do this." : "Ready for the next step?"}
          </h2>
          <p className="text-muted-foreground">
            {isCrisis 
              ? "Focus on breathing. Access immediate tips or plan the next move."
              : "Prepare your child for an upcoming activity change to reduce stress."}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <Link href="/prepare" className="w-full block">
            <Button size="xl" className="w-full text-lg shadow-xl shadow-primary/20 group">
              <ArrowRightLeft className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" />
              Prepare for Transition
            </Button>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <Link href="/help" className="w-full block">
            <Button 
              size="xl" 
              variant="outline" 
              className={`w-full text-lg bg-card border-2 ${isCrisis ? 'border-primary/40 text-primary' : 'border-border text-foreground hover:border-primary/30'}`}
            >
              <LifeBuoy className="w-6 h-6 mr-2" />
              Transition Help & Tips
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
