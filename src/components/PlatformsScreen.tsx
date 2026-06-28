import { useState, Dispatch, SetStateAction } from "react";
import { 
  Instagram, Facebook, Youtube, Linkedin, Film, Flame, Cloud, Twitter, 
  Link, Unlink, Check, Save, Sparkles, Info, Users, BarChart3, Radio, HelpCircle
} from "lucide-react";
import { SocialAccount } from "../types";

interface BrandIconProps {
  className?: string;
  size?: number;
}

const TelegramLogo = ({ className, size = 24 }: BrandIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.97-.74 3.79-1.65 6.32-2.73 7.57-3.25 3.61-1.48 4.36-1.74 4.85-1.75.11 0 .35.03.5.16.13.1.17.24.18.34.02.1-.01.29-.02.35z" />
  </svg>
);

const WhatsAppLogo = ({ className, size = 24 }: BrandIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
  >
    <path d="M12.012 2C6.485 2 2 6.485 2 12.012c0 1.914.537 3.699 1.466 5.234L2 22l4.912-1.29c1.5.82 3.208 1.302 5.1 1.302 5.528 0 10.012-4.485 10.012-10.012C22.024 6.485 17.54 2 12.012 2zm5.836 14.18c-.24.673-1.222 1.218-1.745 1.272-.477.05-1.102.08-1.745-.125-.407-.13-1.614-.627-3.447-1.442-3.13-1.393-5.11-4.562-5.267-4.77-.156-.21-1.254-1.678-1.254-3.2 0-1.523.784-2.274 1.063-2.574.28-.3.61-.375.815-.375.205 0 .41.002.588.01.185.007.435-.07.68.524.254.613.867 2.115.942 2.264.075.15.125.324.025.524-.1.2-.15.324-.3.499-.15.175-.315.39-.45.524-.15.15-.308.315-.133.614.175.3.774 1.282 1.66 2.072.887.79 1.637 1.036 1.87 1.148.232.112.365.093.5-.062.135-.155.58-.673.734-.9.155-.228.308-.19.52-.112.214.078 1.36.643 1.594.757.235.115.39.17.447.27.057.1.057.575-.183 1.248z" />
  </svg>
);

const WeChatLogo = ({ className, size = 24 }: BrandIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
  >
    <path d="M8.57 2C4.316 2 .857 4.968.857 8.629c0 2.052 1.083 3.882 2.784 5.127l-.715 2.146 2.502-1.25c.983.272 2.03.42 3.142.42.348 0 .69-.016 1.026-.048-.28-.707-.44-1.488-.44-2.31 0-3.376 3.018-6.113 6.742-6.113.88 0 1.714.154 2.476.435C17.653 4.606 13.518 2 8.57 2zm-3 5.143c-.473 0-.857-.384-.857-.857 0-.473.384-.857.857-.857s.857.384.857.857c0 .473-.384.857-.857.857zm6 0c-.473 0-.857-.384-.857-.857 0-.473.384-.857.857-.857s.857.384.857.857c0 .473-.384.857-.857.857zm7.288 3.428c-3.411 0-6.177 2.378-6.177 5.31 0 2.933 2.766 5.31 6.177 5.31.854 0 1.666-.149 2.404-.4l1.96 1.002-.553-1.688c1.395-.973 2.277-2.392 2.277-3.974 0-2.932-2.766-5.31-6.177-5.31zm-2.143 4.286c-.343 0-.62-.278-.62-.62 0-.344.277-.621.62-.621s.621.277.621.62c0 .343-.278.62-.621.62zm4.286 0c-.343 0-.621-.278-.621-.62 0-.344.278-.621.621-.621s.62.277.62.62c0 .343-.277.62-.62.62z" />
  </svg>
);

const SubstackLogo = ({ className, size = 24 }: BrandIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
  >
    <path d="M22.56 5.04H1.44V1.44H22.56V5.04ZM22.56 12.24H1.44V8.64H22.56V12.24ZM1.44 15.84V22.56L12 16.8L22.56 22.56V15.84H1.44Z" />
  </svg>
);

const VKLogo = ({ className, size = 24 }: BrandIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
  >
    <path d="M13.162 18.994c-5.64 0-9.616-3.877-9.75-10.312h3.047c.09 4.707 2.164 6.697 3.805 7.106V8.682H13.1c0 2.52 1.071 4.084 2.825 4.263 1.543-.178 3.237-1.624 3.818-4.263h3.048c-.464 3.242-2.822 5.087-4.14 5.704 1.318.616 4.02 2.213 4.985 5.608h-3.33c-.76-2.37-2.656-4.204-4.814-4.417v4.417h-2.292z" />
  </svg>
);

