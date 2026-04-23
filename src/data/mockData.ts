export type SignalSource = "x" | "reddit" | "hn" | "ph";
export type Intent = "Buying" | "Comparing" | "Venting" | "Learning";
export type Urgency = "high" | "mid" | "low";

export interface Signal {
  title: string;
  sub: string;
  src: SignalSource;
  score: number;
  intent: Intent;
  intentColor: string;
  urgency: Urgency;
  tool: string;
  date: string;
  painPoint: string;
  elvanAngle: string;
  reply: string;
}

export interface Lead {
  src: SignalSource;
  time: string;
  score: number;
  urgency: "high" | "med"; // The HTML uses "med" for leads
  title: string;
  pain: string;
  tool: string;
  angle: string;
  reply: string;
  alerted: boolean;
}

export interface Competitor {
  name: string;
  initials: string;
  color: string;
  bg?: string;
  mentions: number;
  pct: number;
  delta: string;
  down?: boolean;
  up?: boolean;
}

export interface CrossSignal {
  tool: string;
  initials: string;
  color: string;
  sources: SignalSource[];
  score: number;
  titles: string[];
}

export const signals: Signal[] = [
  { 
    title: "Looking for a Delighted alternative — NPS is killing our budget", 
    sub: "r/SaaS · u/marcus_pd · 2h ago", 
    src: "reddit", 
    score: 9, 
    intent: "Buying", 
    intentColor: "#22c55e", 
    urgency: "high", 
    tool: "Delighted", 
    date: "Apr 22",
    painPoint: "User is hitting budget limits on Delighted's NPS tier and looking for a cheaper alternative with feature parity.",
    elvanAngle: "Highlight our unlimited NPS surveys on the Starter plan and free migration assist.",
    reply: "Hey, saw your post — we built Elvan specifically for teams hitting Delighted's pricing wall. Our Starter plan includes unlimited NPS, and we can migrate your historical data in under 48h. Happy to share a quick comparison doc?"
  },
  { 
    title: "Show HN: We replaced Typeform with a self-hosted form builder", 
    sub: "news.ycombinator.com · 3h ago", 
    src: "hn", 
    score: 7, 
    intent: "Comparing", 
    intentColor: "#16a34a", 
    urgency: "mid", 
    tool: "Typeform", 
    date: "Apr 22",
    painPoint: "Developer compared several self-hosted solutions to Typeform and found it too expensive at scale.",
    elvanAngle: "Pitch our open-source compatible webhook and our team pricing model.",
    reply: "Interesting teardown! If cost-at-scale was the driver, Elvan's team pricing might work well — it's per-seat, not per-response. We also have a self-hostable edition if data residency matters."
  },
  { 
    title: "Anyone tried Survicate vs Qualtrics for in-product surveys?", 
    sub: "r/ProductManagement · u/lena.w · 4h ago", 
    src: "reddit", 
    score: 8, 
    intent: "Comparing", 
    intentColor: "#16a34a", 
    urgency: "high", 
    tool: "Qualtrics", 
    date: "Apr 22",
    painPoint: "Product manager needs a tool that handles both in-product surveys and NPS without switching platforms.",
    elvanAngle: "Emphasize our unified survey + NPS dashboard with a single SDK integration.",
    reply: "We designed Elvan to handle exactly this — one SDK for both in-product micro-surveys and quarterly NPS. Would love to do a live demo if you're still evaluating."
  },
  { 
    title: "Pulse — Customer feedback without the survey fatigue", 
    sub: "Product Hunt · launched today", 
    src: "ph", 
    score: 6, 
    intent: "Learning", 
    intentColor: "#86efac", 
    urgency: "mid", 
    tool: "—", 
    date: "Apr 22",
    painPoint: "Founder wants async feedback collection without fatiguing their small user base with long surveys.",
    elvanAngle: "Offer a no-survey passive feedback widget that captures intent without interrupting users.",
    reply: "Love the concept — if you're looking to avoid survey fatigue entirely, Elvan has a passive widget mode that captures intent signals without ever showing a survey form. Might complement what you're building."
  },
  { 
    title: "Medallia pricing just jumped 40% at renewal — options?", 
    sub: "r/CustomerSuccess · u/amir_k · 5h ago", 
    src: "reddit", 
    score: 9, 
    intent: "Buying", 
    intentColor: "#22c55e", 
    urgency: "high", 
    tool: "Medallia", 
    date: "Apr 22",
    painPoint: "Medallia renewed at 40% higher cost without adding features — customer is actively evaluating competitors.",
    elvanAngle: "Lead with our transparent, flat-rate pricing and offer a free audit of their current Medallia spend.",
    reply: "40% jumps at renewal are brutal. Elvan uses flat-rate compute pricing and we've never raised prices mid-contract. Happy to run a free cost audit comparing against your current Medallia spend."
  },
  { 
    title: "Ask HN: Best way to capture buying signals from support tickets?", 
    sub: "news.ycombinator.com · 6h ago", 
    src: "hn", 
    score: 5, 
    intent: "Learning", 
    intentColor: "#86efac", 
    urgency: "mid", 
    tool: "—", 
    date: "Apr 21",
    painPoint: "Support team lead wants a way to automatically tag buying signals inside Zendesk/Intercom tickets.",
    elvanAngle: "Demo our AI tagging integration that works natively with Zendesk and Intercom.",
    reply: "We actually built a native Zendesk integration for this exact use-case — it auto-tags tickets with buying signals and routes them to your CRM. Want me to drop a short demo link?"
  },
  { 
    title: "Why we churned from Typeform after 4 years (post-mortem)", 
    sub: "r/startups · u/dev_noa · 8h ago", 
    src: "reddit", 
    score: 7, 
    intent: "Venting", 
    intentColor: "#4ade80", 
    urgency: "mid", 
    tool: "Typeform", 
    date: "Apr 21",
    painPoint: "Marketing team churned due to poor logic branching and lack of real-time analytics in Typeform.",
    elvanAngle: "Show our conditional logic builder and weekly digest email — features Typeform lacks.",
    reply: "We hear this a lot from teams leaving Typeform. Elvan has multi-branch conditional logic and sends a weekly AI digest of your results trends — happy to set up a trial migration from your existing forms."
  },
  { 
    title: "ReplyGuy AI — Find & respond to Reddit leads on autopilot", 
    sub: "Product Hunt · 9h ago", 
    src: "ph", 
    score: 3, 
    intent: "Learning", 
    intentColor: "#86efac", 
    urgency: "low", 
    tool: "—", 
    date: "Apr 21",
    painPoint: "Indie maker promoting a tool to automate lead finding — low urgency, but signals competitor awareness.",
    elvanAngle: "Monitor this space — the person may respond positively to a direct outreach with a comparison doc.",
    reply: "Elvan covers this space too — we automatically surface Reddit and HN threads where people mention competitor tools, with draft replies ready to go. Worth a look for your workflow."
  }
];

