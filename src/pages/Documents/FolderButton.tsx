import React from 'react';
import { Folder, ChevronRight } from 'lucide-react';

interface FolderButtonProps {
  name: string;
  onClick: () => void;
}

export function FolderButton({ name, onClick }: FolderButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 group"
    >
      <div className="flex items-center">
        <div className="p-2 bg-yellow-50 rounded-lg mr-3 text-yellow-600">
          <Folder className="w-5 h-5" />
        </div>
        <span className="text-gray-700 font-medium">{name}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}