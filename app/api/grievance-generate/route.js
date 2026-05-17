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
    const {
      grievantName,
      dateOfIncident,
      runLoad,
      classification,
      selectedArticles,
      violation,
      question
    } = await request.json();

    // Only use the articles the worker selected
    const articleList = selectedArticles && selectedArticles.length > 0
      ? selectedArticles.join(', ')
      : 'See violation analysis';

    // Extract only the violation sections from the full analysis
    // Filter out any ISSUE blocks that say NO - NO VIOLATION
    const violationSections = violation
      .split(/---+/)
      .filter(section => section.includes('YES - VIOLATION FOUND') || section.includes('VERDICT: YES'))
      .join('\n---\n')
      .trim();

    const relevantViolations = violationSections || violation;

    const prompt = `You are a Teamsters union representative writing a formal grievance form for Teamsters Local 391.

Using the following information, write ONLY the Nature of Grievance and Remedy Requested sections.

GRIEVANT: ${grievantName}
DATE OF INCIDENT: ${dateOfIncident || 'the date of incident'}
RUN/LOAD: ${runLoad || 'N/A'}
CLASSIFICATION: ${classification}
ARTICLES VIOLATED (use ONLY these articles - no others): ${articleList}

VIOLATIONS TO INCLUDE (IGNORE any issues marked as NO VIOLATION - only write about these confirmed violations):
${relevantViolations}

WORKER'S ORIGINAL COMPLAINT:
${question}

CRITICAL INSTRUCTIONS:
- Write ONLY about the confirmed violations above - do NOT mention any issues that were not violations
- Use ONLY the articles listed in ARTICLES VIOLATED above
- Use the grievant's name naturally in the nature of grievance
- Do NOT mention the supervisor unless they were specifically named in the worker's original complaint
- Be professional, specific, and factual

Respond in this EXACT format with no other text before or after:
NATURE: [3-4 sentences in first person describing ONLY the confirmed violations, naming the grievant, the date, and which specific articles were violated]
REMEDY: [2-3 sentences with specific remedy for ONLY the confirmed violations - make whole pay, cease and desist, back pay, or other appropriate remedies]`;

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

        const natureMatch = text.match(/NATURE:\s*([\s\S]+?)(?=\nREMEDY:|\nREMEDY |$)/i);
        const remedyMatch = text.match(/REMEDY(?:\s+REQUESTED)?:\s*([\s\S]+?)$/i);
        if (natureMatch) nature = natureMatch[1].trim();
        if (remedyMatch) remedy = remedyMatch[1].trim();

        if (!nature && !remedy) {
          const lines = text.split('\n').filter(l => l.trim());
          const mid = Math.floor(lines.length / 2);
          nature = lines.slice(0, mid).join('\n').trim();
          remedy = lines.slice(mid).join('\n').trim();
        }

        if (!nature) nature = text.trim();

        return Response.json({ nature, remedy, provider: provider.name });
      } catch (err) {
        errors.push(`${provider.name}: ${err.message}`);
      }
    }

    return Response.json({ error: 'All providers failed: ' + errors.join(' | ') }, { status: 500 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
