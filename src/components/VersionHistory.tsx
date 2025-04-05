import React from 'react';
import { format } from 'date-fns';
import { History, RotateCcw } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { Note } from '../store/noteStore';

interface VersionHistoryProps {
  note: Note;
  onRevert: (version: number) => void;
  onClose: () => void;
}

export default function VersionHistory({ note, onRevert, onClose }: VersionHistoryProps) {
  const { theme } = useTheme();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
      <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} 
        rounded-lg shadow-xl w-full max-w-md`}>
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">Version History</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
          {note.versions.map((version) => (
            <div
              key={version.version}
              className={`p-3 rounded-lg mb-2 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Version {version.version}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(version.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <button
                  onClick={() => onRevert(version.version)}
                  className="flex items-center text-blue-500 hover:text-blue-600"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Revert
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}