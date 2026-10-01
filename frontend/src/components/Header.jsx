import { Link } from "react-router-dom";

import { useAuth } from "../context/useAuth";

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <div>
          <h1 className="logo">EduRAG</h1>
          <p className="tagline">
            Academic Knowledge Assistant
          </p>
        </div>

        <div className="header-actions">
          {user && (
            <span className="user-name">
              {user.full_name}
            </span>
          )}

          <button
            type="button"
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

          <div className="header-badge">
            RAG Powered
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;