import { SocialAccount, Post, WeeklyGrowthReport, Playbook } from "./types";

export const INITIAL_ACCOUNTS: SocialAccount[] = [
  {
    id: "ig_1",
    platform: "Instagram",
    username: "@water_creator_ai",
    followerCount: 14500,
    isConnected: true,
    engagementRate: 5.4,
    reach: 48900,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    growthTrend: [13100, 13400, 13600, 13900, 14100, 14300, 14500],
    customInstructions: "Highly visual copy. Emphasize visual aesthetic and layout guides. End with a strong call-to-action to comment a keyword for auto-DM delivery."
  },
  {
    id: "tt_1",
    platform: "TikTok",
    username: "@watercreator.tok",
    followerCount: 42100,
    isConnected: true,
    engagementRate: 8.7,
    reach: 125000,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    growthTrend: [38000, 39200, 40100, 40900, 41500, 41800, 42100],
    customInstructions: "Frontload key curiosity hook in the first 0.8 seconds. Use conversational, fast-paced narration. Suggest dynamic, trending background music options."
  },
  {
    id: "yt_1",
    platform: "YouTube",
    username: "Water Creator Studio",
    followerCount: 8900,
    isConnected: true,
    engagementRate: 6.1,
    reach: 67200,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    growthTrend: [8200, 8350, 8480, 8610, 8730, 8820, 8900],
    customInstructions: "Hook viewers with immediate visual comparison or shocking fact. Keep description optimized for search algorithms with structured timestamps."
  },
  {
    id: "li_1",
    platform: "LinkedIn",
    username: "Water Creator AI",
    followerCount: 3100,
    isConnected: true,
    engagementRate: 4.2,
    reach: 18400,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    growthTrend: [2800, 2850, 2910, 2980, 3020, 3060, 3100],
    customInstructions: "Use spacious line breaks, avoid corporate jargon, focus on personal failure-to-learn narrative arcs. Clean bullet points only."
  },
  {
    id: "fb_1",
    platform: "Facebook",
    username: "Water Creator Hub",
    followerCount: 9200,
    isConnected: true,
    engagementRate: 3.8,
    reach: 31200,
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    growthTrend: [8600, 8750, 8900, 8980, 9050, 9120, 9200],
    customInstructions: "Write in a friendly, community-oriented tone. Emphasize questions that spark discussions in the comments. Keep hashtags moderate (3-5)."
  },
  {
    id: "x_1",
    platform: "X",
    username: "@water_creator_x",
    followerCount: 22100,
    isConnected: true,
    engagementRate: 7.2,
    reach: 98400,
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    growthTrend: [20500, 20900, 21200, 21500, 21800, 22000, 22100],
    customInstructions: "Write concise, value-dense tweets or threads under 280 characters. Start with a polarizing hook. Minimize hashtags (max 1) and use clean formatting."
  },
  {
    id: "kw_1",
    platform: "Kwai",
    username: "@water_creator_kw",
    followerCount: 15300,
    isConnected: false,
    engagementRate: 9.1,
    reach: 45000,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    growthTrend: [13000, 13500, 14000, 14500, 14800, 15100, 15300],
    customInstructions: "High-energy presentation, very direct and visual hook. End with an invitation to follow for fast daily digital hacks."
  },
  {
    id: "bsky_1",
    platform: "BlueSky",
    username: "@watercreator.bsky.social",
    followerCount: 4300,
    isConnected: false,
    engagementRate: 6.8,
    reach: 12300,
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    growthTrend: [3800, 3950, 4050, 4120, 4190, 4250, 4300],
    customInstructions: "Vibe should be developer-friendly, authentic, text-heavy, with witty tech humor. Avoid emoji spam and typical clickbaity marketing copy."
  },
  {
    id: "tg_1",
    platform: "Telegram",
    username: "t.me/water_creator_channel",
    followerCount: 28400,
    isConnected: true,
    engagementRate: 11.2,
    reach: 84000,
    avatarUrl: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=150&auto=format&fit=crop&q=80",
    growthTrend: [25000, 25800, 26400, 27000, 27500, 28000, 28400],
    customInstructions: "Direct, high-value summaries. Use bold markdown formatting for headlines, include clear step-by-step instructions or bullet points, and add a quick-access button or link. Minimize hashtags, keep tone clean and direct."
  },
  {
    id: "wa_1",
    platform: "WhatsApp",
    username: "Water Creator VIP Community",
    followerCount: 12500,
    isConnected: true,
    engagementRate: 18.5,
    reach: 52000,
    avatarUrl: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=150&auto=format&fit=crop&q=80",
    growthTrend: [10000, 10500, 11000, 11500, 11900, 12200, 12500],
    customInstructions: "Hyper-conversational, informal, and personal. Use formatting like *bold* and _italics_ to emphasize core points. Include actionable takeaways and an friendly direct call to reply or ask questions."
  },
  {
    id: "wc_1",
    platform: "WeChat",
    username: "Water Creator Official",
    followerCount: 6200,
    isConnected: false,
    engagementRate: 8.4,
    reach: 19500,
    avatarUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80",
    growthTrend: [5500, 5650, 5800, 5900, 6010, 6100, 6200],
    customInstructions: "Provide bilingual or professional insights. Organize with structured section headers, clear introduction, deep-dive central content, and interactive footer questions to spark discussions in the WeChat group."
  },
  {
    id: "sub_1",
    platform: "Substack",
    username: "watercreator.substack.com",
    followerCount: 8100,
    isConnected: true,
    engagementRate: 24.3,
    reach: 32000,
    avatarUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
    growthTrend: [7000, 7200, 7400, 7600, 7800, 7950, 8100],
    customInstructions: "In-depth, long-form essay tone. Include a clear newsletter intro, detailed analysis with rich markdown tables or bulleted resources, and a strong call-to-action asking readers to subscribe to the newsletter."
  },
  {
    id: "vk_1",
    platform: "VK",
    username: "vk.com/water_creator",
    followerCount: 19400,
    isConnected: false,
    engagementRate: 5.1,
    reach: 42000,
    avatarUrl: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80",
    growthTrend: [17500, 17900, 18300, 18700, 19000, 19200, 19400],
    customInstructions: "Russian-inclusive or globally-minded content layout. Friendly community tone. Highlight structural tips, and include an invitation to check out the shared community materials or files."
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: "pub_1",
    title: "AI Automation Secrets",
    text: "Stop wasting hours writing cold emails. Here is the exact 3-step AI prompt chain that saved me 20 hours last week. 👇\n\n1. Feed it your company profile.\n2. Ask for 5 unique value propositions.\n3. Wrap into hyper-personalized templates.\n\nSave this for later!",
    scheduledDate: "2026-06-25T10:00:00Z",
    platforms: ["LinkedIn", "Instagram"],
    status: "published",
    metrics: {
      views: 18500,
      likes: 1240,
      comments: 98,
      shares: 340,
      engagement: 6.7,
    },
  },
  {
    id: "pub_2",
    title: "Coding in Your Sleep",
    text: "Can AI actually write a fully functional app while you sleep? I tested 3 custom agent pipelines last night. The results were shocking. Some loops broke, but one managed to deploy to production entirely solo. Full setup details coming tomorrow morning. Drop your questions below!",
    scheduledDate: "2026-06-26T15:30:00Z",
    platforms: ["TikTok", "YouTube"],
    status: "published",
    metrics: {
      views: 52400,
      likes: 4890,
      comments: 312,
      shares: 1120,
      engagement: 9.9,
    },
  },
  {
    id: "sch_1",
    title: "Cross Platform Domination",
    text: "Create once. Dominate everywhere. It is not about writing different content; it is about respecting each platform's distinct visual and structural specs. Tomorrow I am launching my ultimate playbook on converting 1 base concept into 5 viral variations in 3 minutes.",
    scheduledDate: "2026-06-28T09:00:00Z", // Scheduled for tomorrow morning
    platforms: ["Instagram", "LinkedIn", "TikTok", "YouTube"],
    status: "scheduled",
  },
  {
    id: "sch_2",
    title: "The Agnes Presenter Hook",
    text: "Say hello to Agnes. She is my custom avatar presenter powered entirely by script-driven AI. Built-in lip-sync, precise expression rendering, and instant script adaptation. We are open-sourcing the base canvas model soon. Stay tuned!",
    scheduledDate: "2026-06-30T14:00:00Z",
    platforms: ["YouTube"],
    status: "scheduled",
  },
];

