const CONTRACT_URLS = {
  master: 'https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/main/master-agreement.txt',
  local: 'https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/main/local-agreement.txt'
};

const ARTICLE_LOCATIONS = {
  master: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45'],
  local: ['46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69']
};

// Topic → article lookup map for natural language article requests
// Based on verified article headers from the actual contract txt files:
// LOCAL: 46=Seniority Acquisition, 47=Seniority For, 48=Seniority, 49=Grievance Procedure,
//        50=Discharge/Suspension, 51=Meal Period, 52=Paid For Time, 53=Wages & Hours,
//        54=Sundays & Holidays, 55=Vacations, 56=Union Cooperation, 57=Parking Tickets,
//        58=Uniforms, 59=Breakdowns, 60=Air Conditioning, 61=Health & Welfare,
//        62=Maintenance, 63=Part-Time, 64=Pay Period, 65=Maintenance of Standards,
//        66=Subcontracting, 67=Leave of Absence, 68=Sick Leave, 69=Term
// MASTER: 1=Parties, 2=Scope, 3=Recognition/Union Shop, 4=Stewards, 5=Sanitary,
//         6=Past Practice, 7=Grievance/Arbitration, 8=National Grievance, 9=Protection of Rights,
//         10=Loss/Damage, 11=Weekend Work, 12=Polygraph, 13=Passengers, 14=Compensation Claims,
//         15=Military, 16=Leave of Absence, 17=Paid for Time, 18=Safety & Health,
//         19=Posting, 20=Examination, 21=Union Activity, 22=Full-Time Combo/Part-Time,
//         23=Separation, 24=Inspection, 25=Separability, 26=Competition, 27=Emergency,
//         28=Sympathetic Action, 29=Jurisdictional, 30=Jurisdictional Disputes, 31=Garnishments,
//         32=Subcontracting, 33=COLA, 34=Health & Welfare, 35=Bail/License/Drug,
//         36=Nondiscrimination, 37=Management/Employee Relations (9.5/Harassment),
//         38=Change of Operations, 39=Trailer Repair, 40=Air Operation,
//         41=Full-Time Wages, 42=Uniforms, 43=Premium Services (Sleeper/Feeder),
//         44=Over 70 Pound, 45=Duration

