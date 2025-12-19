import React from 'react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  Award,
  Shield,
  Clock,
  FileText,
  UserCircle,
  Smartphone,
  Key
} from 'lucide-react';

interface User {
  user_id: number;
  auth_id: number;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  profile_pic?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const getStatusColor = (role?: string | null) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'bg-purple-500';
    case 'employee':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'Not available';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const DetailItem = ({ 
  icon, 
  label, 
  value,
  className = ''
}: { 
  icon: React.ReactNode, 
  label: string, 
  value?: string | null,
  className?: string 
}) => (
  <div className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${className}`}>
    <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-gray-900 font-medium break-words">
        {value || <span className="text-gray-400">Not provided</span>}
      </p>
    </div>
  </div>
);

export function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-100 flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 relative">
              {user.profile_pic ? (
                <img
                  className="h-20 w-20 rounded-xl object-cover border-2 border-gray-200"
                  src={user.profile_pic}
                  alt={`${user.first_name} ${user.last_name}`}
                />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-2 border-gray-200">
                  <UserCircle className="h-10 w-10 text-blue-600" />
                </div>
              )}
              <span className={`absolute -bottom-2 -right-2 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(user.role)}`}></span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.first_name || 'Unknown'} {user.last_name}
              </h2>
              <div className="flex items-center mt-2 space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.role)} text-white`}>
                  {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                </span>
                {user.email && (
                  <a 
                    href={`mailto:${user.email}`} 
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    <Mail className="w-4 h-4 mr-1" /> Contact
                  </a>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-blue-500" />
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl">
              <DetailItem 
                icon={<UserCircle className="w-5 h-5 text-gray-600" />}
                label="First Name"
                value={user.first_name}
                className="bg-white"
              />
              <DetailItem 
                icon={<UserCircle className="w-5 h-5 text-gray-600" />}
                label="Last Name"
                value={user.last_name}
                className="bg-white"
              />
              <DetailItem 
                icon={<Mail className="w-5 h-5 text-gray-600" />}
                label="Email"
                value={user.email}
                className="bg-white"
              />
              <DetailItem 
                icon={<Smartphone className="w-5 h-5 text-gray-600" />}
                label="Phone"
                value={user.phone}
                className="bg-white"
              />
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Key className="w-5 h-5 mr-2 text-blue-500" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl">
              <DetailItem 
                icon={<Briefcase className="w-5 h-5 text-gray-600" />}
                label="Role"
                value={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Not specified'}
                className="bg-white"
              />
              <DetailItem 
                icon={<Calendar className="w-5 h-5 text-gray-600" />}
                label="Member Since"
                value={formatDate(user.created_at)}
                className="bg-white"
              />
              <DetailItem 
                icon={<Clock className="w-5 h-5 text-gray-600" />}
                label="Last Updated"
                value={formatDate(user.updated_at)}
                className="bg-white"
              />
              <DetailItem 
                icon={<Shield className="w-5 h-5 text-gray-600" />}
                label="User ID"
                value={user.user_id.toString()}
                className="bg-white"
              />
            </div>
          </div>

          {/* Role Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-500" />
              Role Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-xl">
              {user.role?.toLowerCase() === 'admin' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Admin</span> users have full access to all system features and settings.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">User Management</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">System Settings</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Data Access</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Permissions</span>
                  </div>
                </div>
              )}
              {user.role?.toLowerCase() === 'employee' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Employees</span> have access to their own workspace and assigned tasks.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Task Management</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Personal Workspace</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Team Collaboration</span>
                  </div>
                </div>
              )}
              {!user.role && (
                <p className="text-sm text-gray-700">
                  No specific role assigned. This user has limited access.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
} 