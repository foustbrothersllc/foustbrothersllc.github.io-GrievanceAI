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

const buildPrompt = (question, classification, contractText, issueCount = 1) => `You are a labor relations expert specializing in UPS Teamsters contracts and FMCSA regulations.

CRITICAL RULES:
1. The Supplemental Agreement (Atlantic Area Agreement) ALWAYS takes precedence over the National Master Agreement. Check Supplement first. Both can apply simultaneously - cite BOTH when relevant.
2. The worker may describe MULTIPLE separate issues. You MUST find and report on EVERY single issue separately. Never combine issues or skip any.
3. Always cite the specific Article and Section number.
4. Always explain what the contract says even if no violation exists.
5. Use only the contract language provided - no general labor law.
6. Be thorough - missing a violation helps the company, not the worker.
7. Focus ONLY on what the company did WRONG. Do not praise or validate company actions. If no violation exists on an issue, state it briefly and move on.

MANDATORY VIOLATION TRIGGERS - Before analyzing, scan the worker's complaint for these keywords and situations. If found, you MUST check the corresponding articles:

HOURS & GUARANTEE VIOLATIONS:
- Article 60 (Daily 8-Hour Guarantee) MATH RULE: Only flag if total hours worked is LESS THAN 8. 
  * "sent home at 9 hours" = 9 > 8 = NO VIOLATION
  * "sent home at 7 hours" = 7 < 8 = VIOLATION
  * "sent home at 8 hours" = 8 = 8 = NO VIOLATION  
  * "only worked 6 hours" = 6 < 8 = VIOLATION
  * "worked 10 hours" = 10 > 8 = NO VIOLATION
  Always extract the actual number of hours mentioned and compare to 8. If hours >= 8, Article 60 is NOT violated. If hours < 8 or no hours mentioned but worker says "sent home early/cut short/didn't get my 8", flag as violation.
- If the worker is a FEEDER DRIVER and mentions working or driving more than 14 hours in a day -> ALWAYS flag Article 18 AND FMCSA 14-Hour Rule violation. Driving or being on-duty past 14 consecutive hours is both a contract and federal safety violation. Remedy: cease and desist, review of driving logs.
- If the worker is a PACKAGE CAR DRIVER (NOT a Feeder Driver) and is on the 9.5 LIST and mentions being dispatched over 9.5 hours THREE OR MORE times in a single workweek -> ALWAYS flag Article 37 (Excessive Dispatch / 9.5 Violation). Remedy is TRIPLE TIME (3x their hourly rate) for all hours worked over 9.5 on those days. NOTE: The 9.5 list does NOT apply to Feeder Drivers - do not flag this for Feeder Drivers.
- If the worker is a FEEDER DRIVER and mentions excessive hours, check the 14-hour FMCSA rule and Article 18 instead.

KEYWORD TRIGGERS - If any of these words or phrases appear in the complaint, ALWAYS check the corresponding articles:
- "Sleeper Team", "sleeper", "team run", "premium service" -> Check Article 43 (Sleeper Team Operations - mileage minimums, rest rotation requirements, cab specifications, layover pay)
- "foreign power", "vendor trailer", "outside truck", "non-UPS equipment", "contractor", "subcontract" -> Check Article 26 AND Article 32 (Subcontracting and Outsourcing - work that belongs to bargaining unit employees being given to outside vendors)
- "red tag", "DVIR", "vehicle inspection", "unsafe", "refused to drive", "mechanical issue", "breakdown" -> Check Article 18 (Safety - right to refuse unsafe work, equipment standards, DVIR requirements)
- "bypass", "bypassed", "skipped over", "passed over", "junior driver got the run", "less senior" -> Check Article 48 (Seniority - employees must be offered work in seniority order; bypassing a senior employee is a violation)
- "grievance retaliation", "punished for filing", "targeted after grievance" -> Check Article 37 (Non-discrimination / Retaliation)
- "worked through lunch", "no meal period", "skipped break" -> Check Article 51 (Meal Period requirements)
- "paid wrong rate", "short check", "missing pay" -> Check Article 17 (Paid for Time / Wage violations)

CRITICAL COGNITIVE LAYER - READ THIS BEFORE ANALYZING:
- THE DECONSTRUCTION MANDATE: Workers often write in short, compressed sentences (e.g., "My run was cut. A junior man took my trailer. Sent home before 8."). You MUST process every single action verb or noun clause as a potential independent violation.
- Rule A: If the text mentions a "junior" person getting work, a trailer, or a run -> That is automatically a separate Seniority Bypass issue. Evaluate Article 48.
- Rule B: If the text mentions a run being "cut" or being "sent home" early -> That is automatically a separate Daily Guarantee issue. Evaluate Article 60.
- NEVER let one rule cancel out the other. If both conditions are met in a single paragraph, you MUST output TWO completely separate issue blocks.

WORKER DETAILS:
Classification: ${classification}
Question/Complaint: "${question}"

CONTRACTS TO ANALYZE:
${contractText}

INSTRUCTIONS:
First, deconstruct the worker's complaint into EVERY separate issue using the Cognitive Layer above. Find ALL issues - do not stop after the first one.

Then for EACH issue found, provide a separate analysis block in this exact format:

---
ISSUE #[number]: [Name of the issue]
VERDICT: YES - VIOLATION FOUND or NO - NO VIOLATION
ARTICLES: [Specific Article and Section from Supplement and/or Master]
ANALYSIS: [If VIOLATION FOUND: detailed explanation of how contract was violated and what the company did wrong. If NO VIOLATION: one brief sentence only - do NOT elaborate or explain what the company did correctly]
WORKER RIGHTS: [If VIOLATION FOUND: what the worker is entitled to. If NO VIOLATION: omit this field entirely]
---

After analyzing ALL issues, end with:

OVERALL VERDICT: YES - VIOLATION FOUND (if any violations exist) or NO - NO VIOLATION
SUMMARY: [Brief summary of violations found and recommended next steps]`;

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
      max_tokens: 4096,
      temperature: 0
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
        generationConfig: { maxOutputTokens: 4096, temperature: 0 }
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
      max_tokens: 4096,
      temperature: 0
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
      max_tokens: 4096,
      temperature: 0
    })
  });
  const data = await response.json();
  if (response.status !== 200) throw new Error(data.error?.message || 'Cohere error');
  const text = data.message?.content?.[0]?.text;
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
      parameters: { max_new_tokens: 1024, temperature: 0 }
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
  if (!text) throw new Error('Empty HuggingFace response');
  // HF returns the full prompt + response, strip the prompt
  return text.replace(prompt, '').trim();
}

