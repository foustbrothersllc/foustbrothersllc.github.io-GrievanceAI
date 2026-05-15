
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
SUPERVISOR: ${supervisor || 'unknown'}
DATE OF INCIDENT: ${dateOfIncident || 'the date of incident'}
RUN/LOAD: ${runLoad || 'N/A'}
CLASSIFICATION: ${classification}
ARTICLES VIOLATED: ${articleList}

VIOLATION ANALYSIS:
${violation}

WORKER'S ORIGINAL COMPLAINT:
${question}

Write professional, specific grievance language. Use the grievant's name. Reference the specific articles. Be concise and factual.

Respond in this EXACT format with no other text:
NATURE: [3-4 sentences describing what happened, naming the grievant, supervisor if known, date, and how the contract was violated]
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
        const natureMatch = text.match(/NATURE:\s*([\s\S]+?)(?=\nREMEDY:|$)/);
        const remedyMatch = text.match(/REMEDY:\s*([\s\S]+?)$/);
        return Response.json({
          nature: natureMatch?.[1]?.trim() || '',
          remedy: remedyMatch?.[1]?.trim() || '',
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