const TOPIC_ARTICLE_MAP = [
  // Meal period — Local 51
  { topics: ['meal','lunch','break','food','eat','eating','meal period','rest period'], articles: ['local:51'] },
  // Wages / raises — Master 41 + Local 53
  { topics: ['raise','wage','pay increase','general wage','gwi','next raise','money','how much do i make','what will i make','when do i get','salary','wage rate'], articles: ['master:41','local:53'] },
  // Part-time wages — Master 22
  { topics: ['part time wage','part-time wage','part time pay','part-time pay','hub pay','preload pay','part time rate'], articles: ['master:22'] },
  // Harassment / dignity / 9.5 — Master 37
  { topics: ['harassment','dignity','respect','yelling','screaming','cursing','hostile','intimidat','coerce','9.5','excessive dispatch','over 9.5','triple time'], articles: ['master:37'] },
  // Seniority / bid — Local 46, 47, 48
  { topics: ['seniority','bypass','bypassed','junior driver','bid','bidding','bid run','seniority list','acquisition of seniority'], articles: ['local:46','local:47','local:48'] },
  // Grievance procedure — Local 49 + Master 7
  { topics: ['grievance','arbitration','panel','filing a grievance','grievance procedure','grievance timeline'], articles: ['master:7','local:49'] },
  // Stewards — Master 4
  { topics: ['steward','union rep','union business','shop steward'], articles: ['master:4'] },
  // Safety / equipment — Master 18
  { topics: ['safety','red tag','dvir','equipment','unsafe','fmcsa','mechanical','safety and health'], articles: ['master:18'] },
  // Health & welfare / pension — Master 34 + Local 61
  { topics: ['pension','health','insurance','benefits','welfare fund','teamcare','health and welfare'], articles: ['master:34','local:61'] },
  // Leave of absence — Master 16 + Local 67
  { topics: ['leave','fmla','leave of absence','military leave','personal leave','time off','sick leave'], articles: ['master:16','local:67','local:68'] },
  // Sleeper / premium services — Master 43
  { topics: ['sleeper','mileage','team run','sleeper team','premium service','layover','feeder run'], articles: ['master:43'] },
  // Subcontracting — Master 26 + 32 + Local 66
  { topics: ['subcontract','outside driver','foreign power','coyote','vendor trailer','contractor'], articles: ['master:26','master:32','local:66'] },
  // Drug test / DOT — Master 35
  { topics: ['drug test','dot physical','dot test','substance','random test','sap program'], articles: ['master:35'] },
  // Short check / missing pay — Master 17 + Local 52
  { topics: ['short check','missing pay','penalty pay','payroll','green check','short pay','48 hours','missing from my check','paid for time'], articles: ['master:17','local:52'] },
  // Workers comp — Master 14
  { topics: ['workers comp','injury','light duty','tast','on the job injury','compensation claim'], articles: ['master:14'] },
  // Past practice / maintenance of standards — Master 6 + Local 65
  { topics: ['past practice','maintenance of standards','local conditions'], articles: ['master:6','local:65'] },
  // Picket line — Master 9
  { topics: ['picket line','sympathy strike','struck goods'], articles: ['master:9'] },
  // Polygraph — Master 12
  { topics: ['polygraph','lie detector','interrogation'], articles: ['master:12'] },
  // Daily guarantee / sent home early — Local 53 + Master 22
  { topics: ['daily guarantee','8 hour guarantee','sent home early','guarantee','8 hours','wages and hours'], articles: ['local:53','master:22'] },
  // Part-time guarantee — Master 22 + Local 63
  { topics: ['part time guarantee','3.5 hours','hub guarantee','part-time employee'], articles: ['master:22','local:63'] },
  // COLA — Master 33
  { topics: ['cola','cost of living','cost-of-living'], articles: ['master:33'] },
  // Union membership — Master 3
  { topics: ['union shop','union membership','dues','check-off'], articles: ['master:3'] },
  // Scope / bargaining unit — Master 2
  { topics: ['bargaining unit','jurisdiction','scope','covered employee'], articles: ['master:2'] },
  // Probationary — Local 46
  { topics: ['probationary','new employee','seasonal','trial period'], articles: ['local:46'] },
  // Overtime / premium pay — Local 53 + Master 22
  { topics: ['overtime','double time','premium pay','hours of work'], articles: ['local:53','master:22'] },
  // Holidays — Local 54
  { topics: ['holiday','paid holiday','christmas','thanksgiving','labor day','memorial day','new years'], articles: ['local:54'] },
  // Vacations — Local 55
  { topics: ['vacation','vacation selection','personal day','floating holiday'], articles: ['local:55'] },
  // Discharge / suspension / discipline — Local 50 + Master 37
  { topics: ['discharge','suspension','discipline','fired','termination','warning letter'], articles: ['local:50','master:37'] },
  // Breakdown / impassable — Local 59
  { topics: ['breakdown','impassable','stuck','tow','road failure'], articles: ['local:59'] },
  // Nondiscrimination — Master 36
  { topics: ['discrimination','race','religion','gender','protected class','nondiscrimination'], articles: ['master:36'] },
  // Air operation — Master 40
  { topics: ['air driver','air operation','next day air','air rate'], articles: ['master:40'] },
  // Uniforms — Master 42 + Local 58
  { topics: ['uniform','clothing','appearance','dress code'], articles: ['master:42','local:58'] },
  // Pay period — Local 64
  { topics: ['pay period','payday','paycheck','direct deposit'], articles: ['local:64'] },
  // Change of operations — Master 38
  { topics: ['change of operations','hub closure','transfer of work','relocation'], articles: ['master:38'] },
];

