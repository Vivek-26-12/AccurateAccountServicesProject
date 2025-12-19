import React from 'react';
import { Building2, User, Star, Folder, Clock } from 'lucide-react';

interface ClientCardProps {
  name: string;
  company: string;
  folders: string[];
  clientId: number;
  userId: number;
  isFavorite: boolean;
  isRecent?: boolean;
  onFavoriteToggle: (clientId: number, isFavorite: boolean) => Promise<void>;
  onSelect: (name: string, id: number) => void;
}

export function ClientCard({ 
  name, 
  company, 
  folders, 
  clientId,
  userId,
  isFavorite,
  isRecent,
  onFavoriteToggle,
  onSelect 
}: ClientCardProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onFavoriteToggle(clientId, !isFavorite);
    } catch (error) {
      console.error('Error updating favorite:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => onSelect(name, clientId)}
        className={`w-full p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start space-y-3 group border ${
          isRecent ? 'border-blue-200' : 'border-gray-100'
        } hover:border-blue-100 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

        {isRecent && (
          <div className="absolute top-3 left-3 flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Recent
          </div>
        )}

        <div className="flex items-center space-x-4 w-full mt-2">
          <div className={`p-3 rounded-xl group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors shadow-inner ${
            isRecent 
              ? 'bg-gradient-to-br from-blue-200 to-indigo-200'
              : 'bg-gradient-to-br from-blue-100 to-indigo-100'
          }`}>
            <User className={`w-6 h-6 ${
              isRecent ? 'text-blue-800' : 'text-blue-700'
            }`} />
          </div>

          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800 block">{name}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <Building2 className="w-4 h-4 mr-2 text-gray-400" />
              {company}
            </div>
          </div>
        </div>

        {folders.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
            {folders.map((folder, idx) => (
              <span key={idx} className="flex items-center bg-gray-100 px-2 py-1 rounded-full text-xs">
                <Folder className="w-3 h-3 mr-1 text-yellow-600" />
                {folder}
              </span>
            ))}
          </div>
        )}
      </button>

      <button 
        onClick={handleFavoriteClick}
        disabled={isProcessing}
        className={`absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-colors ${
          isProcessing ? 'cursor-not-allowed' : 'hover:bg-yellow-50'
        }`}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Star 
          className={`w-5 h-5 transition-colors ${
            isFavorite ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
          } ${isProcessing ? 'opacity-50' : ''}`} 
        />
      </button>
    </div>
  );
}