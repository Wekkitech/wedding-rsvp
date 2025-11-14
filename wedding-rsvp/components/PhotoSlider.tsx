'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoSliderProps {
  photos: string[];
  photosPerView?: number;
  autoPlayInterval?: number;
}

export default function PhotoSlider({ 
  photos, 
  photosPerView = 6,
  autoPlayInterval = 5000 
}: PhotoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const totalSlides = Math.ceil(photos.length / photosPerView);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, totalSlides, autoPlayInterval]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentPhotos = () => {
    const start = currentIndex * photosPerView;
    const end = start + photosPerView;
    return photos.slice(start, end);
  };

  return (
    <div className="relative">
      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {getCurrentPhotos().map((photo, index) => (
          <div
            key={`${currentIndex}-${index}`}
            className="relative aspect-square overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-bronze-200 animate-fade-in"
          >
            <Image
              src={photo}
              alt={`Wedding photo ${currentIndex * photosPerView + index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          className="rounded-full border-bronze-300"
          disabled={totalSlides <= 1}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Slide Indicators */}
        <div className="flex gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-mahogany-600'
                  : 'w-2 bg-bronze-300 hover:bg-bronze-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          className="rounded-full border-bronze-300"
          disabled={totalSlides <= 1}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Play/Pause */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPlaying(!isPlaying)}
          className="rounded-full"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Slide Counter */}
      <p className="text-center text-sm text-bronze-600 mt-4">
        Showing {currentIndex * photosPerView + 1}-{Math.min((currentIndex + 1) * photosPerView, photos.length)} of {photos.length} photos
      </p>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