export const INITIAL_REPORT: WeeklyGrowthReport = {
  nicheAssessed: "SaaS & AI Creator Economy",
  topPerformerSpotlight: {
    platform: "TikTok",
    concept: "Behind-the-Scenes Agent Testing",
    whyItWorked: "The algorithm heavily favored the raw, fast-paced talking head opener. The high retention (48% through 3s) pushed it straight into general tech streams.",
    keyTakeaway: "Front-load the dynamic punchline in the first 0.8 seconds before explaining the logic.",
  },
  recoveryTip: {
    issueIdentified: "Weak Hook and Blocky Copy on LinkedIn",
    fixAction: "Apply clean spacing, remove self-congratulatory wording, and start with an immediate polarizing statistic.",
    templateText: "93% of creators are writing captions the wrong way.\n\nThey start with 'I am thrilled to announce...'\n\nInstead, do this:\n- Start with the exact metric\n- Create white space\n- Close with a 1-click resource offer.\n\nTry this layout tonight.",
    platform: "LinkedIn",
  },
  suggestedNextPost: {
    title: "The Zero-Budget Viral Setup",
    platform: "Instagram",
    aspectRatio: "1:1",
    formatCategory: "Educational Carousel",
    recommendedHook: "My $0 tech stack to automate 90% of my social media schedule.",
    copywritingFramework: "PAS (Problem, Agitate, Solve)",
    suggestedDraft: "You do not need a $500 monthly SaaS stack to stay visible.\n\nHere is my exact zero-budget pipeline to plan, design, and script 30 days of posts in 1 afternoon:\n\n1️⃣ Water Creator (Free tier) -> Create base variations\n2️⃣ Unsplash + Canva -> High-contrast templates\n3️⃣ In-app scheduling -> Autopilot queue\n\nComment 'STACK' and I will DM you the step-by-step setup guides!",
    recommendedTags: ["#creatoreconomy", "#saasgrowth", "#productivityhacks", "#solopreneur"],
  },
};

