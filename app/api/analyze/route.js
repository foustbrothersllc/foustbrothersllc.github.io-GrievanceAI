const CONTRACT_URLS = {
  master: 'https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/main/master-agreement.txt',
  local: 'https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/main/local-agreement.txt'
};

// Article location map - which contract each article lives in
const ARTICLE_LOCATIONS = {
  master: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45'],
  local: ['46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69']
};

// Keyword to article mapping for smart routing
const KEYWORD_ARTICLE_MAP = [
  { keywords: ['bargaining unit','union work','scope','jurisdiction'], articles: ['master:1'] },
  { keywords: ['union membership','dues','check-off','union security'], articles: ['master:3'] },
  { keywords: ['steward','grievance processing','union business'], articles: ['master:4'] },
  { keywords: ['past practice','maintenance of standards','local conditions'], articles: ['master:6'] },
  { keywords: ['grievance procedure','panel','arbitration','timelines'], articles: ['master:7'] },
  { keywords: ['picket line','sympathy strike','struck goods'], articles: ['master:9'] },
  { keywords: ['polygraph','lie detector','interrogation'], articles: ['master:12'] },
  { keywords: ['workers comp','injury on duty','light duty','tast'], articles: ['master:14'] },
  { keywords: ['leave of absence','fmla','personal leave','military leave'], articles: ['master:16'] },
  { keywords: ['missing check','short pay','payroll shortage','48 hours','penalty pay','green check','short check','missing pay','paid wrong rate'], articles: ['master:17'] },
  { keywords: ['red tag','dvir','unsafe','bad brakes','fmcsa','refused to drive','heat stress','ac unit','forced to pull','ordered me to drive','threatened over a red tag','mechanical issue','breakdown','truck is a piece of junk','broken down'], articles: ['master:18', 'master:37'] },
  { keywords: ['foreign power','vendor trailer','outside truck','contractor','coyote','rail trailer','brought in an outside guy','coyote truck'], articles: ['master:26','master:32'] },
  { keywords: ['subcontract','outsourcing','third party','peak season contractor'], articles: ['master:32'] },
  { keywords: ['pension','health insurance','medical benefits','welfare fund'], articles: ['master:34'] },
  { keywords: ['drug testing','dot physical','random test','sap program','discrimination'], articles: ['master:35'] },
  { keywords: ['harassment','harassed','intimidated','coerced','over-supervised','hostile','screaming','yelling','cursing','threatened','talked down to','dignity','retaliation','punished for filing','targeted','grievance retaliation','targeting me','out to get me'], articles: ['master:37'] },
  { keywords: ['9.5 list','9.5 violation','excessive dispatch','over 9.5','triple time','3x pay'], articles: ['master:37'] },
  { keywords: ['sleeper team','sleeper','team run','two man run','premium service','mileage rate','layover pay'], articles: ['master:43'] },
  { keywords: ['bypass','bypassed','skipped over','passed over','junior driver','less senior','seniority list','run given away','weekend call','junior driver got the run','junior got the run','skipped me','let a junior guy go','gave my run away'], articles: ['local:48'] },
  { keywords: ['worked through lunch','no meal period','skipped break','forced break','meal period','ate on the fly','no time to eat','supervisor rushed my break'], articles: ['local:51'] },
  { keywords: ['sent home early','cut short','guarantee','8 hours','minimum hours','reported for work','daily guarantee','didnt get my 8','sent home','forced home','wanted more work','forced to go home','they made me leave',"didn't get my 8","didn't get my time",'cut me short'], articles: ['local:60', 'master:22'] },
  { keywords: ['3.5 hours','part time guarantee','hub guarantee'], articles: ['master:22'] },
  { keywords: ['air conditioning','ac heat in cab'], articles: ['local:60'] },
];

