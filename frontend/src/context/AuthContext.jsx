const API_URL = import.meta.env.VITE_API_URL;
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import AuthContext from "./AuthContext";


export function AuthProvider({ children }) {

  const [token, setToken] = useState(
    () => localStorage.getItem("edurag_token")
  );

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(
    () => Boolean(localStorage.getItem("edurag_token"))
  );


  const fetchCurrentUser = useCallback(
    async (accessToken) => {

      try {

        const response = await fetch(
          `${API_URL}/me`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Invalid session");
        }

        const data = await response.json();

        setUser(data);

      } catch {

        localStorage.removeItem("edurag_token");

        setToken(null);
        setUser(null);

      } finally {

        setLoading(false);

      }

    },
    []
  );


  useEffect(() => {

    const storedToken =
      localStorage.getItem("edurag_token");

    if (storedToken) {
        // Restore the authenticated session from the stored JWT.
        // The API response updates React authentication state.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchCurrentUser(storedToken);
    }

  }, [fetchCurrentUser]);


  const login = async (email, password) => {

    const response = await fetch(
      `${API_URL}/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {

      throw new Error(
        data.detail || "Login failed."
      );

    }

    localStorage.setItem(
      "edurag_token",
      data.access_token
    );

    setToken(data.access_token);

    setLoading(true);

    await fetchCurrentUser(
      data.access_token
    );

    return data;

  };


  const logout = () => {

    localStorage.removeItem(
      "edurag_token"
    );

    setToken(null);
    setUser(null);
    setLoading(false);

  };


  const value = {
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(token && user),
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}