import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

// Import dynamique pour éviter les problèmes de compatibilité Vite
let List: any = null;

// Chargement dynamique de react-window
const loadReactWindow = async () => {
  if (!List) {
    const ReactWindow = await import('react-window');
    List = ReactWindow.List;
  }
  return List;
};

interface VirtualizedListProps<T> {
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
 * Composant de liste virtualisée pour gérer de gros volumes de données
 * Utilise react-window pour des performances optimales
 */
export default function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  loading = false,
  onLoadMore,
  hasNextPage = false,
  className = '',
  overscanCount = 5,
}: VirtualizedListProps<T>) {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const listRef = useRef<any>(null);

  // Charger react-window au montage du composant
  useEffect(() => {
    loadReactWindow().then(() => {
      setIsLoaded(true);
    });
  }, []);

  // Observer pour détecter quand on arrive en bas
  useEffect(() => {
    if (isAtBottom && hasNextPage && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [isAtBottom, hasNextPage, loading, onLoadMore]);

  const handleRowsRendered = ({ visibleStartIndex, visibleStopIndex }: { visibleStartIndex: number; visibleStopIndex: number }) => {
    const isNearBottom = visibleStopIndex >= items.length - 10;
    setIsAtBottom(isNearBottom);
  };

  const RowComponent = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    if (!item) {
      return (
        <div style={style} className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      );
    }

    return renderItem({ index, style, item });
  };

  // Si react-window n'est pas encore chargé, afficher un loader
  if (!isLoaded || !List) {
    return (
      <div className={`virtualized-list ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className={`virtualized-list ${className}`}>
      <List
        listRef={listRef}
        style={{ height }}
        rowComponent={RowComponent}
        rowCount={items.length}
        rowHeight={itemHeight}
        rowProps={{ items }}
        onRowsRendered={handleRowsRendered}
        overscanCount={overscanCount}
      />
      
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
 * Composant de table virtualisée
 */
interface VirtualizedTableProps<T> {
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

export function VirtualizedTable<T>({
  data,
  columns,
  height = 400,
  rowHeight = 50,
  className = '',
}: VirtualizedTableProps<T>) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger react-window au montage du composant
  useEffect(() => {
    loadReactWindow().then(() => {
      setIsLoaded(true);
    });
  }, []);

  const Row = ({ index, style, data }: { index: number; style: React.CSSProperties; data: T[] }) => {
    const item = data[index];
    
    return (
      <div style={style} className="flex items-center border-b border-gray-200 hover:bg-gray-50">
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
    );
  };

  return (
    <div className={`virtualized-table ${className}`}>
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
      {isLoaded && List ? (
        <List
          style={{ height }}
          rowComponent={Row}
          rowCount={data.length}
          rowHeight={rowHeight}
          rowProps={{ data }}
        />
      ) : (
        <div className="flex items-center justify-center" style={{ height }}>
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}

