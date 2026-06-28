import { useState, Dispatch, SetStateAction } from "react";
import { 
  Calendar as CalendarIcon, Clock, Trash2, Edit3, Plus, RefreshCw, 
  Check, Play, ArrowRight, CheckCircle2, Instagram, Linkedin, Video, Film, Sparkles
} from "lucide-react";
import { Post, WeeklyGrowthReport } from "../types";

interface ScheduleCalendarProps {
  posts: Post[];
  setPosts: Dispatch<SetStateAction<Post[]>>;
  growthReport: WeeklyGrowthReport;
}

export default function ScheduleCalendar({
  posts,
  setPosts,
  growthReport
}: ScheduleCalendarProps) {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  // Filter posts to show drafts and scheduled
  const activePosts = posts.filter(p => p.status !== "published");

  // Format ISO timestamp to reader-friendly format
  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      rawDate: isoString.split("T")[0],
      rawTime: isoString.split("T")[1]?.substring(0, 5) || "12:00"
    };
  };

  // Get Platform Brand icons
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Instagram":
        return <Instagram className="text-pink-600" size={15} />;
      case "LinkedIn":
        return <Linkedin className="text-blue-700" size={15} />;
      case "TikTok":
        return <Film className="text-black" size={15} />;
      case "YouTube":
        return <Video className="text-red-600" size={15} />;
      default:
        return <Sparkles className="text-violet-600" size={15} />;
    }
  };

  // Delete scheduled item
  const handleDeletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  // Begin inline edit
  const startEditing = (post: Post) => {
    setEditingPostId(post.id);
    setEditCaption(post.text);
    const formatted = formatDateTime(post.scheduledDate);
    setEditDate(formatted.rawDate);
    setEditTime(formatted.rawTime);
  };

  // Save inline edit
  const savePostEdit = (id: string) => {
    const combinedDateISO = new Date(`${editDate}T${editTime}:00`).toISOString();
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          text: editCaption,
          scheduledDate: combinedDateISO
        };
      }
      return p;
    }));
    setEditingPostId(null);
  };

  // Queue Auto-Fill using AI report suggestions (Pillar 1/Closed-Loop goal)
  const handleQueueAutoFill = () => {
    const nextPostRec = growthReport.suggestedNextPost;
    
    // Choose a dynamic slot (e.g. next Monday at 6:00 PM)
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + ((1 + 7 - nextDate.getDay()) % 7 || 7)); // Next monday
    nextDate.setHours(18, 0, 0, 0); // 6:00 PM

    const autofillPost: Post = {
      id: `autofill_${Date.now()}`,
      title: `AI-Autofill: ${nextPostRec.title}`,
      text: `${nextPostRec.suggestedDraft}\n\n${nextPostRec.recommendedTags.join(" ")}`,
      scheduledDate: nextDate.toISOString(),
      platforms: [nextPostRec.platform],
      status: "scheduled",
      mediaType: nextPostRec.platform === "TikTok" || nextPostRec.platform === "YouTube" ? "video" : "image"
    };

    setPosts(prev => [...prev, autofillPost]);
    alert(`AI Queue Auto-fill Successful! Queued "${nextPostRec.title}" for optimized slot: ${nextDate.toLocaleString()}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800/85" id="schedule-calendar-view">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5 mb-6">
        <div>
          <h3 className="font-display font-bold text-lg text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="text-violet-600 dark:text-violet-400" size={20} />
            Unified Schedule
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Organize cross-platform draft, scheduled, and compiled campaigns</p>
        </div>

        {/* Closed-loop queue auto fill button */}
        <button
          onClick={handleQueueAutoFill}
          className="py-2 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Sparkles size={14} className="text-violet-200 animate-pulse" />
          Auto-Fill Next AI Slot
        </button>
      </div>

      {activePosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Panel: Agenda List view */}
          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
            <h4 className="font-display font-bold text-sm text-gray-900 dark:text-slate-400 px-1 font-mono uppercase text-[10px] text-gray-400 dark:text-slate-500">Queue Timeline</h4>
            {activePosts.map(post => {
              const formatted = formatDateTime(post.scheduledDate);
              const isEditing = editingPostId === post.id;

              return (
                <div 
                  key={post.id}
                  className={`p-4 rounded-xl border transition ${
                    isEditing 
                      ? "border-violet-300 dark:border-violet-800 bg-violet-50/5 dark:bg-violet-950/10" 
                      : "border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:border-gray-200 dark:hover:border-slate-750"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      {/* Platforms row */}
                      <div className="flex flex-wrap items-center gap-2 max-w-full">
                        {post.platforms.map(p => (
                          <span key={p} className="inline-flex items-center gap-1 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded">
                            {getPlatformIcon(p)}
                            <span>{p}</span>
                          </span>
                        ))}
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-700 shrink-0" />
                        <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500 shrink-0">Draft Status</span>
                      </div>

                      <h5 className="font-display font-bold text-sm text-gray-900 dark:text-slate-100 pt-1 break-words">{post.title}</h5>
                    </div>

                    <div className="flex items-center gap-1">
                      {!isEditing && (
                        <>
                          <button
                            onClick={() => startEditing(post)}
                            className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-200 transition cursor-pointer"
                            title="Edit campaign details"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1 text-gray-400 dark:text-slate-500 hover:text-red-500 transition cursor-pointer"
                            title="Remove from schedule"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    /* Inline Editor Panel */
                    <div className="mt-4 space-y-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-500 dark:text-slate-400 font-mono">EDIT CAPTION COPY:</label>
                        <textarea
                          value={editCaption}
                          onChange={(e) => setEditCaption(e.target.value)}
                          rows={4}
                          className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-xs text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-950 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-gray-500 dark:text-slate-400 font-mono">DATE:</label>
                          <input 
                            type="date" 
                            value={editDate} 
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-gray-800 dark:text-slate-250 bg-white dark:bg-slate-950"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-gray-500 dark:text-slate-400 font-mono">TIME:</label>
                          <input 
                            type="time" 
                            value={editTime} 
                            onChange={(e) => setEditTime(e.target.value)}
                            className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-gray-800 dark:text-slate-250 bg-white dark:bg-slate-950"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setEditingPostId(null)}
                          className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-xs text-gray-600 dark:text-slate-300 font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => savePostEdit(post.id)}
                          className="px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs font-semibold cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Standard view info */
                    <div className="mt-3 space-y-2 pt-3 border-t border-gray-100/60 dark:border-slate-800/60">
                      <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-wrap">{post.text}</p>
                      
                      {post.mediaUrl && (
                        <div className="rounded-lg overflow-hidden border border-gray-100/60 dark:border-slate-800/60 mt-2 max-w-xs aspect-video">
                          <img src={post.mediaUrl} alt="Campaign Media Attachment" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 dark:text-slate-500 mt-2">
                        <span className="flex items-center gap-1"><CalendarIcon size={12} /> {formatted.date}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {formatted.time}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Panel: Calendar Grid mockup (Visually represents Month View) */}
          <div className="border border-gray-100 dark:border-slate-800 rounded-2xl p-5 bg-gray-50/30 dark:bg-slate-950/20 flex flex-col justify-between">
            <div>
              <h4 className="font-display font-bold text-sm text-gray-900 dark:text-slate-100 mb-4 flex items-center justify-between">
                <span>Month At-A-Glance</span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono font-normal">June 2026</span>
              </h4>

              {/* Month calendar grid */}
              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-semibold text-gray-400 dark:text-slate-500 font-mono border-b border-gray-100 dark:border-slate-800 pb-2 mb-2">
                <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {/* Pad dummy days */}
                {[...Array(3)].map((_, i) => <div key={`p-${i}`} className="aspect-square bg-transparent" />)}
                
                {[...Array(30)].map((_, i) => {
                  const dayNum = i + 1;
                  // Highlight day 28, 29, 30 if we have scheduled events
                  const mockEventDays: { [key: number]: string[] } = {
                    28: ["Instagram", "LinkedIn", "TikTok"],
                    30: ["YouTube"]
                  };
                  const eventPlatforms = mockEventDays[dayNum];

                  return (
                    <div 
                      key={dayNum} 
                      className={`aspect-square rounded-lg flex flex-col justify-between p-1 border text-[10px] font-mono transition ${
                        dayNum === 27 
                          ? "bg-violet-600 text-white border-violet-600 font-black shadow-xs" 
                          : eventPlatforms 
                            ? "bg-violet-50/50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800 text-gray-800 dark:text-slate-200 font-bold" 
                            : "bg-white dark:bg-slate-900/40 border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-500 hover:border-gray-200 dark:hover:border-slate-700"
                      }`}
                    >
                      <span>{dayNum}</span>
                      {eventPlatforms && (
                        <div className="flex gap-0.5 justify-center">
                          {eventPlatforms.map((plat, idx) => (
                            <span key={idx} className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick tips about optimal slot alignment */}
            <div className="bg-white dark:bg-slate-900/60 rounded-xl p-4 border border-gray-200/60 dark:border-slate-800 mt-6 space-y-2">
              <span className="inline-block px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-400 text-[8px] font-mono rounded uppercase font-bold">ALGORITHMIC INSIGHT</span>
              <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                Water Creator's scheduler reserves optimized slots automatically. Next prime engagement peaks are projected at: <strong>Mondays 6:00 PM</strong> and <strong>Wednesdays 3:30 PM</strong>.
              </p>
            </div>

          </div>

        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 dark:text-slate-500 text-xs border border-dashed border-gray-200 dark:border-slate-800 rounded-xl animate-fade-in">
          <CalendarIcon className="mx-auto text-gray-300 dark:text-slate-700 mb-3" size={32} />
          Your schedule calendar is completely empty. Go to the "Content Creator" tab to compose or "Auto-Fill Next AI Slot" above to seed your editorial queue!
        </div>
      )}

    </div>
  );
}
