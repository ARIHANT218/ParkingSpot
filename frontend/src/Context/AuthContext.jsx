
import React, { createContext, useEffect, useState } from "react";

// give a default object so useContext(AuthContext) never returns undefined by default
export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, role, ... }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      // expected payload: { id, role, ... }
      setUser({ id: payload.id, role: payload.role });
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
