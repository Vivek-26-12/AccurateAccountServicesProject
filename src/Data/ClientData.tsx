import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useAuth } from "./AuthData";
import API_BASE_URL from '../config';

// 🆕 Define contact type
type Contact = {
  contact_id: number;
  client_id: number;
  contact_name: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
};

// Updated client type including contacts
type Client = {
  client_id: number;
  auth_id: number;
  company_name: string;
  contact_person: string;
  email: string;
  gstin: string;
  pan_number: string;
  created_at: string;
  updated_at: string;
  address?: string;         // Optional in case not present
  profile_pic?: string;     // Optional in case not present
  contacts: Contact[];      // 🆕 Added
};

// Context type
type ClientContextType = {
  clients: Client[];
};

// Create context
export const ClientContext = createContext<ClientContextType | undefined>(undefined);

// Provider
export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === "client") {
      axios
        .get(`${API_BASE_URL}/clients/${user.auth_id}`)
        .then((response) => {
          console.log("Fetched Client Data with Contacts:", response.data);
          setClients([response.data]); // Single client with contacts
        })
        .catch((error) => {
          console.error("Error fetching client data:", error);
        });
    }
  }, [user]);

  return (
    <ClientContext.Provider value={{ clients }}>
      {children}
    </ClientContext.Provider>
  );
};
