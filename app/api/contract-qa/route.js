const CONTRACT_URLS = {
  master: 'https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/refs/heads/main/master-agreement.txt',
  local: 'https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/refs/heads/main/local-agreement.txt'
};

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
  { topics: ['sleeper pay','sleeper mileage','sleeper mileage rate','two man split','two-man split','mileage rate','sleeper rate','schedule b','otr rate','over the road rate','truck rate','total truck rate','earning while resting','berth pay'], contract: 'master', article: '43', section: null, lineRef: 'L-NMFA-OTR', anchor: 'REF:NMFA-OTR-RATE' },
];

// Search TOC index by question text
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

// Format matched TOC entries into citation block for AI prompt
function buildIndexCitationBlock(matchedEntries) {
  if (!matchedEntries.length) return '';
  const lines = matchedEntries.map(e => {
    const loc = e.section ? `Article ${e.article}, ${e.section}` : `Article ${e.article}`;
    const contract = e.contract === 'master' ? 'National Master Freight Agreement' : 'Atlantic Area Supplemental Agreement';
    return `  [${e.anchor}] ${contract} — ${loc} (Line Ref: ${e.lineRef})`;
  });
  return `\nCONTRACT SEARCH INDEX MATCHES (anchor your analysis to these first):\n${lines.join('\n')}\n`;
}

// Topic → article lookup map for natural language article requests
const TOPIC_ARTICLE_MAP = [
  { topics: ['meal','lunch','break','food','eat','eating','meal period','rest period'], articles: ['local:51'] },
  { topics: ['raise','wage','pay increase','general wage','gwi','next raise','money','how much do i make','what will i make','when do i get','salary'], articles: ['master:41', 'local:60'] },
  { topics: ['part time wage','part-time wage','part time pay','part-time pay','hub pay','preload pay'], articles: ['master:22'] },
  { topics: ['harassment','dignity','respect','yelling','screaming','cursing','hostile','intimidat','coerce'], articles: ['master:37'] },
  { topics: ['9.5','excessive dispatch','over 9.5','triple time'], articles: ['master:37'] },
  { topics: ['seniority','bypass','bypassed','junior driver','bid','bidding'], articles: ['local:48'] },
  { topics: ['grievance','arbitration','panel','filing a grievance','grievance procedure'], articles: ['master:7'] },
  { topics: ['steward','union rep','union business','shop steward'], articles: ['master:4'] },
  { topics: ['safety','red tag','dvir','equipment','unsafe','fmcsa','mechanical'], articles: ['master:18'] },
  { topics: ['pension','health','insurance','benefits','welfare fund','teamcare'], articles: ['master:34'] },
  { topics: ['leave','fmla','leave of absence','military leave','personal leave','time off'], articles: ['master:16'] },
  { topics: ['sleeper','mileage','team run','sleeper team','premium service','layover'], articles: ['master:43'] },
  { topics: ['subcontract','outside driver','foreign power','coyote','vendor trailer','contractor'], articles: ['master:26','master:32'] },
  { topics: ['drug test','dot physical','dot test','substance','random test','sap program'], articles: ['master:35'] },
  { topics: ['short check','missing pay','penalty pay','payroll','green check','short pay','48 hours','missing from my check'], articles: ['master:17'] },
  { topics: ['workers comp','injury','light duty','tast','on the job injury'], articles: ['master:14'] },
  { topics: ['past practice','maintenance of standards','local conditions'], articles: ['master:6'] },
  { topics: ['picket line','sympathy strike','struck goods'], articles: ['master:9'] },
  { topics: ['polygraph','lie detector','interrogation'], articles: ['master:12'] },
  { topics: ['daily guarantee','8 hour guarantee','sent home early','guarantee','8 hours'], articles: ['local:60'] },
  { topics: ['part time guarantee','3.5 hours','hub guarantee'], articles: ['master:22'] },
  { topics: ['cola','cost of living','cost-of-living'], articles: ['master:33'] },
  { topics: ['union shop','union membership','dues','check-off'], articles: ['master:3'] },
  { topics: ['bargaining unit','jurisdiction','scope','covered employee'], articles: ['master:1'] },
  { topics: ['probationary','new employee','seasonal','trial period'], articles: ['local:46'] },
  { topics: ['overtime','double time','premium pay'], articles: ['local:60'] },
  { topics: ['holiday','holidays','paid holiday','holiday pay','working holiday','time and a half holiday','christmas','thanksgiving','labor day','memorial day','new years','fourth of july','independence day'], articles: ['local:54'] },
  { topics: ['telematics','gps discipline','diad discipline','camera discipline','technology discipline','orion discipline','ivis','tracking discipline'], articles: ['master:3'] },
  { topics: ['feeder bid','bid run','yanked off run','off my run','extra work assignment','open run','feeder board','jumped the board'], articles: ['local:50','local:51'] },
  { topics: ['personal holiday','floating holiday','personal day','8 day notice','day off denied','cash out holiday'], articles: ['local:55'] },
  { topics: ['start time change','unscheduled start','delayed run','8 hour guarantee','sent home early','split shift'], articles: ['local:58','local:59'] },
  { topics: ['weingarten','investigatory interview','steward in meeting','disciplinary meeting','right to representation'], articles: ['master:4'] },
  { topics: ['change of operations','closing building','lane realignment','facility move','dovetail'], articles: ['master:38'] },
  { topics: ['garnishment','wage garnishment','child support','terminated for debt'], articles: ['master:31'] },
  // TOC-driven additions
  { topics: ['double bottoms','doubles pay','twin trailers'], articles: ['master:1'] },
  { topics: ['bond','bonds','security deposit'], articles: ['master:11'] },
  { topics: ['passenger','rider','unauthorized passenger'], articles: ['master:14'] },
  { topics: ['vacation','vacation accrual','vacation selection'], articles: ['local:57'] },
  { topics: ['sick leave','sick day'], articles: ['local:60'] },
  { topics: ['doubles run','doubles letter'], articles: ['local:69'] },
];

