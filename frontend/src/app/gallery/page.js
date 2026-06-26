'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Image as ImageIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GalleryPage() {
  const { settings } = useApp();
  const [lightboxImage, setLightboxImage] = useState(null);

  const galleryImages = settings.gallery.length > 0 ? settings.gallery : [
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-[70vh]">
      
      {/* Back button */}
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Library Photo Gallery</h1>
        <p className="text-slate-400 text-xs">A visual tour of the study environment, resources, and facilities at {settings.libraryName}.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {galleryImages.map((image, index) => (
          <div
            key={index}
            onClick={() => setLightboxImage(image)}
            className="relative aspect-video sm:aspect-square rounded-2xl overflow-hidden border border-white/10 cursor-pointer group shadow-xl bg-slate-900"
          >
            <img
              src={image}
              alt={`Library Spot ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Overlay */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-slate-300 p-2 text-xl font-bold">✕</button>
          <div className="max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10" onClick={e => e.stopPropagation()}>
            <img src={lightboxImage} alt="Lightbox Preview" className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
