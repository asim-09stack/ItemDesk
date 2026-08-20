import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import ItemCard from '../components/ItemCard';
import ConfirmModal from '../components/ConfirmModal';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';
import type { Item } from '../types';

export default function ItemsListPage() {
  const { items, loading, error, reload, deleteItem } = useItems();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category)));
    return unique.sort();
  }, [items]);

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesTerm =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term);
      const matchesCategory = category === 'all' || item.category === category;
      return matchesTerm && matchesCategory;
    });
  }, [items, search, category]);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteItem(pendingDelete.id);
    setPendingDelete(null);
  };

  if (loading) return <Loader label="Loading items…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1 className="page-head__title">Items</h1>
          <p className="page-head__subtitle">
            {items.length} {items.length === 1 ? 'item' : 'items'} in the catalog
          </p>
        </div>
        <Link to="/items/new" className="btn btn--primary">
          + New Item
        </Link>
      </div>

      <div className="toolbar">
        <input
          type="search"
          className="input"
          placeholder="Search by name or description…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search items"
        />
        <select
          className="input"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {visibleItems.length === 0 ? (
        <div className="state">
          <p className="state__text">No items match your filters.</p>
        </div>
      ) : (
        <div className="grid">
          {visibleItems.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={setPendingDelete} />
          ))}
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete item"
          message={`Are you sure you want to delete "${pendingDelete.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </section>
  );
}