// Keyword to article map for Q&A smart routing
const KEYWORD_ARTICLE_MAP = [
  { keywords: ['bargaining unit','union work','scope','jurisdiction','subcontracting','bad address','rewrap','successors','transfer of company','clerical classification','operations covered'], articles: ['master:1'] },
  { keywords: ['union membership','dues','check-off','union security','supervisor working','supervisors working','double shift','early call-in','overtime exhaustion','double time penalty','quadruple time','drive contributions','part-time coverage list','supervisor sorting','supervisor loading','supervisor driving'], articles: ['master:3'] },
  { keywords: ['steward','grievance processing','union business','weingarten','investigatory interview','disciplinary meeting','disciplinary representation','warning copy','denying steward','refusing steward'], articles: ['master:4'] },
  { keywords: ['past practice','maintenance of standards','local conditions','new equipment','technological change','routing software','computerized operations','de-skilling'], articles: ['master:6'] },
  { keywords: ['grievance procedure','panel','arbitration','timelines','national grievance','bench decision','deadlock','binding arbitration','interpretation of master'], articles: ['master:7'] },
  { keywords: ['overweight package','over 70 pounds','heat illness','acclimatization','in-cab ventilation','building fans','water fountain','heat protection','safety violation','workers comp','injury on duty','light duty','tast','broken ac','refused assistance'], articles: ['master:14'] },
  { keywords: ['leave of absence','fmla','personal leave','military leave'], articles: ['master:16'] },
  { keywords: ['missing check','short pay','payroll shortage','48 hours','penalty pay','green check','short check','missing pay','paid wrong rate'], articles: ['master:17'] },
  { keywords: ['red tag','dvir','unsafe','bad brakes','fmcsa','refused to drive','forced to pull','ordered me to drive','threatened over a red tag','mechanical issue','breakdown','air hub','gateway operations','air sorter','flight delay'], articles: ['master:18'] },
  { keywords: ['part time','part-time','hub pay','preload pay','22.3','inside combo','full-time inside','part-time inside','work preservation inside'], articles: ['master:22'] },
  { keywords: ['foreign power','vendor trailer','outside truck','contractor','coyote','rail trailer','surepost','rail usage','feeder displacement','substitute transportation','average daily volume','adv','usps competition'], articles: ['master:26'] },
  { keywords: ['garnishment','wage garnishment','child support','alimony','multiple debts','terminated for garnishment'], articles: ['master:31'] },
  { keywords: ['discrimination','gender identity','sexual orientation','ada','disability accommodation','civil rights'], articles: ['master:36'] },
  { keywords: ['9.5 list','9.5 violation','excessive dispatch','over 9.5','triple time','3x pay','harassment','harassed','intimidated','coerced','over-supervised','hostile','screaming','yelling','cursing','threatened','dignity','retaliation','ride-along','video surveillance','telemetry discipline','fair days work'], articles: ['master:37'] },
  { keywords: ['closing building','lane realignment','moving expenses','dovetail seniority','change of operations','pension trust transfer','facility move','structural change'], articles: ['master:38'] },
  { keywords: ['trailer mechanic','shop trainee','tool replacement','tool allowance','trailer repair'], articles: ['master:39'] },
  { keywords: ['raise','wage increase','pay increase','gwi','general wage','next raise','when do i get paid more','4-year progression','red circled','top rate','break-in rate','step increase','anniversary date','progression scale'], articles: ['master:41','local:60'] },
  { keywords: ['sleeper team','sleeper','team run','mileage rate','layover pay','under 550','550 miles','took my load','premium service','100 miles','120 miles regional','point-to-point','local feeder displacement'], articles: ['master:43'] },
  { keywords: ['cola','cost of living','cost-of-living'], articles: ['master:33'] },
  { keywords: ['pension','health insurance','medical benefits','welfare fund','teamcare'], articles: ['master:34'] },
  { keywords: ['drug testing','dot physical','random test','sap program'], articles: ['master:35'] },
  { keywords: ['30 working days','90 consecutive days','40 days','100 consecutive days','free period','nov 1','dec 31','seniority tie','tie-breaker','coin toss','application date','same seniority date','start time tie','same day hire','seniority number'], articles: ['local:46'] },
  { keywords: ['bypass','bypassed','junior driver','less senior','seniority list','run given away','layoff notice','7 calendar days','emergency notice','displace inside','bump part-time','quarterly posting','updated seniority list','layout sequencing'], articles: ['local:48'] },
  { keywords: ['bid center','route vacancy','5-day posting','training period','30-day training','disqualification','route bid','package car bid','senior bidder bypassed'], articles: ['local:49'] },
  { keywords: ['tractor-trailer qualified','bid run','super qualified','extra work','present and available','run discontinuance','50-mile rule','yanked off run','dispatch reassigned','on-call took run','extra work bypass','open hot run','dispatch jumping','feeder board','worked through lunch','no meal period','skipped break','forced break','meal period','missed lunch'], articles: ['local:51','master:17'] },
  { keywords: ['holiday','paid holiday','holiday pay','working on holiday','time and a half holiday','holiday qualifier','christmas','thanksgiving','labor day','memorial day','new years','fourth of july','independence day','holiday schedule','90 hours straight-time','attendance gate','day after thanksgiving'], articles: ['local:54'] },
  { keywords: ['vacation','vacation selection','personal day','floating holiday','sick day option','nov 1','nov 30','seniority selection','8 days notice','unused floating','december 31','vacation pay'], articles: ['local:55'] },
  { keywords: ['sent home early','cut short','guarantee','8 hours','minimum hours','reported for work','daily guarantee','40-hour weekly','unscheduled start time','start time changed','delayed run','time and a half overtime','split shift','8-hour daily guarantee'], articles: ['local:58','local:59','master:22'] },
  { keywords: ['health and welfare contribution','pension contribution','monthly contribution','5 days per month','coverage threshold','laid off driver','joint supplemental'], articles: ['local:60'] },
  { keywords: ['automotive mechanic','fleet mechanic','building maintenance','apprenticeship','journeyman ratio','foreman premium','shift differential','mechanic apprentice','trade premium'], articles: ['local:62'] },
  // TOC-driven additions
  { keywords: ['double bottoms','doubles pay','twin trailers','double trailer'], articles: ['master:1'] },
  { keywords: ['bond','bonds','security deposit','cash bond'], articles: ['master:11'] },
  { keywords: ['passenger','riding restriction','passenger in cab','rider','unauthorized passenger'], articles: ['master:14'] },
  { keywords: ['overtime','workweek guarantee','40 hour week'], articles: ['local:52'] },
  { keywords: ['sick leave','sick day'], articles: ['local:60'] },
  { keywords: ['doubles run','doubles letter','sick leave doubles'], articles: ['local:69'] },
  // Bump and Roll guardrail
  { keywords: ['bump and roll','bumping','bump a junior','rolling a junior','roll a junior','losing a bid','lost my bid','bid abolished','bid eliminated','reduction of force','layoff displacement','seniority displacement','displace a junior','exercising seniority','chain reaction bump','bump chain'], articles: ['local:47','master:5'] },
  // Sleeper Mileage guardrail
  { keywords: ['sleeper pay','sleeper mileage rate','two man split','two-man split','total truck rate','schedule b','otr rate','over the road rate','earning while resting','berth pay','solo exception','partner incapacitated','split rate','mileage rate split'], articles: ['master:43'] },
];

