import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import axios from "axios";
import { useAuth } from "./AuthData";
import API_BASE_URL from '../config';

// Define the shape of user data
type User = {
  user_id: number;
  auth_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "admin" | "employee" | "client";
  created_at: string;
  updated_at: string;
  profile_pic: string | null;
};

// Define the shape of context data
type UserContextType = {
  currentUser: User | null;
  users: User[];
  fetchUsers: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
};

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook to use the user context
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const { user: authUser } = useAuth();

  const fetchCurrentUser = async () => {
    if (!authUser?.auth_id) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/users/auth/${authUser.auth_id}`);
      const userData = response.data;
      // console.log("Fetched current user:", userData);
      setCurrentUser(userData);
    } catch (error) {
      console.error("Error fetching current user:", error);
      setCurrentUser(null);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      const usersData = response.data;
      // console.log("Fetched all users:", usersData);

      // Filter out the current user if needed
      const otherUsers = authUser?.auth_id
        ? usersData.filter((u: User) => u.auth_id !== authUser.auth_id)
        : usersData;

      setUsers(otherUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    const initializeUserData = async () => {
      await fetchCurrentUser();

      // Only fetch all users if admin or employee
      if (authUser?.role === 'admin' || authUser?.role === 'employee') {
        await fetchUsers();
      }
    };

    initializeUserData();
  }, [authUser]);

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      fetchUsers,
      fetchCurrentUser
    }}>
      {children}
    </UserContext.Provider>
  );
};