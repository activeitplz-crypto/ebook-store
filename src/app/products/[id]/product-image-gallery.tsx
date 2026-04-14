'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: string[];
  title: string;
}

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] || '');

  if (images.length === 0) {
    return (
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted group shadow-sm">
        <Image
          src={`https://picsum.photos/seed/${title}/800/1000`}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted group shadow-sm">
        <Image
          src={activeImage}
          alt={title}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(img)}
              className={cn(
                "relative aspect-square w-20 rounded-lg overflow-hidden border-2 transition-all",
                activeImage === img ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img}
                alt={`${title} view ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
