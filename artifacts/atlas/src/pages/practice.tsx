import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { AtlasLogoMark } from "@/components/AtlasLogo";

const PHRASES = [
  { phrase: "Two more minutes", tip: "Say it slowly and calmly, once only" },
  { phrase: "First shoes, then car", tip: "Keep your voice flat and steady" },
  { phrase: "I can see you're upset", tip: "Lean down to their level if you can" },
  { phrase: "One more minute, then all done", tip: "Hold up one finger as you say it" },
  { phrase: "Do you want to walk or hop?", tip: "Smile slightly — offer it as a genuine choice" },
  { phrase: "Let's take a break", tip: "Say it softly, not as a punishment" },
];

export default function Practice() {
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  // Cleanup TTS on unmount
  useEffect(() => () => window.speechSynthesis.cancel(), []);

  function speak(index: number, text: string) {
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9;
    utt.pitch = 1;
    utt.onend = () => setSpeakingIndex(null);
    utt.onerror = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utt);
  }

  return (
    <div className="min-h-screen w-full pb-10 max-w-lg mx-auto relative">
      {/* Soft top wash */}
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
            Practice a Phrase
          </h1>
        </div>
        <AtlasLogoMark size={30} className="opacity-60" />
      </header>

      {/* Intro line */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 text-muted-foreground text-sm leading-relaxed mb-6 relative z-10"
      >
        Tap the speaker on each card to hear the phrase. Say it out loud after — tone matters as much as the words.
      </motion.p>

      {/* Phrase cards */}
      <div className="px-6 space-y-4 relative z-10">
        {PHRASES.map((item, i) => {
          const isSpeaking = speakingIndex === i;
          return (
            <motion.div
              key={item.phrase}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-rajdhani text-2xl text-foreground leading-snug mb-2">
                    "{item.phrase}"
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {item.tip}
                  </p>
                </div>

                {/* Speaker button */}
                <button
                  onClick={() => speak(i, item.phrase)}
                  aria-label={isSpeaking ? "Stop reading" : "Read phrase aloud"}
                  className={`flex-shrink-0 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200
                    ${isSpeaking
                      ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "bg-background border-border text-primary hover:border-primary/50"
                    }`}
                >
                  {isSpeaking ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
