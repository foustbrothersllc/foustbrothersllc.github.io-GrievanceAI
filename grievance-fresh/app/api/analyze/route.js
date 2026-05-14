import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAKlt8Ulle36RA-wlfM04z2Lyg3MSJGF2U");

export async function POST(request) {
  try {
    const { contractText } = await request.json();

    if (!contractText) {
      return Response.json({ error: "No contract text provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze this contract for potential labor law violations:

${contractText}

Provide:
1. List of violations (type, description)
2. Summary of key issues

Format as JSON:
{
  "violations": [{"type": "...", "description": "..."}],
  "summary": "..."
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const analysis = JSON.parse(jsonMatch[0]);
      return Response.json(analysis);
    } catch {
      return Response.json({
        violations: [],
        summary: text
      });
    }
  } catch (error) {
    return Response.json({ error: `Analysis failed: ${error.message}` }, { status: 500 });
  }
}