// Extract a specific article section from contract text
function extractArticleSection(text, articleNum, maxChars = 8000) {
  const patterns = [
    new RegExp(`ARTICLE\\s+${articleNum}[—\\-\\.\\s]`, 'i'),
    new RegExp(`Article\\s+${articleNum}[—\\-\\.\\s]`, 'i'),
  ];
  
  let start = -1;
  for (const pattern of patterns) {
    const match = text.search(pattern);
    if (match !== -1) { start = match; break; }
  }
  
  if (start === -1) return null;
  
  // Find the next article header to determine end
  const nextArticlePattern = /ARTICLE\s+\d+[—\-\.\s]/gi;
  nextArticlePattern.lastIndex = start + 10;
  let end = text.length;
  let nextMatch;
  while ((nextMatch = nextArticlePattern.exec(text)) !== null) {
    if (nextMatch.index > start + 50) {
      end = nextMatch.index;
      break;
    }
  }
  
  const section = text.slice(start, Math.min(end, start + maxChars));
  return section.trim();
}

// Smart contract extraction - only pull relevant article sections
function extractRelevantSections(masterText, localText, question, classification) {
  const questionLower = question.toLowerCase();
  const triggeredArticles = new Set();
  
  // Always include core articles based on classification
  const isFullTime = ['Feeder Driver', 'Package Car Driver', 'Sleeper Team', 'Specialist', 'Mechanic', 'Combo Worker'].some(
    ft => classification.toLowerCase().includes(ft.toLowerCase())
  );
  
  if (isFullTime) {
    triggeredArticles.add('local:60'); // Full-time Daily Guarantee (Atlantic Area Supplement)
  } else {
    triggeredArticles.add('master:22'); // Part-time guarantee (National Master)
  }
  triggeredArticles.add('local:48'); // Seniority
  
  // Check keyword triggers
  for (const mapping of KEYWORD_ARTICLE_MAP) {
    if (mapping.keywords.some(kw => questionLower.includes(kw.toLowerCase()))) {
      mapping.articles.forEach(a => triggeredArticles.add(a));
    }
  }
  
  // Check for explicit article mentions in question
  const explicitArticles = question.match(/article\s+(\d+)/gi) || [];
  explicitArticles.forEach(match => {
    const num = match.match(/\d+/)[0];
    const inMaster = ARTICLE_LOCATIONS.master.includes(num);
    const inLocal = ARTICLE_LOCATIONS.local.includes(num);
    if (inMaster) triggeredArticles.add(`master:${num}`);
    if (inLocal) triggeredArticles.add(`local:${num}`);
  });

  // Classification-specific triggers
  if (classification.toLowerCase().includes('feeder')) {
    triggeredArticles.add('master:43'); // Sleeper teams
    triggeredArticles.add('master:18'); // FMCSA/Safety
  }
  
  // Extra FMCSA keyword triggers
  const fmcsaKeywords = ['14 hours','been out all day','driving forever','worked me to death','killed me with hours','forced over'];
  if (fmcsaKeywords.some(kw => questionLower.includes(kw))) {
    triggeredArticles.add('master:18');
  }
  if (classification.toLowerCase().includes('package')) {
    triggeredArticles.add('master:37'); // 9.5 list
  }

  // Build the relevant text
  const sections = [];
  
  for (const articleRef of triggeredArticles) {
    const [contract, artNum] = articleRef.split(':');
    const text = contract === 'master' ? masterText : localText;
    const contractName = contract === 'master' ? 'National Master UPS Agreement' : 'Atlantic Area Supplemental Agreement';
    
    const section = extractArticleSection(text, artNum);
    if (section) {
      sections.push(`=== ${contractName} — Article ${artNum} ===\n${section}`);
    }
  }
  
  return sections.join('\n\n');
}

