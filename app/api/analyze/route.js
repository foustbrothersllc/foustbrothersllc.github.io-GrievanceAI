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

const buildPrompt = (question, classification, contractText) => `You are a labor relations expert specializing in UPS Teamsters contracts.

CRITICAL RULES:
1. The Supplemental Agreement (Atlantic Area Agreement) ALWAYS takes precedence over the National Master Agreement. Check Supplement first. Both can apply simultaneously - cite BOTH when relevant.
2. The worker may describe MULTIPLE separate issues. You MUST find and report on EVERY single issue separately. Never combine issues or skip any.
3. Always cite the specific Article and Section number.
4. Always explain what the contract says even if no violation exists.
5. Use only the contract language provided - no general labor law.
6. Be thorough - missing a violation helps the company, not the worker.

WORKER DETAILS:
Classification: ${classification}
Question/Complaint: "${question}"

CONTRACTS TO ANALYZE:
${contractText}

INSTRUCTIONS:
First, read the worker's complaint carefully and identify EVERY separate issue they mentioned (there may be 2, 3, or more).

Then for EACH issue found, provide a separate analysis block in this exact format:

---
ISSUE #[number]: [Name of the issue]
VERDICT: YES - VIOLATION FOUND or NO - NO VIOLATION
ARTICLES: [Specific Article and Section from Supplement and/or Master]
ANALYSIS: [What the contract says and whether it was violated, in plain language]
WORKER RIGHTS: [What the worker is entitled to under the contract]
---

After analyzing ALL issues, end with:

OVERALL VERDICT: YES - VIOLATION FOUND (if any violations exist) or NO - NO VIOLATION
SUMMARY: [Brief summary of all violations found and recommended next steps]`;

// 1. GROQ - Primary (14,400 req/day free)
async function analyzeWithGroq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('No Groq key');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.2
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty Groq response');
  return text;
}

// 2. GEMINI - First backup (20 req/day free)
async function analyzeWithGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('No Gemini key');
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
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
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return text;
}

// 3. MISTRAL - Second backup (free tier)
async function analyzeWithMistral(prompt) {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new Error('No Mistral key');
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'open-mistral-7b',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.2
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty Mistral response');
  return text;
}

// 4. COHERE - Third backup (free tier)
async function analyzeWithCohere(prompt) {
  const key = process.env.COHERE_API_KEY;
  if (!key) throw new Error('No Cohere key');
  const response = await fetch('https://api.cohere.com/v2/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'command-r',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.2
    })
  });
  const data = await response.json();
  if (data.message) throw new Error(data.message);
  const text = data.message?.content?.[0]?.text || data.text;
  if (!text) throw new Error('Empty Cohere response');
  return text;
}

// 5. HUGGING FACE - Fourth backup (free)
async function analyzeWithHuggingFace(prompt) {
  const key = process.env.HUGGINGFACE_API_KEY;
  if (!key) throw new Error('No HuggingFace key');
  const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 1024, temperature: 0.2 }
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
  if (!text) throw new Error('Empty HuggingFace response');
  // HF returns the full prompt + response, strip the prompt
  return text.replace(prompt, '').trim();
}

export async function POST(request) {
  try {
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
    const prompt = buildPrompt(question, classification, contractText);

    const providers = [
      { name: 'Groq', fn: analyzeWithGroq },
      { name: 'Gemini', fn: analyzeWithGemini },
      { name: 'Mistral', fn: analyzeWithMistral },
      { name: 'Cohere', fn: analyzeWithCohere },
      { name: 'HuggingFace', fn: analyzeWithHuggingFace },
    ];

    const errors = [];
    for (const provider of providers) {
      try {
        console.log(`Trying ${provider.name}...`);
        const analysis = await provider.fn(prompt);
        console.log(`Success with ${provider.name}`);
        return Response.json({ analysis, provider: provider.name });
      } catch (err) {
        console.log(`${provider.name} failed:`, err.message);
        errors.push(`${provider.name}: ${err.message}`);
      }
    }

    return Response.json({
      error: `All AI providers failed. Details: ${errors.join(' | ')}`
    }, { status: 500 });

  } catch (error) {
    return Response.json({ error: `Analysis failed: ${error.message}` }, { status: 500 });
  }
}
