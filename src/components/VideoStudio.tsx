import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Video, Play, Pause, RefreshCw, Volume2, ArrowRight, 
  Trash2, Plus, Edit2, CheckCircle, Film, Sliders, Image as ImageIcon
} from "lucide-react";
import { VideoScript, VideoScene } from "../types";

export default function VideoStudio() {
  const [activeSubTab, setActiveSubTab] = useState<"avatar" | "templates">("avatar");
  
  // ----------------------------------------------------
  // AVATAR STATE
  // ----------------------------------------------------
  const [selectedAvatar, setSelectedAvatar] = useState("Agnes");
  const [selectedVoice, setSelectedVoice] = useState("Zephyr");
  const [avatarScript, setAvatarScript] = useState(
    "Hey everyone! Welcome to Water Creator. Today, I'm showing you how to schedule and optimize your posts for multiple platforms using server-side Gemini AI models."
  );
  
  const [generatingScript, setGeneratingScript] = useState(false);
  const [synthesizingSpeech, setSynthesizingSpeech] = useState(false);
  
  // Audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [amplitude, setAmplitude] = useState(0); // For reactive lip-sync animation!
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const avatarsList = [
    { name: "Agnes", role: "Elite Tech Host", color: "bg-purple-900 border-purple-400", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80" },
    { name: "Leo", role: "Casual Creator", color: "bg-blue-900 border-blue-400", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80" },
    { name: "Mia", role: "Corporate Educator", color: "bg-pink-900 border-pink-400", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80" }
  ];

  const voicesList = [
    { name: "Zephyr", desc: "Dynamic, confident (Default)" },
    { name: "Kore", desc: "Calm, educational" },
    { name: "Puck", desc: "Friendly, high-energy" },
    { name: "Charon", desc: "Professional, deep" },
    { name: "Fenrir", desc: "Conversational" }
  ];

  // AI Script Generator
  const generateScriptFromIdea = async () => {
    setGeneratingScript(true);
    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: avatarScript,
          tone: "energetic and friendly",
          platform: "TikTok"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate script.");
      }

      const data = await response.json();
      if (data.scenes && data.scenes.length > 0) {
        // Collect narration parts for the speaking presenter
        const narration = data.scenes.map((s: any) => s.narrationText).join(" ");
        setAvatarScript(narration);
      }
    } catch (err: any) {
      alert("Failed to compose script: " + err.message);
    } finally {
      setGeneratingScript(false);
    }
  };

  // TTS Synthesis with gemini-3.1-flash-tts-preview
  const synthesizeAvatarSpeech = async () => {
    if (!avatarScript.trim()) return;
    setSynthesizingSpeech(true);
    setAmplitude(0);
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const response = await fetch("/api/generate-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: avatarScript,
          voice: selectedVoice
        })
      });

      if (!response.ok) {
        throw new Error("Failed to synthesize speech.");
      }

      const data = await response.json();
      if (data.audio) {
        // Decode base64 to Blob URL
        const binaryString = atob(data.audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (err: any) {
      alert("Speech synthesis failed: " + err.message);
    } finally {
      setSynthesizingSpeech(false);
    }
  };

  // Play / Pause and hook Web Audio API
  const handlePlayToggle = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animationFrameId.current!);
      setAmplitude(0);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setupAudioAnalyser();
        })
        .catch(err => {
          console.error("Audio playback error:", err);
        });
    }
  };

  // Setup reactive analyzer for Lip sync mouth movement
  const setupAudioAnalyser = () => {
    if (!audioRef.current) return;

    // Initialize Web Audio context safely (Chrome requires user gesture)
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    if (!analyserRef.current) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
    }

    if (!sourceRef.current) {
      try {
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyserRef.current);
        analyserRef.current.connect(ctx.destination);
        sourceRef.current = source;
      } catch (e) {
        // Media element source already connected, ignore
      }
    }

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateSync = () => {
      if (!audioRef.current || audioRef.current.paused) {
        setAmplitude(0);
        return;
      }

      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume amplitude
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      
      // Normalize to 0 - 1 range
      setAmplitude(Math.min(avg / 128, 1));

      animationFrameId.current = requestAnimationFrame(updateSync);
    };

    updateSync();
  };

  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // ----------------------------------------------------
  // TEMPLATES STATE (Google Vids style edits)
  // ----------------------------------------------------
  const [selectedTemplate, setSelectedTemplate] = useState("Quick Tip");
  const [templateScenes, setTemplateScenes] = useState<VideoScene[]>([
    { sceneNumber: 1, durationSeconds: 3, visualDescription: "Close-up talking head of host with bright lighting", narrationText: "Did you know you can schedule months of posts in under 3 minutes?", captionText: "Schedule months in 3 minutes ⏱️", bRollSuggestion: "Calendar interface scrolling rapidly" },
    { sceneNumber: 2, durationSeconds: 4, visualDescription: "Slide graphic showing 1 base idea splitting into 4 variants", narrationText: "By using Water Creator's cross-platform engine, you write once and rule everywhere.", captionText: "Write once. Rule everywhere. 🚀", bRollSuggestion: "Data split schematic" },
    { sceneNumber: 3, durationSeconds: 3, visualDescription: "Zoom in on dashboard analytics scorecard", narrationText: "Best of all, Analytics Central continuously improves your hooks based on data.", captionText: "Continuous growth 📈", bRollSuggestion: "Aesthetic engagement charts zooming in" },
  ]);

  const addScene = () => {
    const nextNum = templateScenes.length + 1;
    setTemplateScenes(prev => [...prev, {
      sceneNumber: nextNum,
      durationSeconds: 3,
      visualDescription: "Action overlay",
      narrationText: "Enter scene narration text here.",
      captionText: "Caption overlay",
      bRollSuggestion: "Trending stock video placeholder"
    }]);
  };

  const deleteScene = (index: number) => {
    setTemplateScenes(prev => prev.filter((_, idx) => idx !== index).map((s, idx) => ({ ...s, sceneNumber: idx + 1 })));
  };

  const updateSceneField = (index: number, field: keyof VideoScene, value: any) => {
    setTemplateScenes(prev => prev.map((s, idx) => {
      if (idx === index) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-8" id="video-studio-view">
      
      {/* Video Studio Sub-navigation header */}
      <div className="bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-gray-100 dark:border-slate-800/85 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Film className="text-violet-600 dark:text-violet-400" size={20} />
          <h3 className="font-display font-bold text-gray-900 dark:text-slate-100 text-sm">AI Video Studio</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveSubTab("avatar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeSubTab === "avatar" ? "bg-violet-600 text-white" : "bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"}`}
          >
            Agnes Avatar Presenter
          </button>
          <button 
            onClick={() => setActiveSubTab("templates")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeSubTab === "templates" ? "bg-violet-600 text-white" : "bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"}`}
          >
            Google Vids Scener
          </button>
        </div>
      </div>

      {activeSubTab === "avatar" ? (
        /* Agnes-style Avatar Presenter Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Configuration form (45% width) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900/40 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800/85 space-y-6">
            <div>
              <h4 className="font-display font-bold text-base text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="text-violet-600 dark:text-violet-400" size={18} />
                Presenter Parameters
              </h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Customize the virtual anchor voice, personality, and spoken narration</p>
            </div>

            {/* Avatar Select */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 font-mono">Select Virtual Presenter Face:</span>
              <div className="grid grid-cols-3 gap-3">
                {avatarsList.map(av => (
                  <button
                    key={av.name}
                    onClick={() => {
                      setSelectedAvatar(av.name);
                      if (isPlaying) {
                        audioRef.current?.pause();
                        setIsPlaying(false);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center gap-2 cursor-pointer ${
                      selectedAvatar === av.name 
                        ? "border-violet-600 dark:border-violet-500 bg-violet-50/20 dark:bg-violet-950/20 shadow-xs" 
                        : "border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-850"
                    }`}
                  >
                    <img src={av.img} alt={av.name} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-slate-800" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-900 dark:text-slate-100">{av.name}</p>
                      <p className="text-[9px] text-gray-500 dark:text-slate-400 font-mono mt-0.5">{av.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice select */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 font-mono">Voice Synthesizer (Gemini TTS):</span>
              <select
                value={selectedVoice}
                onChange={(e) => {
                  setSelectedVoice(e.target.value);
                  if (isPlaying) {
                    audioRef.current?.pause();
                    setIsPlaying(false);
                  }
                }}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-gray-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {voicesList.map(voice => (
                  <option key={voice.name} value={voice.name}>{voice.name} — {voice.desc}</option>
                ))}
              </select>
            </div>

            {/* Script editing */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 font-mono">Presenter Speech Script:</span>
                <button
                  onClick={generateScriptFromIdea}
                  disabled={generatingScript || !avatarScript}
                  className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition flex items-center gap-1 cursor-pointer"
                >
                  {generatingScript ? "Drafting..." : "🪄 Draft script from bullet points"}
                </button>
              </div>
              <textarea
                value={avatarScript}
                onChange={(e) => setAvatarScript(e.target.value)}
                rows={5}
                className="w-full border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-xs leading-relaxed text-gray-800 dark:text-slate-200 bg-gray-50/20 dark:bg-slate-950/20 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="Type or paste what the presenter should say. You can also type brief ideas and click the 'Draft script' helper above to convert them."
              />
            </div>

            {/* Synthesis action */}
            <button
              onClick={synthesizeAvatarSpeech}
              disabled={synthesizingSpeech || !avatarScript.trim()}
              className="w-full py-3 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {synthesizingSpeech ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Synthesizing Speech using Gemini TTS...
                </>
              ) : (
                <>
                  <Volume2 size={14} className="text-violet-400" /> Synthesize Script Speech
                </>
              )}
            </button>
          </div>

          {/* Right Panel: Interactive Video Render Canvas (75% width) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900/40 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800/85 flex flex-col justify-between">
            <div className="mb-4">
              <h4 className="font-display font-bold text-base text-gray-900 dark:text-slate-100">Render Canvas & Lip Sync</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Real-time reactive visual anchor mapping and playback controls</p>
            </div>

            {/* Talking Head Studio Player */}
            <div className="aspect-[16/9] bg-gradient-to-br from-indigo-950 via-slate-900 to-black rounded-2xl relative flex items-center justify-center overflow-hidden border border-gray-800 p-4 shadow-inner">
              
              {/* Talking Avatar Visual rendering */}
              <div className="relative flex flex-col items-center">
                {/* Avatar Image circle with responsive lip-sync scale */}
                <div 
                  style={{ transform: `scale(${1 + amplitude * 0.08})` }}
                  className="w-36 h-36 rounded-full border-4 border-violet-500 overflow-hidden shadow-2xl relative transition-transform duration-75"
                >
                  <img 
                    src={avatarsList.find(av => av.name === selectedAvatar)?.img} 
                    alt={selectedAvatar} 
                    className="w-full h-full object-cover" 
                  />

                  {/* Reactive mouth overlay (simulates opening/closing according to audio amplitude) */}
                  <div 
                    style={{ 
                      height: `${10 + amplitude * 32}px`,
                      width: `${24 + amplitude * 12}px`,
                      borderRadius: '50%',
                    }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-rose-950 border border-rose-900 transition-all duration-75 flex items-center justify-center overflow-hidden"
                  >
                    {/* teeth */}
                    {amplitude > 0.3 && <div className="w-4 h-1.5 bg-white rounded-full absolute top-0.5" />}
                  </div>
                </div>

                {/* Speaker indicator waves */}
                {isPlaying && (
                  <div className="flex gap-1 mt-5 h-8 items-end justify-center">
                    {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((val, idx) => (
                      <span 
                        key={idx}
                        style={{ height: `${val * 4 * (0.3 + amplitude * 1.5)}px` }}
                        className="w-1 bg-violet-400 rounded-full transition-all duration-75" 
                      />
                    ))}
                  </div>
                )}
                
                <span className="text-xs text-gray-400 font-mono mt-4 font-semibold px-2 py-1 bg-black/40 rounded">
                  {selectedAvatar} Presenter Studio
                </span>
              </div>

              {/* Dynamic Closed Captions overlaid on video player */}
              {isPlaying && (
                <div className="absolute bottom-4 inset-x-6 bg-black/75 px-4 py-2 rounded-lg text-center text-xs font-semibold text-white tracking-wide border border-white/10 leading-normal">
                  🗣️ "{avatarScript.substring(0, 100)}..."
                </div>
              )}
            </div>

            {/* Playback Controls and HTML5 Audio hidden integration */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${audioUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                  {audioUrl ? "Gemini Synthesizer Ready" : "Unsynthesized. Complete Speech above."}
                </span>
              </div>

              {audioUrl && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePlayToggle}
                    className="py-2 px-5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isPlaying ? (
                      <>
                        <Pause size={13} /> Pause Presentation
                      </>
                    ) : (
                      <>
                        <Play size={13} /> Play Presenter video
                      </>
                    )}
                  </button>
                  
                  {/* HTML5 Audio hidden player */}
                  <audio 
                    ref={audioRef} 
                    src={audioUrl} 
                    onEnded={() => setIsPlaying(false)}
                    className="hidden" 
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        /* Google Vids-inspired template scener */
        <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800/85 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5">
            <div>
              <h4 className="font-display font-bold text-base text-gray-900 dark:text-slate-100">Google Vids Inspired Multi-Scene Editor</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Edit visual scenes, captions, and narrative overlays to compile videos</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={addScene}
                className="py-1.5 px-3 bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} /> Add Scene Block
              </button>
            </div>
          </div>

          {/* Scene timeline blocks */}
          <div className="space-y-4">
            {templateScenes.map((scene, index) => (
              <div key={scene.sceneNumber} className="p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/20 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-white dark:hover:bg-slate-900/40 transition flex flex-col md:flex-row gap-4 items-start">
                
                {/* Scene Indicator */}
                <div className="flex items-center gap-2 md:flex-col md:items-start md:gap-0">
                  <span className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-indigo-600 text-white text-xs font-bold flex items-center justify-center font-mono">
                    #{scene.sceneNumber}
                  </span>
                  <div className="md:mt-2 text-left">
                    <input 
                      type="number" 
                      value={scene.durationSeconds} 
                      onChange={(e) => updateSceneField(index, "durationSeconds", Number(e.target.value))}
                      className="w-12 border border-gray-200 dark:border-slate-700 rounded p-1 text-xs text-center font-mono text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-950"
                    />
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono ml-1">sec</span>
                  </div>
                </div>

                {/* Editable attributes */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                  
                  {/* Visual Setup */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase">Scene Visual:</label>
                    <textarea 
                      value={scene.visualDescription} 
                      onChange={(e) => updateSceneField(index, "visualDescription", e.target.value)}
                      rows={2}
                      className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-xs text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-950"
                    />
                  </div>

                  {/* Narration script */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase">Narration Line:</label>
                    <textarea 
                      value={scene.narrationText} 
                      onChange={(e) => updateSceneField(index, "narrationText", e.target.value)}
                      rows={2}
                      className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-xs text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-950"
                    />
                  </div>

                  {/* Caption overlay */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase">On-Screen Caption:</label>
                    <textarea 
                      value={scene.captionText} 
                      onChange={(e) => updateSceneField(index, "captionText", e.target.value)}
                      rows={2}
                      className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-xs text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-950 font-bold"
                    />
                  </div>

                  {/* B-roll overlay */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 font-mono uppercase">B-roll / stock Asset prompt:</label>
                    <textarea 
                      value={scene.bRollSuggestion} 
                      onChange={(e) => updateSceneField(index, "bRollSuggestion", e.target.value)}
                      rows={2}
                      className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-xs text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-950"
                    />
                  </div>

                </div>

                {/* Actions */}
                <button 
                  onClick={() => deleteScene(index)}
                  disabled={templateScenes.length <= 1}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded transition cursor-pointer disabled:opacity-30"
                  title="Remove Scene Block"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Render Compilation Preview Block */}
          <div className="bg-gray-900 text-white rounded-2xl p-5 border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-950 text-violet-400 rounded-xl">
                <Film size={22} />
              </div>
              <div>
                <h5 className="font-bold text-sm">Compile Google Vids Sequence</h5>
                <p className="text-xs text-gray-400 mt-0.5">
                  Aggregate and align {templateScenes.length} scenes. Expected duration:{" "}
                  <strong>{templateScenes.reduce((acc, curr) => acc + curr.durationSeconds, 0)} seconds</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => alert("Scene sequence finalized! Your compiled project has been queued inside your Content composer.")}
              className="py-2 px-5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              Export Storyboard to Composer <ArrowRight size={13} />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
