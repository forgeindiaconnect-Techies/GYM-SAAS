import React from 'react';

export const AthleteSilhouette: React.FC<{ className?: string }> = ({ className = "w-full h-full text-[#EA580C]/15" }) => (
  <svg
    viewBox="0 0 500 550"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <g transform="translate(40, 20)">
      {/* Head, Neck and Trapezius */}
      <path d="M340,110 C340,70 310,40 270,40 C250,40 235,50 225,65 C220,72 210,85 210,100 C210,115 218,125 225,132 C232,140 235,150 235,165 C235,180 220,200 200,215 C180,230 150,250 130,280 C120,295 115,320 115,350 C115,400 140,460 170,510 L320,510 C330,470 340,410 345,360 C350,320 365,280 380,240 C390,215 405,185 405,150 C405,120 380,110 340,110 Z" />
      {/* Arm with bicep curl */}
      <path d="M310,160 C280,170 240,195 215,230 C190,265 170,310 170,340 C190,335 220,320 245,290 C265,265 290,230 315,205 Z" />
      {/* Forearm & Hand gripping dumbbell */}
      <path d="M170,340 C155,330 130,300 115,260 C105,235 100,210 105,190 C110,175 125,165 140,165 C155,165 165,180 170,200 C175,220 185,270 200,310 Z" />
      {/* Dumbbell Weights */}
      <rect x="70" y="140" width="22" height="70" rx="10" />
      <rect x="55" y="148" width="16" height="54" rx="8" />
      <rect x="120" y="168" width="40" height="14" rx="7" />
      <rect x="150" y="140" width="22" height="70" rx="10" />
      <rect x="170" y="148" width="16" height="54" rx="8" />
    </g>
  </svg>
);

