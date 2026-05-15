async function callGroq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('No Groq key');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.2
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response');
  return text;
}

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('No Gemini key');
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.2 }
      })
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response');
  return text;
}

async function callMistral(prompt) {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new Error('No Mistral key');
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.2
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response');
  return text;
}

async function callCohere(prompt) {
  const key = process.env.COHERE_API_KEY;
  if (!key) throw new Error('No Cohere key');
  const response = await fetch('https://api.cohere.com/v2/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'command-r',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.2
    })
  });
  const data = await response.json();
  if (data.message) throw new Error(data.message);
  const text = data.message?.content?.[0]?.text;
  if (!text) throw new Error('Empty response');
  return text;
}

export async function POST(request) {
  try {
    const { grievantName, supervisor, dateOfIncident, runLoad, classification, articleList, violation, question } = await request.json();

    const prompt = `You are a Teamsters union representative writing a formal grievance form.

Using the following information, write the Nature of Grievance and Remedy Requested sections.

GRIEVANT: ${grievantName}
IMMEDIATE SUPERVISOR (who grievant reports to, not necessarily who committed the act): ${supervisor || 'unknown'}
DATE OF INCIDENT: ${dateOfIncident || 'the date of incident'}
RUN/LOAD: ${runLoad || 'N/A'}
CLASSIFICATION: ${classification}
ARTICLES VIOLATED: ${articleList}

VIOLATION ANALYSIS:
${violation}

WORKER'S ORIGINAL COMPLAINT:
${question}

Write professional, specific grievance language. Use the grievant's name. Reference the specific articles. Be concise and factual.
NOTE: The supervisor field is the grievant's immediate supervisor they report to - do NOT describe them as the person who committed the act.

Respond in this EXACT format with no other text:
NATURE: [3-4 sentences describing what happened, naming the grievant, the date, and how the contract was violated. Reference the supervisor as the immediate supervisor, not as the wrongdoer]
REMEDY: [2-3 sentences with specific remedy - make whole pay, cease and desist, etc.]`;

    const providers = [
      { name: 'Groq', fn: callGroq },
      { name: 'Gemini', fn: callGemini },
      { name: 'Mistral', fn: callMistral },
      { name: 'Cohere', fn: callCohere },
    ];

    const errors = [];
    for (const provider of providers) {
      try {
        const text = await provider.fn(prompt);
        // Try multiple parsing strategies
        let nature = '';
        let remedy = '';

        // Strategy 1: NATURE:/REMEDY: labels
        const natureMatch = text.match(/NATURE:\s*([\s\S]+?)(?=
REMEDY:|
REMEDY |$)/i);
        const remedyMatch = text.match(/REMEDY(?:\s+REQUESTED)?:\s*([\s\S]+?)$/i);
        if (natureMatch) nature = natureMatch[1].trim();
        if (remedyMatch) remedy = remedyMatch[1].trim();

        // Strategy 2: if no labels found, split in half
        if (!nature && !remedy) {
          const lines = text.split('
').filter(l => l.trim());
          const mid = Math.floor(lines.length / 2);
          nature = lines.slice(0, mid).join('
').trim();
          remedy = lines.slice(mid).join('
').trim();
        }

        // Strategy 3: if still empty, put everything in nature
        if (!nature) nature = text.trim();

        return Response.json({
          nature,
          remedy,
          provider: provider.name
        });
      } catch (err) {
        errors.push(`${provider.name}: ${err.message}`);
      }
    }

    return Response.json({ error: 'All providers failed: ' + errors.join(' | ') }, { status: 500 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
