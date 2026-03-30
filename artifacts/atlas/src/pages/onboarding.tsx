import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Leaf, AlertTriangle, ArrowRightLeft, MessageSquare, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AtlasLogoMark } from "@/components/AtlasLogo";

const ONBOARDING_KEY = "atlas_onboarding_complete";

export function markOnboardingComplete() {
  localStorage.setItem(ONBOARDING_KEY, "true");
}

export function hasCompletedOnboarding() {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

const features = [
  { icon: ArrowRightLeft, label: "Prepare for transitions" },
  { icon: MessageSquare, label: "Model helpful language" },
  { icon: Wind, label: "Stay calm during escalation" },
];

const variants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [struggle, setStruggle] = useState("");
  const [, setLocation] = useLocation();

  function finish() {
    markOnboardingComplete();
    setLocation("/");
  }

  return (
    <div className="min-h-screen w-full flex flex-col px-6 py-10 sm:px-8 max-w-lg mx-auto relative overflow-hidden">
      {/* background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-primary/8 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-accent/40 blur-[90px] pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 relative z-10">
        <AtlasLogoMark size={40} />
        <span className="text-xl font-rajdhani text-foreground leading-none">Atlas</span>
      </div>

      {/* Step dots */}
      <div className="flex gap-2 mb-10 relative z-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-border"
            }`}
          />
        ))}
      </div>

      {/* Animated step content */}
      <div className="flex-1 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="flex flex-col flex-1"
            >
              <h1 className="font-rajdhani text-3xl sm:text-4xl text-foreground leading-tight mb-6">
                Support during difficult moments with your child.
              </h1>
              <p className="text-muted-foreground text-sm mb-8">
                Atlas helps caregivers of autistic children navigate transitions with more confidence and less stress.
              </p>
              <div className="space-y-4 mb-auto">
                {features.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-4 bg-card border border-border rounded-2xl px-5 py-4 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{label}</span>
                  </div>
                ))}
              </div>
              <Button size="xl" className="w-full mt-10 shadow-md shadow-primary/15" onClick={() => setStep(1)}>
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="flex flex-col flex-1"
            >
              <h1 className="font-rajdhani text-3xl sm:text-4xl text-foreground leading-tight mb-4">
                When are transitions hardest?
              </h1>
              <p className="text-muted-foreground text-sm mb-8">
                This helps Atlas feel more relevant to your situation. You can always skip.
              </p>
              <div className="flex-1">
                <textarea
                  value={struggle}
                  onChange={(e) => setStruggle(e.target.value)}
                  placeholder="My child struggles leaving therapy"
                  rows={5}
                  className="w-full rounded-2xl border border-border bg-card px-5 py-4 text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition"
                />
              </div>
              <Button size="xl" className="w-full mt-8 shadow-md shadow-primary/15" onClick={() => setStep(2)}>
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <button
                onClick={() => setStep(2)}
                className="text-muted-foreground text-sm mt-4 text-center w-full hover:text-foreground transition"
              >
                Skip
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="flex flex-col flex-1"
            >
              <h1 className="font-rajdhani text-3xl sm:text-4xl text-foreground leading-tight mb-4">
                Atlas is here for calm moments and tough ones.
              </h1>
              <p className="text-muted-foreground text-sm mb-8">
                Switch between modes anytime from the home screen.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-auto">
                {/* Calm Mode card */}
                <div className="bg-card border-2 border-primary/25 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">Calm Mode</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Practice phrases and prepare strategies
                    </p>
                  </div>
                </div>

                {/* Crisis Mode card */}
                <div className="bg-card border-2 border-border rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">Crisis Mode</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Simple guidance and calming language
                    </p>
                  </div>
                </div>
              </div>

              <Button size="xl" className="w-full mt-10 shadow-md shadow-primary/15" onClick={finish}>
                Start Using Atlas
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
