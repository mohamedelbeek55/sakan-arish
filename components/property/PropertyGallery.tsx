"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-56 sm:h-64 items-center justify-center rounded-2xl border border-[#EBE6DC] bg-[#FAF7F0] text-stone-400 text-sm">
        لا توجد صور متاحة لهذا السكن
      </div>
    );
  }

  const goNext = () => setSelectedIndex((prev) => (prev + 1) % images.length);
  const goPrev = () =>
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40;

    // Swiping left (dragged leftward): Next image
    if (diff > minSwipeDistance) {
      goNext();
    }
    // Swiping right (dragged rightward): Previous image
    else if (diff < -minSwipeDistance) {
      goPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-2.5 sm:space-y-3">
        {/* Main Image Container */}
        <div
          className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-2xl border border-[#EBE6DC] bg-stone-100 cursor-pointer group select-none touch-pan-y shadow-2xs"
          onClick={() => setLightboxOpen(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[selectedIndex]}
            alt={`${title} - صورة ${selectedIndex + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-md transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer z-10"
                aria-label="الصورة التالية"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-md transition-all hover:bg-white hover:scale-105 active:scale-95 cursor-pointer z-10"
                aria-label="الصورة السابقة"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </>
          )}

          {/* Counter Badge & Fullscreen Hint */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-mono font-bold text-white backdrop-blur-xs">
            <span>{selectedIndex + 1}</span>
            <span>/</span>
            <span>{images.length}</span>
            <Maximize2 className="h-3 w-3 mr-1 opacity-75" />
          </div>
        </div>

        {/* Thumbnails Row */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none touch-pan-x">
            {images.map((img, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  "relative h-14 w-18 sm:h-16 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer shadow-2xs",
                  i === selectedIndex
                    ? "border-[#0369A1] ring-2 ring-[#0369A1]/20 scale-102"
                    : "border-[#EBE6DC] opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={img}
                  alt={`${title} - مصغّرة ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox with swipe support */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-6 touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-white hover:bg-white/10 rounded-full h-10 w-10 cursor-pointer z-50"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="relative h-[75vh] sm:h-[80vh] w-full max-w-5xl select-none">
            <Image
              src={images[selectedIndex]}
              alt={`${title} - صورة ${selectedIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goNext}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95 cursor-pointer z-50"
                aria-label="الصورة التالية"
              >
                <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
              <button
                type="button"
                onClick={goPrev}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95 cursor-pointer z-50"
                aria-label="الصورة السابقة"
              >
                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            </>
          )}

          {/* Bottom thumbnails in lightbox */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 overflow-x-auto max-w-md p-1 scrollbar-none z-50">
            {images.map((img, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  "relative h-10 w-14 sm:h-12 sm:w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer",
                  i === selectedIndex
                    ? "border-white"
                    : "border-transparent opacity-40 hover:opacity-100"
                )}
              >
                <Image
                  src={img}
                  alt={`مصغّرة ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
