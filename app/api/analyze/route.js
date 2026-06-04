const CONTRACT_URLS = {
  master: 'https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/main/master-agreement.txt',
  local: 'https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/main/local-agreement.txt'
};

// Article location map - which contract each article lives in
const ARTICLE_LOCATIONS = {
  master: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45'],
  local: ['46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69']
};

// ============================================================
// MASTER CONTRACT SEARCH INDEX (Table of Contents)
// Maps topic keywords → article, anchor code, and line baseline
// Used for accurate routing AND prompt citation
// ============================================================
const CONTRACT_SEARCH_INDEX = [
  // National Master Freight Index
  { topics: ['subcontracting','subcontract','outside work','jurisdiction','scope','covered employees','bargaining unit'], contract: 'master', article: '1', section: 'Preamble', lineRef: 'L-0045', anchor: 'REF:NMFA-A01-SUB' },
  { topics: ['double bottoms','doubles pay','twin trailers','double trailer'], contract: 'master', article: '1', section: 'Sec 8', lineRef: 'L-0322', anchor: 'REF:NMFA-A01-DBL' },
  { topics: ['seniority rights','general seniority','seniority order'], contract: 'master', article: '5', section: null, lineRef: 'L-0850', anchor: 'REF:NMFA-A05-SEN' },
  { topics: ['grievance','arbitration','grievance procedure','panel','filing a grievance','deadlock','timelines'], contract: 'master', article: '7', section: null, lineRef: 'L-1200', anchor: 'REF:NMFA-A07-GRV' },
  { topics: ['picket line','sympathy strike','struck goods','protection of rights'], contract: 'master', article: '9', section: null, lineRef: 'L-1650', anchor: 'REF:NMFA-A09-PIC' },
  { topics: ['bond','bonds','security deposit','cash bond'], contract: 'master', article: '11', section: null, lineRef: 'L-1920', anchor: 'REF:NMFA-A11-BND' },
  { topics: ['passenger','riding restriction','passenger in cab','rider','unauthorized passenger'], contract: 'master', article: '14', section: null, lineRef: 'L-2100', anchor: 'REF:NMFA-A14-PAS' },
  { topics: ['equipment','safety standards','safety equipment','unsafe equipment','red tag','dvir','mechanical','fmcsa','refused to drive'], contract: 'master', article: '16', section: null, lineRef: 'L-2400', anchor: 'REF:NMFA-A16-SFT' },
  { topics: ['health','welfare','health and welfare','benefits','insurance','medical','teamcare'], contract: 'master', article: '22', section: null, lineRef: 'L-3100', anchor: 'REF:NMFA-A22-HLT' },
  { topics: ['pension','pension plan','pension contribution','retirement'], contract: 'master', article: '23', section: null, lineRef: 'L-3500', anchor: 'REF:NMFA-A23-PEN' },

  // Atlantic Area Supplemental Index
  { topics: ['probationary period','new hire','new employee','trial period','30 working days','90 days','seniority acquisition'], contract: 'local', article: '46', section: 'Sec 1', lineRef: 'L-4200', anchor: 'REF:ATLA-A46-PROB' },
  { topics: ['local seniority','bidding','bid','seniority bidding','route bid','run bid','posting'], contract: 'local', article: '47', section: null, lineRef: 'L-4450', anchor: 'REF:ATLA-A47-SEN' },
  { topics: ['meal period','lunch','meal break','break scheduling','meal window','lunch window'], contract: 'local', article: '51', section: 'Sec 1', lineRef: 'L-5100', anchor: 'REF:ATLA-A51-MEAL' },
  { topics: ['meal split','tractor trailer meal','split meal','team meal'], contract: 'local', article: '51', section: 'Sec 3', lineRef: 'L-5135', anchor: 'REF:ATLA-A51-SPLIT' },
  { topics: ['worked through lunch','no meal period','worked 6 hours straight','worked 7 hours straight','skipped break','missed lunch','forced break','no break','no food','late break','straight through','ate on the fly'], contract: 'local', article: '51', section: null, lineRef: 'L-5150', anchor: 'REF:ATLA-A51-VIOL' },
  { topics: ['overtime','workweek guarantee','work week','40 hour week','8 hour day','daily guarantee','sent home early','cut short','minimum hours','guarantee','8 hours'], contract: 'local', article: '52', section: null, lineRef: 'L-5400', anchor: 'REF:ATLA-A52-OVT' },
  { topics: ['vacation','vacation accrual','vacation eligibility','vacation selection','vacation pay'], contract: 'local', article: '57', section: null, lineRef: 'L-6200', anchor: 'REF:ATLA-A57-VAC' },
  { topics: ['sick leave','personal day','personal holiday','floating holiday','sick day','personal time'], contract: 'local', article: '60', section: null, lineRef: 'L-6800', anchor: 'REF:ATLA-A60-SCK' },
  { topics: ['holiday pay','holiday','paid holiday','holiday qualifier','working on holiday','christmas','thanksgiving','labor day','memorial day','new years','fourth of july','independence day'], contract: 'local', article: '62', section: null, lineRef: 'L-7100', anchor: 'REF:ATLA-A62-HOL' },
  { topics: ['doubles run','doubles letter','sick leave doubles','doubles sick'], contract: 'local', article: '69', section: null, lineRef: 'L-7900', anchor: 'REF:ATLA-A69-DBL' },
  // Bump and Roll / Seniority Displacement
  { topics: ['bump and roll','bumping','bump a junior','rolling a junior','roll a junior','losing a bid','lost my bid','bid abolished','bid eliminated','reduction of force','layoff displacement','seniority displacement','displace a junior','exercising seniority'], contract: 'local', article: '47', section: null, lineRef: 'L-4450', anchor: 'REF:ATLA-A47-ROLL' },
  { topics: ['bump and roll','bumping','reduction of force','layoff displacement','seniority displacement'], contract: 'master', article: '5', section: null, lineRef: 'L-0850', anchor: 'REF:NMFA-A05-SEN' },
  // Sleeper Mileage / Two-Man Rate
  { topics: ['sleeper pay','sleeper mileage','sleeper mileage rate','two man split','two-man split','mileage rate','sleeper rate','schedule b','otr rate','over the road rate','total truck rate','earning while resting','berth pay'], contract: 'master', article: '43', section: null, lineRef: 'L-NMFA-OTR', anchor: 'REF:NMFA-OTR-RATE' },
];

