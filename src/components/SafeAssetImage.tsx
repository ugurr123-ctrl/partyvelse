import React, { useState } from 'react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackLabel?: string;
  fallbackIcon?: string;
  fallbackClassName?: string;
}

export const SafeAssetImage: React.FC<Props> = ({
  fallbackLabel,
  fallbackIcon = 'deployed_code',
  fallbackClassName = '',
  className = '',
  onError,
  alt = '',
  ...rest
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`w-full h-full flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(0,238,252,0.18)_0%,_rgba(20,17,35,0.95)_70%)] border border-white/10 text-cyan-300/80 select-none ${fallbackClassName}`}
      >
        <span className="material-symbols-outlined text-[28px] opacity-80">{fallbackIcon}</span>
        {fallbackLabel && (
          <span className="mt-1 px-2 text-[9px] font-mono uppercase tracking-wider text-center text-white/60">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className={className}
      onError={(e) => {
        setFailed(true);
        if (onError) onError(e);
      }}
      {...rest}
    />
  );
};
