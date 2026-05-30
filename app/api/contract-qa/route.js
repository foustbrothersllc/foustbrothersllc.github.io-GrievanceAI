const CONTRACT_URLS = {
  master: 'https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/refs/heads/main/master-agreement.txt',
  local: 'https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/refs/heads/main/local-agreement.txt'
};

const ARTICLE_LOCATIONS = {
  master: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45'],
  local: ['46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69']
};

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
];

// Keyword to article map for Q&A smart routing
const KEYWORD_ARTICLE_MAP = [
  // Master Article 1 — Bargaining Unit, Scope, Work Preservation
  { keywords: ['bargaining unit','union work','scope','jurisdiction','subcontracting','bad address','rewrap','successors','transfer of company','clerical classification','operations covered'], articles: ['master:1'] },

  // Master Article 3 — Union Shop, Dues, Supervisors Working
  { keywords: ['union membership','dues','check-off','union security','supervisor working','supervisors working','double shift','early call-in','overtime exhaustion','double time penalty','quadruple time','drive contributions','part-time coverage list','supervisor sorting','supervisor loading','supervisor driving'], articles: ['master:3'] },

  // Master Article 4 — Stewards & Weingarten Rights
  { keywords: ['steward','grievance processing','union business','weingarten','investigatory interview','disciplinary meeting','disciplinary representation','warning copy','denying steward','refusing steward'], articles: ['master:4'] },

  // Master Article 6 — Workweek, New Equipment, Technology
  { keywords: ['past practice','maintenance of standards','local conditions','new equipment','technological change','routing software','computerized operations','de-skilling'], articles: ['master:6'] },

  // Master Articles 7 & 8 — Grievance Machinery & Arbitration
  { keywords: ['grievance procedure','panel','arbitration','timelines','national grievance','bench decision','deadlock','binding arbitration','interpretation of master'], articles: ['master:7'] },

  // Master Article 14 — Health & Safety / Heat
  { keywords: ['overweight package','over 70 pounds','heat illness','acclimatization','in-cab ventilation','building fans','water fountain','heat protection','safety violation','workers comp','injury on duty','light duty','tast','broken ac','refused assistance'], articles: ['master:14'] },

  // Master Article 16 — Leave of Absence
  { keywords: ['leave of absence','fmla','personal leave','military leave'], articles: ['master:16'] },

  // Master Article 17 — Pay Shortage / Penalty Pay
  { keywords: ['missing check','short pay','payroll shortage','48 hours','penalty pay','green check','short check','missing pay','paid wrong rate'], articles: ['master:17'] },

  // Master Article 18 — Safety / Equipment / Air Cargo
  { keywords: ['red tag','dvir','unsafe','bad brakes','fmcsa','refused to drive','forced to pull','ordered me to drive','threatened over a red tag','mechanical issue','breakdown','air hub','gateway operations','air sorter','flight delay'], articles: ['master:18'] },

  // Master Article 22 — Inside & Part-Time Employees
  { keywords: ['part time','part-time','hub pay','preload pay','22.3','inside combo','full-time inside','part-time inside','work preservation inside'], articles: ['master:22'] },

  // Master Article 26 — Competition, Rail, SurePost
  { keywords: ['foreign power','vendor trailer','outside truck','contractor','coyote','rail trailer','surepost','rail usage','feeder displacement','substitute transportation','average daily volume','adv','usps competition'], articles: ['master:26'] },

  // Master Article 31 — Garnishments
  { keywords: ['garnishment','wage garnishment','child support','alimony','multiple debts','terminated for garnishment'], articles: ['master:31'] },

  // Master Article 36 — Nondiscrimination
  { keywords: ['discrimination','gender identity','sexual orientation','ada','disability accommodation','civil rights'], articles: ['master:36'] },

  // Master Article 37 — Management Relations, Harassment, 9.5
  { keywords: ['9.5 list','9.5 violation','excessive dispatch','over 9.5','triple time','3x pay','harassment','harassed','intimidated','coerced','over-supervised','hostile','screaming','yelling','cursing','threatened','dignity','retaliation','ride-along','video surveillance','telemetry discipline','fair days work'], articles: ['master:37'] },

  // Master Article 38 — Change of Operations
  { keywords: ['closing building','lane realignment','moving expenses','dovetail seniority','change of operations','pension trust transfer','facility move','structural change'], articles: ['master:38'] },

  // Master Article 39 — Trailer Repair Shops
  { keywords: ['trailer mechanic','shop trainee','tool replacement','tool allowance','trailer repair'], articles: ['master:39'] },

  // Master Articles 40 & 41 — Air & Full-Time Driver Pay / Progression
  { keywords: ['raise','wage increase','pay increase','gwi','general wage','next raise','when do i get paid more','4-year progression','red circled','top rate','break-in rate','step increase','anniversary date','progression scale'], articles: ['master:41','local:60'] },

  // Master Article 43 — Sleeper Teams / Premium Services
  { keywords: ['sleeper team','sleeper','team run','mileage rate','layover pay','under 550','550 miles','took my load','premium service','100 miles','120 miles regional','point-to-point','local feeder displacement'], articles: ['master:43'] },

  // Master Article 33 — COLA
  { keywords: ['cola','cost of living','cost-of-living'], articles: ['master:33'] },

  // Master Article 34 — Pension & Health
  { keywords: ['pension','health insurance','medical benefits','welfare fund','teamcare'], articles: ['master:34'] },

  // Master Article 35 — Drug Testing
  { keywords: ['drug testing','dot physical','random test','sap program'], articles: ['master:35'] },

  // Local Article 46 — Seniority Acquisition
  { keywords: ['30 working days','90 consecutive days','40 days','100 consecutive days','free period','nov 1','dec 31','seniority tie','tie-breaker','coin toss','application date','same seniority date','start time tie','same day hire','seniority number'], articles: ['local:46'] },

  // Local Article 48 — Seniority, Layoff & Recall
  { keywords: ['bypass','bypassed','junior driver','less senior','seniority list','run given away','layoff notice','7 calendar days','emergency notice','displace inside','bump part-time','quarterly posting','updated seniority list','layout sequencing'], articles: ['local:48'] },

  // Local Article 49 — Package Car Job Bids
  { keywords: ['bid center','route vacancy','5-day posting','training period','30-day training','disqualification','route bid','package car bid','senior bidder bypassed'], articles: ['local:49'] },

  // Local Articles 50 & 51 — Feeder Bid Protections
  { keywords: ['tractor-trailer qualified','bid run','super qualified','extra work','present and available','run discontinuance','50-mile rule','yanked off run','dispatch reassigned','on-call took run','extra work bypass','open hot run','dispatch jumping','feeder board','worked through lunch','no meal period','skipped break','forced break','meal period','missed lunch'], articles: ['local:51','master:17'] },

  // Local Article 54 — Holidays
  { keywords: ['holiday','paid holiday','holiday pay','working on holiday','time and a half holiday','holiday qualifier','christmas','thanksgiving','labor day','memorial day','new years','fourth of july','independence day','holiday schedule','90 hours straight-time','attendance gate','day after thanksgiving'], articles: ['local:54'] },

  // Local Article 55 — Vacations & Personal Days
  { keywords: ['vacation','vacation selection','personal day','floating holiday','sick day option','nov 1','nov 30','seniority selection','8 days notice','unused floating','december 31','vacation pay'], articles: ['local:55'] },

  // Local Articles 58 & 59 — Hours, Overtime, Meal Periods
  { keywords: ['sent home early','cut short','guarantee','8 hours','minimum hours','reported for work','daily guarantee','40-hour weekly','unscheduled start time','start time changed','delayed run','time and a half overtime','split shift','8-hour daily guarantee'], articles: ['local:58','local:59','master:22'] },

  // Local Article 60 — Health & Welfare / Pension Contributions
  { keywords: ['health and welfare contribution','pension contribution','monthly contribution','5 days per month','coverage threshold','laid off driver','joint supplemental'], articles: ['local:60'] },

  // Local Article 62 — Maintenance & Fleet Shop
  { keywords: ['automotive mechanic','fleet mechanic','building maintenance','apprenticeship','journeyman ratio','foreman premium','shift differential','mechanic apprentice','trade premium'], articles: ['local:62'] },
];