export const PLATFORM_PLAYBOOKS: Playbook[] = [
  {
    id: "pb_1",
    title: "The Viral LinkedIn Carousel",
    platform: "LinkedIn",
    description: "Multi-page visual document setup that drives massive algorithmic impressions and shares.",
    hookTemplate: "I analyzed 100 viral LinkedIn slide decks. Here is the 10-page structure they all share.",
    structure: "Slide 1: High contrast problem statement\nSlide 2: Agitate with industry stats\nSlide 3-7: Single actionable point per page (maximum 15 words per slide)\nSlide 8: Full summary page\nSlide 9: Interactive question (Call to Action)\nSlide 10: Profile follow graphic",
    example: "Topic: SaaS Copywriting Secrets. Use large bold display headers (Inter 48px) and a high-contrast white-on-dark-gray canvas.",
  },
  {
    id: "pb_2",
    title: "The TikTok Curiosity Hook",
    platform: "TikTok",
    description: "Rapid visual and narration pattern designed to spike video retention in the first 3 seconds.",
    hookTemplate: "This is the exact 3-second visual hack that got me 50k views on a brand new account.",
    structure: "0.0s - 0.8s: Sudden visual zoom + text overlay question\n0.8s - 3.0s: State a highly counter-intuitive truth (e.g. 'I stopped posting on weekends and my views tripled')\n3.0s - 15s: Step-by-step proof\n15s - 20s: Loop back to the start caption",
    example: "Script: 'Stop posting hashtags. Here is what the TikTok developer documentation actually says about keyword SEO in 2026...'",
  },
  {
    id: "pb_3",
    title: "The Instagram 'Ask & Deliver' Loop",
    platform: "Instagram",
    description: "Drive comments and automations by offering a private resource directly in your DMs.",
    hookTemplate: "Comment 'SCALE' and I will DM you my custom automation blueprint.",
    structure: "Step 1: Focus on a specific pain point (e.g., 'Writing copy is draining')\nStep 2: Show a preview of the solution\nStep 3: Tell viewers to comment a specific keyword\nStep 4: Configure automated DM delivery",
    example: "Topic: Cold Outreach Template. Post a visually striking 1:1 image with large text 'THE $10k/MO DM TEMPLATE' and caption ending with 'Comment TEMPLATE below!'",
  },
  {
    id: "pb_4",
    title: "The YouTube Shorts Retention Build",
    platform: "YouTube",
    description: "Engage search traffic and shelf impressions with structured B-roll and fast narration.",
    hookTemplate: "Don't buy a microphone until you try this free AI audio tool.",
    structure: "Step 1: Immediate audio-visual transition\nStep 2: Compare bad audio to studio audio using a live voice test\nStep 3: Reveal the website name clearly\nStep 4: Give rapid setup tips with captions in the middle of the screen",
    example: "Vibe: Casual, authentic, high-speed talking-head paired with energetic background beats.",
  },
];
