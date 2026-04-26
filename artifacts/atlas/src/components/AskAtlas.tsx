import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2 } from "lucide-react";

interface AskAtlasProps {
  variant?: "default" | "compact";
}

export function AskAtlas({ variant = "default" }: AskAtlasProps) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const trimmed = message.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    setReply(null);
    try {
      const res = await fetch("/api/atlas/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setReply(data.reply || "");
    } catch {
      setError("Atlas couldn't respond right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={variant === "compact" ? "space-y-3" : "space-y-4"}>
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Describe what is happening right now..."
          rows={variant === "compact" ? 2 : 3}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 pr-14 text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition"
        />
        <button
          onClick={handleSend}
          disabled={loading || message.trim().length === 0}
          aria-label="Send to Atlas"
          className="absolute right-2 bottom-2 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20 disabled:opacity-40 disabled:shadow-none hover:opacity-90 transition"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {reply && (
          <motion.div
            key="reply"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="bg-primary/8 border border-primary/20 rounded-2xl px-5 py-4 flex gap-3 items-start"
          >
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <p className="text-foreground text-sm leading-relaxed pt-1">
              {reply}
            </p>
          </motion.div>
        )}

        {error && (
          <motion.p
            key="err"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-destructive text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
