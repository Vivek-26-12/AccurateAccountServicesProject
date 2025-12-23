import React, { useContext, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { ClientContext } from "../Data/ClientData";
import API_BASE_URL from '../config';
//import { ClientContext } from "@/context/ClientData"; // Adjust path if different

export default function FeedbackForm({ onClose }) {
  const { clients } = useContext(ClientContext);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const client = clients[0]; // Only one client per auth_id as per your logic

  const handleSubmit = async () => {
    if (!message.trim()) {
      setStatus("Please write your feedback.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      await axios.post(`${API_BASE_URL}/feedback/submit`, {
        client_id: client.client_id,
        message,
      });

      setStatus("✅ Feedback submitted!");
      setMessage("");

      // Close after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Feedback submission error:", error);
      setStatus("❌ Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-md z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white/80 p-6 rounded-2xl shadow-2xl w-96 backdrop-blur-lg border border-white/30 transform scale-95 transition-all duration-300 animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">💬 Share Your Feedback</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
            <X size={24} />
          </button>
        </div>

        {/* Input */}
        <textarea
          className="w-full border border-gray-300 bg-white/70 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 text-gray-700 resize-none shadow-sm"
          rows="4"
          placeholder="Write your feedback..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>

        {/* Status Message */}
        {status && <p className="text-sm mt-2 text-center text-blue-700">{status}</p>}

        {/* Buttons */}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:scale-105 transition transform shadow-md"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}
