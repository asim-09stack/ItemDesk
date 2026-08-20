import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="state">
      <h1 className="state__title">404</h1>
      <p className="state__text">The page you are looking for does not exist.</p>
      <Link to="/items" className="btn btn--primary">
        Back to items
      </Link>
    </div>
  );
}
