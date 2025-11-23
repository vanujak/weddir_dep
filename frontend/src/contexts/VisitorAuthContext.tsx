// src/context/VisitorAuthContext.tsx
"use client";

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; // Correct import for jwtDecode

interface Visitor {
  id: string;
  email: string;
}

interface AuthContextProps {
  visitor: Visitor | null;
  accessToken: string | null;
  isAuthenticated: boolean; // Add isAuthenticated
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  // Function to login by decoding JWT and extracting visitor details
  const login = (token: string) => {
    const decoded = jwtDecode<{ sub: string; email: string }>(token); // Expecting sub (visitor id) and email

    // Set access token and visitor details in state
    setAccessToken(token);
    setVisitor({
      id: decoded.sub, // Assuming the sub is the visitor's ID
      email: decoded.email, // Email extracted from JWT
    });

    // Save to localStorage
    localStorage.setItem('access_token', token);
  };

  const logout = () => {
    // Clear visitor and accessToken state
    setVisitor(null);
    setAccessToken(null);
    // Remove from localStorage
    localStorage.removeItem('access_token');
    // Redirect to sign-in page
    router.push("/");
  };

  // Check if the visitor is authenticated
  const isAuthenticated = !!accessToken && !!visitor;

  useEffect(() => {
    // On page load, check if there is an access token in localStorage
    const token = localStorage.getItem('access_token');

    if (token) {
      try {
        // Automatically log in if the token exists
        login(token);
      } catch {
        // console.error("Invalid token in localStorage", error);
        localStorage.removeItem('access_token');
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ visitor, accessToken, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
