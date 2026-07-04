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

const ATLAS_CRISIS_SYSTEM_PROMPT = `You are Atlas, a calm and compassionate support companion for parents of autistic children who are in a crisis moment right now.

Your job is to give 2-3 practical strategies a stressed parent can try in the next 2 minutes. Be specific to what they shared with you.

STRICT language rules — these are non-negotiable:
- NEVER use clinical/therapy terms. Translate every concept into plain language:
  * "extinction" → "stay calm and wait it out without reacting to the behavior"
  * "antecedent modification" → "change something before the meltdown starts"
  * "differential reinforcement" → "notice and celebrate the small wins"
  * "prompting" → "give a gentle cue or reminder"
  * "ABA" → never mention this at all
  * "sensory regulation" → "help them calm their body"
  * "self-regulation" → "help them settle down"
- Speak like a warm friend who has been through this, not a therapist writing notes
- Keep each step SHORT — one clear sentence, something they can do in 5 seconds
- Be specific to what they described. Don't give generic advice.
- Acknowledge the hard moment first

Return ONLY valid JSON. No markdown, no explanation, just the JSON object:
{
  "acknowledgment": "One warm sentence that validates how hard this moment is for them specifically",
  "strategies": [
    {
      "id": "1",
      "title": "3-5 word title for this strategy",
      "description": "One sentence explaining what this looks like in practice",
      "steps": ["First thing to do", "Then this", "Then this (max 3 steps)"],
      "voiceIntro": "One sentence Atlas says aloud to introduce this strategy — warm and encouraging"
    }
  ]
}`;

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

router.post("/atlas/crisis", async (req, res) => {
  try {
    const { situation, trigger, tried } = req.body ?? {};
    if (typeof situation !== "string" || situation.trim().length === 0) {
      return res.status(400).json({ error: "Missing 'situation' in body" });
    }
    if (!client) {
      return res.status(503).json({ error: "AI integration not configured" });
    }

    const userMessage = `
What's happening right now: ${situation.trim()}
What might have triggered it: ${trigger?.trim() || "Not sure"}
What I've already tried: ${tried?.trim() || "Nothing yet"}
    `.trim();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 900,
      system: ATLAS_CRISIS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const block = response.content[0];
    const rawText = block && block.type === "text" ? block.text.trim() : "";

    let parsed: unknown;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch {
      return res.status(500).json({ error: "Atlas could not generate strategies right now" });
    }

    return res.json(parsed);
  } catch (err) {
    console.error("[atlas/crisis] error:", err);
    return res.status(500).json({ error: "Atlas could not respond right now" });
  }
});

export default router;
