import React from 'react';

interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  const filters = [
    { name: 'All', icon: '🔄' },
    { name: 'Recent', icon: '🕒' },
    { name: 'Favorites', icon: '⭐' }
  ];
  
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
      {filters.map((filter) => (
        <button
          key={filter.name}
          onClick={() => onFilterChange(filter.name)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
            activeFilter === filter.name
              ? 'bg-white shadow-sm' + 
                (filter.name === 'Favorites' ? ' text-yellow-600' : 
                 filter.name === 'Recent' ? ' text-blue-600' : ' text-gray-800')
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <span className="mr-2">{filter.icon}</span>
          {filter.name}
        </button>
      ))}
    </div>
  );
}