// Keyword to article mapping for smart routing
const KEYWORD_ARTICLE_MAP = [
  { keywords: ['bargaining unit','union work','scope','jurisdiction','subcontracting','subcontract'], articles: ['master:1'] },
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
  { keywords: ['sleeper team','sleeper','team run','two man run','premium service','mileage rate','layover pay','miles less than 550','under 550','550 miles','short miles','short run','short trip','mileage short','paid wrong mileage','mileage dispute','not enough miles','run was short'], articles: ['master:43'] },
  { keywords: ['bypass','bypassed','skipped over','passed over','junior driver','less senior','seniority list','run given away','weekend call','junior driver got the run','junior got the run','skipped me','let a junior guy go','gave my run away'], articles: ['local:48'] },
  { keywords: ['worked through lunch','no meal period','skipped break','forced break','meal period','ate on the fly','no time to eat','supervisor rushed my break','lunch hour','worked 6 hours straight','worked 7 hours straight',"didn't eat until my 6th hour",'ate late','no lunch until','late break','worked 6 hours without a break','worked 7 hours without a break','no food','missed lunch','straight through'], articles: ['local:51', 'master:17'] },
  { keywords: ['sent home early','cut short','guarantee','8 hours','minimum hours','reported for work','daily guarantee','didnt get my 8','sent home','forced home','wanted more work','forced to go home','they made me leave',"didn't get my 8","didn't get my time",'cut me short'], articles: ['local:60', 'master:22'] },
  { keywords: ['3.5 hours','part time guarantee','hub guarantee'], articles: ['master:22'] },
  { keywords: ['air conditioning','ac heat in cab'], articles: ['local:60'] },
  // TOC-driven additions
  { keywords: ['double bottoms','doubles pay','twin trailers','double trailer'], articles: ['master:1'] },
  { keywords: ['bond','bonds','security deposit','cash bond'], articles: ['master:11'] },
  { keywords: ['passenger','riding restriction','passenger in cab','rider','unauthorized passenger'], articles: ['master:14'] },
  { keywords: ['vacation','vacation accrual','vacation selection','vacation pay'], articles: ['local:57'] },
  { keywords: ['sick leave','sick day'], articles: ['local:60'] },
  { keywords: ['holiday pay','holiday','paid holiday','working on holiday','christmas','thanksgiving','labor day','memorial day','new years','fourth of july','independence day'], articles: ['local:62'] },
  { keywords: ['doubles run','doubles letter','sick leave doubles'], articles: ['local:69'] },
  { keywords: ['probationary period','new hire','30 working days','90 days','seniority acquisition'], articles: ['local:46'] },
  { keywords: ['local seniority','route bid','run bid','bid posting'], articles: ['local:47'] },
  { keywords: ['overtime','workweek guarantee','40 hour week'], articles: ['local:52'] },
  // Bump and Roll guardrail
  { keywords: ['bump and roll','bumping','bump a junior','rolling a junior','roll a junior','losing a bid','lost my bid','bid abolished','bid eliminated','reduction of force','layoff displacement','seniority displacement','displace a junior','exercising seniority','chain reaction bump','bump chain'], articles: ['local:47','master:5'] },
  // Sleeper Mileage guardrail
  { keywords: ['sleeper pay','sleeper mileage rate','two man split','two-man split','total truck rate','schedule b','otr rate','over the road rate','earning while resting','berth pay','solo exception','partner incapacitated','split rate','mileage rate split'], articles: ['master:43'] },
];

