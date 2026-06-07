import { Loader2 } from 'lucide-react';

interface LoadMoreProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  total?: number;
  loaded?: number;
}

export default function LoadMore({ hasMore, loading, onLoadMore, total, loaded }: LoadMoreProps) {
  if (!hasMore && !loading) return null;

  return (
    <div className="flex flex-col items-center gap-3 pt-6">
      {loaded !== undefined && total !== undefined && (
        <p className="text-[9px] font-black text-slate uppercase tracking-[0.2em]">
          Showing <span className="text-ink">{loaded}</span> of <span className="text-ink">{total}</span>
        </p>
      )}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="px-8 py-3 rounded-xl border border-hairline text-[10px] font-black uppercase tracking-[0.2em] text-slate hover:text-ink hover:bg-surface hover:border-brand-green/30 disabled:opacity-50 transition-all flex items-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </>
          ) : (
            'Load More'
          )}
        </button>
      )}
    </div>
  );
}
