const CONTRACT_URLS = [
  {
    name: 'Atlantic Area Supplemental Agreement 2023-2028',
    url: 'https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/main/local-agreement.txt'
  },
  {
    name: 'National Master UPS Agreement 2023-2028',
    url: 'https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/main/master-agreement.txt'
  }
];

export async function POST(request) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const { classification, question } = await request.json();

    if (!classification || !question) {
      return Response.json({ error: 'Missing classification or question' }, { status: 400 });
    }

    // Fetch contracts server-side
    const texts = await Promise.all(
      CONTRACT_URLS.map(async (c) => {
        const res = await fetch(c.url);
        const text = await res.text();
        return `=== ${c.name} ===\n${text}`;
      })
    );
    const contractText = texts.join('\n\n');

    const prompt = `You are a labor relations expert specializing in UPS Teamsters contracts.

IMPORTANT RULES YOU MUST FOLLOW:
1. The Supplemental Agreement (Atlantic Area Agreement) has stronger and more specific language than the National Master Agreement. Always check the Supplement first. Both can apply at the same time - if both have relevant language, cite BOTH.
2. Always explain what the contract says regardless of whether there is a violation or not. Never just say "no violation" without explaining the relevant contract language.
3. Always cite the specific Article and Section number when referencing contract language.
4. Answer in plain language a worker can understand.
5. Base your answer ONLY on the contract language provided - do not use general labor law knowledge.

A worker has asked the following question:
"${question}"

Their job classification is: ${classification}

Here are the relevant contracts to analyze (Supplement listed first as it takes precedence):
${contractText}

Based on the contract language above, answer whether there is a violation.

Start your response with either:
- "YES - VIOLATION FOUND:" if the contract supports their claim
- "NO - NO VIOLATION:" if the contract does not support their claim

Then:
1. Cite the specific Article and Section from the Supplement and/or Master Agreement that applies
2. Explain exactly what the contract language says about this situation in plain language
3. If both the Supplement and Master Agreement apply, explain how they work together
4. If no violation, still clearly explain what the worker's rights ARE under the contract`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2048, temperature: 0.2 }
        })
      }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    if (!data.candidates || data.candidates.length === 0) throw new Error('No response from Gemini');

    const text = data.candidates[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');

    return Response.json({ analysis: text });

  } catch (error) {
    return Response.json({ error: `Analysis failed: ${error.message}` }, { status: 500 });
  }
}
