import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/items" className="navbar__brand">
          <span className="navbar__logo" aria-hidden="true">IM</span>
          Item Manager
        </Link>
        <nav className="navbar__nav">
          <NavLink
            to="/items"
            end
            className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
          >
            Items
          </NavLink>
          <Link to="/items/new" className="btn btn--primary btn--sm">
            + New Item
          </Link>
        </nav>
      </div>
    </header>
  );
}
