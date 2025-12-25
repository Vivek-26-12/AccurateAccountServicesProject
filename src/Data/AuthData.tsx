import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from 'axios';
import API_BASE_URL from '../config'; // Import API_BASE_URL
import CryptoJS from 'crypto-js';

const SECRET_KEY = "final-year-project-secure-key-2025";

const encryptData = (data: any) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptData = (ciphertext: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData ? JSON.parse(decryptedData) : null;
  } catch (e) {
    // Fallback for existing plain text data
    try {
      return JSON.parse(ciphertext);
    } catch {
      return null;
    }
  }
};


interface User {
  auth_id: number;
  username: string;
  role: "admin" | "employee" | "client";
  phone: number;
  created_at: string;
  updated_at: string;
  profilePic?: string;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  fetchUserData: () => void;
  loading: boolean; // Add loading state
}

// Create Context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Initialize loading

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = decryptData(storedUser);
      if (userData) {
        setUser(userData);
        // If it was plain text (legacy), re-save it encrypted
        if (storedUser.startsWith('{')) {
          localStorage.setItem("user", encryptData(userData));
        }
      } else {
        localStorage.removeItem("user");
      }
    }
    setLoading(false); // Set loading to false after check
  }, []);

  // Function to store user data
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", encryptData(userData));
  };

  // Function to clear user data
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const fetchUserData = async () => {
    // ... no change needed mostly, but could set loading? probably not needed for background fetch
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const userData = decryptData(storedUser);
      if (!userData) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/users/${userData.auth_id}`);
        if (response.data) {
          setUser(response.data);
          localStorage.setItem('user', encryptData(response.data));
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setUser(null);
        localStorage.removeItem('user');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, fetchUserData, loading }}>
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