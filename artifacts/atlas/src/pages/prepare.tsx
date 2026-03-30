import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { AtlasLogoMark } from "@/components/AtlasLogo";
import { Button } from "@/components/ui/button";

const PLAN_KEY = "atlas_transition_plan";

const PRESET_PHRASES = [
  "Two more minutes",
  "First shoes then car",
  "Time to clean up",
  "One more minute then all done",
];

const TIMER_OPTIONS = [2, 5, 10] as const;

function SectionLabel({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
        <span className="text-primary text-xs font-bold">{number}</span>
      </div>
      <label className="text-sm font-semibold text-foreground">{label}</label>
    </div>
  );
}

function FreeTextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition"
    />
  );
}

export default function Prepare() {
  const [saved, setSaved] = useState(false);

  // Section 1
  const [comingUp, setComingUp] = useState("");
  // Section 2
  const [usuallyHappens, setUsuallyHappens] = useState("");
  // Section 3
  const [wantedBehavior, setWantedBehavior] = useState("");
  // Section 4
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const [customPhraseOpen, setCustomPhraseOpen] = useState(false);
  const [customPhrase, setCustomPhrase] = useState("");
  // Section 5
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  // Section 6
  const [motivation, setMotivation] = useState("");

  function handlePhraseSelect(phrase: string) {
    if (selectedPhrase === phrase) {
      setSelectedPhrase(null);
    } else {
      setSelectedPhrase(phrase);
      setCustomPhraseOpen(false);
    }
  }

  function toggleCustomPhrase() {
    setCustomPhraseOpen((v) => !v);
    if (!customPhraseOpen) setSelectedPhrase(null);
  }

  function savePlan() {
    const plan = {
      comingUp,
      usuallyHappens,
      wantedBehavior,
      phrase: customPhraseOpen ? customPhrase : selectedPhrase,
      timerMinutes,
      motivation,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="min-h-screen w-full pb-10 max-w-lg mx-auto relative">
      {/* Soft background */}
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
            Prepare for Transition
          </h1>
        </div>
        <AtlasLogoMark size={30} className="opacity-60" />
      </header>

      <div className="px-6 space-y-6 relative z-10">

        {/* Section 1 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <SectionLabel number={1} label="What's coming up?" />
          <FreeTextArea
            value={comingUp}
            onChange={setComingUp}
            placeholder="Leaving school, ending screen time, bedtime"
          />
        </motion.div>

        {/* Section 2 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <SectionLabel number={2} label="What usually happens?" />
          <FreeTextArea
            value={usuallyHappens}
            onChange={setUsuallyHappens}
            placeholder="Says no, runs away, drops to floor"
          />
        </motion.div>

        {/* Section 3 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <SectionLabel number={3} label="What would you like them to do instead?" />
          <FreeTextArea
            value={wantedBehavior}
            onChange={setWantedBehavior}
            placeholder="Walk to the car when the timer ends"
          />
        </motion.div>

        {/* Section 4 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <SectionLabel number={4} label="What will you say before time ends?" />
          <div className="space-y-2">
            {PRESET_PHRASES.map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => handlePhraseSelect(phrase)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-medium text-left transition-all duration-200
                  ${selectedPhrase === phrase
                    ? "border-primary bg-primary/8 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/30"
                  }`}
              >
                <span>"{phrase}"</span>
                {selectedPhrase === phrase && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </button>
            ))}

            {/* Custom option */}
            <button
              type="button"
              onClick={toggleCustomPhrase}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200
                ${customPhraseOpen
                  ? "border-primary bg-primary/8 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30"
                }`}
            >
              <span>Custom phrase...</span>
              {customPhraseOpen ? (
                <ChevronUp className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              )}
            </button>

            {customPhraseOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <textarea
                  autoFocus
                  value={customPhrase}
                  onChange={(e) => setCustomPhrase(e.target.value)}
                  placeholder="Type your own phrase..."
                  rows={2}
                  className="w-full rounded-xl border border-primary/40 bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition mt-1"
                />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Section 5 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <SectionLabel number={5} label="Set a visual timer" />
          <div className="flex gap-3">
            {TIMER_OPTIONS.map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => setTimerMinutes(timerMinutes === min ? null : min)}
                className={`flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl border-2 font-semibold transition-all duration-200
                  ${timerMinutes === min
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-background text-foreground hover:border-primary/30"
                  }`}
              >
                <Clock className={`w-5 h-5 ${timerMinutes === min ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-base">{min}</span>
                <span className="text-xs font-normal text-muted-foreground">min</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Section 6 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <SectionLabel number={6} label="What might help motivate this transition?" />
          <FreeTextArea
            value={motivation}
            onChange={setMotivation}
            placeholder="Snack in car, favorite song"
          />
        </motion.div>

        {/* Save button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="pb-4"
        >
          <Button
            size="xl"
            className="w-full shadow-md shadow-primary/15 text-base"
            onClick={savePlan}
          >
            {saved ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Plan Saved!
              </>
            ) : (
              "Save Plan"
            )}
          </Button>
          {saved && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-xs text-muted-foreground mt-3"
            >
              Your transition plan has been saved to this device.
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
