import { useState, Dispatch, SetStateAction } from "react";
import { 
  TrendingUp, Users, Eye, Award, Activity, Sparkles, RefreshCw, 
  ArrowRight, AlertCircle, BookOpen, Plus, Check, Play, Settings,
  Printer, Download, Calendar, Flame, Heart, MessageSquare, Share2,
  Percent, Zap
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { SocialAccount, Post, WeeklyGrowthReport, Playbook } from "../types";

interface AnalyticsCentralProps {
  accounts: SocialAccount[];
  setAccounts: Dispatch<SetStateAction<SocialAccount[]>>;
  posts: Post[];
  setPosts: Dispatch<SetStateAction<Post[]>>;
  growthReport: WeeklyGrowthReport;
  setGrowthReport: Dispatch<SetStateAction<WeeklyGrowthReport>>;
  playbooks: Playbook[];
  onTryTemplate: (text: string, platforms: string[]) => void;
}

export default function AnalyticsCentral({
  accounts,
  setAccounts,
  posts,
  setPosts,
  growthReport,
  setGrowthReport,
  playbooks,
  onTryTemplate
}: AnalyticsCentralProps) {
  const [selectedPostId, setSelectedPostId] = useState<string>(posts[0]?.id || "");
  const [diagnosing, setDiagnosing] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportNiche, setReportNiche] = useState("SaaS & Creator Economy");
  const [chartMetric, setChartMetric] = useState<"followerCount" | "reach" | "engagementRate">("followerCount");
  const [editingNiche, setEditingNiche] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(29); // Default to today (index 29)
  const [heatmapViewMode, setHeatmapViewMode] = useState<"engagement" | "volume">("engagement");
  const [roiPriority, setRoiPriority] = useState<"volume" | "engagement" | "balanced">("balanced");

  // Trending Topics states
  const [trendingTopics, setTrendingTopics] = useState<any[]>([
    {
      topic: "AI Agent Workflows",
      explanation: "High audience interest in workflows that automate coding and administrative tasks rather than simple chat prompts.",
      trafficSpike: "+180% Spike",
      sentiment: "Highly positive",
      suggestedAngle: "Create a 60-second tutorial showing how to build an autonomous agent using Google AI Studio in under 5 minutes.",
      tags: ["#AIAgents", "#AIStudio", "#DeveloperProductivity"]
    },
    {
      topic: "Solopreneur Micro-SaaS",
      explanation: "Individual creators launching hyper-focused software products with zero external funding or large dev teams.",
      trafficSpike: "High Interest",
      sentiment: "Curious & Inspired",
      suggestedAngle: "Break down the exact monthly tech stack and costs of a $10k/month micro-SaaS in a carousel format.",
      tags: ["#MicroSaaS", "#IndieHackers", "#Solopreneur"]
    },
    {
      topic: "Vertical AI Tools",
      explanation: "Shift from general AI assistants to hyper-targeted tools serving specific industries (e.g. legal, real estate, medical).",
      trafficSpike: "+95% Emerging",
      sentiment: "Optimistic",
      suggestedAngle: "Review 3 brand-new vertical AI tools that save professionals 10+ hours a week in a high-energy short-form video.",
      tags: ["#VerticalAI", "#FutureOfWork", "#ProductivityHacks"]
    }
  ]);
  const [trendingSources, setTrendingSources] = useState<any[]>([
    { title: "The Rise of Micro-SaaS Platforms", url: "https://news.ycombinator.com" },
    { title: "Building Autonomous Agents with Gemini", url: "https://ai.google.dev" }
  ]);
  const [trendsQuery, setTrendsQuery] = useState("SaaS & Creator Economy");
  const [fetchingTrends, setFetchingTrends] = useState(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);

  const fetchTrendingTopics = async (customNiche?: string) => {
    const targetNiche = customNiche || trendsQuery || reportNiche;
    if (!targetNiche) return;
    setFetchingTrends(true);
    setTrendsError(null);
    try {
      const response = await fetch("/api/trending-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: targetNiche }),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.trends && Array.isArray(data.trends)) {
        setTrendingTopics(data.trends);
        if (data.sources) {
          setTrendingSources(data.sources);
        }
      } else {
        throw new Error("No trends found in API response.");
      }
    } catch (err: any) {
      console.error("Error fetching trending topics:", err);
      setTrendsError(err.message || "Failed to load trending topics.");
    } finally {
      setFetchingTrends(false);
    }
  };

  // Dynamic calculations
  const connectedAccounts = accounts.filter(a => a.isConnected);

  // Relative production effort scores on a 1-10 scale
  const platformEffortMap: Record<string, number> = {
    Instagram: 6,
    TikTok: 7,
    YouTube: 9,
    LinkedIn: 5,
    Facebook: 4,
    X: 3,
    Kwai: 6,
    BlueSky: 3,
    Telegram: 3,
    WhatsApp: 2,
    WeChat: 6,
    Substack: 8,
    VK: 4
  };

  const platformComparisons = connectedAccounts.map(acc => {
    // Calculate follower growth rate based on growthTrend
    let growthRate = 0;
    if (acc.growthTrend && acc.growthTrend.length >= 2) {
      const first = acc.growthTrend[0];
      const last = acc.growthTrend[acc.growthTrend.length - 1];
      if (first > 0) {
        growthRate = ((last - first) / first) * 100;
      }
    } else {
      growthRate = acc.followerCount > 10000 ? 4.25 : 6.80;
    }

    const effort = platformEffortMap[acc.platform] || 5;

    // Weight allocations based on strategic focus
    let weightGrowth = 1.0;
    let weightEngagement = 1.0;
    let weightReach = 1.0;

    if (roiPriority === "volume") {
      weightGrowth = 2.0;
      weightEngagement = 0.5;
      weightReach = 1.5;
    } else if (roiPriority === "engagement") {
      weightGrowth = 0.5;
      weightEngagement = 2.5;
      weightReach = 0.5;
    }

    // ROI Formula: (weighted growth rate + weighted engagement rate + weighted reach factor) / production effort factor * 10
    const reachFactor = acc.reach / 10000;
    const gainMetric = (growthRate * weightGrowth) + (acc.engagementRate * weightEngagement) + (reachFactor * weightReach);
    const roiScore = Number(((gainMetric / (effort / 5)) * 10).toFixed(1));

    return {
      ...acc,
      growthRate: Number(growthRate.toFixed(2)),
      effort,
      roiScore
    };
  });

  // Sort comparisons to highlight the highest ROI platform
  const sortedByROI = [...platformComparisons].sort((a, b) => b.roiScore - a.roiScore);
  const topRoiAccount = sortedByROI[0];

  const totalFollowers = connectedAccounts.reduce((acc, curr) => acc + curr.followerCount, 0);
  const totalReach = connectedAccounts.reduce((acc, curr) => acc + curr.reach, 0);
  const avgEngagement = connectedAccounts.length > 0 
    ? (connectedAccounts.reduce((acc, curr) => acc + curr.engagementRate, 0) / connectedAccounts.length).toFixed(1)
    : "0";

  // Generate last 30 days of posting frequency and engagement intensity
  const BASE_DATE = new Date("2026-06-27T12:00:00Z");
  
  const heatmapDays = Array.from({ length: 30 }).map((_, index) => {
    const daysAgo = 29 - index;
    const date = new Date(BASE_DATE.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
    
    // Find matching posts in posts prop
    const postsOnDay = posts.filter(p => {
      if (!p.scheduledDate) return false;
      const pDateStr = p.scheduledDate.split("T")[0];
      return pDateStr === dateStr && p.status === "published";
    });

    let hasPost = postsOnDay.length > 0;
    let postCount = postsOnDay.length;
    let views = postsOnDay.reduce((sum, p) => sum + (p.metrics?.views || 0), 0);
    let maxER = postsOnDay.reduce((max, p) => Math.max(max, p.metrics?.engagement || 0), 0);

    // Seed data so the heatmap looks beautifully active and populated
    const seedIndices = [2, 5, 8, 12, 15, 18, 21, 24, 26, 28];
    const seedTitles = [
      "V2 Launch Countdown",
      "SaaS Pricing Mistake",
      "The 3-Step AI Pipeline",
      "No-Code AI App Builders",
      "Inside a $50k/mo Agent",
      "Zero-shot SEO Growth",
      "My Ultimate Copy Framework",
      "Is ChatGPT Getting Dumber?",
      "Building in Public: Day 45",
      "Cross-Platform Dominator"
    ];
    const seedPlatforms = [
      ["Instagram", "TikTok"],
      ["LinkedIn"],
      ["YouTube", "Instagram"],
      ["TikTok"],
      ["LinkedIn", "YouTube"],
      ["Instagram"],
      ["TikTok", "YouTube", "LinkedIn"],
      ["LinkedIn"],
      ["Instagram"],
      ["YouTube", "TikTok"]
    ];

    const currentSeedPosts = [...postsOnDay];

    if (!hasPost && seedIndices.includes(index)) {
      hasPost = true;
      postCount = 1;
      const seedIndex = seedIndices.indexOf(index);
      views = 5200 + (seedIndex * 4800) + (index * 320);
      maxER = Number((3.5 + (seedIndex * 0.7) + (index % 3) * 0.4).toFixed(1));
      
      currentSeedPosts.push({
        id: `seed_post_${index}`,
        title: seedTitles[seedIndex % seedTitles.length],
        text: `Seeded campaign optimizing engagement in the ${reportNiche} niche. This post leverages highly optimized space layout and algorithmic hooks.`,
        scheduledDate: date.toISOString(),
        platforms: seedPlatforms[seedIndex % seedPlatforms.length],
        status: "published",
        metrics: {
          views,
          likes: Math.round(views * 0.082),
          comments: Math.round(views * 0.007),
          shares: Math.round(views * 0.021),
          engagement: maxER
        }
      });
    }

    // Dynamic adjustment when accounts connection engagement rate changes (Simulate Growth Spike)
    const connectedAccs = accounts.filter(a => a.isConnected);
    const avgConnectedER = connectedAccs.length > 0 
      ? connectedAccs.reduce((sum, a) => sum + a.engagementRate, 0) / connectedAccs.length 
      : 5;
    
    const baseAvgER = 5.4;
    if (avgConnectedER > baseAvgER && hasPost) {
      const ratio = avgConnectedER / baseAvgER;
      views = Math.round(views * ratio);
      maxER = Number((maxER * ratio).toFixed(1));
      
      currentSeedPosts.forEach(p => {
        if (p.metrics) {
          p.metrics.views = Math.round(p.metrics.views * ratio);
          p.metrics.engagement = Number((p.metrics.engagement * ratio).toFixed(1));
          p.metrics.likes = Math.round(p.metrics.views * 0.082);
          p.metrics.shares = Math.round(p.metrics.views * 0.021);
        }
      });
    }

    // Intensity levels (0-4)
    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (hasPost) {
      if (heatmapViewMode === "volume") {
        intensity = Math.min(postCount, 4) as 0 | 1 | 2 | 3 | 4;
      } else {
        if (maxER < 3.5) intensity = 1;
        else if (maxER < 6.0) intensity = 2;
        else if (maxER < 8.5) intensity = 3;
        else intensity = 4;
      }
    }

    return {
      date,
      dateStr,
      hasPost,
      postCount,
      engagementRate: maxER,
      views,
      intensity,
      postsOnDay: currentSeedPosts
    };
  });

  const selectedDay = heatmapDays[selectedDayIndex] || heatmapDays[29];

  // Chart data formatting
  const chartData = [
    { name: "Mon", Instagram: 13100, TikTok: 38000, YouTube: 8200, LinkedIn: 2800 },
    { name: "Tue", Instagram: 13400, TikTok: 39200, YouTube: 8350, LinkedIn: 2850 },
    { name: "Wed", Instagram: 13600, TikTok: 40100, YouTube: 8480, LinkedIn: 2910 },
    { name: "Thu", Instagram: 13900, TikTok: 40900, YouTube: 8610, LinkedIn: 2980 },
    { name: "Fri", Instagram: 14100, TikTok: 41500, YouTube: 8730, LinkedIn: 3020 },
    { name: "Sat", Instagram: 14300, TikTok: 41800, YouTube: 8820, LinkedIn: 3060 },
    { name: "Sun", Instagram: 14500, TikTok: 42100, YouTube: 8900, LinkedIn: 3100 },
  ];

  // Selected post for diagnosis
  const selectedPostForDiagnosis = posts.find(p => p.id === selectedPostId);

  // Toggle account connection
  const toggleAccount = (id: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        return { ...acc, isConnected: !acc.isConnected };
      }
      return acc;
    }));
  };

  // Run AI post diagnosis
  const runDiagnosis = async () => {
    if (!selectedPostId || !selectedPostForDiagnosis) return;
    setDiagnosing(true);

    try {
      const response = await fetch("/api/analyze-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selectedPostForDiagnosis.platforms[0] || "Instagram",
          text: selectedPostForDiagnosis.text,
          views: selectedPostForDiagnosis.metrics?.views || 1000,
          engagement: selectedPostForDiagnosis.metrics?.engagement || 3.5,
          followerCount: totalFollowers
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analysis failed.");
      }

      const diagnosis = await response.json();
      
      setPosts(prev => prev.map(p => {
        if (p.id === selectedPostId) {
          return { ...p, diagnosis };
        }
        return p;
      }));
    } catch (err: any) {
      alert(err.message || "Something went wrong during diagnosis.");
    } finally {
      setDiagnosing(false);
    }
  };

  // Re-generate Growth Report
  const generateNewGrowthReport = async () => {
    setGeneratingReport(true);
    try {
      const publishedPosts = posts.filter(p => p.status === "published");
      const response = await fetch("/api/generate-growth-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: reportNiche,
          recentPosts: publishedPosts.map(p => ({
            text: p.text,
            platform: p.platforms[0],
            views: p.metrics?.views,
            engagement: p.metrics?.engagement
          }))
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate report.");
      }

      const newReport = await response.json();
      setGrowthReport(newReport);
      setEditingNiche(false);
    } catch (err: any) {
      alert(err.message || "Failed to update strategy report.");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Simulate traffic spike for fun demo engagement
  const simulateEngagementSpike = () => {
    setAccounts(prev => prev.map(acc => {
      if (acc.isConnected) {
        const multiplier = 1 + (Math.random() * 0.15); // 15% increase
        return {
          ...acc,
          followerCount: Math.round(acc.followerCount * multiplier),
          reach: Math.round(acc.reach * (1 + Math.random() * 0.2)),
          engagementRate: Number((acc.engagementRate * (0.95 + Math.random() * 0.15)).toFixed(1))
        };
      }
      return acc;
    }));
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in" id="analytics-central-view">
      {/* Printable CSS definitions */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          /* Hide the layout elements and normal dashboard */
          #root, 
          header, 
          nav, 
          footer, 
          #analytics-central-view,
          .no-print {
            display: none !important;
          }
          /* Show print section only */
          #print-section {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}} />

      {/* Analytics Central Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5 no-print">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="text-violet-600 dark:text-violet-400" size={24} />
            Analytics Central
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Analyze multi-channel social performance, diagnose content drop-offs, and print dynamic growth playbooks.
          </p>
        </div>
        <button
          onClick={handlePrintReport}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-indigo-500/20 active:scale-95 select-none shrink-0"
        >
          <Printer size={14} className="text-amber-300 animate-pulse" />
          Download Report
        </button>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800/85 flex items-center justify-between" id="metric-total-followers">
          <div>
            <p className="text-xs font-mono text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Connected Audience</p>
            <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-slate-100 mt-1">{totalFollowers.toLocaleString()}</h3>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2">
              <TrendingUp size={14} /> +4.2% this week
            </span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800/85 flex items-center justify-between" id="metric-reach">
          <div>
            <p className="text-xs font-mono text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Ingested Reach</p>
            <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-slate-100 mt-1">{totalReach.toLocaleString()}</h3>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2">
              <TrendingUp size={14} /> +12.8% this week
            </span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Eye size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800/85 flex items-center justify-between" id="metric-avg-engagement">
          <div>
            <p className="text-xs font-mono text-gray-500 dark:text-slate-400 uppercase tracking-wider">Avg Engagement Rate</p>
            <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-slate-100 mt-1">{avgEngagement}%</h3>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2">
              <TrendingUp size={14} /> +0.9% this week
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Activity size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800/85 flex flex-col justify-between" id="metric-growth-loop">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono text-gray-500 dark:text-slate-400 tracking-wider">Growth Loop Efficiency</p>
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-slate-100 mt-2">Closed Loop Active</h3>
            </div>
            <span className="px-2 py-1 bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-[10px] font-mono rounded-md">V2 ENGINE</span>
          </div>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={simulateEngagementSpike}
              className="w-full py-1.5 px-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} /> Simulate Growth Spike
            </button>
          </div>
        </div>
      </div>

      {/* Activity Heatmap Component Section */}
      <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-gray-100 dark:border-slate-800/85 shadow-xs no-print" id="activity-heatmap-component">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="text-violet-600 dark:text-violet-400 animate-pulse" size={20} />
              30-Day Activity & Engagement Heatmap
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Analyze posting frequency and algorithmic engagement levels using interactive contribution blocks.
            </p>
          </div>
          <div className="flex items-center bg-gray-50 dark:bg-slate-950 p-1 rounded-xl border border-gray-100 dark:border-slate-800/80 shrink-0">
            <button
              onClick={() => setHeatmapViewMode("engagement")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                heatmapViewMode === "engagement"
                  ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              Engagement Intensity
            </button>
            <button
              onClick={() => setHeatmapViewMode("volume")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                heatmapViewMode === "volume"
                  ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              Posting Volume
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Heatmap Grid Column */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              {/* Calendar Days Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Grid Cells Container with calendar offset alignment */}
              <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
                {/* Pad first week based on May 29, 2026 starting day of week (Friday = index 5) */}
                {Array.from({ length: heatmapDays[0].date.getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} className="aspect-square w-full rounded-lg bg-gray-50/20 dark:bg-slate-950/10 border border-transparent opacity-20" />
                ))}

                {heatmapDays.map((day, idx) => {
                  let cellBg = "bg-gray-50 dark:bg-slate-950/40 border border-gray-150 dark:border-slate-850/60";
                  let hoverRing = "hover:ring-2 hover:ring-gray-300 dark:hover:ring-slate-700";
                  
                  if (day.hasPost) {
                    if (day.intensity === 1) {
                      cellBg = "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200/40 dark:border-violet-900/40";
                      hoverRing = "hover:ring-2 hover:ring-violet-300 dark:hover:ring-violet-800";
                    } else if (day.intensity === 2) {
                      cellBg = "bg-violet-300 dark:bg-violet-850/80 text-violet-950 dark:text-violet-200 border border-violet-400/30 dark:border-violet-800/40";
                      hoverRing = "hover:ring-2 hover:ring-violet-400 dark:hover:ring-violet-750";
                    } else if (day.intensity === 3) {
                      cellBg = "bg-violet-500 dark:bg-violet-600 text-white border border-violet-600/30 dark:border-violet-500/30";
                      hoverRing = "hover:ring-2 hover:ring-violet-500 dark:hover:ring-violet-400";
                    } else if (day.intensity === 4) {
                      cellBg = "bg-fuchsia-600 dark:bg-fuchsia-500 text-white border border-fuchsia-700/30 dark:border-fuchsia-400/30 shadow-xs shadow-fuchsia-500/10";
                      hoverRing = "hover:ring-2 hover:ring-fuchsia-400 dark:hover:ring-fuchsia-300";
                    }
                  }

                  const isSelected = selectedDayIndex === idx;

                  return (
                    <button
                      key={`day-${idx}`}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`aspect-square w-full rounded-xl flex flex-col items-center justify-center font-mono font-semibold transition-all duration-200 cursor-pointer text-xs select-none relative ${cellBg} ${hoverRing} ${
                        isSelected 
                          ? "ring-2 ring-indigo-600 dark:ring-violet-400 scale-[1.03] shadow-md z-10" 
                          : "hover:scale-102"
                      }`}
                    >
                      <span>{day.date.getDate()}</span>
                      {day.hasPost && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-current opacity-80" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend indicators */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-gray-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 dark:text-slate-400">
                <span>Less</span>
                <div className="w-3 h-3 rounded bg-gray-100 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800/50" />
                <div className="w-3 h-3 rounded bg-violet-100 dark:bg-violet-950/50" />
                <div className="w-3 h-3 rounded bg-violet-300 dark:bg-violet-850" />
                <div className="w-3 h-3 rounded bg-violet-500 dark:bg-violet-600" />
                <div className="w-3 h-3 rounded bg-fuchsia-600 dark:bg-fuchsia-500" />
                <span>More</span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">
                Click any cell to inspect detailed performance insights
              </p>
            </div>
          </div>

          {/* Inspector Panel Column */}
          <div className="bg-gray-50 dark:bg-slate-950/20 border border-gray-100 dark:border-slate-800/60 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-800/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="text-gray-400 dark:text-slate-500" size={14} />
                  <span className="text-xs font-bold text-gray-800 dark:text-slate-300">
                    {selectedDay.date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold ${
                  selectedDay.hasPost 
                    ? "bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300"
                    : "bg-gray-150/80 dark:bg-slate-900 text-gray-500 dark:text-slate-400"
                }`}>
                  {selectedDay.hasPost ? "Active Day" : "Rest Day"}
                </span>
              </div>

              {selectedDay.hasPost ? (
                <div className="space-y-4">
                  {selectedDay.postsOnDay.map((post, pIdx) => (
                    <div key={post.id || pIdx} className="space-y-3">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block font-semibold">Campaign Title</span>
                        <h4 className="text-sm font-display font-bold text-gray-900 dark:text-slate-200 leading-snug mt-0.5">{post.title}</h4>
                      </div>

                      {/* Platforms tag list */}
                      <div className="flex flex-wrap gap-1">
                        {post.platforms.map(plat => (
                          <span key={plat} className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded text-[9px] font-semibold">
                            {plat}
                          </span>
                        ))}
                      </div>

                      {/* Views & Engagement Intensity Stats */}
                      <div className="grid grid-cols-2 gap-3 bg-white dark:bg-slate-900/30 p-3 rounded-xl border border-gray-100 dark:border-slate-850">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono text-gray-400 dark:text-slate-500 uppercase flex items-center gap-1">
                            <Eye size={10} /> Ingested Reach
                          </span>
                          <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100 font-mono">
                            {selectedDay.views.toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono text-gray-400 dark:text-slate-500 uppercase flex items-center gap-1">
                            <Flame size={10} className="text-amber-500" /> Engagement Rate
                          </span>
                          <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100 font-mono">
                            {selectedDay.engagementRate}%
                          </p>
                        </div>
                      </div>

                      {/* Detailed likes/comments/shares breakdown */}
                      {post.metrics && (
                        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-gray-500 dark:text-slate-400 border-t border-gray-100 dark:border-slate-800/40 pt-3">
                          <div>
                            <Heart size={11} className="mx-auto text-rose-500 mb-0.5" />
                            <span>{post.metrics.likes?.toLocaleString() || 0}</span>
                          </div>
                          <div>
                            <MessageSquare size={11} className="mx-auto text-sky-500 mb-0.5" />
                            <span>{post.metrics.comments?.toLocaleString() || 0}</span>
                          </div>
                          <div>
                            <Share2 size={11} className="mx-auto text-emerald-500 mb-0.5" />
                            <span>{post.metrics.shares?.toLocaleString() || 0}</span>
                          </div>
                        </div>
                      )}

                      {/* Actionable link to the Diagnostics Section below */}
                      <div className="pt-3 border-t border-gray-150 dark:border-slate-850">
                        <button
                          onClick={() => {
                            const actualPost = posts.find(p => p.title === post.title);
                            if (actualPost) {
                              setSelectedPostId(actualPost.id);
                              document.getElementById("analytics-central-view")?.scrollIntoView({ behavior: "smooth" });
                            } else {
                              alert(`Seeded Post: "${post.title}" metrics are dynamically linked. You can test live AI analysis using the diagnostic generator below.`);
                            }
                          }}
                          className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/40 text-indigo-700 dark:text-violet-300 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer select-none"
                        >
                          <Sparkles size={12} /> Inspect Engagement Dropoff
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-900 flex items-center justify-center mx-auto text-gray-400 dark:text-slate-500">
                    <Calendar size={18} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-gray-800 dark:text-slate-300">No content published</h5>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-relaxed max-w-[180px] mx-auto">
                      Rest days help maintain high audience attention metrics between viral hooks.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick strategic nudge */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800/60">
              <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-relaxed font-mono flex items-start gap-1">
                <span>💡</span>
                <span>Optimal posting window is 3-4 posts per week inside SaaS & Creator Niche.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Comparison & ROI Intelligence Section */}
      <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-gray-100 dark:border-slate-800/85 shadow-xs no-print my-8" id="platform-roi-comparison">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="text-violet-600 dark:text-violet-400 animate-bounce" size={20} />
              Platform ROI Comparison Engine
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Compare platform efficiency using dynamic formulas linking follower growth, engagement density, and production effort.
            </p>
          </div>
          
          <div className="flex items-center bg-gray-50 dark:bg-slate-950 p-1 rounded-xl border border-gray-100 dark:border-slate-800/80 shrink-0">
            <button
              onClick={() => setRoiPriority("balanced")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                roiPriority === "balanced"
                  ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              Balanced Score
            </button>
            <button
              onClick={() => setRoiPriority("volume")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                roiPriority === "volume"
                  ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              Audience Growth
            </button>
            <button
              onClick={() => setRoiPriority("engagement")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                roiPriority === "engagement"
                  ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              Engagement Intensity
            </button>
          </div>
        </div>

        {connectedAccounts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-slate-950/20 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
            <AlertCircle className="mx-auto text-gray-400 dark:text-slate-500 mb-2" size={24} />
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-300">No channels connected</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Please connect your social media profiles in the Platforms Hub to generate comparative efficiency reports.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Top ROI Platform Spotlight Card */}
            {topRoiAccount && (
              <div className="lg:col-span-1 bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-6 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden" id="top-roi-spotlight">
                {/* Decorative background glow elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/30 rounded-full blur-xl -ml-6 -mb-6" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 bg-white/15 text-white text-[10px] font-mono font-bold uppercase rounded-md tracking-wider flex items-center gap-1">
                      <Sparkles size={11} className="text-amber-300 animate-spin" />
                      ROI Leader
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-100">
                      Score: {topRoiAccount.roiScore}
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/25 flex items-center justify-center font-bold text-xl relative shrink-0">
                      {topRoiAccount.avatarUrl ? (
                        <img 
                          src={topRoiAccount.avatarUrl} 
                          alt={topRoiAccount.platform} 
                          className="w-full h-full rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{topRoiAccount.platform[0]}</span>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-5.5 h-5.5 bg-amber-400 text-gray-900 border-2 border-indigo-700 rounded-full flex items-center justify-center text-[10px]">
                        🏆
                      </span>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-lg leading-tight">{topRoiAccount.platform}</h4>
                      <p className="text-xs text-indigo-100/90 font-mono font-medium">{topRoiAccount.username}</p>
                    </div>
                  </div>

                  {/* Highlights section */}
                  <div className="space-y-3 bg-white/10 p-3.5 rounded-xl border border-white/10 mb-4 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-indigo-100">Follower Growth:</span>
                      <span className="font-bold">+{topRoiAccount.growthRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-100">Engagement Rate:</span>
                      <span className="font-bold">{topRoiAccount.engagementRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-100">Production Effort:</span>
                      <span className="font-bold">{topRoiAccount.effort}/10</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="border-t border-white/15 pt-3 mt-3">
                    <span className="text-[9px] font-mono font-bold text-indigo-200 uppercase tracking-wider block mb-1">AI Strategic Focus</span>
                    <p className="text-xs text-indigo-50/95 leading-relaxed font-sans">
                      {topRoiAccount.platform === "Telegram" ? (
                        "Direct push notifications and absolute post delivery result in top-tier actionable conversions. Double down on direct value summaries and exclusive VIP community broadcasts."
                      ) : topRoiAccount.platform === "Substack" ? (
                        "Long-form editorial essays establish supreme brand authority. Convert cold traffic to paid subscribers by offering rich downloadable resources and exclusive deep-dives."
                      ) : topRoiAccount.platform === "LinkedIn" ? (
                        "Organic professional reach remains highly lucrative. Repurpose long-form copy into visual PDF carousels and tag industry leaders to amplify secondary engagement loops."
                      ) : topRoiAccount.platform === "Instagram" ? (
                        "Visual hooks and aesthetic consistency drive high organic impressions. Scale short-form video reels targeting broad industry pain-points and use automated comment-to-DM triggers."
                      ) : topRoiAccount.platform === "TikTok" ? (
                        "Viral velocity and rapid discovery loops offer unprecedented top-of-funnel volume. Focus heavily on first-3-second hooks, trending audios, and interactive community stitching."
                      ) : topRoiAccount.platform === "YouTube" ? (
                        "High production commitment yields permanent compound interest. Build evergreen long-form educational guides backed by dynamic custom-designed thumbnails and specific timestamps."
                      ) : topRoiAccount.platform === "WhatsApp" ? (
                        "Intimate conversational circles capture unparalleled loyalty and response rates. Launch structured weekly Q&A segments and provide instant interactive community feedback."
                      ) : topRoiAccount.platform === "WeChat" ? (
                        "Highly structured professional ecosystems thrive on bilingual and regional technical deep-dives. Foster direct interactions inside exclusive invite-only groups."
                      ) : (
                        `Maximize engagement efficiency on ${topRoiAccount.platform} by aligning hook templates with your highest-performing campaign formats. Maintain standard cross-posting sequences.`
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Platform Comparison Table & Metric Insights Column */}
            <div className="lg:col-span-2 bg-gray-50 dark:bg-slate-950/20 border border-gray-100 dark:border-slate-800/60 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-150 dark:border-slate-800/60">
                  <span className="text-xs font-bold text-gray-800 dark:text-slate-300 uppercase tracking-wider font-mono">
                    Channel Comparative Efficiency
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 dark:text-slate-400">
                    Formula: (Gain Score / Effort Score) × 10
                  </span>
                </div>

                {/* Grid Comparison List */}
                <div className="space-y-3">
                  {sortedByROI.map((comp) => (
                    <div 
                      key={comp.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white dark:bg-slate-900/30 border border-gray-100 dark:border-slate-850 rounded-xl hover:border-violet-200 dark:hover:border-violet-900/40 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 flex items-center justify-center shrink-0">
                          {comp.avatarUrl ? (
                            <img src={comp.avatarUrl} alt={comp.platform} className="w-full h-full rounded-lg object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="font-mono font-bold text-xs text-gray-500">{comp.platform[0]}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-bold text-sm text-gray-900 dark:text-slate-100">{comp.platform}</span>
                            {comp.id === topRoiAccount?.id && (
                              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[9px] font-mono px-1.5 py-0.5 rounded-sm font-semibold">
                                ROI LEADER
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-slate-400 font-mono block">{comp.username}</span>
                        </div>
                      </div>

                      {/* Middle metrics indicators */}
                      <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
                        <div className="space-y-0.5 text-left sm:text-center">
                          <span className="text-[9px] font-mono text-gray-400 dark:text-slate-500 uppercase block">Growth</span>
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">+{comp.growthRate}%</span>
                        </div>
                        <div className="space-y-0.5 text-left sm:text-center">
                          <span className="text-[9px] font-mono text-gray-400 dark:text-slate-500 uppercase block">Engagement</span>
                          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{comp.engagementRate}%</span>
                        </div>
                        <div className="space-y-0.5 text-left sm:text-center">
                          <span className="text-[9px] font-mono text-gray-400 dark:text-slate-500 uppercase block">Effort</span>
                          <span className="text-xs font-mono font-semibold text-gray-700 dark:text-slate-300">{comp.effort}/10</span>
                        </div>
                      </div>

                      {/* Right-side ROI Score badge with progress bar indication */}
                      <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-gray-100 pt-2 sm:pt-0">
                        <span className="text-[9px] font-mono text-gray-400 dark:text-slate-500 uppercase block sm:hidden">Calculated ROI</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                            comp.roiScore >= 50
                              ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
                              : comp.roiScore >= 25
                              ? "bg-violet-100 dark:bg-violet-950/40 text-violet-800 dark:text-violet-300"
                              : "bg-gray-100 dark:bg-slate-900 text-gray-600 dark:text-slate-400"
                          }`}>
                            {comp.roiScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Insights Summary Footer */}
              <div className="mt-5 pt-4 border-t border-gray-150 dark:border-slate-800/60 text-xs text-gray-500 dark:text-slate-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <p className="font-mono flex items-center gap-1">
                  <Zap size={13} className="text-amber-500 animate-pulse" />
                  <span>Strategic Focus is currently set to <strong className="text-violet-600 dark:text-violet-400 capitalize">{roiPriority} Mode</strong>.</span>
                </p>
                <button
                  onClick={() => {
                    const modes: ("balanced" | "volume" | "engagement")[] = ["balanced", "volume", "engagement"];
                    const nextMode = modes[(modes.indexOf(roiPriority) + 1) % modes.length];
                    setRoiPriority(nextMode);
                  }}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg font-semibold transition text-[11px] cursor-pointer"
                >
                  Rotate Optimizer
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Main Grid: Multi-platform Analytics & Platform Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Unified Graph Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800/85">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-slate-100">Multi-Channel Ingested Performance</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Real-time metrics aggregated from connected social accounts</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-xs text-gray-500 dark:text-slate-400 font-medium mr-1">Metrics:</span>
              <button 
                onClick={() => setChartMetric("followerCount")}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${chartMetric === 'followerCount' ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-950' : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300'}`}
              >
                Followers
              </button>
              <button 
                onClick={() => setChartMetric("reach")}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${chartMetric === 'reach' ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-950' : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300'}`}
              >
                Reach
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "white" }} />
                
                {accounts.find(a => a.platform === "Instagram")?.isConnected && (
                  <Area type="monotone" dataKey="Instagram" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorIg)" />
                )}
                {accounts.find(a => a.platform === "TikTok")?.isConnected && (
                  <Area type="monotone" dataKey="TikTok" stroke="#000000" strokeWidth={2} fillOpacity={0.1} />
                )}
                {accounts.find(a => a.platform === "YouTube")?.isConnected && (
                  <Area type="monotone" dataKey="YouTube" stroke="#ef4444" strokeWidth={2} fillOpacity={0.05} />
                )}
                {accounts.find(a => a.platform === "LinkedIn")?.isConnected && (
                  <Area type="monotone" dataKey="LinkedIn" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorLi)" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar stack */}
        <div className="space-y-8 col-span-1">
          {/* Connected Channel Manager */}
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800/85">
            <div className="mb-5">
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-slate-100">Platform Connections</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Authorize channels to ingest metrics and post variations</p>
            </div>

            <div className="space-y-4">
              {accounts.map((acc) => (
                <div 
                  key={acc.id}
                  className={`p-4 rounded-xl border transition flex items-center justify-between ${acc.isConnected ? 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/30' : 'border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/20 opacity-70'}`}
                >
                  <div className="flex items-center gap-3">
                    <img src={acc.avatarUrl} alt={acc.username} className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-slate-800" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-gray-900 dark:text-slate-100">{acc.platform}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${acc.isConnected ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-700'}`} />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">{acc.username}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {acc.isConnected && (
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-gray-900 dark:text-slate-100">{acc.followerCount.toLocaleString()}</p>
                        <p className="text-[10px] font-mono text-gray-500 dark:text-slate-400">ER: {acc.engagementRate}%</p>
                      </div>
                    )}
                    <button 
                      onClick={() => toggleAccount(acc.id)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${acc.isConnected ? 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
                    >
                      {acc.isConnected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI-Powered Trending Topics Widget (Google Search Grounded) */}
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800/85" id="trending-topics-widget">
            <div className="mb-5">
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Flame className="text-amber-500 animate-pulse fill-amber-500" size={18} />
                Trending Content Topics
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Real-time viral news and content formats sourced using Google Search grounding.
              </p>
            </div>

            {/* Input query and fetch buttons */}
            <div className="space-y-3 mb-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trendsQuery}
                  onChange={(e) => setTrendsQuery(e.target.value)}
                  placeholder="Enter niche (e.g. B2B SaaS, Fitness)"
                  className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs flex-1 text-gray-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <button
                  onClick={() => fetchTrendingTopics()}
                  disabled={fetchingTrends || !trendsQuery.trim()}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    fetchingTrends 
                      ? "bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed" 
                      : "bg-violet-600 hover:bg-violet-700 text-white active:scale-95"
                  }`}
                >
                  <RefreshCw size={13} className={fetchingTrends ? "animate-spin" : ""} />
                  {fetchingTrends ? "Searching..." : "Fetch"}
                </button>
              </div>

              {trendsError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/25 border border-red-100 dark:border-red-900/50 rounded-xl text-[11px] text-red-600 dark:text-red-400 font-mono flex items-start gap-1.5">
                  <span>⚠️</span>
                  <span>{trendsError}</span>
                </div>
              )}
            </div>

            {/* Content Results list or Loader */}
            {fetchingTrends ? (
              <div className="py-12 text-center space-y-4">
                <div className="relative w-10 h-10 mx-auto">
                  <div className="absolute inset-0 border-3 border-violet-200 dark:border-violet-900 rounded-full" />
                  <div className="absolute inset-0 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="space-y-1 animate-pulse">
                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">Grounding query with Google Search...</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">Extracting latest citations and hashtags</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {trendingTopics.map((trend, i) => (
                  <div 
                    key={i} 
                    className="p-3.5 bg-gray-50 dark:bg-slate-950/30 border border-gray-100 dark:border-slate-850 rounded-xl space-y-2.5 transition hover:border-violet-200 dark:hover:border-violet-900/30"
                  >
                    {/* Trend header */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-gray-900 dark:text-slate-100 font-display">
                        {trend.topic}
                      </h4>
                      <span className="text-[9px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-md uppercase shrink-0">
                        {trend.trafficSpike}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                      {trend.explanation}
                    </p>

                    {/* Suggested angle */}
                    <div className="p-2.5 bg-violet-50/50 dark:bg-violet-950/15 border border-violet-100/60 dark:border-violet-900/40 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider block">
                          SUGGESTED ANGLE
                        </span>
                        <span className="text-[9px] font-mono text-gray-400 dark:text-slate-500 block">
                          Sentiment: {trend.sentiment}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-700 dark:text-slate-200 italic leading-relaxed">
                        "{trend.suggestedAngle}"
                      </p>
                      <button
                        onClick={() => onTryTemplate(trend.suggestedAngle, ["Instagram", "LinkedIn"])}
                        className="text-[10px] text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        Try this concept in composer <ArrowRight size={10} />
                      </button>
                    </div>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {trend.tags?.map((tag: string, tid: number) => (
                        <span 
                          key={tid} 
                          onClick={() => setTrendsQuery(tag)}
                          className="text-[9px] font-mono font-medium text-gray-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-gray-100 dark:border-slate-800/80 cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Grounding Sources */}
                {trendingSources.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-gray-150 dark:border-slate-800/80">
                    <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                      Verified Grounding Sources
                    </span>
                    <div className="space-y-1.5">
                      {trendingSources.map((source, idx) => (
                        <a 
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 transition"
                        >
                          <span className="shrink-0 text-violet-500">🔗</span>
                          <span className="truncate flex-1 hover:underline">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Closed-Loop AI Diagnostics & Growth Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pillar 2: Diagnostics (Performance Audit) */}
        <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800/85">
          <div className="mb-6">
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <AlertCircle className="text-violet-600 dark:text-violet-400" size={20} />
              AI Performance Diagnosis
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Diagnose past posts against platform algorithm specs to isolate exact dropped hooks</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 font-mono">Select Post for Audit:</label>
              <select 
                value={selectedPostId} 
                onChange={(e) => setSelectedPostId(e.target.value)}
                className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-2 text-xs flex-1 text-gray-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {posts.filter(p => p.status === "published").map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.platforms.join(", ")})</option>
                ))}
              </select>
            </div>

            {selectedPostForDiagnosis && (
              <div className="bg-gray-50 dark:bg-slate-950/40 p-4 rounded-xl border border-gray-200/60 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700 dark:text-slate-300">Source Caption Preview:</span>
                  <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400 font-mono text-[10px]">
                    <span>Views: {selectedPostForDiagnosis.metrics?.views.toLocaleString()}</span>
                    <span>Engagement: {selectedPostForDiagnosis.metrics?.engagement}%</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-slate-300 line-clamp-3 italic leading-relaxed">"{selectedPostForDiagnosis.text}"</p>
              </div>
            )}

            <button
              onClick={runDiagnosis}
              disabled={diagnosing || !selectedPostId}
              className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {diagnosing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Diagnosing post with Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-violet-400" /> Diagnose Engagement Dropoff
                </>
              )}
            </button>

            {/* Diagnostic Results */}
            {selectedPostForDiagnosis?.diagnosis ? (
              <div className="border-t border-gray-100 dark:border-slate-800 pt-5 mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-3 rounded-xl">
                    <span className="text-[10px] font-mono text-rose-500 dark:text-rose-400 uppercase font-bold">Hook Grade</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-display font-black text-rose-700 dark:text-rose-400">{selectedPostForDiagnosis.diagnosis.hookGrade}</span>
                      <span className="text-[10px] text-rose-600 dark:text-rose-500">Spec Match</span>
                    </div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-3 rounded-xl">
                    <span className="text-[10px] font-mono text-amber-500 dark:text-amber-400 uppercase font-bold">SEO & Keywords</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-display font-black text-amber-700 dark:text-amber-400">{selectedPostForDiagnosis.diagnosis.seoGrade}</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-500">Search Rank</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-slate-200 font-mono uppercase text-[10px] tracking-wider mb-0.5">Hook Dropoff Analysis</h5>
                    <p className="text-gray-600 dark:text-slate-400">{selectedPostForDiagnosis.diagnosis.hookAnalysis}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-slate-200 font-mono uppercase text-[10px] tracking-wider mb-0.5">Readability & Copy Spacing</h5>
                    <p className="text-gray-600 dark:text-slate-400">{selectedPostForDiagnosis.diagnosis.pacingFeedback}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-slate-200 font-mono uppercase text-[10px] tracking-wider mb-0.5">Algorithm Adherence</h5>
                    <p className="text-gray-600 dark:text-slate-400">{selectedPostForDiagnosis.diagnosis.viralSpecAdherence}</p>
                  </div>
                </div>

                {/* Try actionable fix */}
                <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 p-4 rounded-xl mt-2">
                  <div className="flex items-center gap-1 text-violet-800 dark:text-violet-300 font-semibold text-xs mb-1">
                    <Sparkles size={14} /> Recommended Recovery Template:
                  </div>
                  <p className="text-xs text-gray-700 dark:text-slate-300 mb-3 italic bg-white/70 dark:bg-slate-900/60 p-3 rounded-lg border border-violet-200/50 dark:border-violet-800/50 leading-relaxed font-mono whitespace-pre-wrap">
                    {selectedPostForDiagnosis.diagnosis.actionableRecommendation}
                  </p>
                  <button
                    onClick={() => onTryTemplate(selectedPostForDiagnosis.diagnosis!.actionableRecommendation, selectedPostForDiagnosis.platforms)}
                    className="py-1.5 px-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    Load Fixed Template in Composer <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 dark:text-slate-500 text-xs border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                No active audit payload found. Click "Diagnose Engagement" above to execute a real-time Gemini assessment.
              </div>
            )}
          </div>
        </div>

        {/* Pillar 1 & 3: Weekly AI Growth Report */}
        <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800/85">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="text-violet-600 dark:text-violet-400" size={20} />
                Weekly AI Growth Report
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Intelligent strategic suggestions aligned to niche and history</p>
            </div>
            
            <div className="flex items-center gap-1.5">
              {editingNiche ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="text" 
                    value={reportNiche} 
                    onChange={(e) => setReportNiche(e.target.value)} 
                    className="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded px-2 py-1 text-xs text-gray-800 dark:text-slate-100 w-36"
                  />
                  <button 
                    onClick={generateNewGrowthReport}
                    disabled={generatingReport}
                    className="p-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 rounded hover:bg-emerald-200 dark:hover:bg-emerald-900 cursor-pointer"
                  >
                    <Check size={13} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setEditingNiche(true)}
                  className="px-2 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-[10px] font-mono font-bold text-gray-600 dark:text-slate-300 flex items-center gap-1"
                >
                  Niche: {reportNiche}
                </button>
              )}
              <button 
                onClick={generateNewGrowthReport}
                disabled={generatingReport}
                title="Regenerate Growth Report"
                className="p-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-gray-600 dark:text-slate-300 transition cursor-pointer"
              >
                <RefreshCw size={13} className={generatingReport ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Spotlight */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/40 dark:from-slate-950/85 dark:to-slate-900/65 p-4 rounded-xl border border-indigo-100 dark:border-slate-800">
              <span className="inline-block px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-400 text-[9px] font-mono rounded mb-2 uppercase font-bold">TOP PERFORMER SPOTLIGHT</span>
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="font-bold text-xs text-gray-900 dark:text-slate-100">{growthReport.topPerformerSpotlight.platform}:</span>
                <span className="text-xs text-gray-700 dark:text-slate-300 italic">"{growthReport.topPerformerSpotlight.concept}"</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-300 mb-2 leading-relaxed">{growthReport.topPerformerSpotlight.whyItWorked}</p>
              <div className="text-[11px] text-indigo-900 dark:text-indigo-300 font-mono font-medium">
                🔑 Rule: {growthReport.topPerformerSpotlight.keyTakeaway}
              </div>
            </div>

            {/* Recovery Tip */}
            <div className="bg-amber-50/80 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <span className="inline-block px-2 py-0.5 bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 text-[9px] font-mono rounded mb-2 uppercase font-bold">SUGGESTED RECOVERY ACT</span>
              <h5 className="font-bold text-xs text-amber-950 dark:text-amber-300 mb-1">{growthReport.recoveryTip.issueIdentified}</h5>
              <p className="text-xs text-gray-600 dark:text-slate-300 mb-3 leading-relaxed">{growthReport.recoveryTip.fixAction}</p>
              <button
                onClick={() => onTryTemplate(growthReport.recoveryTip.templateText, [growthReport.recoveryTip.platform])}
                className="py-1 px-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={11} /> Load Recovery template
              </button>
            </div>

            {/* AI Next Best Post */}
            <div className="bg-violet-50/60 dark:bg-violet-950/20 p-4 rounded-xl border border-violet-100 dark:border-violet-900/30">
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-950/50 text-violet-800 dark:text-violet-400 text-[9px] font-mono rounded uppercase font-bold">SUGGESTED NEXT CAMPAIGN</span>
                <span className="text-[10px] font-mono text-gray-500 dark:text-slate-400">{growthReport.suggestedNextPost.formatCategory}</span>
              </div>
              <h4 className="font-bold text-xs text-gray-900 dark:text-slate-200">{growthReport.suggestedNextPost.title}</h4>
              <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 mb-2">
                <strong>Hook Formula:</strong> "{growthReport.suggestedNextPost.recommendedHook}"
              </p>
              <div className="text-xs text-gray-500 dark:text-slate-300 font-mono bg-white dark:bg-slate-950 p-3 rounded-lg border border-violet-100 dark:border-slate-800 leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                {growthReport.suggestedNextPost.suggestedDraft}
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {growthReport.suggestedNextPost.recommendedTags.map(t => (
                  <span key={t} className="text-[9px] font-mono text-violet-700 dark:text-violet-300 bg-violet-100/50 dark:bg-violet-950/60 px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
              <button
                onClick={() => onTryTemplate(growthReport.suggestedNextPost.suggestedDraft, [growthReport.suggestedNextPost.platform])}
                className="w-full py-2 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                <Plus size={14} /> Try This AI Campaign <ArrowRight size={13} />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Section: On-demand Playbooks (Guide Library) */}
      <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800/85">
        <div className="mb-6">
          <h3 className="font-display font-bold text-lg text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="text-violet-600 dark:text-violet-400" size={20} />
            On-Demand Viral Playbooks
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Dynamically sorted blueprints applying proven copywriting frameworks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {playbooks.map((pb) => (
            <div key={pb.id} className="p-5 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20 flex flex-col justify-between hover:border-violet-200 dark:hover:border-violet-800 hover:bg-white dark:hover:bg-slate-900/40 transition group">
              <div>
                <span className="px-2 py-0.5 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-[9px] font-mono rounded group-hover:bg-violet-100 dark:group-hover:bg-violet-950 group-hover:text-violet-800 dark:group-hover:text-violet-400 transition">
                  {pb.platform}
                </span>
                <h4 className="font-display font-bold text-sm text-gray-900 dark:text-slate-200 mt-3">{pb.title}</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">{pb.description}</p>
                
                <div className="bg-white dark:bg-slate-950 rounded-lg p-3 border border-gray-200/50 dark:border-slate-800 mt-4 text-[11px] text-gray-600 dark:text-slate-300 space-y-2">
                  <p><strong>Hook Template:</strong> "{pb.hookTemplate}"</p>
                  <p className="text-gray-400 dark:text-slate-500 leading-normal font-mono text-[10px] whitespace-pre-line">{pb.structure}</p>
                </div>
              </div>

              <button
                onClick={() => onTryTemplate(`${pb.hookTemplate}\n\n[Add your core value proposition here]\n\n[Add Call to Action]`, [pb.platform])}
                className="w-full py-1.5 px-3 bg-gray-900 dark:bg-indigo-600 group-hover:bg-violet-600 dark:group-hover:bg-violet-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                <Plus size={13} /> Try Playbook Hook
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PRINT-ONLY SECTION (Hidden during web view, visible on window.print()) */}
      <div id="print-section" className="hidden p-8 bg-white text-black">
        {/* Print Header */}
        <div className="border-b-4 border-indigo-900 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-indigo-900 font-display">WATER CREATOR</h1>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mt-1">Cross-Platform Social Post Optimizer & Performance Center</p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Automated Strategic Intelligence Document</p>
          </div>
          <div className="text-right">
            <span className="bg-indigo-900 text-white px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider inline-block">
              EXECUTIVE REPORT
            </span>
            <p className="text-[11px] text-slate-600 mt-2 font-mono"><strong>Date:</strong> {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-[11px] text-slate-600 font-mono"><strong>Target Niche:</strong> {reportNiche}</p>
          </div>
        </div>

        {/* Executive Summary Metrics Grid */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-indigo-900 border-b border-slate-200 pb-1.5 mb-4 uppercase tracking-wide font-mono">1. Executive Audience & Performance Summary</h3>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Total Connected Audience</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block font-display">{totalFollowers.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-600 mt-1 block font-medium">▲ +4.2% Growth Trend</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Total Ingested Reach</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block font-display">{totalReach.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-600 mt-1 block font-medium">▲ +12.8% Organic Reach</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Average Engagement Rate</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block font-display">{avgEngagement}%</span>
              <span className="text-[10px] text-emerald-600 mt-1 block font-medium">▲ +0.9% Algorithmic Push</span>
            </div>
          </div>

          {/* Connected Channels Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wide font-mono">
                  <th className="p-2.5">Platform Channel</th>
                  <th className="p-2.5">Username Handle</th>
                  <th className="p-2.5 text-right">Followers</th>
                  <th className="p-2.5 text-right">Weekly Reach</th>
                  <th className="p-2.5 text-right">Engagement Rate</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-800">
                {accounts.map(acc => (
                  <tr key={acc.id} className="border-b border-slate-150 hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900">{acc.platform}</td>
                    <td className="p-2.5 font-mono text-slate-500">{acc.username}</td>
                    <td className="p-2.5 text-right font-semibold">{acc.isConnected ? acc.followerCount.toLocaleString() : "—"}</td>
                    <td className="p-2.5 text-right">{acc.isConnected ? acc.reach.toLocaleString() : "—"}</td>
                    <td className="p-2.5 text-right font-medium">{acc.isConnected ? `${acc.engagementRate}%` : "—"}</td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${acc.isConnected ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-400"}`}>
                        {acc.isConnected ? "Active Feed" : "Not Linked"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Print Heatmap Block */}
          <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50/20">
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-3 font-mono">30-Day Content Activity Heatmap</h4>
            
            {/* Simple Print Calendar headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-mono font-bold text-slate-400 mb-1">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Padding */}
              {Array.from({ length: heatmapDays[0].date.getDay() }).map((_, i) => (
                <div key={`pad-print-${i}`} className="aspect-square bg-white border border-transparent" />
              ))}

              {heatmapDays.map((day, idx) => {
                let cellStyle = "bg-white border-slate-150 text-slate-400";
                if (day.hasPost) {
                  if (day.intensity === 1) cellStyle = "bg-indigo-50 border-slate-300 text-indigo-700 font-bold";
                  else if (day.intensity === 2) cellStyle = "bg-indigo-100 border-indigo-300 text-indigo-800 font-bold";
                  else if (day.intensity === 3) cellStyle = "bg-indigo-200 border-indigo-400 text-indigo-950 font-bold";
                  else cellStyle = "bg-indigo-600 border-indigo-600 text-white font-bold";
                }
                return (
                  <div
                    key={`print-day-${idx}`}
                    className={`aspect-square rounded border flex flex-col items-center justify-center text-[9px] font-mono p-0.5 ${cellStyle}`}
                  >
                    <span>{day.date.getDate()}</span>
                    {day.hasPost && (
                      <span className="text-[7px] block leading-none font-sans font-medium">
                        {day.engagementRate}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-3 flex justify-between items-center text-[8px] font-mono text-slate-400">
              <p>Key: Level of Engagement rates (Low: &lt;3.5%, Medium: &lt;6%, High: &lt;8.5%, Peak: &gt;=8.5%)</p>
              <div className="flex gap-1 items-center">
                <span>Inactive</span>
                <div className="w-2.5 h-2.5 border border-slate-200 bg-white" />
                <div className="w-2.5 h-2.5 border border-slate-300 bg-indigo-50" />
                <div className="w-2.5 h-2.5 border border-indigo-300 bg-indigo-100" />
                <div className="w-2.5 h-2.5 border border-indigo-400 bg-indigo-200" />
                <div className="w-2.5 h-2.5 border border-indigo-600 bg-indigo-600" />
                <span>Peak</span>
              </div>
            </div>
          </div>

        </div>

        {/* Section 2: Weekly AI Growth Strategy */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-indigo-900 border-b border-slate-200 pb-1.5 mb-4 uppercase tracking-wide font-mono">2. Weekly AI Strategic Growth Plan</h3>
          
          <div className="space-y-4">
            {/* Top Spotlight */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/30">
              <span className="text-[9px] font-bold text-indigo-800 tracking-wider block uppercase font-mono">Top Performer Spotlight</span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="font-bold text-xs text-slate-900">{growthReport?.topPerformerSpotlight?.platform}:</span>
                <span className="text-xs text-slate-700 italic">"{growthReport?.topPerformerSpotlight?.concept}"</span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed"><strong>Algorithmic Pull Factor:</strong> {growthReport?.topPerformerSpotlight?.whyItWorked}</p>
              <p className="text-xs text-indigo-900 font-bold mt-1.5 font-mono">🔑 Tactical Key Takeaway: {growthReport?.topPerformerSpotlight?.keyTakeaway}</p>
            </div>

            {/* Recovery Act */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/30">
              <span className="text-[9px] font-bold text-amber-800 tracking-wider block uppercase font-mono">Suggested Recovery Plan</span>
              <h5 className="font-bold text-xs text-slate-900 mt-1">{growthReport?.recoveryTip?.issueIdentified}</h5>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed"><strong>Recommended Action:</strong> {growthReport?.recoveryTip?.fixAction}</p>
              <div className="bg-white p-3 rounded border border-slate-200 mt-2 font-mono">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Recovery Content Template:</span>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{growthReport?.recoveryTip?.templateText}</p>
              </div>
            </div>

            {/* Next Best Campaign */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/30">
              <span className="text-[9px] font-bold text-violet-800 tracking-wider block uppercase font-mono">Suggested Next Campaign Spec</span>
              <div className="mt-1 flex justify-between items-baseline">
                <h4 className="font-bold text-xs text-slate-900">{growthReport?.suggestedNextPost?.title}</h4>
                <span className="text-[9px] font-mono text-slate-500 uppercase">{growthReport?.suggestedNextPost?.formatCategory} | {growthReport?.suggestedNextPost?.platform} ({growthReport?.suggestedNextPost?.aspectRatio})</span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5"><strong>Recommended Hook Formula:</strong> "{growthReport?.suggestedNextPost?.recommendedHook}"</p>
              
              <div className="bg-white p-3 rounded border border-slate-200 mt-2 font-mono">
                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Synthesized High-Impression Draft:</span>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{growthReport?.suggestedNextPost?.suggestedDraft}</p>
              </div>
              <div className="flex items-center gap-2 mt-2.5">
                <span className="text-[10px] font-bold text-slate-500 font-mono">Suggested SEO Hashtags:</span>
                <div className="flex gap-1">
                  {growthReport?.suggestedNextPost?.recommendedTags?.map(t => (
                    <span key={t} className="text-[9px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Break for diagnostic audit and playbooks */}
        <div className="page-break" />

        {/* Section 3: Diagnostic Performance Audit */}
        <div className="mb-8 pt-6">
          <h3 className="text-sm font-bold text-indigo-900 border-b border-slate-200 pb-1.5 mb-4 uppercase tracking-wide font-mono">3. Active Post Diagnostic Audit</h3>
          
          {selectedPostForDiagnosis ? (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-bold text-slate-900">Audited Campaign Content: "{selectedPostForDiagnosis.title}"</span>
                  <span className="text-[9px] text-slate-500 font-mono uppercase">Status: {selectedPostForDiagnosis.status} | Platforms: {selectedPostForDiagnosis.platforms.join(", ")}</span>
                </div>
                <p className="text-xs text-slate-600 italic font-mono leading-relaxed bg-white p-3 rounded border border-slate-150">"{selectedPostForDiagnosis.text}"</p>
                {selectedPostForDiagnosis.metrics && (
                  <div className="flex gap-4 text-[9px] font-mono text-slate-500 mt-2">
                    <span>Views: {selectedPostForDiagnosis.metrics.views?.toLocaleString()}</span>
                    <span>Engagement: {selectedPostForDiagnosis.metrics.engagement}%</span>
                    <span>Likes: {selectedPostForDiagnosis.metrics.likes?.toLocaleString()}</span>
                    <span>Comments: {selectedPostForDiagnosis.metrics.comments?.toLocaleString()}</span>
                    <span>Shares: {selectedPostForDiagnosis.metrics.shares?.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {selectedPostForDiagnosis.diagnosis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="border border-rose-200 rounded-lg p-3 bg-rose-50/20">
                      <span className="text-[9px] font-bold text-rose-700 uppercase tracking-wider block font-mono">Algorithmic Hook Grade</span>
                      <span className="text-2xl font-black text-rose-700 mt-0.5 block font-display">{selectedPostForDiagnosis.diagnosis.hookGrade}</span>
                    </div>
                    <div className="border border-amber-200 rounded-lg p-3 bg-amber-50/20">
                      <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider block font-mono">SEO & Discoverability Grade</span>
                      <span className="text-2xl font-black text-amber-700 mt-0.5 block font-display">{selectedPostForDiagnosis.diagnosis.seoGrade}</span>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-xs leading-relaxed text-slate-700">
                    <div>
                      <h5 className="font-bold text-slate-950 uppercase text-[9px] tracking-wider mb-0.5 font-mono">Hook Retention Analysis</h5>
                      <p className="text-slate-600">{selectedPostForDiagnosis.diagnosis.hookAnalysis}</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-950 uppercase text-[9px] tracking-wider mb-0.5 font-mono">Pacing, Readability & Space Layout</h5>
                      <p className="text-slate-600">{selectedPostForDiagnosis.diagnosis.pacingFeedback}</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-950 uppercase text-[9px] tracking-wider mb-0.5 font-mono">Algorithmic Specification Adherence</h5>
                      <p className="text-slate-600">{selectedPostForDiagnosis.diagnosis.viralSpecAdherence}</p>
                    </div>
                  </div>

                  <div className="border border-indigo-100 rounded-lg p-4 bg-indigo-50/20 mt-2 font-mono">
                    <span className="text-[9px] font-bold text-indigo-800 tracking-wider block uppercase">Actionable Recovery Recommendation Copy</span>
                    <p className="text-xs text-indigo-950 leading-relaxed bg-white p-3 rounded border border-indigo-100/60 mt-1.5 whitespace-pre-wrap">
                      {selectedPostForDiagnosis.diagnosis.actionableRecommendation}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">No diagnostic payload calculated for this post. Prior to exporting this report, click the "Diagnose Engagement Dropoff" button inside the online dashboard to populate real-time diagnostics.</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No post selected for audit.</p>
          )}
        </div>

        {/* Section 4: On-Demand Viral Blueprints */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-indigo-900 border-b border-slate-200 pb-1.5 mb-4 uppercase tracking-wide font-mono">4. On-Demand Copywriting Frameworks</h3>
          <div className="grid grid-cols-2 gap-4">
            {playbooks.slice(0, 4).map(pb => (
              <div key={pb.id} className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/30 flex flex-col justify-between">
                <div>
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[8px] font-mono font-bold rounded uppercase tracking-wider inline-block">
                    {pb.platform}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 mt-1.5">{pb.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{pb.description}</p>
                  <div className="border-t border-slate-200 pt-2 mt-2 space-y-1 text-[10px] text-slate-700">
                    <p><strong>Hook template:</strong> "{pb.hookTemplate}"</p>
                    <p className="font-mono text-slate-500 leading-normal text-[9px] whitespace-pre-line">{pb.structure}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Print Footer */}
        <div className="border-t border-slate-200 pt-4 mt-8 flex justify-between text-[9px] text-slate-400 font-mono">
          <span>WATER CREATOR © 2026. All Strategic Blueprints Patented.</span>
          <span>Confidential Strategy Assessment Document</span>
        </div>
      </div>

    </div>
  );
}
