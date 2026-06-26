import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import Panel from "../components/Panel";
import { recordNavItems } from "../data/recordNavItems";

export default function Records() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <PageContainer title="Records">
      <Panel title="Browse Records">
        <div className="records-subnav-header">
          <button
            type="button"
            className="subnav-toggle-button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="records-subnav-menu"
          >
            <span className="hamburger-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>{isMenuOpen ? "Close Menu" : "Open Sub-Pages"}</span>
          </button>
        </div>

        <nav
          id="records-subnav-menu"
          className={isMenuOpen ? "sub-nav sub-nav-open" : "sub-nav"}
        >
          {recordNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "sub-nav-link active" : "sub-nav-link"
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </Panel>

      <Outlet />
    </PageContainer>
  );
}
