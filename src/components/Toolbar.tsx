import React from 'react';
import { 
  Bold, Italic, List, Heading1, Heading2, Code, 
  Link, Image, Table, CheckSquare, Archive, History,
  Share, Download, Upload
} from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface ToolbarProps {
  onAction: (action: string) => void;
}

export default function Toolbar({ onAction }: ToolbarProps) {
  const { theme } = useTheme();

  const tools = [
    { icon: Bold, action: 'bold', tooltip: 'Bold (Ctrl+B)' },
    { icon: Italic, action: 'italic', tooltip: 'Italic (Ctrl+I)' },
    { icon: List, action: 'list', tooltip: 'List (Ctrl+L)' },
    { icon: Heading1, action: 'h1', tooltip: 'Heading 1' },
    { icon: Heading2, action: 'h2', tooltip: 'Heading 2' },
    { icon: Code, action: 'code', tooltip: 'Code Block (Ctrl+`)' },
    { icon: Link, action: 'link', tooltip: 'Insert Link (Ctrl+K)' },
    { icon: Image, action: 'image', tooltip: 'Insert Image' },
    { icon: Table, action: 'table', tooltip: 'Insert Table' },
    { icon: CheckSquare, action: 'todo', tooltip: 'Add Todo' },
    { icon: Archive, action: 'archive', tooltip: 'Archive Note' },
    { icon: History, action: 'history', tooltip: 'Version History' },
    { icon: Share, action: 'share', tooltip: 'Share Note' },
    { icon: Download, action: 'export', tooltip: 'Export Note' },
    { icon: Upload, action: 'import', tooltip: 'Import Note' },
  ];

  return (
    <div className={`flex items-center space-x-1 p-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b`}>
      {tools.map(({ icon: Icon, action, tooltip }) => (
        <button
          key={action}
          onClick={() => onAction(action)}
          className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          title={tooltip}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}