// Keyword to article map for Q&A smart routing
const KEYWORD_ARTICLE_MAP = [
  { keywords: ['bargaining unit','union work','scope','jurisdiction'], articles: ['master:2'] },
  { keywords: ['union membership','dues','check-off','union security'], articles: ['master:3'] },
  { keywords: ['steward','grievance processing','union business'], articles: ['master:4'] },
  { keywords: ['past practice','maintenance of standards','local conditions'], articles: ['master:6','local:65'] },
  { keywords: ['grievance procedure','panel','arbitration','timelines','grievance timeline'], articles: ['master:7','local:49'] },
  { keywords: ['picket line','sympathy strike','struck goods'], articles: ['master:9'] },
  { keywords: ['polygraph','lie detector','interrogation'], articles: ['master:12'] },
  { keywords: ['workers comp','injury on duty','light duty','tast','compensation claim'], articles: ['master:14'] },
  { keywords: ['leave of absence','fmla','personal leave','military leave'], articles: ['master:16','local:67'] },
  { keywords: ['sick leave','sick day','sick time'], articles: ['local:68'] },
  { keywords: ['missing check','short pay','payroll shortage','48 hours','penalty pay','green check','short check','missing pay','paid wrong rate','paid for time'], articles: ['master:17','local:52'] },
  { keywords: ['red tag','dvir','unsafe','bad brakes','fmcsa','refused to drive','heat stress','forced to pull','ordered me to drive','threatened over a red tag','mechanical issue','breakdown'], articles: ['master:18'] },
  { keywords: ['9.5 list','9.5 violation','excessive dispatch','over 9.5','triple time','3x pay'], articles: ['master:37'] },
  { keywords: ['harassment','harassed','intimidated','coerced','over-supervised','hostile','screaming','yelling','cursing','threatened','dignity','retaliation'], articles: ['master:37'] },
  { keywords: ['discharge','suspension','fired','termination','warning letter','discipline'], articles: ['local:50'] },
  { keywords: ['foreign power','vendor trailer','outside truck','contractor','coyote','rail trailer'], articles: ['master:26','master:32','local:66'] },
  { keywords: ['pension','health insurance','medical benefits','welfare fund','health and welfare'], articles: ['master:34','local:61'] },
  { keywords: ['drug testing','dot physical','random test','sap program'], articles: ['master:35'] },
  { keywords: ['discrimination','nondiscrimination','race','religion','gender'], articles: ['master:36'] },
  { keywords: ['sleeper team','sleeper','team run','mileage rate','layover pay','under 550','550 miles','premium service'], articles: ['master:43'] },
  { keywords: ['bypass','bypassed','junior driver','less senior','seniority list','run given away'], articles: ['local:46','local:47','local:48'] },
  { keywords: ['worked through lunch','no meal period','skipped break','forced break','meal period','missed lunch'], articles: ['local:51','master:17'] },
  { keywords: ['sent home early','cut short','guarantee','8 hours','minimum hours','reported for work','daily guarantee','wages and hours'], articles: ['local:53','master:22'] },
  { keywords: ['raise','wage increase','pay increase','gwi','general wage','next raise','when do i get paid more','wage rate'], articles: ['master:41','local:53'] },
  { keywords: ['part time','part-time','hub pay','preload pay','part time employee'], articles: ['master:22','local:63'] },
  { keywords: ['cola','cost of living','cost-of-living'], articles: ['master:33'] },
  { keywords: ['holiday','paid holiday','christmas','thanksgiving','labor day'], articles: ['local:54'] },
  { keywords: ['vacation','vacation selection','personal day','floating holiday'], articles: ['local:55'] },
  { keywords: ['uniform','clothing','dress code','appearance'], articles: ['master:42','local:58'] },
  { keywords: ['breakdown','impassable','stuck','tow'], articles: ['local:59'] },
  { keywords: ['air driver','air operation','next day air'], articles: ['master:40'] },
  { keywords: ['pay period','payday','paycheck'], articles: ['local:64'] },
  { keywords: ['change of operations','hub closure','transfer of work'], articles: ['master:38'] },
];

