export const runtime = 'nodejs';

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { text } = body;
    if (!text || !text.trim()) {
      return Response.json({ error: 'Missing text' }, { status: 400 });
    }

    // The kill switch is handled client-side via Firestore onSnapshot.
    // The button simply doesn't render when disabled — no need to check here.

    const key = process.env.GROQ_API_KEY;
    if (!key) {
      console.error('[spellcheck] No GROQ_API_KEY');
      return Response.json({ corrected: text, changed: false });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `Fix spelling and grammar in the following text. Follow these rules strictly:
- Correct spelling and grammar errors only
- Never change numbers, dates, times, or mileage figures
- Never change union or job terminology: feeder, RPCD, steward, DIAD, telematics, seniority, grievance, preload, combo, sleeper, tractor-trailer, layover, dispatch, hub, sorter, loader, unloader, bid, bump, roll, sleeper team, package car, air driver, combo worker
- Never add or remove any facts or details
- Never change the meaning or tone of the text
- If the text is already correct, return it exactly as-is
- Return ONLY the corrected text — no explanation, no quotes, no preamble, nothing else

Text: ${text}`
        }],
        max_tokens: 500,
        temperature: 0,
      })
    });

    const data = await response.json();
    const corrected = data.choices?.[0]?.message?.content?.trim();

    if (!corrected) {
      console.error('[spellcheck] Empty response from Groq');
      return Response.json({ corrected: text, changed: false });
    }

    return Response.json({ corrected, changed: corrected !== text });

  } catch (error) {
    console.error('[spellcheck] Error:', error.message);
    // Always return original text — never return empty string
    return Response.json({ corrected: body?.text || '', changed: false });
  }
}
