import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      onMouseLeave={() => interactive && setHoverRating(null)}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? 'تقييم بالنجوم' : `تقييم ${rating} من ${maxRating}`}
    >
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= activeRating;

        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            className={`transition-all duration-150 ${
              interactive
                ? 'cursor-pointer hover:scale-115 active:scale-95 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400'
                : 'cursor-default p-0'
            }`}
            aria-label={`${starValue} نجوم`}
            tabIndex={interactive ? 0 : -1}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors duration-150 ${
                isFilled
                  ? 'text-amber-400'
                  : 'text-stone-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

