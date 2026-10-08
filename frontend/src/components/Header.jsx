import { useEffect, useState } from "react";

import { useAuth } from "../context/useAuth";

function Header() {
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("edurag_theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem(
      "edurag_theme",
      theme
    );
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light"
    );
  };

  return (
    <header className="header">
      <div className="header-content">

        <div className="brand">
          <div
            className="brand-mark"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M12 3.5 13.7 9l5.3 1.7-5.3 1.7L12 18l-1.7-5.6L5 10.7 10.3 9 12 3.5Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="m18.5 16 .7 2.2 2.3.8-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.8.7-2.2Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="brand-copy">
            <div className="logo">
              EduRAG
            </div>

            <div className="tagline">
              Academic Knowledge Assistant
            </div>
          </div>
        </div>

        <div className="header-actions">

          {user?.full_name && (
            <span className="user-name">
              {user.full_name}
            </span>
          )}

          <div className="header-menu-wrapper">

            <button
              type="button"
              className="header-menu-button"
              onClick={() =>
                setMenuOpen((open) => !open)
              }
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>

            {menuOpen && (
              <div className="header-menu-dropdown">

                <button
                  type="button"
                  className="menu-item"
                  onClick={() => {
                    toggleTheme();
                    setMenuOpen(false);
                  }}
                >
                  <span className="menu-item-icon">
                    {theme === "light"
                      ? "☾"
                      : "☀"}
                  </span>

                  <span>
                    {theme === "light"
                      ? "Dark mode"
                      : "Light mode"}
                  </span>
                </button>

                <div className="menu-divider" />

                <button
                  type="button"
                  className="menu-item menu-item-danger"
                  onClick={logout}
                >
                  <span className="menu-item-icon">
                    ↪
                  </span>

                  <span>Logout</span>
                </button>

              </div>
            )}

          </div>

        </div>

      </div>
    </header>
  );
}

export default Header;