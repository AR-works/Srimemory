'use client';

import React from 'react';

export const FloralWreath: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 320,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      className={`animate-spin-slow pointer-events-none ${className}`}
      fill="none"
    >
      <defs>
        <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#F472B6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Main Organic Circle */}
      <circle
        cx="200"
        cy="200"
        r="170"
        stroke="url(#stemGrad)"
        strokeWidth="1.5"
        strokeDasharray="6 8"
      />

      {/* Blossom 1 (Top) */}
      <g transform="translate(200, 30)">
        <circle cx="0" cy="0" r="8" fill="#FBCFE8" opacity="0.9" />
        <circle cx="0" cy="0" r="4" fill="#F472B6" />
        <circle cx="-7" cy="-3" r="5" fill="#FDF2F8" opacity="0.8" />
        <circle cx="7" cy="-3" r="5" fill="#FDF2F8" opacity="0.8" />
        <circle cx="-5" cy="6" r="5" fill="#FDF2F8" opacity="0.8" />
        <circle cx="5" cy="6" r="5" fill="#FDF2F8" opacity="0.8" />
      </g>

      {/* Blossom 2 (Right) */}
      <g transform="translate(370, 200)">
        <circle cx="0" cy="0" r="7" fill="#E9D5FF" opacity="0.9" />
        <circle cx="0" cy="0" r="3" fill="#C084FC" />
        <circle cx="-6" cy="-4" r="4" fill="#FAF5FF" opacity="0.8" />
        <circle cx="6" cy="-4" r="4" fill="#FAF5FF" opacity="0.8" />
        <circle cx="0" cy="6" r="4" fill="#FAF5FF" opacity="0.8" />
      </g>

      {/* Blossom 3 (Bottom) */}
      <g transform="translate(200, 370)">
        <circle cx="0" cy="0" r="8" fill="#FBCFE8" opacity="0.9" />
        <circle cx="0" cy="0" r="4" fill="#FB7185" />
        <circle cx="-6" cy="-4" r="5" fill="#FFF1F2" opacity="0.8" />
        <circle cx="6" cy="-4" r="5" fill="#FFF1F2" opacity="0.8" />
        <circle cx="0" cy="6" r="5" fill="#FFF1F2" opacity="0.8" />
      </g>

      {/* Blossom 4 (Left) */}
      <g transform="translate(30, 200)">
        <circle cx="0" cy="0" r="7" fill="#DDD6FE" opacity="0.9" />
        <circle cx="0" cy="0" r="3" fill="#A855F7" />
        <circle cx="-5" cy="-3" r="4" fill="#F5F3FF" opacity="0.8" />
        <circle cx="5" cy="-3" r="4" fill="#F5F3FF" opacity="0.8" />
      </g>

      {/* Botanical Leaves around circumference */}
      <path
        d="M 280 60 C 295 55, 305 70, 290 80 C 275 75, 270 65, 280 60 Z"
        fill="#A7F3D0"
        opacity="0.6"
      />
      <path
        d="M 345 125 C 360 120, 365 135, 350 145 C 335 140, 335 130, 345 125 Z"
        fill="#A7F3D0"
        opacity="0.6"
      />
      <path
        d="M 345 275 C 360 280, 355 295, 340 290 C 330 280, 335 270, 345 275 Z"
        fill="#A7F3D0"
        opacity="0.6"
      />
      <path
        d="M 120 340 C 105 345, 95 330, 110 320 C 125 325, 130 335, 120 340 Z"
        fill="#A7F3D0"
        opacity="0.6"
      />
      <path
        d="M 55 125 C 40 120, 35 135, 50 145 C 65 140, 65 130, 55 125 Z"
        fill="#A7F3D0"
        opacity="0.6"
      />
    </svg>
  );
};
