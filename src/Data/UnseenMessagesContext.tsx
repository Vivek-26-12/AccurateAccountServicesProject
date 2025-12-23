import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from "react";
import axios from "axios";
import { useUserContext } from "./UserData";
import API_BASE_URL from '../config';

type UnseenMessages = {
  personal_chats: Record<number, number>;
  group_chats: Record<number, number>;
};

type UnseenMessagesContextType = {
  unseenMessages: UnseenMessages;
  loading: boolean;
  error: string | null;
  refreshUnseenMessages: () => Promise<void>;
  markPersonalMessagesAsSeen: (senderId: number) => Promise<void>;
  markGroupMessagesAsSeen: (groupId: number) => Promise<void>;
};

const UnseenMessagesContext = createContext<UnseenMessagesContextType | undefined>(undefined);

export const useUnseenMessages = () => {
  const context = useContext(UnseenMessagesContext);
  if (context === undefined) {
    throw new Error('useUnseenMessages must be used within an UnseenMessagesProvider');
  }
  return context;
};

export const UnseenMessagesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [unseenMessages, setUnseenMessages] = useState<UnseenMessages>({
    personal_chats: {},
    group_chats: {}
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser: authUser } = useUserContext();

  const fetchUnseenMessages = useCallback(async () => {
    if (!authUser?.user_id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/unseen-messages/all?user_id=${authUser.user_id}`);
      setUnseenMessages(response.data);
    } catch (err) {
      console.error("Error fetching unseen messages:", err);
      setError("Failed to fetch unseen messages");
    } finally {
      setLoading(false);
    }
  }, [authUser?.user_id]);

  const markPersonalMessagesAsSeen = useCallback(async (senderId: number) => {
    if (!authUser?.user_id) return;

    try {
      // Optimistic update first
      setUnseenMessages(prev => ({
        ...prev,
        personal_chats: {
          ...prev.personal_chats,
          [senderId]: 0
        }
      }));

      await axios.post(`${API_BASE_URL}/mark-personal-messages-seen`, {
        sender_id: senderId,
        receiver_id: authUser.user_id
      });
    } catch (err) {
      console.error("Error marking personal messages as seen:", err);
      // Revert on error
      await fetchUnseenMessages();
    }
  }, [authUser?.user_id, fetchUnseenMessages]);

  const markGroupMessagesAsSeen = useCallback(async (groupId: number) => {
    if (!authUser?.user_id) return;

    try {
      // Optimistic update first
      setUnseenMessages(prev => ({
        ...prev,
        group_chats: {
          ...prev.group_chats,
          [groupId]: 0
        }
      }));

      await axios.post(`${API_BASE_URL}/mark-group-messages-seen`, {
        user_id: authUser.user_id,
        group_id: groupId
      });
    } catch (err) {
      console.error("Error marking group messages as seen:", err);
      // Revert on error
      await fetchUnseenMessages();
    }
  }, [authUser?.user_id, fetchUnseenMessages]);

  // Initial fetch when auth user changes
  useEffect(() => {
    if (authUser?.user_id) {
      fetchUnseenMessages();
    }
  }, [authUser?.user_id, fetchUnseenMessages]);

  return (
    <UnseenMessagesContext.Provider value={{
      unseenMessages,
      loading,
      error,
      refreshUnseenMessages: fetchUnseenMessages,
      markPersonalMessagesAsSeen,
      markGroupMessagesAsSeen
    }}>
      {children}
    </UnseenMessagesContext.Provider>
  );
};