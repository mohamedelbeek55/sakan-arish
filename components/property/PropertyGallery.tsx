"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
        لا توجد صور متاحة
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
    const minSwipeDistance = 45;

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
      <div className="space-y-3">
        {/* Main Image */}
        <div
          className="relative aspect-[16/10] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 cursor-pointer group select-none touch-pan-y"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition-all hover:bg-white hover:shadow-md cursor-pointer"
                aria-label="الصورة التالية"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition-all hover:bg-white hover:shadow-md cursor-pointer"
                aria-label="الصورة السابقة"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Counter Badge */}
          <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-xs">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  "relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer",
                  i === selectedIndex
                    ? "border-teal-600 ring-1 ring-teal-600/20"
                    : "border-slate-200 opacity-70 hover:opacity-100"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-white hover:bg-white/10 cursor-pointer"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="relative h-[80vh] w-full max-w-5xl select-none">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 cursor-pointer"
                aria-label="الصورة التالية"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={goPrev}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 cursor-pointer"
                aria-label="الصورة السابقة"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          {/* Bottom thumbnails in lightbox */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-lg p-1">
            {images.map((img, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  "relative h-12 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-all cursor-pointer",
                  i === selectedIndex
                    ? "border-white"
                    : "border-transparent opacity-50 hover:opacity-100"
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