// ============================================================
// TOC-based search: matches question to CONTRACT_SEARCH_INDEX
// Returns matched index entries for citation in the prompt
// ============================================================
function searchContractIndex(question) {
  const q = question.toLowerCase();
  const matched = [];
  for (const entry of CONTRACT_SEARCH_INDEX) {
    if (entry.topics.some(t => q.includes(t.toLowerCase()))) {
      matched.push(entry);
    }
  }
  return matched;
}

// Format matched TOC entries into a citation block for the AI prompt
function buildIndexCitationBlock(matchedEntries) {
  if (!matchedEntries.length) return '';
  const lines = matchedEntries.map(e => {
    const loc = e.section ? `Article ${e.article}, ${e.section}` : `Article ${e.article}`;
    const contract = e.contract === 'master' ? 'National Master Freight Agreement' : 'Atlantic Area Supplemental Agreement';
    return `  [${e.anchor}] ${contract} — ${loc} (Line Ref: ${e.lineRef})`;
  });
  return `\nCONTRACT SEARCH INDEX MATCHES (use these as your primary reference anchors):\n${lines.join('\n')}\n`;
}

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

// Smart contract extraction - pulls articles from both KEYWORD map and TOC index
function extractRelevantSections(masterText, localText, question, classification) {
  const questionLower = question.toLowerCase();
  const classificationLower = (classification || '').toLowerCase();
  const triggeredArticles = new Set();

  // Detect classification from question text if not explicitly passed
  const fullTimeTerms = ['feeder driver','feeder','package car driver','package car','package driver','sleeper team','sleeper','specialist','mechanic','combo worker','combo'];
  const questionMentionsFullTime = fullTimeTerms.some(t => questionLower.includes(t));

  // Always include core articles based on classification
  const isFullTime = ['Feeder Driver', 'Package Car Driver', 'Sleeper Team', 'Specialist', 'Mechanic', 'Combo Worker'].some(
    ft => classificationLower.includes(ft.toLowerCase())
  ) || questionMentionsFullTime;

  if (isFullTime) {
    triggeredArticles.add('local:60');
  } else {
    triggeredArticles.add('master:22');
  }
  triggeredArticles.add('local:48');

  // Keyword map triggers
  for (const mapping of KEYWORD_ARTICLE_MAP) {
    if (mapping.keywords.some(kw => questionLower.includes(kw.toLowerCase()))) {
      mapping.articles.forEach(a => triggeredArticles.add(a));
    }
  }

  // TOC index triggers — adds any articles matched by the search index
  const tocMatches = searchContractIndex(question);
  for (const entry of tocMatches) {
    triggeredArticles.add(`${entry.contract}:${entry.article}`);
  }

  // Explicit article number mentions
  const explicitArticles = question.match(/article\s+(\d+)/gi) || [];
  explicitArticles.forEach(match => {
    const num = match.match(/\d+/)[0];
    const inMaster = ARTICLE_LOCATIONS.master.includes(num);
    const inLocal = ARTICLE_LOCATIONS.local.includes(num);
    if (inMaster) triggeredArticles.add(`master:${num}`);
    if (inLocal) triggeredArticles.add(`local:${num}`);
  });

  // Classification-specific triggers (check question text too)
  if (classificationLower.includes('feeder') || classificationLower.includes('sleeper') ||
      questionLower.includes('feeder') || questionLower.includes('sleeper team')) {
    triggeredArticles.add('master:43');
    triggeredArticles.add('master:18');
  }
  if (classificationLower.includes('sleeper') || questionLower.includes('sleeper')) {
    triggeredArticles.add('master:43');
  }

  // Mileage under 550
  const mileageKeywords = ['under 550','less than 550','550 miles','short miles','short run','mileage short','mileage dispute','not enough miles','run was short','short trip','paid wrong mileage','miles less than 550'];
  if (mileageKeywords.some(kw => questionLower.includes(kw))) {
    triggeredArticles.add('master:43');
  }

  // FMCSA hours
  const fmcsaKeywords = ['14 hours','been out all day','driving forever','worked me to death','killed me with hours','forced over'];
  if (fmcsaKeywords.some(kw => questionLower.includes(kw))) {
    triggeredArticles.add('master:18');
  }
  if (classificationLower.includes('package')) {
    triggeredArticles.add('master:37');
  }

  // Build the relevant text
  const sections = [];
  for (const articleRef of triggeredArticles) {
    const [contract, artNum] = articleRef.split(':');
    const text = contract === 'master' ? masterText : localText;
    const contractName = contract === 'master' ? 'National Master Freight Agreement' : 'Atlantic Area Supplemental Agreement';
    const section = extractArticleSection(text, artNum);
    if (section) {
      sections.push(`=== ${contractName} — Article ${artNum} ===\n${section}`);
    }
  }
  
  return sections.join('\n\n');
}