// Compute today's date context for the AI
function getTodayContext() {
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Raise schedule
  const raises = [
    { year: 2023, date: new Date('2023-08-01'), amount: '$2.75', applied: true },
    { year: 2024, date: new Date('2024-08-01'), amount: '$0.75', applied: true },
    { year: 2025, date: new Date('2025-08-01'), amount: '$0.75', applied: true },
    { year: 2026, date: new Date('2026-08-01'), amount: '$1.00', applied: false },
    { year: 2027, date: new Date('2027-08-01'), amount: '$2.25', applied: false },
  ];

  // Mark which raises have actually been applied based on today
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

function extractArticleSection(text, articleNum, maxChars = 10000) {
  // Contract headers use em dash: "ARTICLE 51—MEAL PERIOD"
  // Match article number followed by anything that is not another digit
  const searchStr = `ARTICLE ${articleNum}`;
  const idx = text.toUpperCase().indexOf(searchStr);
  
  if (idx === -1) return null;
  
  // Make sure the character after the number is not another digit (avoid matching 51 in 510)
  const charAfter = text[idx + searchStr.length];
  if (charAfter && /\d/.test(charAfter)) return null;

  const start = idx;

  // Find the next ARTICLE header
  let end = text.length;
  let searchFrom = start + searchStr.length + 1;
  while (searchFrom < text.length) {
    const nextIdx = text.toUpperCase().indexOf('ARTICLE ', searchFrom);
    if (nextIdx === -1) break;
    // Make sure it's actually a new article (followed by a digit)
    const afterArticle = text[nextIdx + 8];
    if (afterArticle && /\d/.test(afterArticle) && nextIdx > start + 50) {
      end = nextIdx;
      break;
    }
    searchFrom = nextIdx + 1;
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

  if (isFullTime) {
    triggeredArticles.add('local:60');
  } else if (classification) {
    triggeredArticles.add('master:22');
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

// Hard-coded top rate schedules by classification
const TOP_RATE_SCHEDULES = {
  'feeder driver': {
    label: 'Feeder Driver',
    rates: [
      { period: 'August 1, 2023 – July 31, 2024', rate: '$43.24/hr' },
      { period: 'August 1, 2024 – July 31, 2025', rate: '$43.99/hr' },
      { period: 'August 1, 2025 – July 31, 2026', rate: '$45.74/hr' },
      { period: 'August 1, 2026 – July 31, 2027', rate: '$46.74/hr' },
      { period: 'August 1, 2027 – July 31, 2028', rate: '$48.99/hr' },
    ]
  },
  'package car driver': {
    label: 'Package Car Driver',
    rates: [
      { period: 'August 1, 2023 – July 31, 2024', rate: '$43.24/hr' },
      { period: 'August 1, 2024 – July 31, 2025', rate: '$43.99/hr' },
      { period: 'August 1, 2025 – July 31, 2026', rate: '$45.74/hr' },
      { period: 'August 1, 2026 – July 31, 2027', rate: '$46.74/hr' },
      { period: 'August 1, 2027 – July 31, 2028', rate: '$48.99/hr' },
    ]
  },
  'part-time': {
    label: 'Part-Time Employee (Preloader, Sorter, Loader, Unloader, Clerk)',
    rates: [
      { period: 'August 1, 2025 – July 31, 2026', rate: '$22.50/hr (top rate, hired on/after July 2, 1982)' },
      { period: 'August 1, 2026 – July 31, 2027', rate: '$23.50/hr' },
      { period: 'August 1, 2027 – July 31, 2028', rate: '$25.75/hr' },
    ],
    notes: 'Legacy employees hired BEFORE July 2, 1982 follow the Feeder/Package top rate schedule ($45.74 current, $46.74 in 2026, $48.99 in 2027).'
  },
  'combo': {
    label: 'Full-Time Combination Employee (Article 22.4)',
    rates: [
      { period: 'August 1, 2025 – July 31, 2026', rate: '$37.38/hr' },
      { period: 'August 1, 2026 – July 31, 2027', rate: '$38.38/hr' },
      { period: 'August 1, 2027 – July 31, 2028', rate: '$40.63/hr' },
    ]
  },
  'mechanic': {
    label: 'Mechanic (Journeyman)',
    rates: [
      { period: 'August 1, 2023 – July 31, 2024', rate: '$45.33/hr' },
      { period: 'August 1, 2024 – July 31, 2025', rate: '$46.08/hr' },
      { period: 'August 1, 2025 – July 31, 2026', rate: '$46.83/hr' },
      { period: 'August 1, 2026 – July 31, 2027', rate: '$47.83/hr' },
      { period: 'August 1, 2027 – July 31, 2028', rate: '$50.08/hr' },
    ],
    notes: 'Sub-classifications: Automotive Helper = 70% of Journeyman rate (currently $32.78/hr, $33.48 in 2026). Maintenance Handyman = 55% of Journeyman rate (currently $25.76/hr, $26.31 in 2026).'
  },
  'part-time air driver': {
    label: 'Part-Time Air Driver',
    rates: [
      { period: 'August 1, 2025 – July 31, 2026', rate: '$35.14/hr (top/out-of-progression rate)' },
      { period: 'August 1, 2026 – July 31, 2027', rate: '$36.14/hr' },
      { period: 'August 1, 2027 – July 31, 2028', rate: '$38.39/hr' },
    ],
    notes: 'New hire progression: Start $21.00 → 12mo $21.50 → 24mo $22.00 → 36mo $23.00 → 48mo top rate. Daily guarantee: 3.5 hours.'
  },
  'full-time air driver': {
    label: 'Full-Time Air Driver',
    rates: [
      { period: 'August 1, 2025 – July 31, 2026', rate: '$37.38/hr (top/out-of-progression rate)' },
      { period: 'August 1, 2026 – July 31, 2027', rate: '$38.38/hr' },
      { period: 'August 1, 2027 – July 31, 2028', rate: '$40.63/hr' },
    ],
    notes: 'New hire progression: Start $23.00 → 12mo $24.00 → 24mo $25.00 → 36mo $29.00 → 48mo top rate. 8-hour daily / 40-hour weekly guarantee.'
  },
};

// Hard-coded holiday facts (Article 54, Atlantic Area Supplemental Agreement)
const HOLIDAY_FACTS = {
  source: 'Article 54, Atlantic Area Supplemental Agreement',
  holidays: [
    "New Year's Day",
    'Memorial Day',
    'Independence Day (4th of July)',
    'Labor Day',
    'Thanksgiving Day',
    'Christmas Day',
    'The day after Thanksgiving',
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

// Hard-coded guarantee facts by classification
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

function getGuaranteeContext(classification) {
  if (!classification) return '';
  const key = classification.toLowerCase();
  const match = Object.keys(GUARANTEE_FACTS).find(k => key.includes(k));
  if (!match) return '';
  const g = GUARANTEE_FACTS[match];
  const rules = g.rules.length ? '\n' + g.rules.map(r => `  - ${r}`).join('\n') : '';
  return `\nVERIFIED DAILY GUARANTEE FOR ${g.label.toUpperCase()} (use these exact facts — do not guess or estimate):\n  Guarantee: ${g.guarantee}${rules}\n`;
}

function getTopRateContext(classification) {
  if (!classification) return '';
  const key = classification.toLowerCase();
  const match = Object.keys(TOP_RATE_SCHEDULES).find(k => key.includes(k));
  if (!match) return '';
  const schedule = TOP_RATE_SCHEDULES[match];
  const lines = schedule.rates.map(r => `  - ${r.period}: ${r.rate}`).join('\n');
  const notes = schedule.notes ? `\n  Note: ${schedule.notes}` : '';
  return `\nVERIFIED TOP RATE SCHEDULE FOR ${schedule.label.toUpperCase()} (use these exact figures — do not use contract text tables for pay rates):\n${lines}${notes}\n`;
}

function buildQAPrompt(question, classification, contractText, todayContext) {
  const topRateContext = getTopRateContext(classification);
  const guaranteeContext = getGuaranteeContext(classification);
  const holidayContext = getHolidayContext(question);
  return `You are a knowledgeable Teamsters contract expert helping a UPS worker understand their rights. Answer clearly and directly — lead with the answer, then add only essential detail. Do not pad responses with unnecessary sections or filler.

${todayContext}
${topRateContext}${guaranteeContext}${holidayContext}
WORKER'S JOB CLASSIFICATION: ${classification || 'Not specified'}

CONTRACT LANGUAGE (relevant sections only):
${contractText}

RULES:
1. Answer as of TODAY's date — never describe raise schedules or timelines as if it's the beginning of the contract.
2. If asked about raises or pay: lead with exactly what they have NOW and precisely when/what the next increase is, including the number of days away.
3. For pay rates: use ONLY the VERIFIED TOP RATE SCHEDULE above — never calculate rates from the contract text tables, which may be misformatted.
4. Cite the Article and Section (National Master or Atlantic Area Supplement) briefly.
5. Quote key contract language only when it genuinely adds clarity — keep quotes short.
6. Never give legal advice — explain the contract only.
7. Keep answers concise. For simple factual questions (pay, dates, guarantees), answer in 2–4 short paragraphs. Do not force the full section format on simple questions.
8. NEVER guess, estimate, or fill in missing information. If the contract language provided does not explicitly state a specific fact, say "the contract language provided does not specify that — check with your steward." Do not use phrases like "typically," "generally," "usually," "approximately," or "for example" to introduce numbers or facts not found in the contract text.

For complex situations involving violations, discipline, or multi-step processes, use only the sections that apply:
  📋 WHAT THE CONTRACT SAYS
  📖 WHAT IT MEANS
  ⏱️ TIMING / DEADLINES
  💰 PAY / REMEDY
  ✅ WHAT YOU SHOULD DO
  ⚠️ WATCH OUT FOR

WORKER'S QUESTION: ${question}

Answer directly and concisely:`;
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
