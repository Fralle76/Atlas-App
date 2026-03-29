import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AtlasLogoMark } from "@/components/AtlasLogo";
import { useMode } from "@/lib/mode-context";

const calmphrases = [
  { situation: "Starting a warning", phrase: "In 5 minutes, we're going to stop playing and have dinner." },
  { situation: "One minute left", phrase: "One more minute, then it's time to turn off the game." },
  { situation: "Transition time", phrase: "Okay, it's time now. You did a great job playing." },
  { situation: "Acknowledging feelings", phrase: "I know it's hard to stop. It's okay to feel sad about it." },
  { situation: "Offering comfort", phrase: "You can play again tomorrow. Let's go wash hands together." },
  { situation: "First / Then", phrase: "First we eat dinner, then we can read your favorite book." },
];

const crisisPhrases = [
  { situation: "Grounding", phrase: "I'm right here. You're safe. Take a slow breath with me." },
  { situation: "Simple direction", phrase: "Let's sit down together. Just you and me, right here." },
  { situation: "Validation", phrase: "I see you're really upset. That makes sense. I'm not going anywhere." },
  { situation: "Reduce demands", phrase: "We don't have to do anything right now. Let's just breathe." },
  { situation: "Reassurance", phrase: "This feeling will pass. I'll stay with you the whole time." },
];

export default function Practice() {
  const { mode } = useMode();
  const isCrisis = mode === "crisis";
  const phrases = isCrisis ? crisisPhrases : calmphrases;

  return (
    <div className="min-h-screen w-full px-6 py-8 sm:px-8 max-w-lg mx-auto relative">
      <header className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-4 bg-white/50 border border-border shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground">Practice a Phrase</h1>
        </div>
        <AtlasLogoMark size={32} className="opacity-70" />
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-muted-foreground text-sm leading-relaxed">
          {isCrisis
            ? "Use these phrases to help ground and reassure your child during a hard moment."
            : "Practice saying these phrases out loud so they come naturally when you need them."}
        </p>
      </motion.div>

      <div className="space-y-4">
        {phrases.map((item, i) => (
          <motion.div
            key={item.situation}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  {item.situation}
                </p>
                <p className="text-foreground font-medium leading-relaxed">
                  "{item.phrase}"
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