// ============================================================
// GUARDRAIL: BUMP AND ROLL / SENIORITY DISPLACEMENT
// ============================================================
const BUMP_AND_ROLL_FACTS = {
  source_master: 'Article 5, National Master Freight Agreement',
  source_local: 'Article 47, Atlantic Area Supplemental Agreement',
  anchor: 'REF:ATLA-A47-ROLL',
  legal_term: 'Reduction of Force / Abolishment of Bid / Exercise of Seniority (operational slang: "Bump and Roll")',
  definition: 'When a bid position is cut or abolished, the displaced senior employee has the contractual right to exercise their seniority to displace ("bump") the most junior employee in any classification they are qualified to perform. The junior employee then has the same right to bump the next most junior employee — this cascade is the "roll".',
  absolute_right: 'A senior employee whose bid is abolished CANNOT be forced to accept a lesser assignment without first being offered the opportunity to displace a junior employee. This right is absolute and management cannot bypass it.',
  time_window: 'The employee typically has 48 hours from the time of written notice of abolishment to exercise their bump rights. Failure to act within the window may be treated as a voluntary acceptance of the junior position.',
  chain_reaction: 'Each bumped driver is immediately entitled to bump the next most junior driver in a classification they are qualified for — the chain continues until the most junior overall employee absorbs the cut. Management must allow the full chain to complete before finalizing the new work assignments.',
  qualification_rule: 'The bumping driver must be qualified for the position they are claiming. Management cannot deny the bump solely on the grounds of preference or convenience.',
};