// Compute today's date context for the AI
// Pay rates and raise amounts come from the contract text — only dates/timing are computed here
function getTodayContext() {
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const raiseDates = [
    { year: 2023, date: new Date('2023-08-01') },
    { year: 2024, date: new Date('2024-08-01') },
    { year: 2025, date: new Date('2025-08-01') },
    { year: 2026, date: new Date('2026-08-01') },
    { year: 2027, date: new Date('2027-08-01') },
  ];

  const appliedYears = raiseDates.filter(r => today >= r.date).map(r => r.year);
  const upcoming = raiseDates.filter(r => today < r.date);
  const nextRaise = upcoming[0] || null;

  let raiseContext = `RAISE DATES — amounts are in the contract text (Article 41 / Local Article 53):\n`;
  raiseContext += `  - Raises already effective: August 1 of ${appliedYears.join(', ')}\n`;

  if (nextRaise) {
    const daysUntil = Math.ceil((nextRaise.date - today) / (1000 * 60 * 60 * 24));
    raiseContext += `  - Next raise date: August 1, ${nextRaise.year}`;
    if (daysUntil > 0) {
      raiseContext += ` — ${daysUntil} days from today`;
    } else {
      raiseContext += ` — effective today or recently passed`;
    }
    raiseContext += `\n`;
    if (upcoming.length > 1) {
      raiseContext += `  - Future raise dates: ${upcoming.slice(1).map(r => `August 1, ${r.year}`).join('; ')}\n`;
    }
  }

  return `TODAY'S DATE: ${todayStr}
CONTRACT PERIOD: August 1, 2023 through July 31, 2028
${raiseContext}
IMPORTANT: Always answer as of today's date (${todayStr}). For pay rates and raise amounts, read them DIRECTLY from the contract text provided and state them clearly — the contract text is your source, use it. For timing questions, calculate from today's date above.`;
}

function extractArticleSection(text, articleNum, maxChars = 10000) {
  // We need to find the actual ARTICLE XX header, not a cross-reference like "Article 41, Section 2"
  // Standalone headers are always uppercase: "ARTICLE 41." or "ARTICLE 41—" or "ARTICLE 41\n"
  const upperText = text.toUpperCase();
  const searchStr = `ARTICLE ${articleNum}`;
  
  let start = -1;
  let searchFrom = 0;
  
  // Find the first occurrence that looks like a standalone header (all caps followed by . — or newline)
  while (searchFrom < upperText.length) {
    const idx = upperText.indexOf(searchStr, searchFrom);
    if (idx === -1) break;
    
    const charAfter = upperText[idx + searchStr.length];
    // Must not be followed by another digit (avoid matching 41 in 410)
    if (charAfter && /\d/.test(charAfter)) {
      searchFrom = idx + 1;
      continue;
    }
    
    // Check if this is an uppercase standalone header (not a cross-reference mid-sentence)
    // Look at the character before — if it's a letter, it's likely mid-sentence
    const charBefore = idx > 0 ? text[idx - 1] : '\n';
    if (charBefore !== '\n' && charBefore !== ' ' && charBefore !== '-') {
      searchFrom = idx + 1;
      continue;
    }
    
    // Check if the word "ARTICLE" is uppercase in the original text (standalone headers are uppercase)
    const originalSlice = text.slice(idx, idx + searchStr.length);
    if (originalSlice.toUpperCase() === originalSlice && originalSlice === originalSlice.toUpperCase()) {
      // It's uppercase — this is a standalone header
      start = idx;
      break;
    }
    
    searchFrom = idx + 1;
  }

  if (start === -1) return null;

  // Find the next standalone ARTICLE header
  let end = text.length;
  let searchFrom2 = start + searchStr.length + 1;
  while (searchFrom2 < upperText.length) {
    const nextIdx = upperText.indexOf('ARTICLE ', searchFrom2);
    if (nextIdx === -1) break;
    const afterArticle = upperText[nextIdx + 8];
    if (afterArticle && /\d/.test(afterArticle) && nextIdx > start + 50) {
      // Check it's an uppercase standalone header
      const origSlice = text.slice(nextIdx, nextIdx + 8);
      if (origSlice === 'ARTICLE ') {
        end = nextIdx;
        break;
      }
    }
    searchFrom2 = nextIdx + 1;
  }

  return text.slice(start, Math.min(end, start + maxChars)).trim();
}

