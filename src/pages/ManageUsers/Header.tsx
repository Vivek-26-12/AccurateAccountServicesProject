import React from 'react';
import { Plus, Search } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddUser: () => void;
  activeTab: 'users' | 'clients' | 'groups';
  setActiveTab: (tab: 'users' | 'clients' | 'groups') => void;
  userRole?: string;
}

export function Header({
  searchTerm,
  setSearchTerm,
  onAddUser,
  activeTab,
  setActiveTab,
  userRole
}: HeaderProps) {
  const tabs = (['users', 'clients', 'groups'] as const).filter(tab =>
    userRole === 'employee' ? tab !== 'users' : true
  );

  return (
    <div className="bg-white/70 backdrop-blur-xl shadow-lg rounded-xl border border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col space-y-6 md:flex-row md:items-center md:justify-between">
          {/* Title */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-8 md:space-y-0">
            <h1 className="text-3xl font-bold text-gray-900 tracking-wide">
              {userRole === 'employee' ? 'Manage Clients' : 'User Management'}
            </h1>
          </div>

          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-6 md:space-y-0">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-sm"
              />
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 capitalize ${activeTab === tab
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Add User Button */}
            <button
              onClick={onAddUser}
              className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white font-medium rounded-lg shadow-lg transition-all duration-200 transform active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}