"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Play, ExternalLink } from "lucide-react";

interface YouTubeEmbedProps {
  url: string;
  className?: string;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  // 1. Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  // 2. YouTube Shorts: youtube.com/shorts/VIDEO_ID or youtu.be/shorts/VIDEO_ID
  const shortsMatch = cleanUrl.match(/(?:youtube\.com|youtu\.be)\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch) return shortsMatch[1];

  // 3. youtu.be/VIDEO_ID
  const youtuBeMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (youtuBeMatch) return youtuBeMatch[1];

  // 4. youtube.com/embed/VIDEO_ID
  const embedMatch = cleanUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch) return embedMatch[1];

  // 5. Query param ?v=VIDEO_ID or &v=VIDEO_ID
  const watchMatch = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch) return watchMatch[1];

  // 6. Generic match: any 11-character sequence after a slash or equal sign in a youtube domain
  const genericMatch = cleanUrl.match(/(?:youtube\.com|youtu\.be).*[=/]([a-zA-Z0-9_-]{11})/i);
  if (genericMatch) return genericMatch[1];

  return null;
}

export default function YouTubeEmbed({ url, className }: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = extractYouTubeId(url);

  if (!videoId) return null;

  const isShorts = url.includes("/shorts/");
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm group",
          isShorts ? "max-w-sm mx-auto aspect-[9/16]" : "aspect-video",
          className
        )}
      >
        {isPlaying ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title="جولة فيديو للسكن"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 h-full w-full block text-right cursor-pointer"
            aria-label="تشغيل فيديو جولة السكن"
          >
            {/* Background Thumbnail */}
            <Image
              src={thumbnailUrl}
              alt="معاينة فيديو السكن"
              fill
              className="object-cover opacity-85 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-95"
              sizes="(max-width: 768px) 100vw, 60vw"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition-colors" />

            {/* Play Button Facade */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-red-600/90 text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-red-600">
                <Play className="h-7 w-7 sm:h-9 sm:w-9 fill-white translate-x-0.5" />
              </div>
              <span className="rounded-full bg-black/60 px-3.5 py-1 text-xs sm:text-sm font-semibold text-white backdrop-blur-xs">
                اضغط لتشغيل جولة الفيديو ▶
              </span>
            </div>
          </button>
        )}
      </div>

      <div className="flex justify-start">
        <a
          href={url.startsWith("http") ? url : `https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 transition font-medium"
        >
          <span>مشاهدة الفيديو على تطبيق يوتيوب</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
