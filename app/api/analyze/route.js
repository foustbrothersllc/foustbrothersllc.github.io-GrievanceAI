import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyBCsWv144FkqsorpXiTC4_3mRjejj7msoA");

export async function POST(request) {
  try {
    const { contracts, classification, question, contractText } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt;

    // Dashboard sends: contracts + classification + question
    if (contracts && classification && question) {
      const contractDump = contracts
        .map(c => `=== ${c.name} ===\n${c.text}`)
        .join('\n\n');

      prompt = `You are a labor relations expert specializing in UPS Teamsters contracts.

A worker has asked the following question:
"${question}"

Their job classification is: ${classification}

Here are the relevant contracts to analyze:
${contractDump}

Based ONLY on the contract language above, answer whether there is a violation.

Start your response with either:
- "YES - VIOLATION FOUND:" if the contract supports their claim
- "NO - NO VIOLATION:" if the contract does not support their claim

Then explain clearly and specifically what the contract says about this situation, citing the relevant section or language if possible. Keep it concise and in plain language a worker can understand.`;

    // Analyze page sends: contractText (legacy support)
    } else if (contractText) {
      prompt = `Analyze this contract for potential labor law violations:

${contractText}

Provide:
1. List of violations (type, description)
2. Summary of key issues

Format as JSON:
{
  "violations": [{"type": "...", "description": "..."}],
  "summary": "..."
}`;

    } else {
      return Response.json({ error: "No contract data provided" }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Dashboard expects { analysis: "..." }
    if (contracts && classification && question) {
      return Response.json({ analysis: text });
    }

    // Legacy analyze page expects { violations, summary }
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const analysis = JSON.parse(jsonMatch[0]);
      return Response.json(analysis);
    } catch {
      return Response.json({ violations: [], summary: text });
    }

  } catch (error) {
    return Response.json({ error: `Analysis failed: ${error.message}` }, { status: 500 });
  }
}
