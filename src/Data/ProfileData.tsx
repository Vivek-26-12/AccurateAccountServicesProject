import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "../Data/AuthData";
import axios from "axios";

// Define the Profile Data type
interface ProfileData {
  auth_id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  company_name?: string;
  contact_person?: string;
  gstin?: string;
  pan_number?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProfileContextType {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const endpoint = user.role === "client" ? "/clients" : "/users";
        const response = await axios.get(`${endpoint}/${user.auth_id}`);

        setProfile(response.data);
      } catch (err) {
        setError("Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <ProfileContext.Provider value={{ profile, loading, error }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};