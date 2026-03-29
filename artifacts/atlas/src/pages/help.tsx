import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Wind, Heart, Clock, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMode } from "@/lib/mode-context";
import { AtlasLogoMark } from "@/components/AtlasLogo";

const tips = [
  {
    icon: Clock,
    title: "Use a Visual Timer",
    content: "Set a physical or visual timer so they can see time passing. It removes the 'surprise' element of the transition."
  },
  {
    icon: MessageCircle,
    title: "First / Then Language",
    content: "Keep sentences short and direct. 'First shoes, then park.' Avoid lengthy explanations when emotions are high."
  },
  {
    icon: MapPin,
    title: "Offer a Transition Object",
    content: "Allow them to bring a small, comforting item from the current activity to the next space."
  },
  {
    icon: Heart,
    title: "Acknowledge the Emotion",
    content: "Validate their feelings gently. 'I see you are upset. It is hard to stop playing.' Connection before direction."
  }
];

export default function Help() {
  const { mode } = useMode();
  const isCrisis = mode === "crisis";

  return (
    <div className="min-h-screen w-full px-6 py-8 sm:px-8 max-w-lg mx-auto relative bg-background">
      <header className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-4 bg-white/50 border border-border shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground">Transition Help</h1>
        </div>
        <AtlasLogoMark size={32} className="opacity-70" />
      </header>

      <div className="space-y-6">
        {isCrisis && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary text-primary-foreground p-6 rounded-3xl shadow-xl shadow-primary/20 mb-8"
          >
            <div className="flex items-center gap-3 mb-3">
              <Wind className="w-6 h-6 animate-pulse" />
              <h2 className="text-xl font-display font-bold">Breathe.</h2>
            </div>
            <p className="text-primary-foreground/90 font-medium text-lg leading-relaxed">
              Inhale for 4 seconds.<br/>
              Exhale for 6 seconds.<br/>
              You are safe. You can handle this.
            </p>
          </motion.div>
        )}

        <div className="space-y-4">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border-2 border-border p-5 rounded-2xl shadow-sm flex gap-4 items-start"
            >
              <div className={`p-3 rounded-xl flex-shrink-0 ${isCrisis ? 'bg-primary/20 text-primary' : 'bg-secondary text-primary'}`}>
                <tip.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground mb-1 font-display">{tip.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{tip.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