// Pre-flight: detect if user is asking to VIEW an article (by number or topic)
function detectArticleLookup(question) {
  const q = question.toLowerCase().trim();

  const lookupTriggers = ['show me','pull up','read me','give me','display','let me see','can i see','can you show','can you pull'];
  const hasTrigger = lookupTriggers.some(t => q.includes(t));

  // Check for explicit article number mention — only when a number follows "article"
  const articleNumMatch = question.match(/article\s+(\d+)/i);
  if (articleNumMatch) {
    const num = articleNumMatch[1];
    const inMaster = ARTICLE_LOCATIONS.master.includes(num);
    const inLocal = ARTICLE_LOCATIONS.local.includes(num);
    if (inMaster || inLocal) {
      return {
        isLookup: true,
        articles: inMaster ? [`master:${num}`] : [`local:${num}`],
        label: `Article ${num}`
      };
    }
  }

  // Topic-based lookup — only fires when user has a clear "show/pull/read" trigger
  // OR uses phrasing like "the meal article" / "article about meal" / "meal section"
  const topicLookupPhrases = [
    'article about', 'section about', 'article on', 'section on',
    'the article', 'that article', 'the section', 'that section',
    'meal article', 'seniority article', 'harassment article', 'safety article',
    'raise article', 'wage article', 'break article', 'lunch article',
    'grievance article', 'pension article', 'leave article', 'sleeper article',
  ];
  const hasTopicPhrase = hasTrigger || topicLookupPhrases.some(p => q.includes(p));

  if (hasTopicPhrase) {
    for (const mapping of TOPIC_ARTICLE_MAP) {
      if (mapping.topics.some(t => q.includes(t))) {
        return {
          isLookup: true,
          articles: mapping.articles,
          label: mapping.topics[0]
        };
      }
    }
  }

  return { isLookup: false };
}

// Smart extraction for Q&A (only relevant articles)
function extractRelevantSections(masterText, localText, question, classification) {
  const questionLower = question.toLowerCase();
  const classificationLower = (classification || '').toLowerCase();
  const triggeredArticles = new Set();

  const isFullTime = ['feeder driver','package car driver','sleeper team','specialist','mechanic','combo worker'].some(
    ft => classificationLower.includes(ft)
  );

  // Always pull wages article for full-time, part-time pay for part-time
  if (isFullTime) {
    triggeredArticles.add('master:41');
    triggeredArticles.add('local:53');
  } else if (classification) {
    triggeredArticles.add('master:22');
  }

  // Also trigger wages if question mentions rate, pay, top rate, wage
  const wageWords = ['rate','top rate','pay','wage','salary','how much','what do i make','what am i paid'];
  if (wageWords.some(w => questionLower.includes(w))) {
    triggeredArticles.add('master:41');
    triggeredArticles.add('local:53');
  }

  for (const mapping of KEYWORD_ARTICLE_MAP) {
    if (mapping.keywords.some(kw => questionLower.includes(kw.toLowerCase()))) {
      mapping.articles.forEach(a => triggeredArticles.add(a));
    }
  }

  const explicitArticles = question.match(/article\s+(\d+)/gi) || [];
  explicitArticles.forEach(match => {
    const num = match.match(/\d+/)[0];
    if (ARTICLE_LOCATIONS.master.includes(num)) triggeredArticles.add(`master:${num}`);
    if (ARTICLE_LOCATIONS.local.includes(num)) triggeredArticles.add(`local:${num}`);
  });

  if (classificationLower.includes('feeder') || classificationLower.includes('sleeper')) {
    triggeredArticles.add('master:43');
    triggeredArticles.add('master:18');
  }
  if (classificationLower.includes('package')) {
    triggeredArticles.add('master:37');
  }

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

function buildQAPrompt(question, classification, contractText, todayContext) {
  return `You are a knowledgeable, plain-English Teamsters contract expert helping a UPS worker understand their rights. You answer questions clearly, accurately, and always from the worker's perspective.

${todayContext}

WORKER'S JOB CLASSIFICATION: ${classification || 'Not specified'}

CONTRACT LANGUAGE (relevant sections only):
${contractText}

STRICT RULES:
1. Answer as of TODAY's date — never describe raise schedules or timelines as if it's the beginning of the contract.
2. If asked about raises or pay: tell the member exactly what they have NOW and precisely when/what the next increase is, including the number of days away.
3. Always cite the exact Article and Section (and whether it's National Master or Atlantic Area Supplement).
4. Quote the relevant contract language briefly, then explain it in plain English.
5. If a question spans multiple articles, address each one in its own section.
6. Never give legal advice — you explain the contract, not legal strategy.
7. Be thorough and detailed. Do not give a short answer when more explanation would help the worker.

OUTPUT FORMAT — always structure your answer using these sections (skip any that do not apply):

📋 WHAT THE CONTRACT SAYS
Cite the exact Article and Section. Quote the key language directly.

📖 WHAT IT MEANS
Explain it in plain English. What does this mean day-to-day for the worker? Be thorough here.

⏱️ TIMING / DEADLINES
Any time limits, windows, or deadlines the worker needs to know about.

💰 PAY / REMEDY
Any pay rates, penalties, back pay, or premium rates that apply.

✅ WHAT YOU SHOULD DO
Practical next steps — what to say, who to contact, what to document.

⚠️ WATCH OUT FOR
Common ways management pushes back or tries to avoid this. What to look for.

WORKER'S QUESTION: ${question}

Answer thoroughly and in detail using the sections above:`;
}

// AI providers (same chain as analyze route)
async function queryWithGroq(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('No Groq key');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.1
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty Groq response');
  return text;
}

async function queryWithGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('No Gemini key');
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.1 }
      })
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return text;
}

