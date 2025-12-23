// src/components/MessagesPopup.js
import React, { useEffect, useState } from 'react';
import { FiX, FiMail } from 'react-icons/fi';
import API_BASE_URL from '../config';

interface MessagesPopupProps {
  onClose: () => void;
}

interface GuestMessage {
  guest_name: string;
  guest_email: string;
  message: string;
  created_at: string;
}

const MessagesPopup = ({ onClose }: MessagesPopupProps) => {
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  useEffect(() => {
    fetch(`${API_BASE_URL}/guest-messages`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch messages:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm bg-black/60">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl p-6 border border-gray-200 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl transition"
          aria-label="Close"
        >
          <FiX />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FiMail className="text-blue-600 mr-2" /> New Messages
          </h2>
          <div className="h-1 w-24 bg-blue-500 rounded-full mt-2" />
        </div>

        {/* Message List */}
        <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <p className="text-gray-500 text-sm">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-500 text-sm">No new messages.</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gradient-to-br from-white via-white/70 to-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center text-sm shadow-inner shadow-blue-200 ring-2 ring-white">
                  {getInitials(msg.guest_name)}
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-800">{msg.guest_name}</h4>
                  <p className="text-xs text-gray-500 mb-1">{msg.guest_email}</p>
                  <p className="text-sm text-gray-700 italic">"{msg.message}"</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPopup;