function getBumpAndRollContext(question) {
  const q = question.toLowerCase();
  const keywords = [
    'bump and roll','bumping','bump a junior','rolling a junior','roll a junior',
    'losing a bid','lost my bid','bid abolished','bid eliminated','bid cut',
    'reduction of force','layoff displacement','seniority displacement',
    'displace a junior','exercising seniority','chain reaction bump','bump chain',
    'bump rights','who do i bump','can i bump','bump the junior','roll the junior',
    'they cut my bid','my run got cut','my job got cut','position abolished',
  ];
  if (!keywords.some(k => q.includes(k))) return '';
  const b = BUMP_AND_ROLL_FACTS;
  return `
GUARDRAIL ACTIVE — BUMP AND ROLL / SENIORITY DISPLACEMENT [${b.anchor}, Line Ref: L-4450]
SOURCE: ${b.source_local} (controlling) + ${b.source_master} (general seniority framework)
LEGAL TERM: "${b.legal_term}"
ABSOLUTE RIGHT: ${b.absolute_right}
TIME WINDOW: ${b.time_window}
CHAIN-REACTION RULE: ${b.chain_reaction}
QUALIFICATION RULE: ${b.qualification_rule}
REQUIRED OUTPUT: Include anchor [${b.anchor}-L4450] in your ARTICLES field. Output the enforced structure: legal term → absolute right → time window → chain-reaction rule → qualification rule.
`;
}

// ============================================================
// GUARDRAIL: SLEEPER TEAM MILEAGE PAY
// ============================================================
// Hard-coded top rate schedules — source: Article 53 Atlantic Area Supplement & Article 43 National Master
const TOP_RATE_SCHEDULES = {
  'feeder driver': {
    label: 'Feeder Driver',
    source: 'Article 53, Section 1, Atlantic Area Supplemental Agreement',
    current: '$45.74/hr (standard) | $45.84/hr (tractor-trailer singles/doubles)',
    next: '$46.74/hr (standard) | $46.84/hr (tractor-trailer) — effective August 1, 2026',
    future: '$48.99/hr (standard) | $49.09/hr (tractor-trailer) — effective August 1, 2027',
    premium: 'Double Bottoms: +$0.45/hr over tractor-trailer rate. Double 40\'s and Trains: +$0.80/hr over tractor-trailer rate. (Article 19, Section 8, Atlantic Area Supplement)',
  },
  'package car driver': {
    label: 'Package Car Driver',
    source: 'Article 53, Section 1, Atlantic Area Supplemental Agreement',
    current: '$45.74/hr',
    next: '$46.74/hr — effective August 1, 2026',
    future: '$48.99/hr — effective August 1, 2027',
    premium: null,
  },
};

const SLEEPER_MILEAGE_FACTS = {
  source: 'Article 43, Section 3, National Master Freight Agreement',
  anchor: 'REF:NMFA-OTR-RATE',
  interpretation_rule: 'Applies ONLY to Two-Man Sleeper Team operations. Do NOT conflate with local hourly cartage rates or single-driver OTR rules.',
  current_rates: 'CURRENT (Aug 1, 2025): Single Trailer: $1.0492/mi | Double Trailers: $1.0713/mi | Triple/Double 40s: $1.0937/mi',
  rates_2026: 'Aug 1, 2026: Single: $1.0721/mi | Doubles: $1.0947/mi | Triple/Dbl 40s: $1.1176/mi',
  rates_2027: 'Aug 1, 2027: Single: $1.1237/mi | Doubles: $1.1474/mi | Triple/Dbl 40s: $1.1714/mi',
  team_premium: '+$0.02 per mile premium added to base rate for two-person sleeper team operations.',
  split_formula: 'MANDATORY 50/50 SPLIT: (Base Rate + $0.02 team premium) × total miles = Total Truck Payout ÷ 2 = Per-Driver Share. Each driver receives exactly half regardless of who drove more miles.',
  earning_while_resting: 'EARNING WHILE RESTING: Both drivers are paid their full 50% split for EVERY mile the tractor logs — including miles while one driver is in the berth. Berth time is compensated time.',
  solo_exception: 'SINGLE-DRIVER EXCEPTION: If a partner becomes incapacitated mid-run, the remaining driver switches to the full single-driver OTR rate for all solo miles from that point forward.',
};

