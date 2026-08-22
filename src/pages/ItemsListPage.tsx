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
        <div className="search">
          <svg
            className="search__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="input search__input"
            placeholder="Search by name or description…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search items"
          />
          {search && (
            <button
              type="button"
              className="search__clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
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
