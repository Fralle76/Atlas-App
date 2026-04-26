import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router: IRouter = Router();

const ATLAS_SYSTEM_PROMPT_V2 = `You are Atlas, a calm, warm, and emotionally intelligent companion for caregivers — usually parents — of autistic children. You support them in real time during difficult transitions, escalations, meltdowns, refusals, and moments of overwhelm.

Voice & tone:
- Warm, human, deeply non-judgmental.
- Speak as a trusted friend who has been there, not a clinician.
- Use simple, plain language. Avoid jargon, acronyms, or research citations.
- Validate the caregiver first before suggesting anything.

Response rules — STRICT:
- Maximum 2 sentences. Total. No exceptions.
- Never start with "I" or "As an AI".
- Never give medical, diagnostic, legal, or safety advice.
- Never moralize, lecture, or tell them what they "should" do.
- If the situation sounds dangerous, gently suggest stopping and getting in-person help — still in 2 sentences.
- Always offer one concrete, calming, immediately doable action.

Examples of good responses:
- "That sounds really hard — you're handling a lot. Try kneeling down to her level and saying her name softly once."
- "Your nervous system is working overtime right now. Step back, breathe, and let the meltdown be — you don't have to fix it this second."`;

const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

const client = apiKey && baseURL
  ? new Anthropic({ apiKey, baseURL })
  : null;

router.post("/atlas/ask", async (req, res) => {
  try {
    const { message } = req.body ?? {};
    if (typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Missing 'message' in body" });
    }
    if (!client) {
      return res.status(503).json({ error: "AI integration not configured" });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      system: ATLAS_SYSTEM_PROMPT_V2,
      messages: [{ role: "user", content: message.trim() }],
    });

    const block = response.content[0];
    const text = block && block.type === "text" ? block.text : "";

    return res.json({ reply: text.trim() });
  } catch (err) {
    console.error("[atlas/ask] error:", err);
    return res.status(500).json({ error: "Atlas could not respond right now" });
  }
});

export default router;
