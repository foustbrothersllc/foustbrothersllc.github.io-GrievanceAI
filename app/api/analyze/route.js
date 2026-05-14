import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCdz8tNf7ponF5j1ZjxA155-PiLWkDBJF8");

export async function POST(request) {
  try {
    const { contractText } = await request.json();

    if (!contractText) {
      return Response.json(
        { error: "No contract text provided" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze this contract for potential labor law violations and issues:

${contractText}

Please provide:
1. A list of potential violations (type, description, section)
2. Compliant clauses (what's good)
3. A summary of findings

Format as JSON with this structure:
{
  "violations": [
    { "type": "violation type", "description": "description", "section": "section reference" }
  ],
  "compliant": ["clause 1", "clause 2"],
  "summary": "overall summary"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({
        violations: [],
        compliant: [],
        summary: text,
      });
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return Response.json(analysis);
  } catch (error) {
    console.error("Gemini API error:", error);
    return Response.json(
      { error: `Analysis failed: ${error.message}` },
      { status: 500 }
    );
  }
}