async function queryWithCerebras(prompt) {
  const key = process.env.CEREBRAS_API_KEY;
  if (!key) throw new Error('No Cerebras key');
  const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.1
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty Cerebras response');
  return text;
}

async function queryWithOpenRouter(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('No OpenRouter key');
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty OpenRouter response');
  return text;
}

async function queryWithMistral(prompt) {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new Error('No Mistral key');
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty Mistral response');
  return text;
}

async function queryWithCohere(prompt) {
  const key = process.env.COHERE_API_KEY;
  if (!key) throw new Error('No Cohere key');
  const response = await fetch('https://api.cohere.ai/v1/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'command-r-plus',
      message: prompt,
      max_tokens: 2048,
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  const text = data.text;
  if (!text) throw new Error('Empty Cohere response');
  return text;
}

export async function POST(request) {
  try {
    const { classification, question } = await request.json();
    if (!question) {
      return Response.json({ error: 'Missing question' }, { status: 400 });
    }

    // Fetch both contracts
    const [masterText, localText] = await Promise.all([
      fetch(CONTRACT_URLS.master).then(r => r.text()),
      fetch(CONTRACT_URLS.local).then(r => r.text())
    ]);

    // PRE-FLIGHT: Is the user asking to VIEW an article?
    const lookupResult = detectArticleLookup(question);

    if (lookupResult.isLookup) {
      const articleSections = [];
      for (const articleRef of lookupResult.articles) {
        const [contract, artNum] = articleRef.split(':');
        const text = contract === 'master' ? masterText : localText;
        const contractName = contract === 'master' ? 'National Master UPS Agreement' : 'Atlantic Area Supplemental Agreement';
        const section = extractArticleSection(text, artNum);
        if (section) {
          articleSections.push({
            contractName,
            articleNum: artNum,
            text: section
          });
        }
      }

      if (articleSections.length === 0) {
        return Response.json({
          mode: 'lookup',
          found: false,
          label: lookupResult.label,
          message: `Could not find that article in the contract. Try asking by article number (e.g., "Show me Article 51") or rephrasing your topic.`
        });
      }

      return Response.json({
        mode: 'lookup',
        found: true,
        label: lookupResult.label,
        sections: articleSections
      });
    }

    // Q&A mode — pull relevant sections and query AI
    const contractText = extractRelevantSections(masterText, localText, question, classification);
    const todayContext = getTodayContext();
    const prompt = buildQAPrompt(question, classification, contractText, todayContext);

    const providers = [
      { name: 'Groq', fn: queryWithGroq },
      { name: 'Gemini', fn: queryWithGemini },
      { name: 'Cerebras', fn: queryWithCerebras },
      { name: 'OpenRouter', fn: queryWithOpenRouter },
      { name: 'Mistral', fn: queryWithMistral },
      { name: 'Cohere', fn: queryWithCohere },
    ];

    const errors = [];
    for (const provider of providers) {
      try {
        const answer = await provider.fn(prompt);
        return Response.json({
          mode: 'qa',
          answer,
          provider: provider.name
        });
      } catch (err) {
        errors.push(`${provider.name}: ${err.message}`);
      }
    }

    return Response.json({
      error: `All AI providers failed. Details: ${errors.join(' | ')}`
    }, { status: 500 });

  } catch (error) {
    return Response.json({ error: `Q&A failed: ${error.message}` }, { status: 500 });
  }
}