function getSleeperMileageContext(question) {
  const q = question.toLowerCase();
  const keywords = [
    'sleeper pay','sleeper mileage','sleeper mileage rate','two man split','two-man split',
    'total truck rate','schedule b','otr rate','over the road rate',
    'earning while resting','berth pay','berth miles','paid in the bunk',
    'solo exception','partner incapacitated','split rate','mileage rate split',
    'sleeper rate','two man rate','team mileage','team pay','sleeper team pay',
    'how does sleeper pay work','how is sleeper pay calculated','mileage rate',
    'per mile','per-mile','what do i make per mile','how much per mile',
    'what is my rate','paid per mile','mile rate','cents per mile','dollar per mile',
    'what do sleeper','sleeper driver pay',
  ];
  const mentionsSleeper = q.includes('sleeper') || q.includes('two man') || q.includes('two-man') || q.includes('team driver');
  const mentionsRate = q.includes('rate') || q.includes('pay') || q.includes('paid') || q.includes('mile') || q.includes('wage') || q.includes('make') || q.includes('earn');
  if (!keywords.some(k => q.includes(k)) && !(mentionsSleeper && mentionsRate)) return '';
  const s = SLEEPER_MILEAGE_FACTS;
  return `
GUARDRAIL ACTIVE — SLEEPER TEAM MILEAGE PAY [${s.anchor}]
SOURCE: ${s.source}
INTERPRETATION RULE: ${s.interpretation_rule}
VERIFIED RATES: ${s.current_rates}
FUTURE RATES: ${s.rates_2026} | ${s.rates_2027}
TEAM PREMIUM: ${s.team_premium}
SPLIT FORMULA: ${s.split_formula} — display math explicitly for the trailer type involved.
EARNING WHILE RESTING: ${s.earning_while_resting}
SINGLE-DRIVER EXCEPTION: ${s.solo_exception}
REQUIRED OUTPUT: Include anchor [${s.anchor}] in your ARTICLES field. Show the rate, the premium, and the split math.
`;
}

