import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="app-header">
      <nav className="primary-nav">
        <NavLink
          to="/new"
          className={({ isActive }) =>
            isActive ? "primary-nav-link active" : "primary-nav-link"
          }
        >
          New Record
        </NavLink>

        <NavLink
          to="/records"
          className={({ isActive }) =>
            isActive ? "primary-nav-link active" : "primary-nav-link"
          }
        >
          Records
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? "primary-nav-link active" : "primary-nav-link"
          }
        >
          Settings
        </NavLink>
      </nav>
    </header>
  );
}
