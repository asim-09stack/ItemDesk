import { Link, useNavigate } from 'react-router-dom';
import type { Item } from '../types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

interface ItemCardProps {
  item: Item;
  onDelete: (item: Item) => void;
}

export default function ItemCard({ item, onDelete }: ItemCardProps) {
  const navigate = useNavigate();

  return (
    <article className="card">
      <Link to={`/items/${item.id}`} className="card__body">
        <div className="card__head">
          <h3 className="card__title">{item.name}</h3>
          <span className="badge">{item.category}</span>
        </div>
        <p className="card__desc">{item.description}</p>
        <div className="card__meta">
          <span className="card__price">{currency.format(item.price)}</span>
          <span className={`card__stock${item.stock === 0 ? ' card__stock--out' : ''}`}>
            {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
          </span>
        </div>
      </Link>
      <div className="card__actions">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => navigate(`/items/${item.id}/edit`)}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn--danger btn--sm"
          onClick={() => onDelete(item)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