// Compute today's date context for the AI
function getTodayContext() {
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const raises = [
    { year: 2023, date: new Date('2023-08-01'), amount: '$2.75', applied: true },
    { year: 2024, date: new Date('2024-08-01'), amount: '$0.75', applied: true },
    { year: 2025, date: new Date('2025-08-01'), amount: '$0.75', applied: true },
    { year: 2026, date: new Date('2026-08-01'), amount: '$1.00', applied: false },
    { year: 2027, date: new Date('2027-08-01'), amount: '$2.25', applied: false },
  ];
  raises.forEach(r => {
    r.applied = today >= r.date;
    const diffMs = r.date - today;
    r.daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  });
  const appliedRaises = raises.filter(r => r.applied);
  const upcomingRaises = raises.filter(r => !r.applied);
  const nextRaise = upcomingRaises[0] || null;
  let raiseContext = `RAISES ALREADY APPLIED AS OF TODAY:\n`;
  appliedRaises.forEach(r => {
    raiseContext += `  - August 1, ${r.year}: ${r.amount}/hr (already received)\n`;
  });
  if (nextRaise) {
    raiseContext += `\nNEXT UPCOMING RAISE:\n`;
    raiseContext += `  - August 1, ${nextRaise.year}: ${nextRaise.amount}/hr`;
    if (nextRaise.daysUntil > 0) {
      raiseContext += ` — ${nextRaise.daysUntil} days from today`;
    } else {
      raiseContext += ` — effective today or recently passed`;
    }
    raiseContext += `\n`;
  }
  if (upcomingRaises.length > 1) {
    raiseContext += `\nFUTURE RAISES AFTER THAT:\n`;
    upcomingRaises.slice(1).forEach(r => {
      raiseContext += `  - August 1, ${r.year}: ${r.amount}/hr\n`;
    });
  }
  return `TODAY'S DATE: ${todayStr}
CONTRACT PERIOD: August 1, 2023 through July 31, 2028
${raiseContext}
IMPORTANT: Always answer as of today's date (${todayStr}). When discussing raises, benefits, or timelines, tell the member what applies RIGHT NOW and what's coming next — not what was true at the start of the contract. If they ask "when is my next raise," calculate from today.`;
}

function extractArticleSection(text, articleNum, maxChars = 25000) {
  const searchStr = `ARTICLE ${articleNum}`;
  const idx = text.toUpperCase().indexOf(searchStr);
  if (idx === -1) return null;
  const charAfter = text[idx + searchStr.length];
  if (charAfter && /\d/.test(charAfter)) return null;
  const start = idx;
  let end = text.length;
  let searchFrom = start + searchStr.length + 1;
  while (searchFrom < text.length) {
    const nextIdx = text.toUpperCase().indexOf('ARTICLE ', searchFrom);
    if (nextIdx === -1) break;
    const afterArticle = text[nextIdx + 8];
    if (afterArticle && /\d/.test(afterArticle) && nextIdx > start + 50) {
      end = nextIdx;
      break;
    }
    searchFrom = nextIdx + 1;
  }
  return text.slice(start, Math.min(end, start + maxChars)).trim();
}

// Pre-flight: detect if user is asking to VIEW an article
function detectArticleLookup(question) {
  const q = question.toLowerCase().trim();
  const lookupTriggers = ['show me','pull up','read me','give me','display','let me see','can i see','can you show','can you pull'];
  const hasTrigger = lookupTriggers.some(t => q.includes(t));
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
        return { isLookup: true, articles: mapping.articles, label: mapping.topics[0] };
      }
    }
  }
  return { isLookup: false };
}

