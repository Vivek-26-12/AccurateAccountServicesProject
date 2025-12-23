import React, { useEffect, useState } from 'react';
import { FiX, FiMessageCircle } from 'react-icons/fi';
import axios from 'axios';
import API_BASE_URL from '../config';

const ClientFeedbackPopup = ({ onClose }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/feedback/all`);
        const formatted = response.data.map(fb => ({
          message: fb.message,
          client: `${fb.company_name} (${fb.contact_person})`,
        }));
        setFeedbacks(formatted);
      } catch (error) {
        console.error("Failed to load feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative border border-blue-200/60">
        {/* Top Bar Header */}
        <div className="flex items-center justify-between mb-5 border-b pb-4 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <FiMessageCircle size={20} />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Client Feedback
            </h2>
          </div>

          <button
            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
            onClick={onClose}
            title="Close"
          >
            <FiX size={26} />
          </button>
        </div>

        {/* Feedback List */}
        <div className="space-y-4 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent pr-2">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading feedbacks...</p>
          ) : feedbacks.length > 0 ? (
            feedbacks.map((item, index) => (
              <div
                key={index}
                className="p-5 bg-white border-l-4 border-blue-500 rounded-lg shadow hover:shadow-md transition duration-200"
              >
                <p className="text-gray-700 text-[15px] leading-relaxed">
                  “{item.message}”
                </p>
                <p className="text-sm text-blue-700 font-medium mt-3 text-right">
                  – {item.client}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-10">No feedback available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientFeedbackPopup;
