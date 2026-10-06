import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  clickable?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  clickable = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className="flex items-center gap-3 group select-none">
      {/* Connected Heart + Medical Cross Logo Icon */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]} rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-cyan-500/30 transition-all duration-300`}>
        <div className="w-full h-full bg-slate-950/80 rounded-[10px] flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
          {/* Subtle cyan glow inside */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-500/20 pointer-events-none" />
          
          <svg
            viewBox="0 0 24 24"
            className="w-3/4 h-3/4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Heart shape */}
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" opacity="0.3" fill="currentColor" />
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" stroke="url(#heart-grad)" />
            {/* Cross inside */}
            <path d="M12 7v6" stroke="#FFFFFF" strokeWidth="2.2" />
            <path d="M9 10h6" stroke="#FFFFFF" strokeWidth="2.2" />
            {/* Connected nodes */}
            <circle cx="5" cy="5" r="1.5" fill="#38BDF8" />
            <circle cx="19" cy="5" r="1.5" fill="#38BDF8" />
            <circle cx="12" cy="19" r="1.5" fill="#38BDF8" />
            <defs>
              <linearGradient id="heart-grad" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="1" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 font-bold tracking-wider">
          <span className={`bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent ${titleSizes[size]}`}>
            CARECONNECT
          </span>
          <span className={`text-cyan-400 font-extrabold ${titleSizes[size]} drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]`}>
            360
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-slate-400 font-medium tracking-wide">
            Smarter care. Safer living.
          </span>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return (
      <Link to="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
};