interface PlatformsScreenProps {
  accounts: SocialAccount[];
  setAccounts: Dispatch<SetStateAction<SocialAccount[]>>;
}

export default function PlatformsScreen({ accounts, setAccounts }: PlatformsScreenProps) {
  const [activePlatformId, setActivePlatformId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ [key: string]: boolean }>({});

  // Toggle connection state of a platform
  const handleToggleConnection = (id: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        const nextState = !acc.isConnected;
        return { ...acc, isConnected: nextState };
      }
      return acc;
    }));
  };

  // Update custom instructions for a platform
  const handleUpdateInstructions = (id: string, text: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        return { ...acc, customInstructions: text };
      }
      return acc;
    }));
  };

  // Save changes visual trigger
  const triggerSaveVisual = (id: string) => {
    setSaveStatus(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, [id]: false }));
    }, 1500);
  };

  // Pre-defined high-performing prompt blueprints that users can click to load immediately
  const promptBlueprints = [
    {
      label: "Viral Curiosity Hook",
      text: "Open with a shocking or counter-intuitive hook in the first 3 seconds (e.g., 'Stop doing X. Here is what actually works in 2026...'). Use high-tempo pacing, 3-4 bullet points, and clean line spacing."
    },
    {
      label: "Developer/Intellectual Vibe",
      text: "Write with an authentic, direct, tech-forward tone. Pair analytical insights with light developer humor. Avoid salesy exclamation marks, emoji-spam, or generic hashtags. Keep it clean and readable."
    },
    {
      label: "Community Builder",
      text: "Warm, engaging, and highly conversational copy. Pose a thought-provoking open question at the end to spark discussions in the comments. Use moderate line breaks and 3 custom hashtags."
    },
    {
      label: "Short-Form Video Engine",
      text: "Format strictly as a high-retention video script. Include specific instructions for scene visual direction, voiceover narration, and dynamic overlay caption text. Keep estimated total duration under 45 seconds."
    }
  ];

  // Helper to map platform names to icons and background themes
  const getPlatformDetails = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return {
          icon: Instagram,
          color: "text-pink-600",
          bgColor: "bg-pink-50/50",
          borderColor: "border-pink-100",
          accentColor: "from-pink-500 to-rose-500",
          tagline: "IG - Visual feed, stories & reels"
        };
      case "facebook":
        return {
          icon: Facebook,
          color: "text-blue-600",
          bgColor: "bg-blue-50/50",
          borderColor: "border-blue-100",
          accentColor: "from-blue-600 to-indigo-600",
          tagline: "FB - Dynamic groups & social feeds"
        };
      case "x":
        return {
          icon: Twitter,
          color: "text-gray-900",
          bgColor: "bg-gray-100/50",
          borderColor: "border-gray-200",
          accentColor: "from-slate-800 to-slate-950",
          tagline: "X - Real-time threads & breaking tech"
        };
      case "youtube":
        return {
          icon: Youtube,
          color: "text-red-600",
          bgColor: "bg-red-50/50",
          borderColor: "border-red-100",
          accentColor: "from-red-600 to-orange-600",
          tagline: "YT - Video essays & retention shorts"
        };
      case "tiktok":
        return {
          icon: Film,
          color: "text-indigo-950",
          bgColor: "bg-slate-100/50",
          borderColor: "border-slate-200",
          accentColor: "from-slate-900 via-indigo-950 to-pink-500",
          tagline: "TT - Fast-paced vertical algorithms"
        };
      case "kwai":
        return {
          icon: Flame,
          color: "text-orange-500",
          bgColor: "bg-orange-50/50",
          borderColor: "border-orange-100",
          accentColor: "from-orange-500 to-yellow-500",
          tagline: "KW - Energetic local short-videos"
        };
      case "bluesky":
        return {
          icon: Cloud,
          color: "text-sky-500",
          bgColor: "bg-sky-50/50",
          borderColor: "border-sky-100",
          accentColor: "from-sky-400 to-blue-500",
          tagline: "BSky - Decentralized developer hub"
        };
      case "linkedin":
        return {
          icon: Linkedin,
          color: "text-blue-700",
          bgColor: "bg-indigo-50/50",
          borderColor: "border-indigo-100",
          accentColor: "from-blue-700 to-sky-600",
          tagline: "LN - Professional learning arcs"
        };
      case "telegram":
        return {
          icon: TelegramLogo,
          color: "text-sky-500",
          bgColor: "bg-sky-50/50",
          borderColor: "border-sky-100",
          accentColor: "from-sky-400 to-blue-500",
          tagline: "TG - Secure broadcasts, groups & channels"
        };
      case "whatsapp":
        return {
          icon: WhatsAppLogo,
          color: "text-emerald-500",
          bgColor: "bg-emerald-50/50",
          borderColor: "border-emerald-100",
          accentColor: "from-emerald-500 to-teal-600",
          tagline: "WA - Direct community & VIP updates"
        };
      case "wechat":
        return {
          icon: WeChatLogo,
          color: "text-green-600",
          bgColor: "bg-green-50/50",
          borderColor: "border-green-100",
          accentColor: "from-green-500 to-emerald-600",
          tagline: "WC - Public accounts & dynamic groups"
        };
      case "substack":
        return {
          icon: SubstackLogo,
          color: "text-orange-600",
          bgColor: "bg-orange-50/50",
          borderColor: "border-orange-100",
          accentColor: "from-orange-500 to-amber-600",
          tagline: "SB - Deep-dive newsletters & essays"
        };
      case "vk":
        return {
          icon: VKLogo,
          color: "text-blue-500",
          bgColor: "bg-blue-50/50",
          borderColor: "border-blue-100",
          accentColor: "from-blue-500 to-indigo-600",
          tagline: "VK - Comprehensive social networks & hubs"
        };
      default:
        return {
          icon: Radio,
          color: "text-violet-600",
          bgColor: "bg-violet-50/50",
          borderColor: "border-violet-100",
          accentColor: "from-violet-600 to-purple-600",
          tagline: "Social Hub"
        };
    }
  };

  return (
    <div className="space-y-6" id="platforms-screen">
      
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-300 via-indigo-500 to-slate-950 pointer-events-none"></div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono uppercase tracking-wider border border-blue-500/30">
            <Radio size={12} className="animate-pulse" />
            Unified Channel Hub
          </div>
          <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight leading-none">
            Cross-Platform Connectors
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
            Connect Water Creator AI to your favorite publish feeds, and specify platform-level custom prompt rules. When generating variants, Gemini will read these exact guardrails to customize your posts.
          </p>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map(acc => {
          const details = getPlatformDetails(acc.platform);
          const PlatformIcon = details.icon;
          const isSelectedForEdit = activePlatformId === acc.id;

          return (
            <div 
              key={acc.id} 
              id={`platform-card-${acc.id}`}
              className={`bg-white dark:bg-slate-900/40 dark:border-slate-800/80 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm ${
                acc.isConnected 
                  ? "border-slate-200 hover:shadow-md dark:hover:shadow-indigo-500/5" 
                  : "border-gray-200/60 opacity-85 hover:opacity-100 dark:border-slate-900"
              }`}
            >
              
              {/* Card Main Block */}
              <div className="p-5 space-y-4">
                
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${details.bgColor} ${details.borderColor} dark:border-slate-800 dark:bg-slate-950/60`}>
                      <PlatformIcon className={`${details.color}`} size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-sm text-gray-900 dark:text-slate-100 leading-tight">
                          {acc.platform}
                        </h3>
                        {acc.isConnected ? (
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold rounded-md flex items-center gap-0.5">
                            <Check size={8} /> Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-50 dark:bg-slate-950/40 border border-gray-150 dark:border-slate-900 text-gray-400 dark:text-slate-500 text-[9px] font-medium rounded-md">
                            Offline
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-gray-400 dark:text-slate-500 mt-0.5">{details.tagline}</p>
                    </div>
                  </div>

                  {/* Toggle Connection Button */}
                  <button
                    onClick={() => handleToggleConnection(acc.id)}
                    className={`py-1.5 px-3 rounded-xl text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      acc.isConnected
                        ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/30"
                        : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    }`}
                  >
                    {acc.isConnected ? (
                      <>
                        <Unlink size={11} /> Disconnect
                      </>
                    ) : (
                      <>
                        <Link size={11} /> Connect App
                      </>
                    )}
                  </button>
                </div>

                {/* Account Details & Live Stats */}
                {acc.isConnected ? (
                  <div className="grid grid-cols-3 gap-2 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800/60">
                    <div className="text-center">
                      <span className="block text-[9px] font-mono text-gray-400 dark:text-slate-500 uppercase">Followers</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-slate-200 font-mono flex items-center justify-center gap-1 mt-0.5">
                        <Users size={10} className="text-slate-400 dark:text-slate-500" />
                        {acc.followerCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-center border-x border-gray-200/50 dark:border-slate-800">
                      <span className="block text-[9px] font-mono text-gray-400 dark:text-slate-500 uppercase">Engagement</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-slate-200 font-mono flex items-center justify-center gap-1 mt-0.5">
                        <BarChart3 size={10} className="text-slate-400 dark:text-slate-500" />
                        {acc.engagementRate}%
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[9px] font-mono text-gray-400 dark:text-slate-500 uppercase">Est. Reach</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-slate-200 font-mono flex items-center justify-center gap-1 mt-0.5">
                        <Radio size={10} className="text-slate-400 dark:text-slate-500" />
                        {acc.reach >= 1000 ? `${(acc.reach / 1000).toFixed(1)}k` : acc.reach}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50/50 dark:bg-slate-950/20 rounded-xl p-3 border border-gray-100 dark:border-slate-900 text-center py-4">
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono leading-relaxed">
                      This channel is paused. Connect to synch visual calendars, view viral metrics & allow AI post translations.
                    </p>
                  </div>
                )}

                {/* Custom Instructions Panel */}
                <div className="space-y-2 border-t border-gray-100 dark:border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300 font-mono flex items-center gap-1">
                      <Sparkles className="text-fuchsia-500" size={12} />
                      AI Posting Overrides:
                    </span>
                    <button
                      onClick={() => setActivePlatformId(isSelectedForEdit ? null : acc.id)}
                      className="text-[10px] text-blue-600 dark:text-fuchsia-400 hover:underline font-mono cursor-pointer"
                    >
                      {isSelectedForEdit ? "Collapse Customizer" : "Customize Prompt"}
                    </button>
                  </div>

                  {/* Preview of custom instructions if collapsed */}
                  {!isSelectedForEdit && (
                    <div className="bg-gray-50 dark:bg-slate-950/20 p-2.5 rounded-lg border border-gray-100 dark:border-slate-900 min-h-10 flex items-center">
                      <p className="text-[10px] text-gray-500 dark:text-slate-400 italic line-clamp-2 leading-relaxed">
                        {acc.customInstructions || "No custom prompt rules configured yet. Tap 'Customize Prompt' to tailor the voiceover, pacing, or emojis."}
                      </p>
                    </div>
                  )}

                  {/* Fully expanded editor custom instructions */}
                  {isSelectedForEdit && (
                    <div className="space-y-3 pt-1 animate-fade-in">
                      <textarea
                        value={acc.customInstructions || ""}
                        onChange={(e) => handleUpdateInstructions(acc.id, e.target.value)}
                        placeholder="e.g. Keep copy short and professional. Maximize bullet points. Add exact viral retention guidelines."
                        rows={4}
                        className="w-full border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 bg-white dark:bg-slate-950"
                      />

                      {/* Prompt presets / Blueprints */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase flex items-center gap-0.5">
                          <HelpCircle size={10} /> Instantly Load AI Presets:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {promptBlueprints.map(bp => (
                            <button
                              key={bp.label}
                              type="button"
                              onClick={() => handleUpdateInstructions(acc.id, bp.text)}
                              className="text-[9px] font-sans font-medium bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md transition cursor-pointer"
                            >
                              + {bp.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Inline Action Row */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            handleUpdateInstructions(acc.id, acc.customInstructions || "");
                            triggerSaveVisual(acc.id);
                          }}
                          className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-fuchsia-600 dark:hover:bg-fuchsia-500 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          {saveStatus[acc.id] ? (
                            <>
                              <Check size={11} className="text-emerald-400" /> Saved!
                            </>
                          ) : (
                            <>
                              <Save size={11} /> Save Prompt Rules
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* Bottom Card Ribbon */}
              <div className="bg-slate-50 dark:bg-slate-950/40 px-5 py-2.5 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-gray-400 dark:text-slate-500 font-mono">
                <span>Account: {acc.username || "Not Configured"}</span>
                <span>Type: {acc.platform} Connector</span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Info Notice Box */}
      <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 rounded-2xl p-4 flex items-start gap-3">
        <Info className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" size={16} />
        <div>
          <h4 className="font-display font-bold text-xs text-sky-950 dark:text-sky-300">How do platform-level instructions work?</h4>
          <p className="text-[11px] text-sky-800 dark:text-sky-400 leading-relaxed mt-0.5 font-sans">
            When you navigate to the **Content Composer** and generate multi-platform variations, Water Creator automatically appends the custom prompt instructions corresponding to each active (connected) platform. This guarantees that your brand voice, formatting requirements, and unique style guidelines are applied perfectly per channel.
          </p>
        </div>
      </div>

    </div>
  );
}