export const leads: Lead[] = [
  {
    src: "reddit", time: "2h ago", score: 9.2, urgency: "high",
    title: "Frustrated with Delighted NPS pricing — looking for alternatives",
    pain: "User is hitting budget limits on Delighted's NPS tier and actively seeking cheaper alternatives with feature parity.",
    tool: "Delighted",
    angle: "Highlight our unlimited NPS surveys on the Starter plan and offer a free data migration within 48h.",
    reply: "Hey, saw your post — we built Elvan specifically for teams hitting Delighted's pricing wall. Our Starter plan has unlimited NPS, and we'll migrate your data for free. Happy to share a quick comparison doc?",
    alerted: true
  },
  {
    src: "hn", time: "4h ago", score: 8.9, urgency: "high",
    title: "Ask HN: Best managed Postgres that doesn't cost a fortune for staging?",
    pain: "Startup needs DB branching for staging environments but Neon/Supabase pricing is scaling poorly for their dev team.",
    tool: "Supabase",
    angle: "Pitch our flat-rate environment branching and unlimited ephemeral DB feature for staging teams.",
    reply: "We saw this exact problem scaling staging for 20+ devs. At Elvan we charge flat-rate compute and allow unlimited ephemeral branching — might fit your staging model better than per-project billing.",
    alerted: false
  },
  {
    src: "ph", time: "6h ago", score: 8.1, urgency: "med",
    title: "LaunchFast 2.0 comment — missing deep Stripe billing integration",
    pain: "Commenter needs complex subscription tier handling but LaunchFast lacks deep native Stripe integration.",
    tool: "LaunchFast",
    angle: "Mention our robust billing engine templates that handle complex subscription edge cases out of the box.",
    reply: "If complex Stripe tiers are a blocker, you might want to look at Elvan UI. We spent 3 months building the billing engine templates to handle exactly those edge cases — would love to show you a demo.",
    alerted: true
  },
  {
    src: "reddit", time: "7h ago", score: 9.6, urgency: "high",
    title: "Medallia pricing jumped 40% at renewal — we're evaluating alternatives now",
    pain: "Enterprise customer was hit with a 40% renewal price hike from Medallia without any new feature additions.",
    tool: "Medallia",
    angle: "Lead with transparent flat-rate pricing and offer a free cost audit comparing against their current Medallia spend.",
    reply: "40% jumps at renewal with no new features are brutal. Elvan uses flat-rate compute pricing and we've never raised prices mid-contract. Happy to do a free cost audit vs your current Medallia spend.",
    alerted: true
  },
  {
    src: "hn", time: "9h ago", score: 8.4, urgency: "high",
    title: "Ask HN: How do you handle customer churn prediction at early stage?",
    pain: "Founder wants to identify churn signals early but existing tools (Mixpanel, Amplitude) are cost-prohibitive at sub-$1M ARR.",
    tool: "Amplitude",
    angle: "Show our early-stage pricing tier with built-in churn signal detection, starting free up to 10k MAU.",
    reply: "We built our early-stage tier exactly for this — churn signal detection with behavioral triggers, free up to 10k MAU. No Mixpanel tax until you're ready for it. Happy to set up a trial?",
    alerted: false
  },
  {
    src: "reddit", time: "11h ago", score: 8.0, urgency: "med",
    title: "Why we churned from Typeform after 4 years — a post-mortem",
    pain: "Team left Typeform due to poor conditional logic, no real-time analytics digest, and hidden price increases at scale.",
    tool: "Typeform",
    angle: "Show our conditional logic builder and weekly AI digest email — direct answers to their specific Typeform pain points.",
    reply: "We hear this a lot from teams leaving Typeform. Elvan has multi-branch conditional logic and an AI digest email every week. Happy to set up a 20-min migration trial from your existing forms.",
    alerted: false
  },
];