// Smart extraction for Q&A — keyword map + TOC index
function extractRelevantSections(masterText, localText, question, classification) {
  const questionLower = question.toLowerCase();
  const classificationLower = (classification || '').toLowerCase();
  const triggeredArticles = new Set();

  // Detect classification from the question itself if not passed in
  const fullTimeTerms = ['feeder driver','feeder','package car driver','package car','package driver','sleeper team','sleeper','specialist','mechanic','combo worker','combo'];
  const partTimeTerms = ['part time','part-time','hub worker','preloader','sorter','loader','unloader','air driver'];
  const questionMentionsFullTime = fullTimeTerms.some(t => questionLower.includes(t));
  const questionMentionsPartTime = partTimeTerms.some(t => questionLower.includes(t));

  const isFullTime = ['feeder driver','feeder','package car driver','package car','sleeper team','sleeper','specialist','mechanic','combo worker','combo'].some(
    ft => classificationLower.includes(ft)
  ) || questionMentionsFullTime;

  if (isFullTime) {
    triggeredArticles.add('local:60');
  } else if (classificationLower || questionMentionsPartTime) {
    triggeredArticles.add('master:22');
  } else {
    // No classification info at all — pull both guarantee articles so the AI can answer either way
    triggeredArticles.add('local:60');
    triggeredArticles.add('master:22');
  }

  for (const mapping of KEYWORD_ARTICLE_MAP) {
    if (mapping.keywords.some(kw => questionLower.includes(kw.toLowerCase()))) {
      mapping.articles.forEach(a => triggeredArticles.add(a));
    }
  }

  // TOC index triggers
  const tocMatches = searchContractIndex(question);
  for (const entry of tocMatches) {
    triggeredArticles.add(`${entry.contract}:${entry.article}`);
  }

  const explicitArticles = question.match(/article\s+(\d+)/gi) || [];
  explicitArticles.forEach(match => {
    const num = match.match(/\d+/)[0];
    if (ARTICLE_LOCATIONS.master.includes(num)) triggeredArticles.add(`master:${num}`);
    if (ARTICLE_LOCATIONS.local.includes(num)) triggeredArticles.add(`local:${num}`);
  });

  if (classificationLower.includes('feeder') || classificationLower.includes('sleeper') ||
      questionLower.includes('feeder') || questionLower.includes('sleeper team')) {
    triggeredArticles.add('master:43');
    triggeredArticles.add('master:18');
  }
  if (classificationLower.includes('package') || questionLower.includes('package car') || questionLower.includes('package driver')) {
    triggeredArticles.add('master:37');
  }

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

const HOLIDAY_FACTS = {
  source: 'Article 54, Atlantic Area Supplemental Agreement',
  holidays: [
    "New Year's Day", 'Memorial Day', 'Independence Day (4th of July)', 'Labor Day',
    'Thanksgiving Day', 'Christmas Day', 'The day after Thanksgiving',
    'The day before or after Christmas (as designated)',
  ],
  rules: [
    'Full-time employees receive 8 hours of straight-time holiday pay for each named holiday (Article 54, Section 1).',
    'To qualify, you must work your scheduled day immediately before AND your scheduled day immediately after the holiday (Article 54, Section 1(b)).',
    'If you work on a holiday, you receive time-and-one-half (1.5x) for all hours worked IN ADDITION to your standard 8-hour holiday pay (Article 54, Section 1(c)).',
    'If you call in sick on the day before or after a holiday without an approved excuse, you forfeit your holiday pay.',
  ]
};

function getHolidayContext(question) {
  const q = question.toLowerCase();
  const holidayKeywords = ['holiday','paid holiday','holiday pay','working on holiday','christmas','thanksgiving','labor day','memorial day','new years','fourth of july','independence day','holiday schedule','holiday qualifier'];
  if (!holidayKeywords.some(k => q.includes(k))) return '';
  const holidayList = HOLIDAY_FACTS.holidays.map(h => `  - ${h}`).join('\n');
  const ruleList = HOLIDAY_FACTS.rules.map(r => `  - ${r}`).join('\n');
  return `\nVERIFIED HOLIDAY FACTS (${HOLIDAY_FACTS.source}) — use these exact facts only:\nPAID HOLIDAYS:\n${holidayList}\nRULES:\n${ruleList}\n`;
}

const SUPERVISORS_WORKING_FACTS = {
  source: 'Article 3, Section 7, National Master UPS Agreement',
  prohibited_work: 'Supervisors are strictly prohibited from performing ANY bargaining unit work: sorting, loading, unloading, driving, pulling mis-sorts, moving equipment, or performing set-up work before a shift.',
  allowed_exceptions: [
    'Training employees on proper methods.',
    'Demonstrating safety procedures.',
    'Direct Acts of God emergencies — only until an hourly worker can be found.',
  ],
  call_in_sequence: 'Before a supervisor may work, management MUST exhaust in order: (1) double-shift list, (2) early call-ins, (3) overtime offers, (4) monthly coverage lists.',
  penalty_calculations: [
    '2 hours or less worked by supervisor: Pay the affected hourly worker Double Time (2x) for the exact minutes worked.',
    'More than 2 hours worked by supervisor: Pay 4 hours straight time OR actual hours worked at 2x — whichever is greater.',
    '3-Strikes Escalation: If ONE specific supervisor is found guilty of 3 infractions within a rolling 9-month window, the penalty escalates to Quadruple Time (4x) for all hours worked on that 3rd strike and all subsequent infractions.',
  ]
};

function getSupervisorsWorkingContext(question) {
  const q = question.toLowerCase();
  const keywords = ['supervisor working','supervisors working','supervisor sorting','supervisor loading','supervisor driving','supervisor unloading','management working','supe working','sup working','supervisor doing','manager working','double time penalty','quadruple time','4x pay','2x pay','coverage list'];
  if (!keywords.some(k => q.includes(k))) return '';
  const f = SUPERVISORS_WORKING_FACTS;
  const exceptions = f.allowed_exceptions.map(r => `  - ${r}`).join('\n');
  const penalties = f.penalty_calculations.map(r => `  - ${r}`).join('\n');
  return `\nVERIFIED SUPERVISORS WORKING RULES (${f.source}) — use these exact facts only:\n  Prohibited Work: ${f.prohibited_work}\n  Call-In Sequence: ${f.call_in_sequence}\n  Allowed Exceptions:\n${exceptions}\n  Penalty Calculations:\n${penalties}\n`;
}

const SENIORITY_TIEBREAKER_FACTS = {
  source: 'Article 46, Section 1, Atlantic Area Supplemental Agreement',
  prohibited: 'Management CANNOT assign work based on preference, arrival time, or who asked first when two employees share the exact same seniority start date.',
  violation_classification: 'Seniority Bypass / Improper Extra Work Assignment.',
  steps: [
    'Step A — 30th Workday Completion: Check center records to see who completed their 30th working day of qualification first. The driver who hit their 30th day first goes higher on the seniority list.',
    'Step B — Application Date: If both completed their 30th working day on the exact same shift, the date on their original employment application governs. The earlier application date goes higher.',
    'Step C — Coin Toss: If both share the same application date, the tie is broken by a formal coin toss witnessed by a shop steward who must sign off on the result.',
  ]
};

function getSeniorityTiebreakerContext(question) {
  const q = question.toLowerCase();
  const keywords = ['same day','same date','same seniority','tie','tiebreaker','tie-breaker','coin toss','application date','30th day','30 working days','same hire date','seniority tie','who goes first','higher on the list','seniority order'];
  if (!keywords.some(k => q.includes(k))) return '';
  const ruleList = SENIORITY_TIEBREAKER_FACTS.steps.map((r, i) => `  ${i + 1}. ${r}`).join('\n');
  return `\nVERIFIED SENIORITY TIE-BREAKER RULES (${SENIORITY_TIEBREAKER_FACTS.source}) — use these exact facts only:\n${ruleList}\n`;
}

const TELEMATICS_FACTS = {
  source: 'Article 3, Section 7, National Master UPS Agreement',
  rule: 'Management CANNOT discharge or discipline an employee based SOLELY on information gathered from GPS, telematics, IVIS, DIAD, or any sensor system.',
  exception: 'The only exception is clear, proven, intentional dishonesty with intent to defraud. Failing to perfectly recall events shown on telemetry does NOT constitute dishonesty.',
  corroboration_requirement: "Any infraction spotted via technology must be: (1) confirmed by a supervisor's direct, physical, eye-witness observation, AND (2) preceded by an in-person verbal counseling session before any discipline is issued.",
  violation_classification: 'Improper Technology-Based Discipline.',
};

function getTelematicsContext(question) {
  const q = question.toLowerCase();
  const keywords = ['telematics','gps','diad','ivis','camera','sensor','tracking','telemetry','disciplined for gps','fired for gps','write up from camera','technology discipline','orion','surveillance','dishonesty','intentional dishonesty'];
  if (!keywords.some(k => q.includes(k))) return '';
  return `\nVERIFIED TELEMATICS DISCIPLINE RULES (${TELEMATICS_FACTS.source}):\n  Rule: ${TELEMATICS_FACTS.rule}\n  Exception: ${TELEMATICS_FACTS.exception}\n  Corroboration Required: ${TELEMATICS_FACTS.corroboration_requirement}\n  Violation Classification: ${TELEMATICS_FACTS.violation_classification}\n`;
}

const FEEDER_BID_FACTS = {
  source: 'Articles 50 & 51, Atlantic Area Supplemental Agreement',
  rule: 'A contractually bid feeder run belongs entirely to the seniority driver who won the bid. Management CANNOT arbitrarily remove a regular driver from their scheduled bid run.',
  prohibited: "Saving a driver's regular bid route to be covered by an on-call/casual driver later while forcing the bid-holder onto an unscheduled regional or extra run is strictly prohibited.",
  extra_work_rule: 'Extra work assignments must follow the seniority board in order. Management cannot jump the board to assign an open run to a junior driver when a senior driver is present and available.',
  violation_classification: 'Immediate Work Preservation and Bid Protection Violation.',
};

function getFeederBidContext(question) {
  const q = question.toLowerCase();
  const keywords = ['yanked off run','off my run','removed from my run','dispatch reassigned','cover driver took','on-call took','extra work','open run','bid run','took my run','bumped off','pulled off my run','forced onto','extra board','feeder board','jumped the board'];
  if (!keywords.some(k => q.includes(k))) return '';
  const f = FEEDER_BID_FACTS;
  return `\nVERIFIED FEEDER BID PROTECTION RULES (${f.source}):\n  Rule: ${f.rule}\n  Prohibited: ${f.prohibited}\n  Extra Work Rule: ${f.extra_work_rule}\n  Violation Classification: ${f.violation_classification}\n`;
}

const NINE_FIVE_FACTS = {
  source: 'Article 37, Section 1, National Master UPS Agreement',
  core_principle: "The Employer must make every reasonable effort to keep an opted-in driver's daily schedule below 9.5 hours. A violation occurs when an eligible, opted-in driver works more than 9.5 hours on THREE (3) separate days in a single workweek.",
  eligibility: [
    '(a) The employee covers a route for a full week.',
    '(b) The employee bids/is assigned a route for the full week but management disrupts it by reassigning them.',
    '(c) The employee has four (4) or more years of seniority as a full-time RPCD.',
  ],
  opt_in: "The Union collects the 9.5 opt-in list once per year. It must be submitted to the Company by January 5th. Reclassified drivers (former 22.4s) are automatically covered upon becoming RPCDs.",
  blackout: 'The 9.5 protections are SUSPENDED from November 15th through January 15th (peak season). No standard 9.5 grievances can be filed for weeks falling in this window.',
  penalty: "TRIPLE TIME (3x) the driver's regular straight-time hourly rate for all hours worked over 9.5 on each violating day.",
  retaliation_rule: 'Management CANNOT deliberately overload a driver with massive overtime on the remaining two days of the week to avoid the 3-day threshold. If found guilty, the Co-Chairs may impose Triple Time (3x) on those retaliatory days as well.',
  how_to_file: 'File a grievance under Article 37, Section 1. Document the exact hours worked each day. Your steward submits it within the contractual timeline.',
};

function getNineFiveContext(question, classification) {
  const q = question.toLowerCase();
  const cl = (classification || '').toLowerCase();
  const keywords = ['9.5','9 5','nine five','over 9','excessive dispatch','triple time','3x','dispatch too much','too many hours','over dispatched','worked too long','opt in list','9.5 list','rpcd','peak blackout','nov 15','jan 15'];
  if (!keywords.some(k => q.includes(k))) return '';

  // 9.5 DOES NOT APPLY TO FEEDER DRIVERS OR SLEEPER TEAMS — enforce this hard
  const isFeederOrSleeper =
    cl.includes('feeder') || cl.includes('sleeper') ||
    q.includes('feeder driver') || q.includes('feeder') || q.includes('sleeper team') || q.includes('sleeper');

  if (isFeederOrSleeper) {
    return `\n⛔ 9.5 OVERTIME PROTECTION — NOT APPLICABLE\nThe 9.5 list and Article 37 Section 1(b) overtime protections apply EXCLUSIVELY to Package Car Drivers (RPCDs). Feeder Drivers and Sleeper Team drivers are NOT covered by 9.5 protections and CANNOT file 9.5 grievances. Do not apply 9.5 rules to this worker under any circumstances. If the worker is asking about excessive hours as a Feeder Driver, direct them to FMCSA 14-hour on-duty rules (Article 18) instead.\n`;
  }

  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const inBlackout = (month === 11 && day >= 15) || month === 12 || (month === 1 && day <= 15);
  const eligibilityList = NINE_FIVE_FACTS.eligibility.map(e => `  - ${e}`).join('\n');
  const blackoutWarning = inBlackout
    ? `\n  ⚠️ CURRENT STATUS: TODAY FALLS WITHIN THE PEAK BLACKOUT (Nov 15 – Jan 15). Standard 9.5 grievances CANNOT be filed for this period.`
    : `\n  ✅ CURRENT STATUS: Today is outside the peak blackout window. 9.5 protections are ACTIVE.`;
  return `\nVERIFIED 9.5 OVERTIME PROTECTION RULES (${NINE_FIVE_FACTS.source}) — PACKAGE CAR DRIVERS ONLY:\n  Core Rule: ${NINE_FIVE_FACTS.core_principle}\n  Eligibility (must meet ANY one of these):\n${eligibilityList}\n  Opt-In Requirement: ${NINE_FIVE_FACTS.opt_in}\n  Blackout Period: ${NINE_FIVE_FACTS.blackout}${blackoutWarning}\n  Penalty: ${NINE_FIVE_FACTS.penalty}\n  Retaliation Rule: ${NINE_FIVE_FACTS.retaliation_rule}\n  How to File: ${NINE_FIVE_FACTS.how_to_file}\n`;
}

const PERSONAL_HOLIDAY_FACTS = {
  source: 'Article 55, Atlantic Area Supplemental Agreement',
  eligibility: 'Employees with 24 or more months of seniority receive five (5) personal holidays per year.',
  request_rule: 'Must be requested in writing at least eight (8) calendar days in advance.',
  approval_rule: 'Management must approve or deny the request by the end of the next working day.',
  quota: 'The center must allow a daily quota of at least 1 person OR 5% of the total workforce off — whichever is greater.',
  blackout: 'Personal holidays are strictly blocked from the Saturday after Thanksgiving through December 25th.',
  cash_out: 'Any unused personal holidays remaining on December 31st must be automatically cashed out.',
};

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
  steward_tip: 'Collect: (1) Written abolishment notice with date/time. (2) Current seniority list. (3) List of all junior employees and their classifications. (4) Timestamps of when each bump was exercised.',
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

ENFORCED OUTPUT STRUCTURE — you MUST include ALL of the following sections:
1. LEGAL TERM: "${b.legal_term}"
2. ABSOLUTE RIGHT: ${b.absolute_right}
3. TIME WINDOW TO EXECUTE BUMP: ${b.time_window}
4. CHAIN-REACTION RULE: ${b.chain_reaction}
5. QUALIFICATION RULE: ${b.qualification_rule}
6. REFERENCE ANCHOR: Output exactly → [${b.anchor}-L4450]
7. STEWARD EVIDENCE TIP: ${b.steward_tip}

DO NOT answer bump-and-roll questions using general seniority language. Use ONLY the above facts and the extracted Article 47 / Article 5 contract text below.
`;
}

// ============================================================
// GUARDRAIL: SLEEPER TEAM MILEAGE PAY
// ============================================================
const SLEEPER_MILEAGE_FACTS = {
  source: 'Article 43, Section 3, National Master Freight Agreement',
  anchor: 'REF:NMFA-OTR-RATE',
  interpretation_rule: 'This guardrail applies ONLY to Two-Man Sleeper Team operations. Do NOT conflate with local hourly cartage rates or single-driver OTR rules.',
  current_rates_label: 'CURRENT MILEAGE RATES (Effective August 1, 2025):',
  current_rates: 'Single Trailer: $1.0492/mi | Double Trailers: $1.0713/mi | Triple/Double 40s: $1.0937/mi',
  rates_2026: 'August 1, 2026: Single Trailer: $1.0721/mi | Double Trailers: $1.0947/mi | Triple/Double 40s: $1.1176/mi',
  rates_2027: 'August 1, 2027: Single Trailer: $1.1237/mi | Double Trailers: $1.1474/mi | Triple/Double 40s: $1.1714/mi',
  team_premium: 'SLEEPER TEAM PREMIUM: An additional $0.02 per mile is added to the base mileage rate for two-person sleeper team operations.',
  split_formula: 'MANDATORY 50/50 SPLIT: (Base Rate + $0.02 team premium) × total dispatch miles = Total Truck Payout. Total Truck Payout ÷ 2 = Per-Driver Share. Each driver receives exactly half regardless of who drove more miles.',
  earning_while_resting: 'EARNING WHILE RESTING: Both drivers are paid their full 50% split for EVERY mile the tractor logs during the dispatch — including miles logged while one driver is in the berth sleeping. Berth time is fully compensated time.',
  solo_exception: 'SINGLE-DRIVER EXCEPTION: If a partner becomes incapacitated mid-run (illness, injury, disqualification), the remaining solo driver switches to the full single-driver OTR rate for all miles driven alone from that point forward. The solo driver does NOT continue on the split rate.',
  steward_tip: 'To verify a mileage pay dispute: (1) Pull dispatch sheet showing total miles and trailer type. (2) Confirm the correct base rate was used (single/double/triple). (3) Verify the $0.02 team premium was included. (4) Calculate: (base + $0.02) × miles ÷ 2 = each driver\'s correct share. (5) If solo exception was invoked, verify the solo rate applied from the correct mile marker.',
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
    'what is my rate','what am i paid','what do sleeper','sleeper driver pay',
    'paid per mile','mile rate','cents per mile','dollar per mile',
  ];
  // Also fire if question mentions sleeper AND any pay/rate/mile concept
  const mentionsSleeper = q.includes('sleeper') || q.includes('two man') || q.includes('two-man') || q.includes('team driver');
  const mentionsRate = q.includes('rate') || q.includes('pay') || q.includes('paid') || q.includes('mile') || q.includes('wage') || q.includes('make') || q.includes('earn');
  if (!keywords.some(k => q.includes(k)) && !(mentionsSleeper && mentionsRate)) return '';
  const s = SLEEPER_MILEAGE_FACTS;
  return `
GUARDRAIL ACTIVE — SLEEPER TEAM MILEAGE PAY [${s.anchor}]
SOURCE: ${s.source}
INTERPRETATION RULE: ${s.interpretation_rule}

ENFORCED OUTPUT STRUCTURE — you MUST include ALL of the following sections:
1. CURRENT RATES (${s.current_rates_label}): ${s.current_rates}
2. FUTURE RATES: ${s.rates_2026} | ${s.rates_2027}
3. TEAM PREMIUM: ${s.team_premium}
4. SPLIT FORMULA: ${s.split_formula}
   → Display the math explicitly for the specific trailer type asked about.
5. EARNING WHILE RESTING: ${s.earning_while_resting}
6. SINGLE-DRIVER EXCEPTION: ${s.solo_exception}
7. REFERENCE ANCHOR: Output exactly → [${s.anchor}]
8. STEWARD EVIDENCE TIP: ${s.steward_tip}

DO NOT answer sleeper mileage questions using general hourly or local cartage language. Use ONLY the above verified rates.
`;
}

function getPersonalHolidayContext(question) {
  const q = question.toLowerCase();
  const keywords = ['personal holiday','floating holiday','personal day','5 personal','8 days notice','8-day notice','day off request','denied day off','vacation request','cash out holiday','december 31','unused holiday','quota','5 percent'];
  if (!keywords.some(k => q.includes(k))) return '';
  const p = PERSONAL_HOLIDAY_FACTS;
  return `\nVERIFIED PERSONAL FLOATING HOLIDAY RULES (${p.source}):\n  Eligibility: ${p.eligibility}\n  Request Rule: ${p.request_rule}\n  Approval Rule: ${p.approval_rule}\n  Quota: ${p.quota}\n  Blackout Period: ${p.blackout}\n  Cash-Out Rule: ${p.cash_out}\n`;
}

const GUARANTEE_FACTS = {
  'feeder driver': {
    label: 'Feeder Driver',
    guarantee: '8 consecutive hours (excluding unpaid meal period) per day, per Article 60 of the Atlantic Area Supplemental Agreement.',
    rules: [
      'You must report to your scheduled shift on time.',
      'If management tells you before you punch in that volume is light and tries to send you home, you can refuse and demand your 8 hours.',
      'The 8 hours must be consecutive — management cannot force a split shift without your consent.',
      'If you finish your assignment early, management must either find additional work or pay the remaining hours as guaranteed time.',
    ]
  },
  'package car driver': {
    label: 'Package Car Driver',
    guarantee: '8 consecutive hours (excluding unpaid meal period) per day, per Article 60 of the Atlantic Area Supplemental Agreement.',
    rules: [
      'You must report to your scheduled shift on time.',
      'If management tells you before you punch in that volume is light and tries to send you home, you can refuse and demand your 8 hours.',
      'The 8 hours must be consecutive — management cannot force a split shift without your consent.',
      'If you finish your assignment early, management must either find additional work or pay the remaining hours as guaranteed time.',
    ]
  },
  'part-time': {
    label: 'Part-Time Employee',
    guarantee: '3.5 hours per day, per Article 22 of the National Master UPS Agreement.',
    rules: [
      'If you report to work and are sent home early, you are guaranteed a minimum of 3.5 hours of work or pay.',
    ]
  },
  'part-time air driver': {
    label: 'Part-Time Air Driver',
    guarantee: '3.5 hours per day.',
    rules: [
      'If you report to work and are sent home early, you are guaranteed a minimum of 3.5 hours of work or pay.',
    ]
  },
  'full-time air driver': {
    label: 'Full-Time Air Driver',
    guarantee: '8 hours per day and 40 hours per week.',
    rules: []
  },
  'combo': {
    label: 'Full-Time Combination Employee (Article 22.4)',
    guarantee: '8 hours per day.',
    rules: []
  },
};

function getGuaranteeContext(classification, question) {
  const q = (question || '').toLowerCase();
  const cl = (classification || '').toLowerCase();

  const GUARANTEE_PHRASES = {
    'feeder driver':       ['feeder driver','feeder drivers','i am a feeder','i\'m a feeder','as a feeder'],
    'package car driver':  ['package car driver','package car drivers','i am a package','package driver','rpcd'],
    'mechanic':            ['mechanic','journeyman','automotive mechanic','fleet mechanic'],
    'combo':               ['combo worker','combo driver','22.4'],
    'part-time air driver':['part time air driver','part-time air driver','pt air driver'],
    'full-time air driver':['full time air driver','full-time air driver','ft air driver'],
    'part-time':           ['part time','part-time','hub worker','preloader','sorter','loader','unloader'],
  };

  let match = null;
  if (cl) match = Object.keys(GUARANTEE_FACTS).find(k => cl.includes(k));
  if (!match) {
    for (const [key, phrases] of Object.entries(GUARANTEE_PHRASES)) {
      if (phrases.some(p => q.includes(p))) { match = key; break; }
    }
  }
  if (!match) return '';

  const g = GUARANTEE_FACTS[match];
  const rules = g.rules.length ? '\n' + g.rules.map(r => `  - ${r}`).join('\n') : '';
  return `\nVERIFIED DAILY GUARANTEE FOR ${g.label.toUpperCase()} (use these exact facts — do not guess or estimate):\n  Guarantee: ${g.guarantee}${rules}\n`;
}

// Hard-coded top rate schedules by classification
// Source: Article 53, Section 1, Atlantic Area Supplemental Agreement (page 242)
//         Article 43, Section 3, National Master Agreement (page 339) for sleeper mileage
const TOP_RATE_SCHEDULES = {
  'feeder driver': {
    label: 'Feeder Driver / Package Car Driver',
    source: 'Article 53, Section 1, Atlantic Area Supplemental Agreement',
    rates: [
      { period: 'August 1, 2025 – July 31, 2026 (CURRENT)', rate: '$45.74/hr (standard feeder/package car) | $45.84/hr (tractor-trailer singles/doubles)' },
      { period: 'August 1, 2026 – July 31, 2027', rate: '$46.74/hr (standard) | $46.84/hr (tractor-trailer)' },
      { period: 'August 1, 2027 – July 31, 2028', rate: '$48.99/hr (standard) | $49.09/hr (tractor-trailer)' },
    ],
    notes: 'EQUIPMENT PREMIUM (Article 19, Section 8, Atlantic Area Supplement): Double Bottoms = +$0.45/hr over tractor-trailer rate. Double 40\'s and Trains = +$0.80/hr over tractor-trailer rate. These premiums stack ON TOP of the tractor-trailer rate, not the standard rate.'
  },
  'package car driver': {
    label: 'Package Car Driver',
    source: 'Article 53, Section 1, Atlantic Area Supplemental Agreement',
    rates: [
      { period: 'August 1, 2025 – July 31, 2026 (CURRENT)', rate: '$45.74/hr' },
      { period: 'August 1, 2026 – July 31, 2027', rate: '$46.74/hr' },
      { period: 'August 1, 2027 – July 31, 2028', rate: '$48.99/hr' },
    ],
    notes: null
  },
  'sleeper team': {
    label: 'Sleeper Team (Mileage Rates)',
    source: 'Article 43, Section 3, National Master Agreement',
    rates: [
      { period: 'August 1, 2025 – July 31, 2026 (CURRENT)', rate: 'Single Trailer: $1.0492/mi | Double Trailers: $1.0713/mi | Triple/Double 40s: $1.0937/mi' },
      { period: 'August 1, 2026 – July 31, 2027', rate: 'Single Trailer: $1.0721/mi | Double Trailers: $1.0947/mi | Triple/Double 40s: $1.1176/mi' },
      { period: 'August 1, 2027 – July 31, 2028', rate: 'Single Trailer: $1.1237/mi | Double Trailers: $1.1474/mi | Triple/Double 40s: $1.1714/mi' },
    ],
    notes: 'SLEEPER TEAM RULES: (1) A 2-cent per mile PREMIUM is added to these base rates for two-person sleeper team operations. (2) The total accumulated mileage pay (base + 2-cent premium) is split 50/50 between both drivers. (3) Both drivers are paid for every mile the tractor logs, including miles while the other driver is in the berth. (4) If one driver becomes incapacitated mid-run, the solo driver switches to the full single OTR rate.'
  },
  'part-time': {
    label: 'Part-Time Employee (Preloader, Sorter, Loader, Unloader, Clerk)',
    source: 'Article 22, National Master Agreement',
    rates: [
      { period: 'August 1, 2025 – July 31, 2026 (CURRENT)', rate: '$22.50/hr (top rate, hired on/after July 2, 1982)' },
      { period: 'August 1, 2026 – July 31, 2027', rate: '$23.50/hr' },
      { period: 'August 1, 2027 – July 31, 2028', rate: '$25.75/hr' },
    ],
    notes: 'Legacy employees hired BEFORE July 2, 1982 follow the standard feeder/package top rate schedule.'
  },
  'combo': {
    label: 'Full-Time Combination Employee (Article 22.4)',
    source: 'Article 22, National Master Agreement',
    rates: [
      { period: 'August 1, 2025 – July 31, 2026 (CURRENT)', rate: '$37.38/hr' },
      { period: 'August 1, 2026 – July 31, 2027', rate: '$38.38/hr' },
      { period: 'August 1, 2027 – July 31, 2028', rate: '$40.63/hr' },
    ],
    notes: null
  },
  'mechanic': {
    label: 'Mechanic (Journeyman)',
    source: 'Atlantic Area Supplemental Agreement',
    rates: [
      { period: 'August 1, 2025 – July 31, 2026 (CURRENT)', rate: '$46.83/hr' },
      { period: 'August 1, 2026 – July 31, 2027', rate: '$47.83/hr' },
      { period: 'August 1, 2027 – July 31, 2028', rate: '$50.08/hr' },
    ],
    notes: 'Sub-classifications: Automotive Helper = 70% of Journeyman rate. Maintenance Handyman = 55% of Journeyman rate.'
  },
  'part-time air driver': {
    label: 'Part-Time Air Driver',
    source: 'Atlantic Area Supplemental Agreement',
    rates: [
      { period: 'August 1, 2025 – July 31, 2026 (CURRENT)', rate: '$35.14/hr (top/out-of-progression rate)' },
      { period: 'August 1, 2026 – July 31, 2027', rate: '$36.14/hr' },
      { period: 'August 1, 2027 – July 31, 2028', rate: '$38.39/hr' },
    ],
    notes: 'New hire progression: Start $21.00 → 12mo $21.50 → 24mo $22.00 → 36mo $23.00 → 48mo top rate. Daily guarantee: 3.5 hours.'
  },
  'full-time air driver': {
    label: 'Full-Time Air Driver',
    source: 'Atlantic Area Supplemental Agreement',
    rates: [
      { period: 'August 1, 2025 – July 31, 2026 (CURRENT)', rate: '$37.38/hr (top/out-of-progression rate)' },
      { period: 'August 1, 2026 – July 31, 2027', rate: '$38.38/hr' },
      { period: 'August 1, 2027 – July 31, 2028', rate: '$40.63/hr' },
    ],
    notes: 'New hire progression: Start $23.00 → 12mo $24.00 → 24mo $25.00 → 36mo $29.00 → 48mo top rate. 8-hour daily / 40-hour weekly guarantee.'
  },
};

function getTopRateContext(classification, question) {
  const q = (question || '').toLowerCase();
  const cl = (classification || '').toLowerCase();

  // Detect from classification field first, then fall back to question text
  const CLASSIFICATION_PHRASES = {
    'feeder driver':       ['feeder driver','feeder drivers','i am a feeder','i\'m a feeder','as a feeder','feeder rate','feeder top rate'],
    'sleeper team':        ['sleeper team','sleeper driver','two man team','two-man team','sleeper pay','sleeper rate','sleeper mileage'],
    'package car driver':  ['package car driver','package car drivers','i am a package car','i\'m a package','package driver','package car rate','rpcd'],
    'mechanic':            ['mechanic','mechanics','journeyman','automotive mechanic','fleet mechanic','mechanic rate','mechanic pay'],
    'combo':               ['combo worker','combo driver','22.4','inside outside','combo rate','combo pay'],
    'part-time air driver':['part time air driver','part-time air driver','air driver rate','pt air driver'],
    'full-time air driver':['full time air driver','full-time air driver','ft air driver','air driver pay'],
    'part-time':           ['part time','part-time','hub worker','preloader','sorter','loader','unloader','pt rate','part time rate','hub pay','part time pay','part-time pay','hub rate'],
  };

  let match = null;

  // Check classification field first
  if (cl) {
    match = Object.keys(TOP_RATE_SCHEDULES).find(k => cl.includes(k));
  }

  // Fall back to scanning question text
  if (!match) {
    for (const [key, phrases] of Object.entries(CLASSIFICATION_PHRASES)) {
      if (phrases.some(p => q.includes(p))) {
        match = key;
        break;
      }
    }
  }

  // Also fire on generic pay/rate questions — inject all relevant rates
  const isGenericRateQuestion = !match && (
    q.includes('top rate') || q.includes('what do i make') || q.includes('how much do i make') ||
    q.includes('what is my pay') || q.includes('what am i paid') || q.includes('what is my rate') ||
    q.includes('my wage') || q.includes('my pay rate') || q.includes('hourly rate') ||
    (q.includes('raise') && (q.includes('when') || q.includes('how much') || q.includes('next')))
  );

  if (!match && !isGenericRateQuestion) return '';

  if (isGenericRateQuestion && !match) {
    // Return a summary of all full-time rates
    return `\nVERIFIED CURRENT TOP RATES (Effective August 1, 2025) — use ONLY these figures:
  - Feeder Driver / Package Car Driver (standard): $45.74/hr
  - Feeder Driver (tractor-trailer singles/doubles): $45.84/hr
  - Double Bottoms premium: +$0.45/hr over tractor-trailer rate
  - Double 40's and Trains premium: +$0.80/hr over tractor-trailer rate
  - Mechanic (Journeyman): $46.83/hr
  - Full-Time Combo Worker (22.4): $37.38/hr
  - Full-Time Air Driver: $37.38/hr
  - Part-Time (hub/preload/sort): $22.50/hr
  - Part-Time Air Driver: $35.14/hr
  Source: Article 53, Section 1, Atlantic Area Supplemental Agreement\n`;
  }

  const schedule = TOP_RATE_SCHEDULES[match];
  const lines = schedule.rates.map(r => `  - ${r.period}: ${r.rate}`).join('\n');
  const notes = schedule.notes ? `\n  Note: ${schedule.notes}` : '';
  const source = schedule.source ? `\n  Source: ${schedule.source}` : '';
  return `\nVERIFIED TOP RATE SCHEDULE FOR ${schedule.label.toUpperCase()} (use ONLY these figures — never use contract text tables for pay rates):${source}\n${lines}${notes}\n`;
}

function buildQAPrompt(question, classification, contractText, todayContext, indexCitationBlock) {
  const topRateContext = getTopRateContext(classification, question);
  const guaranteeContext = getGuaranteeContext(classification, question);
  const holidayContext = getHolidayContext(question);
  const seniorityTiebreakerContext = getSeniorityTiebreakerContext(question);
  const supervisorsWorkingContext = getSupervisorsWorkingContext(question);
  const telematicsContext = getTelematicsContext(question);
  const feederBidContext = getFeederBidContext(question);
  const personalHolidayContext = getPersonalHolidayContext(question);
  const nineFiveContext = getNineFiveContext(question, classification);
  const bumpAndRollContext = getBumpAndRollContext(question);
  const sleeperMileageContext = getSleeperMileageContext(question);

  return `You are a knowledgeable Teamsters contract expert helping a UPS worker understand their rights. Answer clearly and directly — lead with the answer, then add only essential detail. Do not pad responses with unnecessary sections or filler.

SEARCH INDEX ROUTING RULE: When an anchor code like [REF:ATLA-A51-MEAL] is listed below, anchor your analysis to that specific article and section first. Include the anchor code and line reference in your citation so the member knows exactly where in the contract to look.
${indexCitationBlock}
${todayContext}
${topRateContext}${guaranteeContext}${holidayContext}${seniorityTiebreakerContext}${supervisorsWorkingContext}${telematicsContext}${feederBidContext}${personalHolidayContext}${nineFiveContext}${bumpAndRollContext}${sleeperMileageContext}
WORKER'S JOB CLASSIFICATION: ${classification || 'Not specified'}

CONTRACT LANGUAGE (relevant sections only):
${contractText}

RULES:
1. Answer as of TODAY's date — never describe raise schedules or timelines as if it's the beginning of the contract.
2. If asked about raises or pay: lead with exactly what they have NOW and precisely when/what the next increase is, including the number of days away.
3. For pay rates: use ONLY the VERIFIED TOP RATE SCHEDULE above — never calculate rates from the contract text tables.
4. Cite the Article and Section (National Master or Atlantic Area Supplement) briefly. Include anchor code and line ref when available, e.g. Article 51, Sec 1 [REF:ATLA-A51-MEAL, Line L-5100].
5. Quote key contract language only when it genuinely adds clarity — keep quotes short.
6. Never give legal advice — explain the contract only.
7. Keep answers concise. For simple factual questions (pay, dates, guarantees), answer in 2–4 short paragraphs.
8. NEVER guess, estimate, or fill in missing information. Do not use "typically," "generally," "usually," or "approximately" to introduce specific numbers or facts.
9. HARD RULE — 9.5 PROTECTIONS: The 9.5 list and Article 37 Section 1(b) apply ONLY to Package Car Drivers (RPCDs). NEVER tell a Feeder Driver, Sleeper Team driver, or any non-RPCD that they have 9.5 rights. If a Feeder Driver asks about excessive hours, redirect them to FMCSA 14-hour rules under Article 18.
10. If contract text was provided above, use it as your primary source. If the provided text does not contain enough to answer the question, use your general knowledge of the UPS Teamsters National Master and Atlantic Area Supplemental Agreement to give the best answer you can — but flag it clearly: "Based on general contract knowledge (specific section not extracted for this query):"
11. NEVER refuse to answer or say you cannot help. Always provide the most useful answer possible, then suggest the member confirm with their steward for anything high-stakes.

For complex situations involving violations, discipline, or multi-step processes, use only the sections that apply:
  ⚖️ VERDICT: State clearly — VIOLATION or NO VIOLATION — and which Article/Section governs.
  📋 WHAT THE CONTRACT SAYS: Cite the exact Article and Section. Quote the key language directly.
  📖 WHAT IT MEANS: Plain-English explanation of what the contract requires day-to-day.
  ⏱️ TIMING / DEADLINES: Any time limits, windows, or deadlines the worker needs to know.
  💰 PAY / REMEDY: Exact pay calculations — 1.5x, 2x, 4x — or other remedies that apply.
  ✅ WHAT YOU SHOULD DO: Practical next steps — what to say, who to contact, what to document.
  ⚠️ WATCH OUT FOR: Common ways management pushes back or tries to avoid this.

WORKER'S QUESTION: ${question}

Answer directly and concisely:`;
}

// AI providers
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
        const contractName = contract === 'master' ? 'National Master Freight Agreement' : 'Atlantic Area Supplemental Agreement';
        const section = extractArticleSection(text, artNum);
        if (section) {
          articleSections.push({ contractName, articleNum: artNum, text: section });
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
      return Response.json({ mode: 'lookup', found: true, label: lookupResult.label, sections: articleSections });
    }

    // Q&A mode
    const contractText = extractRelevantSections(masterText, localText, question, classification);
    const todayContext = getTodayContext();
    const tocMatches = searchContractIndex(question);
    const indexCitationBlock = buildIndexCitationBlock(tocMatches);
    const prompt = buildQAPrompt(question, classification, contractText, todayContext, indexCitationBlock);

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
        if (answer && answer.trim().length > 10) {
          return Response.json({ mode: 'qa', answer, provider: provider.name });
        }
        errors.push(`${provider.name}: response too short or empty`);
      } catch (err) {
        console.error(`[contract-qa] ${provider.name} failed:`, err.message);
        errors.push(`${provider.name}: ${err.message}`);
      }
    }

    console.error('[contract-qa] All providers failed:', errors);
    return Response.json({ error: `All AI providers failed. Details: ${errors.join(' | ')}` }, { status: 500 });

  } catch (error) {
    return Response.json({ error: `Q&A failed: ${error.message}` }, { status: 500 });
  }
}
