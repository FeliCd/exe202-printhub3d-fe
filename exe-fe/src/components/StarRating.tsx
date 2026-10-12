import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 sao - Rất không hài lòng',
  2: '2 sao - Chưa ưng ý',
  3: '3 sao - Bình thường',
  4: '4 sao - Hài lòng, chất lượng tốt',
  5: '5 sao - Rất xuất sắc, vượt mong đợi!',
};

export default function StarRating({
  rating,
  onChange,
  readOnly = false,
  size = 'md',
  showText = false,
  className = '',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  }[size];

  return (
    <div className={`inline-flex flex-col gap-1.5 ${className}`}>
      <div className="inline-flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(activeRating);
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              onMouseLeave={() => !readOnly && setHoverRating(null)}
              className={`transition-transform focus:outline-none ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-125 active:scale-110 p-0.5'
              }`}
              title={readOnly ? undefined : RATING_LABELS[star]}
              aria-label={`${star} sao`}
            >
              <Star
                className={`${sizeClasses} transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'text-slate-600 stroke-[1.5]'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showText && !readOnly && (
        <span className="text-xs font-semibold text-amber-300/90 min-h-4 transition-all">
          {activeRating > 0 ? RATING_LABELS[activeRating] : 'Vui lòng chọn số sao'}
        </span>
      )}
    </div>
  );
}