// 6. CEREBRAS - Fifth backup (free, very fast)
async function analyzeWithCerebras(prompt) {
  const key = process.env.CEREBRAS_API_KEY;
  if (!key) throw new Error('No Cerebras key');
  const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty Cerebras response');
  return text;
}

// 7. OPENROUTER - Sixth backup (free tier)
async function analyzeWithOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('No OpenRouter key');
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': 'https://foustbrothersllc-github-io-grievanc.vercel.app',
      'X-Title': 'Grievance AI'
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
      temperature: 0
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty OpenRouter response');
  return text;
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
        // Truncate each contract to 60,000 chars to stay within token limits
        const truncated = text.length > 100000 ? text.slice(0, 100000) + '\n...[contract continues]' : text;
        return `=== ${c.name} ===\n${truncated}`;
      })
    );
    const contractText = texts.join('\n\n');

    // Count issues in the question to add to prompt
    const issueCount = (question.match(/and|also|plus|additionally|furthermore|second|third|another/gi) || []).length + 1;
    const prompt = buildPrompt(question, classification, contractText, issueCount);

    const providers = [
      { name: 'Groq', fn: analyzeWithGroq },
      { name: 'Gemini', fn: analyzeWithGemini },
      { name: 'Cerebras', fn: analyzeWithCerebras },
      { name: 'OpenRouter', fn: analyzeWithOpenRouter },
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
