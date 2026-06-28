export interface PlatformVariant {
  platform: string;
  caption: string;
  aspectRatio: string;
  hook: string;
  hashtags: string[];
  trendingAudioSuggestion: string;
  visualLayoutGuide: string;
}

export interface SocialAccount {
  id: string;
  platform: "Instagram" | "TikTok" | "YouTube" | "LinkedIn" | "Facebook" | "X" | "Kwai" | "BlueSky" | string;
  username: string;
  followerCount: number;
  isConnected: boolean;
  engagementRate: number;
  reach: number;
  avatarUrl: string;
  growthTrend: number[]; // Sparkline data points
  customInstructions?: string; // Custom AI prompting rules per platform
}

export interface Post {
  id: string;
  title: string;
  text: string;
  scheduledDate: string; // ISO string
  platforms: string[]; // Target platforms
  status: "draft" | "scheduled" | "published";
  mediaUrl?: string;
  mediaType?: "image" | "video";
  // If published, has metrics:
  metrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement: number; // percentage
  };
  // If analyzed, holds the diagnosis
  diagnosis?: {
    hookGrade: string;
    hookAnalysis: string;
    pacingFeedback: string;
    seoGrade: string;
    seoFeedback: string;
    viralSpecAdherence: string;
    actionableRecommendation: string;
  };
}

export interface WeeklyGrowthReport {
  nicheAssessed: string;
  topPerformerSpotlight: {
    platform: string;
    concept: string;
    whyItWorked: string;
    keyTakeaway: string;
  };
  recoveryTip: {
    issueIdentified: string;
    fixAction: string;
    templateText: string;
    platform: string;
  };
  suggestedNextPost: {
    title: string;
    platform: string;
    aspectRatio: string;
    formatCategory: string;
    recommendedHook: string;
    copywritingFramework: string;
    suggestedDraft: string;
    recommendedTags: string[];
  };
}

export interface VideoScene {
  sceneNumber: number;
  durationSeconds: number;
  visualDescription: string;
  narrationText: string;
  captionText: string;
  bRollSuggestion: string;
}

export interface VideoScript {
  title: string;
  estimatedTotalDuration: number;
  scenes: VideoScene[];
}

export interface Playbook {
  id: string;
  title: string;
  platform: string;
  description: string;
  hookTemplate: string;
  structure: string;
  example: string;
}
