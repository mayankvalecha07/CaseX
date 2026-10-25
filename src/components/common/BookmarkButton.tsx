import React from 'react';
import { Bookmark, Star } from 'lucide-react';
import { useCase } from '../../context/CaseContext';

interface BookmarkButtonProps {
  id: string;
  type: 'CASE' | 'EVIDENCE';
  className?: string;
  showLabel?: boolean;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  id,
  type,
  className = '',
  showLabel = false
}) => {
  const { isCaseFavorite, isEvidenceFavorite, toggleFavoriteCase, toggleFavoriteEvidence } = useCase();

  const isFav = type === 'CASE' ? isCaseFavorite(id) : isEvidenceFavorite(id);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (type === 'CASE') {
      toggleFavoriteCase(id);
    } else {
      toggleFavoriteEvidence(id);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={isFav ? 'Remove from Bookmarks' : 'Save to Bookmarks'}
      aria-label={isFav ? 'Remove from Bookmarks' : 'Save to Bookmarks'}
      className={`inline-flex items-center gap-1.5 p-1.5 rounded-lg border transition-all ${
        isFav
          ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
          : 'bg-white/5 text-slate-400 hover:text-amber-300 hover:bg-white/10 border-white/10'
      } ${className}`}
    >
      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
      {showLabel && (
        <span className="text-[11px] font-mono tracking-wider">
          {isFav ? 'BOOKMARKED' : 'BOOKMARK'}
        </span>
      )}
    </button>
  );
};