export const competitors: Competitor[] = [
  { name: "Delighted", initials: "D", color: "#ec4899", mentions: 512, pct: 100, delta: "+12%", up: true, down: false },
  { name: "Typeform", initials: "T", color: "#6366f1", bg: "#f9fafb", mentions: 438, pct: 85, delta: "+8%", up: true, down: false },
  { name: "Qualtrics", initials: "Q", color: "#00b5e2", mentions: 286, pct: 56, delta: "−3%", up: false, down: true },
  { name: "Survicate", initials: "S", color: "#f97316", mentions: 184, pct: 36, delta: "+22%", up: true, down: false },
  { name: "Medallia", initials: "M", color: "#7c3aed", mentions: 142, pct: 28, delta: "+4%", up: true, down: false },
  { name: "Hotjar", initials: "H", color: "#f43f5e", mentions: 98, pct: 19, delta: "−1%", up: false, down: true },
];

export const overviewCompetitors: Competitor[] = [
  { name: "Delighted", initials: "D", color: "#ec4899", mentions: 214, pct: 100, delta: "+12%" },
  { name: "Typeform", initials: "T", color: "#111827", bg: "#f9fafb", mentions: 186, pct: 87, delta: "+8%" },
  { name: "Qualtrics", initials: "Q", color: "#00b5e2", mentions: 142, pct: 66, delta: "−3%", down: true },
  { name: "Survicate", initials: "S", color: "#6366f1", mentions: 98, pct: 46, delta: "+22%" },
  { name: "Medallia", initials: "M", color: "#7c3aed", mentions: 71, pct: 33, delta: "+4%" },
];

export const crossSignals: CrossSignal[] = [
  {
    tool: "Delighted", initials: "D", color: "#ec4899",
    sources: ["reddit", "hn", "ph"],
    score: 17.4,
    titles: [
      "Looking for a Delighted alternative — NPS pricing killing our budget",
      "Show HN: We replaced Delighted with an open-source NPS stack"
    ]
  },
  {
    tool: "Typeform", initials: "T", color: "#6366f1",
    sources: ["reddit", "hn"],
    score: 15.1,
    titles: [
      "Why we churned from Typeform after 4 years (post-mortem)",
      "Ask HN: Best Typeform alternative for conditional logic forms?"
    ]
  },
  {
    tool: "Qualtrics", initials: "Q", color: "#00b5e2",
    sources: ["reddit", "ph"],
    score: 14.8,
    titles: [
      "Medallia and Qualtrics pricing jumped 40% — anyone else affected?",
      "AskReddit: Qualtrics enterprise license vs alternatives for mid-market"
    ]
  },
  {
    tool: "Survicate", initials: "S", color: "#f97316",
    sources: ["hn", "ph"],
    score: 11.2,
    titles: [
      "Ask HN: In-product survey SDKs that don't track users across sites",
      "Survicate vs Pendo Feedback — a 6-month comparison"
    ]
  },
];
