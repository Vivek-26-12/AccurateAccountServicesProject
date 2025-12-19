import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { FiAlertCircle, FiBell, FiCalendar, FiZap } from "react-icons/fi";
import { useUserContext } from "../Data/UserData";

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const { currentUser } = useUserContext();
  

  const loggedInUserId = currentUser?.user_id;

  useEffect(() => {
    // Fetch tasks for user
    axios.get(`http://localhost:3000/tasks/user/${loggedInUserId}`)
      .then((res) => setTasks(res.data))
      .catch((err) => console.error("Failed to fetch tasks", err));

    // Fetch announcements
    axios.get("http://localhost:3000/announcements")
      .then((res) => setAnnouncements(res.data))
      .catch((err) => console.error("Failed to fetch announcements", err));
  }, [loggedInUserId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-blue-600 rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <h1 className="text-3xl font-extrabold text-white mb-1">Welcome back, Employee!</h1>
          <p className="text-white text-sm">Here’s a quick overview of today’s updates.</p>
        </div>

        {/* Team Pulse */}
        <div className="mb-8">
          <div className="relative bg-white rounded-xl shadow-xl p-8 flex items-center border-2 border-pink-400 animate-glow-border">
            <div className="p-3 rounded-full bg-gradient-to-r from-red-100 to-blue-100 mr-6">
              <FiZap className="text-yellow-500" size={32} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500 animate-pulse-text">
                Team Pulse
              </p>
              <p className="text-base text-gray-600 mt-2">Energize. Collaborate. Thrive.</p>
              <style>
                {`
                  @keyframes pulseText {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                  }
                  .animate-pulse-text {
                    animation: pulseText 3s ease-in-out infinite;
                  }
                  @keyframes glowBorder {
                    0%, 100% { border-color: #f472b6; }
                    50% { border-color: #ec4899; }
                  }
                  .animate-glow-border {
                    animation: glowBorder 2.5s ease-in-out infinite;
                  }
                `}
              </style>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Announcements */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 max-h-[400px] overflow-y-auto">
              <div className="px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FiBell className="mr-2 text-orange-500" /> Announcements
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {announcements.length === 0 ? (
                  <p className="px-6 py-4 text-gray-500">No announcements yet.</p>
                ) : (
                  announcements.map((item) => (
                    <div key={item.announcement_id} className="px-6 py-4 hover:bg-gray-50 transition">
                      <div className="flex items-start">
                        <span className="mr-3 mt-1">
                          <FiAlertCircle className="text-red-500" />
                        </span>
                        <div>
                          <h3 className="text-md font-medium text-gray-800">{item.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{item.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-6 py-4 bg-gray-50 text-right">
                <button className="text-sm text-blue-600 font-medium hover:underline">
                  View all announcements →
                </button>
              </div>
            </div>
          </div>

          {/* Your Tasks */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 max-h-[400px] overflow-y-auto">
              <div className="px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FiCalendar className="mr-2 text-purple-500" /> Your Tasks
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {tasks.length === 0 ? (
                  <p className="px-6 py-4 text-gray-500">No tasks assigned.</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.task_id} className="px-6 py-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-800 font-medium">{task.task_name}</p>
                          <p className="text-sm text-gray-500">
                            Due {new Date(task.due_date).toDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const getPriorityColor = (priority) => {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
