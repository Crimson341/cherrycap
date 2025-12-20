"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Copy, 
  Check, 
  MessageCircle,
  Hash,
  Clock,
  Type,
  AtSign,
  Share2,
  Globe,
} from "lucide-react";

interface SocialPostCardProps {
  platform: "twitter" | "instagram" | "linkedin" | "facebook" | "tiktok" | "threads";
  content: string;
  hashtags?: string[];
  characterCount?: number;
  maxCharacters?: number;
  className?: string;
}

const platformConfig = {
  twitter: {
    name: "X (Twitter)",
    icon: AtSign,
    color: "from-gray-700 to-gray-900",
    accent: "text-gray-400",
    maxChars: 280,
  },
  instagram: {
    name: "Instagram",
    icon: Share2,
    color: "from-pink-500 via-purple-500 to-orange-500",
    accent: "text-pink-400",
    maxChars: 2200,
  },
  linkedin: {
    name: "LinkedIn",
    icon: Globe,
    color: "from-blue-600 to-blue-800",
    accent: "text-blue-400",
    maxChars: 3000,
  },
  facebook: {
    name: "Facebook",
    icon: Share2,
    color: "from-blue-500 to-blue-700",
    accent: "text-blue-400",
    maxChars: 63206,
  },
  tiktok: {
    name: "TikTok",
    icon: MessageCircle,
    color: "from-gray-900 via-pink-500 to-cyan-400",
    accent: "text-pink-400",
    maxChars: 4000,
  },
  threads: {
    name: "Threads",
    icon: MessageCircle,
    color: "from-gray-800 to-gray-900",
    accent: "text-gray-400",
    maxChars: 500,
  },
};

export function SocialPostCard({
  platform,
  content,
  hashtags = [],
  characterCount,
  maxCharacters,
  className = "",
}: SocialPostCardProps) {
  const [copied, setCopied] = useState(false);
  const config = platformConfig[platform];
  const Icon = config.icon;
  
  const charCount = characterCount || content.length;
  const maxChars = maxCharacters || config.maxChars;
  const isOverLimit = charCount > maxChars;

  const handleCopy = async () => {
    const fullContent = hashtags.length > 0 
      ? `${content}\n\n${hashtags.join(" ")}`
      : content;
    
    await navigator.clipboard.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className={`px-4 py-3 bg-gradient-to-r ${config.color} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-white" />
          <span className="text-sm font-medium text-white">{config.name}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white text-xs font-medium"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
        
        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#2a2a2a]">
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs text-gray-500">Hashtags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded-md bg-[#2a2a2a] ${config.accent}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Stats */}
      <div className="px-4 py-3 bg-[#151515] border-t border-[#2a2a2a] flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Type className="h-3.5 w-3.5" />
            <span className={isOverLimit ? "text-red-400" : ""}>
              {charCount.toLocaleString()} / {maxChars.toLocaleString()}
            </span>
          </div>
          {hashtags.length > 0 && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Hash className="h-3.5 w-3.5" />
              <span>{hashtags.length} tags</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          <span>Ready to post</span>
        </div>
      </div>
    </motion.div>
  );
}

// Helper function to parse AI response and extract social posts
export function parseSocialPost(text: string): {
  platform: string;
  content: string;
  hashtags: string[];
} | null {
  // Look for formatted social post blocks
  const postMatch = text.match(/📱\s*\[?(\w+(?:\s*\(\w+\))?)\]?\s*POST:?\s*([\s\S]*?)(?=---|\n📱|$)/i);
  
  if (postMatch) {
    const platform = postMatch[1].toLowerCase().replace(/[()]/g, '').trim();
    let content = postMatch[2].trim();
    
    // Extract hashtags
    const hashtagMatch = content.match(/#\w+/g) || [];
    const hashtags = hashtagMatch.map(h => h);
    
    // Remove hashtag line if it's separate
    content = content.replace(/\n*(?:hashtags?:?\s*)?(?:#\w+\s*)+$/i, '').trim();
    
    return {
      platform: platform.includes('twitter') || platform.includes('x') ? 'twitter' : platform,
      content,
      hashtags,
    };
  }
  
  return null;
}
