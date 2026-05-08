import Anthropic from '@anthropic-ai/sdk';

let client;
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

const SYSTEM_PROMPT = `You evaluate whether a piece of text qualifies as a good "index card" in the tradition of Brian Eno's Oblique Strategies.

A good index card:
1. Is short enough to be an interruption — command-line style, not explanatory. Under 15 words ideally.
2. Is concrete but portable — applies across domains without being vague ("Do it differently" is too vague; "Reverse the order of operations" is concrete and portable).
3. Contains an imperative verb that induces a change of operation: Remove, Reverse, Amplify, Translate, Subtract, Repeat, Delay, Mirror, Compress, etc.
4. Attacks hidden defaults the reader obeys without realizing — it names an assumption and breaks it.
5. Converts anxiety into procedure — it gives the stuck person something *to do*, not something to think about.
6. Creates productive ambiguity — it applies in multiple ways depending on context.
7. Has slight absurdity — it lowers the dignity of the stuck state without being a joke.
8. Alternates discipline and permission — sometimes it constrains, sometimes it frees.

Formula: "One card = one pressure applied to a stuck system."

NOT a good index card:
- Quotes or proverbs ("The journey of a thousand miles begins with a single step")
- Life lessons or maxims ("Be present", "Trust the process")
- Instructions too specific to one domain ("Transpose the chord progression to F minor")
- Questions without pressure ("What are you trying to say?")
- Vague encouragements ("Let go of perfection")
- Anything over 20 words

Return a JSON object with:
- score: integer 0-100 (70+ means it qualifies as a good index card)
- reason: one short sentence explaining the score

Return ONLY valid JSON, no other text.`;

export async function scoreMessage(text) {
  try {
    const response = await getClient().messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Evaluate this text as a potential index card:\n\n"${text}"` }],
    });

    const raw = response.content[0].text.trim().replace(/^```[a-z]*\n?|\n?```$/g, '');
    const parsed = JSON.parse(raw);
    return {
      score: typeof parsed.score === 'number' ? parsed.score : 0,
      reason: parsed.reason || 'No reason given',
    };
  } catch (err) {
    console.error('Scoring error:', err.message);
    return { score: 0, reason: 'Scoring failed' };
  }
}
