import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAKlt8Ulle36RA-wlfM04z2Lyg3MSJGF2U");

export async function POST(request) {
  try {
    const { contracts, classification, question } = await request.json();

    if (!contracts || !classification || !question) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Format all contracts
    const contractsText = contracts.map(c => `Contract: ${c.name}\n${c.text}`).join('\n\n---\n\n');

    const prompt = `You are a labor law expert. A ${classification} is asking the following question about their union contract:

Question: ${question}

Here are all the contracts on file:

${contractsText}

Based on these contracts, answer:
1. Does this question reveal a violation? (YES or NO)
2. Which contract clause applies?
3. Brief explanation

Format your response as:
VIOLATION: YES/NO
CLAUSE: [contract name and relevant clause]
EXPLANATION: [brief explanation]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    return Response.json({ analysis: text });
  } catch (error) {
    return Response.json({ error: `Analysis failed: ${error.message}` }, { status: 500 });
  }
}
