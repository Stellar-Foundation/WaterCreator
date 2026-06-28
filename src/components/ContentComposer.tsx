import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { 
  Sparkles, Instagram, Linkedin, Send, Calendar, Check, Edit, Image as ImageIcon,
  Music, Film, RefreshCw, Layers, ArrowRight, Eye, Video, FileText, CheckCircle,
  Facebook, Youtube, Twitter, Cloud, Flame, MessageCircle, MessageSquare, BookOpen, Share2,
  Clock, AlertCircle
} from "lucide-react";
import { PlatformVariant, Post, SocialAccount } from "../types";

interface ContentComposerProps {
  accounts: SocialAccount[];
  initialText?: string;
  initialPlatforms?: string[];
  posts: Post[];
  setPosts: Dispatch<SetStateAction<Post[]>>;
  onScheduleSuccess: () => void; // Callback to open Calendar tab
}

export default function ContentComposer({
  accounts,
  initialText = "",
  initialPlatforms = [],
  posts,
  setPosts,
  onScheduleSuccess
}: ContentComposerProps) {
  const [basePrompt, setBasePrompt] = useState(initialText);
  const [generating, setGenerating] = useState(false);
  const [variants, setVariants] = useState<PlatformVariant[]>([]);
  const [activeTab, setActiveTab] = useState("");
  
  // Custom manual edits for each variant
  const [editedCaptions, setEditedCaptions] = useState<{ [key: string]: string }>({});
  
  // Scheduling state - always visible on the left form
  const [scheduleDate, setScheduleDate] = useState("2026-06-29");
  const [scheduleTime, setScheduleTime] = useState("18:00");
  const [successScheduled, setSuccessScheduled] = useState(false);

  // Asset generator state
  const [generatingAsset, setGeneratingAsset] = useState<{ [key: string]: boolean }>({});
  const [assetUrls, setAssetUrls] = useState<{ [key: string]: string }>({});

  // 1. "should POST on all connected platforms by default, unless the user unchecks on a menu"
  const connectedPlatforms = accounts.filter(a => a.isConnected).map(a => a.platform);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(() => {
    return connectedPlatforms.length > 0 ? connectedPlatforms : ["Instagram", "LinkedIn"];
  });

  // Keep in sync if parent changes initialText (e.g. user clicked "Try This" on reports)
  useEffect(() => {
    if (initialText) {
      setBasePrompt(initialText);
    }
    // If parent specifically requested platforms, override
    if (initialPlatforms && initialPlatforms.length > 0) {
      setSelectedPlatforms(initialPlatforms);
    } else {
      // otherwise fallback to connected platforms
      const connected = accounts.filter(a => a.isConnected).map(a => a.platform);
      if (connected.length > 0) {
        setSelectedPlatforms(connected);
      }
    }
  }, [initialText, initialPlatforms, accounts]);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Generate platform variations using Gemini
  const generatePlatformVariants = async () => {
    if (!basePrompt.trim()) return;
    if (selectedPlatforms.length === 0) {
      alert("Please select at least one target platform.");
      return;
    }

    setGenerating(true);
    setVariants([]);
    setEditedCaptions({});

    // Build custom instructions map based on connected accounts
    const customInstructionsMap: { [key: string]: string } = {};
    accounts.forEach(acc => {
      if (acc.isConnected && acc.customInstructions) {
        customInstructionsMap[acc.platform] = acc.customInstructions;
      }
    });

    try {
      const response = await fetch("/api/generate-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: basePrompt,
          platforms: selectedPlatforms,
          customInstructions: customInstructionsMap
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Generation failed.");
      }

      const data = await response.json();
      if (data.variants && data.variants.length > 0) {
        setVariants(data.variants);
        setActiveTab(data.variants[0].platform);
        
        // Populate initial edited values
        const initialEdits: { [key: string]: string } = {};
        data.variants.forEach((v: PlatformVariant) => {
          initialEdits[v.platform] = v.caption;
        });
        setEditedCaptions(initialEdits);
      }
    } catch (err: any) {
      alert(err.message || "Failed to generate cross-platform posts.");
    } finally {
      setGenerating(false);
    }
  };

  // Generate placeholder graphics for the variations mockup
  const handleGenerateAsset = (platform: string) => {
    setGeneratingAsset(prev => ({ ...prev, [platform]: true }));
    
    setTimeout(() => {
      const randomId = Math.floor(Math.random() * 1000);
      const randomImageUrl = `https://images.unsplash.com/photo-${randomId % 2 === 0 ? '1451187580459-43490279c0fa' : '1518770660439-4636190af475'}?w=800&auto=format&fit=crop&q=80&sig=${randomId}`;
      
      setAssetUrls(prev => ({ ...prev, [platform]: randomImageUrl }));
      setGeneratingAsset(prev => ({ ...prev, [platform]: false }));
    }, 1200);
  };

  // Handle caption modification
  const handleCaptionChange = (platform: string, text: string) => {
    setEditedCaptions(prev => ({
      ...prev,
      [platform]: text
    }));
  };

  // Direct Scheduling of the Base Draft (allows fast direct posting!)
  const handleScheduleDirect = () => {
    if (!basePrompt.trim()) return;
    if (selectedPlatforms.length === 0) {
      alert("Please select at least one platform to publish on.");
      return;
    }

    const scheduledDateISO = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();

    // Create scheduled items for all checked platforms using original draft text
    const newScheduledPosts: Post[] = selectedPlatforms.map((platform, idx) => {
      return {
        id: `usr_direct_${Date.now()}_${idx}`,
        title: `Direct Campaign: ${platform}`,
        text: basePrompt,
        scheduledDate: scheduledDateISO,
        platforms: [platform],
        status: "scheduled",
        mediaUrl: undefined,
        mediaType: platform === "TikTok" || platform === "YouTube" ? "video" : "image"
      };
    });

    setPosts(prev => [...prev, ...newScheduledPosts]);
    setSuccessScheduled(true);

    setTimeout(() => {
      setSuccessScheduled(false);
      onScheduleSuccess(); // change tab
    }, 1500);
  };

  // Scheduling of the tailored variations
  const handleScheduleTailored = () => {
    if (variants.length === 0) return;

    const scheduledDateISO = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();

    const newScheduledPosts: Post[] = variants.map((v, idx) => {
      const finalCaption = editedCaptions[v.platform] || v.caption;
      const finalHashtags = v.hashtags.map(tag => tag.startsWith("#") ? tag : `#${tag}`).join(" ");
      
      return {
        id: `usr_tailored_${Date.now()}_${idx}`,
        title: `AI-Campaign: ${v.platform}`,
        text: `${finalCaption}\n\n${finalHashtags}`,
        scheduledDate: scheduledDateISO,
        platforms: [v.platform],
        status: "scheduled",
        mediaUrl: assetUrls[v.platform] || undefined,
        mediaType: v.platform === "TikTok" || v.platform === "YouTube" ? "video" : "image"
      };
    });

    setPosts(prev => [...prev, ...newScheduledPosts]);
    setSuccessScheduled(true);

    setTimeout(() => {
      setSuccessScheduled(false);
      onScheduleSuccess(); // change tab
    }, 1500);
  };

  return (
    <div 
      className="bg-[#0b1026] text-slate-100 p-6 md:p-8 rounded-2xl shadow-2xl border border-slate-800/80 w-full select-none" 
      id="content-composer-view"
      style={{ colorScheme: 'dark' }}
    >
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Campaign Configuration Form (Dark styled) */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-display font-bold text-xl text-slate-100 flex items-center gap-2">
              <Sparkles className="text-violet-400" size={22} />
              Publish & Queue Center (POST)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure parameters, select networks, set release peaks, and schedule immediately or run tailored AI optimizers.
            </p>
          </div>

          {/* Base Draft text area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 font-mono tracking-wide uppercase flex justify-between">
              <span>Core Idea / Social Copy Draft:</span>
              <span className="text-[10px] text-slate-500 font-normal normal-case">{basePrompt.length} characters</span>
            </label>
            <textarea
              value={basePrompt}
              onChange={(e) => setBasePrompt(e.target.value)}
              placeholder="e.g. Announcing our newest open-source platform release! It analyzes cross-platform stats, generates real-time viral copy variations, and provides on-demand playbooks."
              rows={5}
              className="w-full border border-slate-800 rounded-xl p-3 text-xs leading-relaxed text-slate-100 placeholder-slate-500 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-shadow shadow-xs"
            />
          </div>

          {/* Scheduling Options - Always Visible & Prominent */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 font-mono tracking-wide uppercase flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-400" />
                Release Scheduling Options
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded font-bold uppercase">
                Optimized Peak Activated
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 font-mono">PUBLICATION DATE:</label>
                <input 
                  type="date" 
                  value={scheduleDate} 
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 font-mono">PUBLICATION TIME:</label>
                <input 
                  type="time" 
                  value={scheduleTime} 
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 bg-slate-900/50 border border-slate-800/60 p-2.5 rounded-lg text-[11px] text-slate-300">
              <Clock size={14} className="text-indigo-400 mt-0.5 shrink-0" />
              <span>
                Based on your channel diagnostics, your optimal peak release slot is suggested for <strong>June 29th at 6:00 PM</strong> to maximize algorithmic impressions.
              </span>
            </div>
          </div>

          {/* Target Platforms selection list / menu */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-300 font-mono tracking-wide uppercase">Target Distribution Networks:</span>
              <span className="text-[10px] text-indigo-400 font-mono font-bold">POSTs on connected by default</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { name: "Instagram", icon: Instagram, color: "text-pink-400 border-pink-900/50 bg-pink-950/20" },
                { name: "Facebook", icon: Facebook, color: "text-blue-400 border-blue-900/50 bg-blue-950/20" },
                { name: "X", icon: Twitter, color: "text-slate-100 border-slate-800 bg-slate-900/40" },
                { name: "YouTube", icon: Youtube, color: "text-red-400 border-red-900/50 bg-red-950/20" },
                { name: "TikTok", icon: Film, color: "text-slate-100 border-slate-800 bg-slate-900/40" },
                { name: "Kwai", icon: Flame, color: "text-orange-400 border-orange-900/50 bg-orange-950/20" },
                { name: "BlueSky", icon: Cloud, color: "text-sky-400 border-sky-900/50 bg-sky-950/20" },
                { name: "LinkedIn", icon: Linkedin, color: "text-blue-400 border-blue-900/50 bg-blue-950/20" },
                { name: "Telegram", icon: Send, color: "text-sky-400 border-sky-900/50 bg-sky-950/20" },
                { name: "WhatsApp", icon: MessageCircle, color: "text-emerald-400 border-emerald-900/50 bg-emerald-950/20" },
                { name: "WeChat", icon: MessageSquare, color: "text-green-400 border-green-900/50 bg-green-950/20" },
                { name: "Substack", icon: BookOpen, color: "text-orange-400 border-orange-900/50 bg-orange-950/20" },
                { name: "VK", icon: Share2, color: "text-blue-400 border-blue-900/50 bg-blue-950/20" }
              ].map(p => {
                const isSelected = selectedPlatforms.includes(p.name);
                const isConnected = accounts.find(a => a.platform === p.name)?.isConnected || false;
                
                return (
                  <button
                    key={p.name}
                    onClick={() => togglePlatform(p.name)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition flex flex-col items-center gap-1.5 cursor-pointer relative ${
                      isSelected 
                        ? `${p.color} border-indigo-500 ring-1 ring-indigo-500` 
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    {/* Glowing dot representing connected status */}
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-700"}`} />
                    </div>

                    <p.icon size={16} />
                    <span className="font-display font-medium text-[11px]">{p.name}</span>
                    <span className="text-[8px] font-mono font-normal opacity-80 scale-90">
                      {isConnected ? "CONNECTED" : "UNLINKED"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Publishing Action Board (Offers direct publish OR tailoring) */}
          <div className="space-y-3 pt-2">
            
            {/* Primary Action Button: Direct Post / Schedule */}
            <button
              onClick={handleScheduleDirect}
              disabled={successScheduled || !basePrompt.trim() || selectedPlatforms.length === 0}
              className={`w-full py-3 px-5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                successScheduled 
                  ? "bg-emerald-600 text-white" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {successScheduled ? (
                <>
                  <CheckCircle size={15} /> Draft Published & Scheduled!
                </>
              ) : (
                <>
                  <Send size={14} /> Direct POST / Schedule Now ({selectedPlatforms.length} Platforms)
                </>
              )}
            </button>

            {/* AI Custom-Tailor Action Button */}
            <button
              onClick={generatePlatformVariants}
              disabled={generating || !basePrompt.trim() || selectedPlatforms.length === 0}
              className="w-full py-2.5 px-5 border border-indigo-900 hover:border-indigo-800 bg-indigo-950/40 hover:bg-indigo-950/60 text-indigo-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-indigo-400" /> Tailwind-Optimizing with Gemini...
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-violet-400 animate-pulse" /> Optimize and Preview with Gemini AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Tailored Previews & Platform Overrides */}
        <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-slate-800 pt-6 lg:pt-0 lg:pl-8 space-y-6">
          {variants.length > 0 ? (
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="font-display font-bold text-sm text-slate-200">Gemini-Tailored Campaign Variations</h4>
                <span className="text-[9px] bg-indigo-950/50 text-indigo-300 border border-indigo-900/40 font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                  Algorithmic Spec Match
                </span>
              </div>

              {/* Variant platform picker tabs */}
              <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1">
                {variants.map(v => (
                  <button
                    key={v.platform}
                    onClick={() => setActiveTab(v.platform)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg border-b-2 transition cursor-pointer whitespace-nowrap ${
                      activeTab === v.platform 
                        ? "border-violet-500 text-violet-400 font-bold bg-violet-950/20" 
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {v.platform}
                  </button>
                ))}
              </div>

              {/* Active Preview Panel */}
              {variants.map(v => {
                if (v.platform !== activeTab) return null;
                const finalImg = assetUrls[v.platform];
                return (
                  <div key={v.platform} className="space-y-5 animate-fade-in text-slate-100">
                    
                    {/* Device Layout Simulator */}
                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 w-full max-w-full sm:max-w-sm mx-auto shadow-xs">
                      <div className="flex items-center justify-between mb-2.5 border-b border-slate-800 pb-2">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{v.platform} News Feed simulator</span>
                        <span className="text-[10px] font-mono text-violet-400 font-bold">{v.aspectRatio} Ratio</span>
                      </div>

                      {/* Mock Card */}
                      <div className="bg-slate-900 rounded-lg border border-slate-800/60 overflow-hidden shadow-xs text-slate-100">
                        {v.platform === "TikTok" || v.platform === "YouTube" ? (
                          /* Portrait Short Video mockup */
                          <div className="aspect-[9/16] bg-slate-950 relative flex flex-col justify-between p-4 text-white h-96">
                            {finalImg ? (
                              <img src={finalImg} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-purple-950/40 to-black/90 flex flex-col items-center justify-center p-6 text-center">
                                <Video className="text-slate-400 animate-pulse" size={28} />
                                <span className="text-[10px] text-slate-400 mt-2 font-mono">Simulated Portrait Stream</span>
                              </div>
                            )}

                            <div className="relative z-10 text-[9px] uppercase font-mono tracking-widest bg-black/40 px-2 py-0.5 rounded self-start">
                              Mobile Player
                            </div>

                            <div className="relative z-10 space-y-2 mt-auto text-left">
                              <p className="text-[11px] font-bold text-amber-300">
                                🎬 Video Hook: "{v.hook}"
                              </p>
                              <p className="text-xs line-clamp-3 leading-relaxed text-slate-200">
                                {editedCaptions[v.platform] || v.caption}
                              </p>
                              <div className="flex flex-wrap gap-1 text-[9px] font-mono text-cyan-300">
                                {v.hashtags.map(t => <span key={t}>#{t}</span>)}
                              </div>
                              <div className="text-[9px] font-mono flex items-center gap-1 text-emerald-300 bg-black/40 p-1.5 rounded">
                                <Music size={10} /> Suggested Sound: {v.trendingAudioSuggestion}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Square post card preview */
                          <div className="flex flex-col text-left">
                            {finalImg ? (
                              <img src={finalImg} alt="Visual cover asset" className="w-full aspect-square object-cover" />
                            ) : (
                              <div className="w-full aspect-square bg-slate-950 flex flex-col items-center justify-center border-b border-slate-850">
                                <ImageIcon className="text-slate-400" size={32} />
                                <span className="text-[10px] text-slate-500 font-mono mt-1.5">No graphic cover generated</span>
                              </div>
                            )}

                            <div className="p-4 space-y-2.5">
                              <p className="text-[11px] font-bold text-indigo-300 bg-indigo-950/30 px-2 py-0.5 rounded-md inline-block">
                                📌 Visual Layout: {v.visualLayoutGuide}
                              </p>
                              <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                                {editedCaptions[v.platform] || v.caption}
                              </p>
                              <p className="text-[10px] font-mono text-blue-400">
                                {v.hashtags.map(t => `#${t}`).join(" ")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cover Generation inside Simulation Box */}
                      <div className="mt-3">
                        <button
                          onClick={() => handleGenerateAsset(v.platform)}
                          disabled={generatingAsset[v.platform]}
                          className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {generatingAsset[v.platform] ? (
                            <>
                              <RefreshCw size={11} className="animate-spin" /> Tailor-modeling image...
                            </>
                          ) : (
                            <>
                              <ImageIcon size={11} /> Generate Cover Graphics (Gemini Art)
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Manual Override caption editor */}
                    <div className="space-y-1.5 text-left">
                      <span className="text-xs font-bold text-slate-300 font-mono uppercase flex justify-between">
                        <span>Edit Platform Caption Override:</span>
                        <span className="text-[9px] text-indigo-400 font-normal">Custom changes save instantly</span>
                      </span>
                      <textarea
                        value={editedCaptions[v.platform] || ""}
                        onChange={(e) => handleCaptionChange(v.platform, e.target.value)}
                        rows={5}
                        className="w-full border border-slate-800 rounded-xl p-3 text-xs leading-relaxed text-slate-100 bg-slate-950 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                );
              })}

              {/* Confirm Tailored Queue Button */}
              <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-violet-400" />
                  Ready to Publish tailored versions?
                </span>
                <button
                  onClick={handleScheduleTailored}
                  disabled={successScheduled}
                  className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  Confirm & Queue Cross-Platform Campaign (Optimized)
                </button>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-24 px-4 text-slate-500">
              <Layers size={44} className="text-slate-600 mb-3" />
              <h4 className="font-display font-bold text-sm text-slate-300 mb-1">Tailored Optimizations Canvas</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Click "Optimize and Preview with Gemini AI" on the left to synthesize target platform captions, video hook variants, trending audio templates, and custom cover images.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
