import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiMessageCircle, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import { BsGraphUp } from 'react-icons/bs';
import axios from 'axios';
import { useUserContext } from '../Data/UserData';
import ClientFeedbackPopup from '../components/ClientFeedbackPopup';
import MessagesPopup from '../components/MessagesPopup';

function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useUserContext();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for dynamic data
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({
    pendingReviews: 0,
    guestMessages: 0,
    yesterdayFeedbackCount: 0,
    yesterdayMessageCount: 0
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch admin tasks
        const tasksResponse = await axios.get(`http://localhost:3000/tasks/user/${currentUser.user_id}`);
        setTasks(tasksResponse.data.map(task => ({
          id: task.task_id,
          title: task.task_name,
          project: task.group_name || 'General',
          priority: task.priority,
          completed: task.status === 'Completed',
          dueDate: task.due_date
        })));

        // Fetch announcements
        const announcementsResponse = await axios.get('http://localhost:3000/announcements');
        setAnnouncements(announcementsResponse.data);

        const feedbackCountResponse = await axios.get('http://localhost:3000/feedback/count');
        const yesterdayFeedbackResponse = await axios.get('http://localhost:3000/feedback/count/yesterday');
        // console.log(yesterdayFeedbackResponse);
        // Fetch guest message stats
        const messageCountResponse = await axios.get('http://localhost:3000/guest-messages/count');
        const yesterdayMessageResponse = await axios.get('http://localhost:3000/guest-messages/count/yesterday');

        setStats({
          pendingReviews: feedbackCountResponse.data.count,
          guestMessages: messageCountResponse.data.count,
          yesterdayFeedbackCount: yesterdayFeedbackResponse.data.count,
          yesterdayMessageCount: yesterdayMessageResponse.data.count
        });


      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.user_id) {
      fetchData();
    }
  }, [currentUser]);

  const toggleTaskCompletion = async (taskId) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      await axios.put(`http://localhost:3000/tasks/${taskId}`, {
        status: !taskToUpdate.completed ? 'Completed' : 'Pending'
      });

      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeText = (current, yesterday) => {
    if (yesterday === 0) {
      return 'No new items from yesterday';
    }
    return `+${yesterday} from yesterday`;
  };

  const handleViewAllTasks = () => navigate("/tasks");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-sm p-4 sm:p-6 mb-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Welcome back, {currentUser?.first_name || 'Admin'}</h2>
              <p className="text-sm sm:text-base opacity-90">Here's what's happening with your organization today</p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 mb-6">
        <StatCard
            title="Client Feedback"
            value={stats.pendingReviews}
            change={stats.yesterdayFeedbackCount === 0 
              ? 'No new feedback' 
              : `+${stats.yesterdayFeedbackCount} from yesterday`}
            icon={<FiMessageSquare className="text-blue-500" size={20} />}
            color="bg-blue-50"
            onClick={() => setIsFeedbackOpen(true)}
          />
          <StatCard
            title="New Guest Messages"
            value={stats.guestMessages}
            change={stats.yesterdayMessageCount === 0 
              ? 'No new messages' 
              : `+${stats.yesterdayMessageCount} from yesterday`}
            icon={<FiMessageCircle className="text-red-500" size={20} />}
            color="bg-red-50"
            onClick={() => setIsMessagesOpen(true)}
          />
        </div>

        {/* Announcements & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Announcements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-700 flex items-center text-sm sm:text-base">
                <BsGraphUp className="mr-2 text-indigo-500" /> Announcements
              </h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <div key={announcement.announcement_id} className="px-4 sm:px-5 py-4 hover:bg-gray-50 transition">
                    <p className="text-sm font-semibold text-gray-800">{announcement.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Posted on {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="mt-2 text-gray-500">No announcements found</p>
                </div>
              )}
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 max-h-[400px] overflow-y-auto">
              <div className="px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FiCalendar className="mr-2 text-purple-500" /> Your Tasks
                </h2>
                <button
                  className="text-blue-500 text-sm font-medium hover:text-blue-700 flex items-center absolute right-6 top-5"
                  onClick={handleViewAllTasks}
                >
                  View All <span className="ml-1">→</span>
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {tasks.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <FiCheckCircle className="mx-auto text-gray-300" size={48} />
                    <p className="mt-2 text-gray-500">No tasks found</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`text-gray-800 font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{task.project}</span>
                            <span className="mx-2">•</span>
                            <span>Due {formatDate(task.dueDate)}</span>
                          </div>
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Popups */}
      {isFeedbackOpen && (
        <ClientFeedbackPopup onClose={() => setIsFeedbackOpen(false)} />
      )}
      {isMessagesOpen && (
        <MessagesPopup onClose={() => setIsMessagesOpen(false)} />
      )}
    </div>
  );
}

const StatCard = ({ title, value, change, icon, color, onClick }) => (
  <div
    onClick={onClick}
    className={`${color} rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition cursor-pointer`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className={`text-xs mt-1 ${change.includes('+') ? 'text-green-600' : 'text-gray-500'}`}>
          {change}
        </p>
      </div>
      <div className="p-2 bg-white rounded-lg shadow-xs">
        {icon}
      </div>
    </div>
  </div>
);

export default AdminDashboard;