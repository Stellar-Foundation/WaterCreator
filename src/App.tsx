import { useState } from "react";
import { 
  BarChart2, Edit, Video, Calendar, Sparkles, BookOpen, Layers, Info, CheckCircle2, Globe, CloudLightning
} from "lucide-react";
import { INITIAL_ACCOUNTS, INITIAL_POSTS, INITIAL_REPORT, PLATFORM_PLAYBOOKS } from "./data";
import { SocialAccount, Post, WeeklyGrowthReport } from "./types";
import AnalyticsCentral from "./components/AnalyticsCentral";
import ContentComposer from "./components/ContentComposer";
import VideoStudio from "./components/VideoStudio";
import ScheduleCalendar from "./components/ScheduleCalendar";
import PlatformsScreen from "./components/PlatformsScreen";

export default function App() {
  const [activeTab, setActiveTab] = useState<"analytics" | "composer" | "studio" | "calendar" | "platforms">("analytics");
  const [accounts, setAccounts] = useState<SocialAccount[]>(INITIAL_ACCOUNTS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [growthReport, setGrowthReport] = useState<WeeklyGrowthReport>(INITIAL_REPORT);
  const [playbooks] = useState(PLATFORM_PLAYBOOKS);

  // States to bridge data from Analytics -> Composer
  const [composerInitialText, setComposerInitialText] = useState("");
  const [composerInitialPlatforms, setComposerInitialPlatforms] = useState<string[]>([]);

  // Force dark theme exclusively
  const isDark = true;

  // Triggered when a user clicks "Try This" on any suggestion or playbook
  const handleTryTemplate = (text: string, platforms: string[]) => {
    setComposerInitialText(text);
    setComposerInitialPlatforms(platforms);
    setActiveTab("composer");
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden dark bg-[#020512] text-slate-100" 
      id="water-creator-app"
    >
      
      {/* Premium Apple-Style Gradient Glow (Active in Dark Mode only) */}
      <div className="absolute top-0 inset-x-0 h-[650px] pointer-events-none overflow-hidden z-0 select-none">
        {/* Fuchsia glowing orb */}
        <div className="absolute top-[-300px] right-[5%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-fuchsia-600/10 via-purple-500/10 to-pink-500/5 blur-[140px] mix-blend-screen animate-pulse duration-[10s]"></div>
        {/* Deep Navy/Royal Blue glowing orb */}
        <div className="absolute top-[-250px] left-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-600/15 via-blue-500/10 to-transparent blur-[120px] mix-blend-screen animate-pulse duration-[8s]"></div>
        {/* Tiny center-ground secondary orb */}
        <div className="absolute top-[350px] left-[30%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px] mix-blend-screen"></div>
      </div>

      {/* Premium Navigation Top Bar (Apple-Styled) */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300 relative z-10 bg-[#020512]/80 border-slate-900">
        <div className="flex items-center gap-3">
          {/* Generated PWA Capacitor Orb App Icon */}
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-slate-800/40 relative group cursor-pointer bg-slate-950">
            <img 
              src="/src/assets/images/pwa_icon_1782617542062.jpg" 
              alt="Water Creator PWA Icon" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-lg tracking-tight leading-none bg-gradient-to-r from-indigo-300 via-fuchsia-300 dark:to-pink-300 text-transparent bg-clip-text">
                Water Creator
              </h1>
              <span className="px-1.5 py-0.5 bg-indigo-950/40 border border-indigo-900/50 text-indigo-300 text-[9px] font-bold rounded-md">
                PWA AMBIENT
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">Create once. Dominate everywhere. Grow intelligently.</p>
          </div>
        </div>

        {/* Dynamic Mode Controller & PWA Assets Indicator */}
        <div className="flex items-center gap-3">
          
          {/* Dark Mode Active Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-900/50 text-[10px] font-mono text-indigo-300 font-bold">
            <Sparkles size={11} className="text-indigo-400" />
            <span>DARK AMBIENT</span>
          </div>

          {/* PWA Active Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800/80 text-[10px] font-mono text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Capacitor Hub Ready</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame container with extra bottom padding to clear the non-floating docked bottom navigation bar */}
      <main className="flex-1 p-6 pb-24 max-w-7xl w-full mx-auto space-y-6 relative z-10">
        
        {/* Active tab routing views */}
        {activeTab === "analytics" && (
          <AnalyticsCentral
            accounts={accounts}
            setAccounts={setAccounts}
            posts={posts}
            setPosts={setPosts}
            growthReport={growthReport}
            setGrowthReport={setGrowthReport}
            playbooks={playbooks}
            onTryTemplate={handleTryTemplate}
          />
        )}

        {activeTab === "composer" && (
          <ContentComposer
            accounts={accounts}
            initialText={composerInitialText}
            initialPlatforms={composerInitialPlatforms}
            posts={posts}
            setPosts={setPosts}
            onScheduleSuccess={() => {
              setComposerInitialText("");
              setComposerInitialPlatforms([]);
              setActiveTab("calendar");
            }}
          />
        )}

        {activeTab === "studio" && (
          <VideoStudio />
        )}

        {activeTab === "calendar" && (
          <ScheduleCalendar
            posts={posts}
            setPosts={setPosts}
            growthReport={growthReport}
          />
        )}

        {activeTab === "platforms" && (
          <PlatformsScreen
            accounts={accounts}
            setAccounts={setAccounts}
          />
        )}

      </main>

      {/* Pinned Non-Floating Bottom Navigation Bar (Apple-Style, zero margin, full-width docked) */}
      <div 
        className="fixed bottom-0 inset-x-0 z-50 border-t backdrop-blur-xl bg-[#020512]/90 border-slate-900 text-white" 
        id="bottom-nav-dock"
      >
        <nav className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-1 w-full">
          {[
            { id: "analytics", label: "Analytics Central", icon: BarChart2 },
            { id: "composer", label: "POST", icon: Edit },
            { id: "studio", label: "AI Video Studio", icon: Video },
            { id: "calendar", label: "Schedule", icon: Calendar },
            { id: "platforms", label: "Platforms Hub", icon: Globe }
          ].map(tab => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                id={`bottom-nav-tab-${tab.id}`}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? "bg-gradient-to-tr from-indigo-600 to-fuchsia-600 text-white font-bold shadow-md shadow-indigo-500/10 scale-[1.02]" 
                    : "text-slate-400 hover:text-white hover:bg-slate-900/50"
                }`}
              >
                <tab.icon size={17} className={isSelected ? "scale-110 transition-transform text-white" : ""} />
                <span className="text-[10px] mt-1 font-medium tracking-tight truncate w-full text-center">
                  {tab.label.split(" ")[0]} <span className="hidden xs:inline">{tab.label.split(" ")[1] || ""}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Humble Footer */}
      <footer className="border-t py-6 px-6 text-center text-[11px] font-mono pb-20 bg-[#020512] border-slate-900 text-slate-500">
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Water Creator Inc. All rights reserved. Self-improving Social Growth Loop Active.</p>
          <div className="flex items-center gap-4">
            {/* Display PWA Icon Thumbnail in Footer for inspection */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">PWA Orb Logo:</span>
              <img 
                src="/src/assets/images/pwa_icon_1782617542062.jpg" 
                alt="Capacitor PWA Thumbnail" 
                className="w-4.5 h-4.5 rounded-md border border-slate-700/50 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="flex items-center gap-1"><Info size={11} /> Aligned to V2 Product Spec</span>
            <span>Secure Server-Side Gemini API Tunnel Active</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