const buildPrompt = (question, classification, contractText) => `You are a strict, highly analytical Labor Relations Expert and Teamster Shop Steward. Your sole purpose is to protect the worker by identifying contract and safety violations. You do not compromise, you do not make assumptions for the employer, and you do not let minor details slide.

The Atlantic Area Supplemental Agreement ALWAYS takes precedence over the National Master Agreement. Check Supplement first. Both can apply simultaneously - cite BOTH when relevant.

CONTRACT KEYWORD MAP - Use this as your primary routing index:
Article 1 (Bargaining Unit): bargaining unit, union work, scope, covered employees, jurisdiction
Article 3 (Union Shop): union membership, dues, check-off, union security
Article 4 (Stewards): steward rights, grievance processing, union business
Article 6 (Maintenance of Standards): past practice, local conditions, protection of conditions
Article 7 (Grievance Machinery): grievance procedure, panel, arbitration, timelines
Article 9 (Protection of Rights): picket line, sympathy strike, struck goods
Article 12 (Polygraph): polygraph, lie detector, interrogation
Article 14 (Compensation Claims): workers comp, injury on duty, light duty, TAST
Article 16 (Leave of Absence): leave of absence, FMLA, personal leave, military leave
Article 17 (Paid for Time): missing check, short pay, payroll shortage, 48 hours, penalty pay, green check
Article 18 (Safety/Equipment): red tag, DVIR, unsafe, bad brakes, FMCSA, refused to drive, heat stress, forced to pull, ordered to drive, threatened over red tag
Article 26 (Subcontracting/Feeder): foreign power, vendor trailer, outside truck, contractor, coyote, rail trailer
Article 32 (Subcontracting): outsourcing, third party logistics, peak season contractors
Article 34 (Health/Pension): pension, health insurance, medical benefits, welfare fund
Article 35 (Non-Discrimination/Substance): discrimination, SAP program, drug testing, DOT physical
Article 37 Section 1 (Dignity/Respect): harassment, harassed, intimidated, coerced, over-supervised, hostile, screaming, yelling, cursing, threatened, talked down to, retaliation
Article 37 Section 1(b) (9.5 Over-Dispatch): 9.5 list, excessive dispatch, over 9.5 hours, triple time - PACKAGE CAR ONLY
Article 43 (Sleeper Teams): sleeper team, team run, premium service, mileage rate, layover pay
Article 48 (Seniority/Dispatch) [ATLANTIC AREA SUPPLEMENT]: bypass, bypassed, junior driver, less senior, seniority list, run given away
Article 51 (Meal/Breaks) [ATLANTIC AREA SUPPLEMENT]: worked through lunch, no meal period, skipped break, forced break
Article 60 (Daily Guarantee - Full-Time) [ATLANTIC AREA SUPPLEMENT]: sent home early, cut short, 8 hours, minimum hours, reported for work, daily guarantee - FOR FEEDER DRIVERS AND PACKAGE CAR DRIVERS
Article 22 (Daily Guarantee - Part-Time) [NATIONAL MASTER]: part-time guarantee, 3.5 hours, hub worker, sent home early - FOR PART-TIME EMPLOYEES

SAFETY NET ROUTER: If the worker explicitly names ANY article number, audit it regardless of keywords.

SYSTEM GUARDRAIL - JOB DISPLACEMENT & SENIORITY TIE-BREAKERS (ARTICLES 48 & 60):

1. BID PROTECTION RULE:
- If a driver has a regular scheduled or bid run, management CANNOT arbitrarily remove them from that run to perform other work while giving their bid work to a junior or on-call cover driver.
- Exception: Certified Hot Loads or emergency network service failures ONLY.
- If management displaces a driver from their bid run without a certified emergency -> flag as a direct CONTRACT VIOLATION under Article 48.

2. SENIORITY TIE-BREAKER RULE:
- If two employees share the EXACT same seniority date, management CANNOT decide on-the-spot who is senior based on preference, desires, or shift arrival.
- Ties must be broken strictly in this sequence:
  * Step A: Date of achieving the 30th worked day (gaining seniority)
  * Step B: Date on the original employment application
  * Step C: Official coin toss or drawing of lots with a shop steward present
- If management allows a driver with an identical start date to claim extra work or displace another driver WITHOUT proving a valid pre-established tie-breaker -> flag as a direct SENIORITY VIOLATION under Article 48.

CRITICAL ENFORCEMENT RULES:
- ARTICLE 37 ENFORCEMENT: Yelling, cursing, screaming, or threatening a worker ANYWHERE is an immediate Article 37 violation. Flip verdict to YES immediately.
- ORIGIN BOOK ACCURACY: Article 48 and Article 52 (Daily Guarantee) are ATLANTIC AREA SUPPLEMENT articles. NEVER label them as National Master Agreement provisions.
- ARTICLE 18 CROSS-REFERENCE: If management threatened or coerced a worker to operate unsafe equipment, flag BOTH Article 18 AND Article 37 as separate violations.
- DAILY GUARANTEE MATH RULE: For full-time employees (Feeder Driver, Package Car Driver) use Article 60 Atlantic Area Supplement - only flag if hours worked < 8. For part-time employees use Article 22 National Master - only flag if hours worked < 3.5. Always extract the actual number of hours and compare to the correct threshold for that classification.
- 9.5 LIST: Only applies to PACKAGE CAR DRIVERS. NEVER apply to Feeder Drivers.
- FEEDER DRIVERS over 14 hours on-duty: Flag Article 18 AND FMCSA 14-Hour Rule.

WORKER DETAILS:
Classification: ${classification}
Question/Complaint: "${question}"

RELEVANT CONTRACT SECTIONS (extracted for this specific complaint):
${contractText}

Follow this exact 3-Step Audit Protocol:

STEP 1 - COMPRESSED SENTENCE DECONSTRUCTION:
Treat EVERY clause, action verb, or noun as a separate potential legal claim.
- Junior employee getting work/equipment -> Seniority Bypass (Article 48)
- Worker cut short/sent home/denied hours -> Daily Guarantee (Article 52)
- Yelling, cursing, threatening -> Dignity and Respect (Article 37)
NEVER combine distinct issues. Output separate numbered blocks for each.

STEP 2 - LOGIC OVER TEXT:
Treat complaints about different days as independent events. Never let math from one day erase a claim from another day.

STEP 3 - RIGID OUTPUT (no pleasantries, no filler, start immediately):

For EACH issue found output EXACTLY:

---
ISSUE #[number]: [Precise Name of the Contractual Infraction]
VERDICT: YES - VIOLATION FOUND or NO - NO VIOLATION
ARTICLES: [Cite specific Article and Section - correctly label National Master or Atlantic Area Supplement]
ANALYSIS: [Quote the exact contract language verbatim in quotation marks first. Then state what management did. Then explain why it is a violation. If NO VIOLATION: one brief sentence only.]
WORKER RIGHTS: [If VIOLATION FOUND: specific remedy, back-pay, premium rates owed. If NO VIOLATION: omit entirely.]
---

OVERALL VERDICT: YES - VIOLATION FOUND (if any single issue was a violation) or NO - NO VIOLATION
SUMMARY: [Two sentences: all violations found and immediate proof/evidence the steward needs to collect.]`;

