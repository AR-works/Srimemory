'use client';

import React, { useEffect, useState } from 'react';

interface Butterfly {
  id: number;
  startX: number;
  startY: number;
  duration: number;
  delay: number;
  scale: number;
  color: string;
}

interface Petal {
  id: number;
  left: number;
  duration: number;
  delay: number;
  scale: number;
  rotation: number;
}

export const NatureAtmosphere: React.FC = () => {
  const [butterflies, setButterflies] = useState<Butterfly[]>([]);
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    // Generate 4 gentle ethereal butterflies
    const bList: Butterfly[] = [
      { id: 1, startX: 10, startY: 30, duration: 18, delay: 0, scale: 0.9, color: '#C084FC' },
      { id: 2, startX: 75, startY: 20, duration: 22, delay: 3, scale: 1.1, color: '#F472B6' },
      { id: 3, startX: 25, startY: 65, duration: 20, delay: 6, scale: 0.75, color: '#DDD6FE' },
      { id: 4, startX: 85, startY: 70, duration: 25, delay: 1, scale: 0.85, color: '#A855F7' },
    ];
    setButterflies(bList);

    // Generate 12 falling blossom petals
    const pList: Petal[] = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 95,
      duration: 10 + Math.random() * 12,
      delay: Math.random() * 10,
      scale: 0.6 + Math.random() * 0.5,
      rotation: Math.random() * 360,
    }));
    setPetals(pList);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating Animated Butterflies */}
      {butterflies.map((b) => (
        <div
          key={b.id}
          className="absolute transition-opacity opacity-75 dark:opacity-60"
          style={{
            top: `${b.startY}%`,
            left: `${b.startX}%`,
            animation: `butterflyFloat ${b.duration}s ease-in-out ${b.delay}s infinite alternate`,
            transform: `scale(${b.scale})`,
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 100 100"
            className="butterfly-wings drop-shadow-md"
            fill="none"
          >
            {/* Left Wing */}
            <path
              d="M 50 50 C 35 15, 0 20, 10 50 C 0 70, 30 85, 50 50 Z"
              fill={b.color}
              opacity="0.8"
              className="wing-left"
            />
            {/* Right Wing */}
            <path
              d="M 50 50 C 65 15, 100 20, 90 50 C 100 70, 70 85, 50 50 Z"
              fill={b.color}
              opacity="0.8"
              className="wing-right"
            />
            {/* Butterfly Body */}
            <ellipse cx="50" cy="50" rx="3" ry="16" fill="#4C1D95" opacity="0.9" />
            <path d="M 49 35 Q 42 22 36 24" stroke="#4C1D95" strokeWidth="2" strokeLinecap="round" />
            <path d="M 51 35 Q 58 22 64 24" stroke="#4C1D95" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      ))}

      {/* Gentle Floating Cherry Blossom / Flower Petals */}
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-5%] opacity-65 dark:opacity-40"
          style={{
            left: `${p.left}%`,
            animation: `petalFall ${p.duration}s linear ${p.delay}s infinite`,
            transform: `scale(${p.scale}) rotate(${p.rotation}deg)`,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
            <path
              d="M20 0 C32 10, 38 28, 20 40 C2 28, 8 10, 20 0 Z"
              fill="#FBCFE8"
              opacity="0.85"
            />
            <path
              d="M20 5 C28 14, 32 25, 20 35 C8 25, 12 14, 20 5 Z"
              fill="#F472B6"
              opacity="0.5"
            />
          </svg>
        </div>
      ))}

      {/* Ethereal Glow Orbs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[750px] h-[500px] bg-purple-300/30 dark:bg-purple-900/30 theme-evening:bg-amber-600/20 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-pink-200/30 dark:bg-pink-950/20 theme-evening:bg-rose-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-purple-200/40 dark:bg-indigo-950/30 theme-evening:bg-orange-950/25 rounded-full blur-3xl" />
    </div>
  );
};
