import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMail,
  FiLogOut,
  FiX,
  FiUser,
  FiCalendar,
  FiClock,
  FiEdit2
} from 'react-icons/fi';
import { useAuth } from '../Data/AuthData';
import axios from 'axios';
import API_BASE_URL from '../config';

const defaultProfilePic =
  "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38764.jpg?semt=ais_hybrid";

const ProfileUser = ({ isOpen, onClose }) => {
  const { logout, user: authUser } = useAuth();
  const navigate = useNavigate();
  const modalRef = useRef();

  const [userData, setUserData] = useState({
    name: 'Guest User',
    email: 'guest@example.com',
    profileImage: defaultProfilePic,
    phone: Number,
    joinDate: new Date(),
    lastUpdate: new Date(),
    userId: null,
    authId: null
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (authUser?.auth_id) {
      axios
        .get(`${API_BASE_URL}/users/${authUser.auth_id}`)
        .then((res) => {
          const data = res.data;
          setUserData({
            name: `${data.first_name} ${data.last_name}` || 'Guest User',
            email: data.email || 'guest@example.com',
            profileImage: defaultProfilePic,
            phone: data.phone,
            joinDate: new Date(data.created_at),
            lastUpdate: new Date(data.updated_at),
            userId: data.user_id,
            authId: data.auth_id
          });
        })
        .catch((err) => {
          console.error("Failed to load user details:", err);
        });
    }
  }, [authUser]);

  if (!isOpen || !authUser) return null;

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date || isNaN(date.getTime())) return 'Unknown time';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = () => {
    switch (authUser.role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'employee':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm transition-opacity duration-300">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-96 max-w-[90vw] relative animate-fade-in-up"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          aria-label="Close profile"
        >
          <FiX size={20} />
        </button>

        <div className="flex flex-col items-center">
          <div className="relative mb-4 group">
            <div className="relative">
              <img
                src={userData.profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
              />
              {authUser.role !== "client" && (
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiEdit2 className="text-white" />
                </div>
              )}
            </div>
            <span
              className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor()}`}
            >
              {authUser.role.toUpperCase()}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {userData.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 flex items-center mt-1">
            <FiMail className="mr-2" /> {userData.email}
          </p>

          <div className="mt-4 w-full space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <FiCalendar className="text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Phone Number </span>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {userData.phone}
              </span>
            </div>

            {/* <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <FiClock className="text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Last updated</span>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {formatDate(userData.lastUpdate)} at {formatTime(userData.lastUpdate)}
              </span>
            </div> */}

            {/* <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <FiUser className="text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-300">User ID</span>
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {userData.userId}
              </span>
            </div> */}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex-1 mr-2 text-gray-800 dark:text-white"
          >
            Close
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex-1"
          >
            <FiLogOut className="inline mr-2" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileUser;