// AI provider functions
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

async function analyzeWithMistral(prompt) {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new Error('No Mistral key');
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'mistral-small-latest',
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

async function analyzeWithHuggingFace(prompt) {
  const key = process.env.HUGGINGFACE_API_KEY;
  if (!key) throw new Error('No HuggingFace key');
  const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 2048, temperature: 0.1 }
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
  if (!text) throw new Error('Empty HuggingFace response');
  return text.replace(prompt, '').trim();
}

export async function POST(request) {
  try {
    const { classification, question } = await request.json();
    if (!classification || !question) {
      return Response.json({ error: 'Missing classification or question' }, { status: 400 });
    }

    // Fetch both contracts
    const [masterText, localText] = await Promise.all([
      fetch(CONTRACT_URLS.master).then(r => r.text()),
      fetch(CONTRACT_URLS.local).then(r => r.text())
    ]);

    // Smart extraction - only pull relevant article sections
    const contractText = extractRelevantSections(masterText, localText, question, classification);

    const providers = [
      { name: 'Groq', fn: analyzeWithGroq },
      { name: 'Gemini', fn: analyzeWithGemini },
      { name: 'Cerebras', fn: analyzeWithCerebras },
      { name: 'OpenRouter', fn: analyzeWithOpenRouter },
      { name: 'Mistral', fn: analyzeWithMistral },
      { name: 'Cohere', fn: analyzeWithCohere },
      { name: 'HuggingFace', fn: analyzeWithHuggingFace },
    ];

    const prompt = buildPrompt(question, classification, contractText);
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
