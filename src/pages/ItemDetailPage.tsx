import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useItems } from '../context/ItemsContext';
import ConfirmModal from '../components/ConfirmModal';
import Loader from '../components/Loader';
import ErrorState from '../components/ErrorState';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, error, reload, getItemById, deleteItem } = useItems();
  const [confirming, setConfirming] = useState(false);

  if (loading) return <Loader label="Loading item…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const item = id ? getItemById(id) : undefined;

  if (!item) {
    return (
      <div className="state">
        <p className="state__text">Item not found.</p>
        <Link to="/items" className="btn btn--primary">
          Back to items
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    deleteItem(item.id);
    navigate('/items');
  };

  const fields: { label: string; value: string | number }[] = [
    { label: 'Category', value: item.category },
    { label: 'Price', value: currency.format(item.price) },
    { label: 'Stock', value: `${item.stock} units` },
    { label: 'Item ID', value: item.id },
    { label: 'Created', value: formatDate(item.createdAt) },
    { label: 'Updated', value: formatDate(item.updatedAt) },
    { label: 'Image URL', value: item.imageUrl },
  ];

  return (
    <section>
      <Link to="/items" className="back-link">
        ← Back to items
      </Link>

      <div className="detail">
        <div className="detail__head">
          <div>
            <h1 className="detail__title">{item.name}</h1>
            <span className="badge">{item.category}</span>
          </div>
          <div className="detail__actions">
            <Link to={`/items/${item.id}/edit`} className="btn btn--ghost">
              Edit
            </Link>
            <button type="button" className="btn btn--danger" onClick={() => setConfirming(true)}>
              Delete
            </button>
          </div>
        </div>

        <p className="detail__desc">{item.description}</p>

        <dl className="detail__grid">
          {fields.map((field) => (
            <div key={field.label} className="detail__row">
              <dt className="detail__label">{field.label}</dt>
              <dd className="detail__value">{field.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {confirming && (
        <ConfirmModal
          title="Delete item"
          message={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </section>
  );
}
