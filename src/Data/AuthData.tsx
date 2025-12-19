import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from 'axios';

// Define the user type
interface User {
  auth_id: number;
  username: string;
  role: "admin" | "employee" | "client";
  phone :number;
  created_at: string;
  updated_at: string;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  fetchUserData: () => void; // Add fetchUserData to the context type.
}

// Create Context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Function to store user data
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Function to clear user data
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const fetchUserData = async () => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
        const userData = JSON.parse(storedUser);
        try {
            const response = await axios.get(`/users/${userData.auth_id}`);
            if (response.data) {
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            // Handle error (e.g., clear user data, redirect to login)
            setUser(null);
            localStorage.removeItem('user');
        }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, fetchUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};