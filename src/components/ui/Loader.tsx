'use client';

import React from 'react';

interface LoaderProps {
  // 'inline' sits inside a card, 'overlay' covers the whole screen, 'page' fills a full container
  variant?: 'inline' | 'overlay' | 'page';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loader({ variant = 'inline', text, size = 'md' }: LoaderProps) {
  // Size mappings
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  const ring = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} rounded-full border-solid border-gray-100 border-t-[#5433EB] animate-spin`}
        style={{ animationDuration: '0.8s' }}
      />
      {text && (
        <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.1em] animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {ring}
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        {ring}
      </div>
    );
  }

  // Default 'inline'
  return ring;
}