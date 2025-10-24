import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

interface SimpleVirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; item: T }) => React.ReactNode;
  loading?: boolean;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  className?: string;
  overscanCount?: number;
}

/**
 * Composant de liste virtualisée simple sans dépendances externes
 * Utilise une approche de fenêtre glissante pour simuler la virtualisation
 */
export default function SimpleVirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  loading = false,
  onLoadMore,
  hasNextPage = false,
  className = '',
  overscanCount = 5,
}: SimpleVirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculer les éléments visibles
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscanCount);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + height) / itemHeight) + overscanCount
    );
    return { startIndex, endIndex };
  }, [scrollTop, height, itemHeight, items.length, overscanCount]);

  // Éléments visibles
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, visibleRange]);

  // Gestion du scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const newScrollTop = target.scrollTop;
    setScrollTop(newScrollTop);

    // Détecter si on est en bas
    const isNearBottom = newScrollTop + height >= target.scrollHeight - 100;
    setIsAtBottom(isNearBottom);
  };

  // Charger plus d'éléments si nécessaire
  useEffect(() => {
    if (isAtBottom && hasNextPage && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [isAtBottom, hasNextPage, loading, onLoadMore]);

  return (
    <div className={`simple-virtualized-list ${className}`}>
      <div
        ref={containerRef}
        style={{ height, overflow: 'auto' }}
        onScroll={handleScroll}
        className="relative"
      >
        {/* Spacer pour simuler la hauteur totale */}
        <div style={{ height: items.length * itemHeight, position: 'relative' }}>
          {/* Éléments visibles */}
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: index * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
            >
              {renderItem({ index, style: {}, item })}
            </div>
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}

/**
 * Hook pour la pagination infinie
 */
export const useInfinitePagination = <T,>(
  fetchFunction: (page: number, limit: number, ...args: any[]) => Promise<T[]>,
  initialLimit: number = 20
) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const loadMore = async (...args: any[]) => {
    if (loading || !hasNextPage) return;

    setLoading(true);
    setError(null);

    try {
      const newItems = await fetchFunction(page, initialLimit, ...args);
      
      if (newItems.length === 0) {
        setHasNextPage(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setItems([]);
    setPage(1);
    setHasNextPage(true);
    setError(null);
  };

  return {
    items,
    loading,
    hasNextPage,
    error,
    loadMore,
    reset,
  };
};

/**
 * Composant de table virtualisée simple
 */
interface SimpleVirtualizedTableProps<T> {
  data: T[];
  columns: Array<{
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    width?: number;
  }>;
  height?: number;
  rowHeight?: number;
  className?: string;
}

export function SimpleVirtualizedTable<T>({
  data,
  columns,
  height = 400,
  rowHeight = 50,
  className = '',
}: SimpleVirtualizedTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculer les lignes visibles
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight));
    const endIndex = Math.min(
      data.length - 1,
      Math.floor((scrollTop + height) / rowHeight)
    );
    return { startIndex, endIndex };
  }, [scrollTop, height, rowHeight, data.length]);

  // Lignes visibles
  const visibleRows = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return data.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [data, visibleRange]);

  // Gestion du scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  };

  return (
    <div className={`simple-virtualized-table ${className}`}>
      {/* Header */}
      <div className="flex items-center bg-gray-100 border-b-2 border-gray-300 font-semibold">
        {columns.map((column) => (
          <div
            key={column.key}
            className="px-4 py-3 flex-1"
            style={{ width: column.width || 'auto' }}
          >
            {column.label}
          </div>
        ))}
      </div>
      
      {/* Virtualized Body */}
      <div
        ref={containerRef}
        style={{ height, overflow: 'auto' }}
        onScroll={handleScroll}
        className="relative"
      >
        <div style={{ height: data.length * rowHeight, position: 'relative' }}>
          {visibleRows.map(({ item, index }) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: index * rowHeight,
                left: 0,
                right: 0,
                height: rowHeight,
              }}
              className="flex items-center border-b border-gray-200 hover:bg-gray-50"
            >
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="px-4 py-2 flex-1"
                  style={{ width: column.width || 'auto' }}
                >
                  {column.render ? column.render(item) : (item as any)[column.key]}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