const buildPrompt = (question, classification, contractText, indexCitationBlock) => `You are a strict, highly analytical Labor Relations Expert and Teamster Shop Steward. Your sole purpose is to protect the worker by identifying contract and safety violations. You do not compromise, you do not make assumptions for the employer, and you do not let minor details slide.

The Atlantic Area Supplemental Agreement ALWAYS takes precedence over the National Master Agreement. Check Supplement first. Both can apply simultaneously - cite BOTH when relevant.

SEARCH INDEX ROUTING RULE: When an anchor code like [REF:ATLA-A51-MEAL] is listed below, you MUST anchor your analysis to that specific article and section first. Reference the anchor code and line reference in your ARTICLES citation so the member knows exactly where in the contract to look.
${indexCitationBlock}
CONTRACT KEYWORD MAP - Use this as your secondary routing index:
Article 1 (Bargaining Unit / Subcontracting): bargaining unit, union work, scope, covered employees, jurisdiction, subcontracting, double bottoms [REF:NMFA-A01-SUB / REF:NMFA-A01-DBL]
Article 3 (Union Shop): union membership, dues, check-off, union security
Article 4 (Stewards): steward rights, grievance processing, union business
Article 5 (Seniority - General): general seniority rights [REF:NMFA-A05-SEN]
Article 6 (Maintenance of Standards): past practice, local conditions, protection of conditions
Article 7 (Grievance Machinery): grievance procedure, panel, arbitration, timelines [REF:NMFA-A07-GRV]
Article 9 (Protection of Rights): picket line, sympathy strike, struck goods [REF:NMFA-A09-PIC]
Article 11 (Bonds): bonds, security deposits [REF:NMFA-A11-BND]
Article 12 (Polygraph): polygraph, lie detector, interrogation
Article 14 (Passenger Restrictions): passenger in cab, unauthorized rider [REF:NMFA-A14-PAS]
Article 16 (Equipment & Safety): red tag, DVIR, unsafe, bad brakes, FMCSA, refused to drive, heat stress [REF:NMFA-A16-SFT]
Article 17 (Paid for Time): missing check, short pay, payroll shortage, 48 hours, penalty pay, green check
Article 22 (Health & Welfare): health insurance, medical benefits, welfare fund [REF:NMFA-A22-HLT]
Article 23 (Pension): pension plan, pension contributions [REF:NMFA-A23-PEN]
Article 26 (Subcontracting/Feeder): foreign power, vendor trailer, outside truck, contractor, coyote, rail trailer
Article 32 (Subcontracting): outsourcing, third party logistics, peak season contractors
Article 34 (Health/Pension): pension, health insurance, medical benefits, welfare fund
Article 35 (Non-Discrimination/Substance): discrimination, SAP program, drug testing, DOT physical
Article 37 Section 1 (Dignity/Respect): harassment, harassed, intimidated, coerced, hostile, screaming, yelling, cursing, threatened, retaliation
Article 37 Section 1(b) (9.5 Over-Dispatch): 9.5 list, excessive dispatch, over 9.5 hours, triple time - PACKAGE CAR ONLY
Article 43 (Sleeper Teams): sleeper team, team run, premium service, mileage rate, layover pay, under 550 miles
Article 46 (Probationary / New Hires) [ATLANTIC AREA SUPPLEMENT]: probationary period, new hire, 30 working days, 90 days [REF:ATLA-A46-PROB]
Article 47 (Seniority - Local/Bidding) [ATLANTIC AREA SUPPLEMENT]: local seniority, route bid, run bid, posting [REF:ATLA-A47-SEN]
Article 48 (Seniority/Dispatch) [ATLANTIC AREA SUPPLEMENT]: bypass, bypassed, junior driver, less senior, seniority list, run given away
Article 51 (Meal/Breaks) [ATLANTIC AREA SUPPLEMENT]: worked through lunch, no meal period, skipped break, missed lunch, no food - VIOLATION if meal not taken between end of 4th and start of 6th hour. Cross-reference Article 17 for penalty pay. [REF:ATLA-A51-MEAL / REF:ATLA-A51-VIOL]
Article 52 (Overtime & Work Week) [ATLANTIC AREA SUPPLEMENT]: overtime, workweek guarantee, 8 hour day, sent home early, cut short, daily guarantee [REF:ATLA-A52-OVT]
Article 57 (Vacation) [ATLANTIC AREA SUPPLEMENT]: vacation accrual, vacation eligibility, vacation selection, vacation pay [REF:ATLA-A57-VAC]
Article 60 (Sick Leave / Personal Days) [ATLANTIC AREA SUPPLEMENT]: sick leave, personal day, personal holiday, floating holiday [REF:ATLA-A60-SCK]
Article 62 (Holiday Pay) [ATLANTIC AREA SUPPLEMENT]: holiday pay, paid holiday, holiday qualifier, working on holiday [REF:ATLA-A62-HOL]
Article 69 (Doubles Runs) [ATLANTIC AREA SUPPLEMENT]: doubles run, doubles letter, sick leave doubles [REF:ATLA-A69-DBL]

SAFETY NET ROUTER: If the worker explicitly names ANY article number, audit it regardless of keywords.

CRITICAL ENFORCEMENT RULES:
- ARTICLE 37 ENFORCEMENT: Yelling, cursing, screaming, or threatening a worker ANYWHERE is an immediate Article 37 violation. Flip verdict to YES immediately.
- ORIGIN BOOK ACCURACY: Articles 46–69 are ATLANTIC AREA SUPPLEMENT articles. NEVER label them as National Master Agreement provisions.
- ARTICLE 18/16 CROSS-REFERENCE: If management threatened or coerced a worker to operate unsafe equipment, flag BOTH the safety article AND Article 37 as separate violations.
- DAILY GUARANTEE MATH RULE: For full-time employees (Feeder Driver, Package Car Driver) use Article 52 Atlantic Area Supplement - only flag if hours worked < 8. For part-time employees use Article 22 National Master - only flag if hours worked < 3.5.
- 9.5 LIST: The 9.5 list and Article 37 Section 1(b) apply EXCLUSIVELY to Package Car Drivers (RPCDs). NEVER apply 9.5 rules to a Feeder Driver, Sleeper Team driver, or any non-RPCD — not even partially. If the classification is Feeder Driver or Sleeper Team and the complaint involves excessive hours, flag Article 18 (FMCSA 14-Hour Rule) instead. Output VERDICT: NO - NO VIOLATION on any 9.5 claim for a non-RPCD and explain why.
- FEEDER DRIVERS over 14 hours on-duty: Flag safety article AND FMCSA 14-Hour Rule.
- ARTICLE 43 MILEAGE RULE: For Sleeper Team runs, if ANY run is under 550 miles, immediately audit Article 43 for premium pay, mileage rate violations, and layover pay.
- ANCHOR CODE CITATION RULE: When your analysis references an article that has an anchor code in the search index, include that anchor code and line reference in your ARTICLES field so the member can locate the exact provision.
- BUMP AND ROLL GUARDRAIL: If the question involves "bump and roll", "bumping", "bid abolished", "reduction of force", or "seniority displacement" — you MUST output: (1) the legal term, (2) the employee's absolute right, (3) the 48-hour time window, (4) the chain-reaction rule, (5) the qualification rule, and (6) the anchor [REF:ATLA-A47-ROLL-L4450].
- SLEEPER MILEAGE GUARDRAIL: If the question involves sleeper mileage, two-man split, total truck rate, or earning while resting — you MUST output: (1) current Total Truck Rate, (2) the 50/50 split math displayed explicitly, (3) the Earning While Resting rule, (4) the Single-Driver Exception, and (5) the anchor [REF:NMFA-OTR-RATE-LXXXX].

ACTIVE GUARDRAIL CONTEXTS (injected for this request):
${getBumpAndRollContext(question)}${getSleeperMileageContext(question)}
WORKER DETAILS:
Classification: ${classification}
Question/Complaint: "${question}"

RELEVANT CONTRACT SECTIONS (extracted for this specific complaint):
${contractText}

Follow this exact 3-Step Audit Protocol:

STEP 1 - COMPRESSED SENTENCE DECONSTRUCTION:
Treat EVERY clause, action verb, or noun as a separate potential legal claim.
- Junior employee getting work/equipment -> Seniority Bypass (Article 48)
- Worker cut short/sent home/denied hours -> Daily Guarantee (Article 52) [REF:ATLA-A52-OVT]
- Yelling, cursing, threatening -> Dignity and Respect (Article 37)
- Sleeper run under 550 miles -> Mileage/Premium Pay (Article 43)
- No meal period by 6th hour -> Meal Period Violation (Article 51) [REF:ATLA-A51-VIOL]
- Bid abolished / position cut -> Bump and Roll / Seniority Displacement (Article 47 + Article 5) [REF:ATLA-A47-ROLL-L4450]
- Sleeper mileage pay dispute -> Two-Man Split / Earning While Resting (Article 43) [REF:NMFA-OTR-RATE]
NEVER combine distinct issues. Output separate numbered blocks for each.

STEP 2 - LOGIC OVER TEXT:
Treat complaints about different days as independent events. Never let math from one day erase a claim from another day.

STEP 3 - RIGID OUTPUT (no pleasantries, no filler, start immediately):

For EACH issue found output EXACTLY:

---
ISSUE #[number]: [Precise Name of the Contractual Infraction]
VERDICT: YES - VIOLATION FOUND or NO - NO VIOLATION
ARTICLES: [Cite specific Article and Section — correctly label National Master or Atlantic Area Supplement — include anchor code and line reference if available, e.g. Article 51, Sec 1 [REF:ATLA-A51-MEAL, Line L-5100]]
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

    // Smart extraction - keyword map + TOC index
    const contractText = extractRelevantSections(masterText, localText, question, classification);

    // Build TOC citation block for the prompt
    const tocMatches = searchContractIndex(question);
    const indexCitationBlock = buildIndexCitationBlock(tocMatches);

    const prompt = buildPrompt(question, classification, contractText, indexCitationBlock);

    const providers = [
      { name: 'Groq', fn: analyzeWithGroq },
      { name: 'Gemini', fn: analyzeWithGemini },
      { name: 'Cerebras', fn: analyzeWithCerebras },
      { name: 'OpenRouter', fn: analyzeWithOpenRouter },
      { name: 'Mistral', fn: analyzeWithMistral },
      { name: 'Cohere', fn: analyzeWithCohere },
      { name: 'HuggingFace', fn: analyzeWithHuggingFace },
    ];

    const errors = [];
    for (const provider of providers) {
      try {
        console.log(`Trying ${provider.name}...`);
        const analysis = await provider.fn(prompt);
        if (analysis && analysis.trim().length > 10) {
          console.log(`Success with ${provider.name}`);
          return Response.json({ analysis, provider: provider.name });
        }
        errors.push(`${provider.name}: response too short or empty`);
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
