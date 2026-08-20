import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import seedProducts from '../data/products.json';
import type { Item, ItemInput } from '../types';

interface ItemsContextValue {
  items: Item[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  getItemById: (id: string | number) => Item | undefined;
  addItem: (data: ItemInput) => Item;
  updateItem: (id: string | number, data: ItemInput) => void;
  deleteItem: (id: string | number) => void;
}

const ItemsContext = createContext<ItemsContextValue | null>(null);

/**
 * Simulates fetching the seed data from a back-end.
 * Resolves with the products after a short delay so the UI can show a
 * loading state. Rejects if a fetch failure is simulated via localStorage,
 * which lets us exercise the error UI on demand.
 */
function fetchItems(): Promise<Item[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.localStorage.getItem('simulateFetchError') === 'true') {
        reject(new Error('Unable to load items. Please try again.'));
        return;
      }
      resolve(seedProducts as Item[]);
    }, 600);
  });
}

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchItems()
      .then((data) => setItems(data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load items.'))
      .finally(() => setLoading(false));
  }, []);

  // Seed the context from products.json exactly once on mount.
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const getItemById = useCallback(
    (id: string | number) => items.find((item) => String(item.id) === String(id)),
    [items]
  );

  const addItem = useCallback((data: ItemInput): Item => {
    const now = new Date().toISOString();
    const created: Item = { id: 0, createdAt: now, updatedAt: now, ...data };
    setItems((prev) => {
      const nextId = prev.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
      created.id = nextId;
      return [...prev, created];
    });
    return created;
  }, []);

  const updateItem = useCallback((id: string | number, data: ItemInput) => {
    const now = new Date().toISOString();
    setItems((prev) =>
      prev.map((item) =>
        String(item.id) === String(id) ? { ...item, ...data, id: item.id, updatedAt: now } : item
      )
    );
  }, []);

  const deleteItem = useCallback((id: string | number) => {
    setItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
  }, []);

  const value = useMemo<ItemsContextValue>(
    () => ({
      items,
      loading,
      error,
      reload: loadItems,
      getItemById,
      addItem,
      updateItem,
      deleteItem,
    }),
    [items, loading, error, loadItems, getItemById, addItem, updateItem, deleteItem]
  );

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
}

export function useItems(): ItemsContextValue {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
}
