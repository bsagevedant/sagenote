import React, { useState, useEffect } from 'react';
import { Save, Menu, Plus, Trash2, Sun, Moon, Twitter, X, Search, Download, Tag, Check, Pin, PinOff, Clock, FileText } from 'lucide-react';
import { useTheme } from './ThemeContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import hotkeys from 'hotkeys-js';

interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  category: string;
  isPinned?: boolean;
  wordCount?: number;
  readTime?: number;
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Setup keyboard shortcuts
  useEffect(() => {
    hotkeys('ctrl+s, command+s', (event) => {
      event.preventDefault();
      // Save is automatic, but we can show a notification here
      console.log('Saved!');
    });

    hotkeys('ctrl+b, command+b', (event) => {
      event.preventDefault();
      if (selectedNote) {
        const note = notes.find(n => n.id === selectedNote);
        if (note) {
          const textarea = document.querySelector('textarea');
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = note.content;
            const newText = text.substring(0, start) + '**' + text.substring(start, end) + '**' + text.substring(end);
            updateNote(selectedNote, { content: newText });
          }
        }
      }
    });

    hotkeys('ctrl+/, command+/', () => {
      setIsPreviewMode(!isPreviewMode);
    });

    return () => {
      hotkeys.unbind('ctrl+s, command+s');
      hotkeys.unbind('ctrl+b, command+b');
      hotkeys.unbind('ctrl+/, command+/');
    };
  }, [isPreviewMode, selectedNote, notes]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
    const uniqueCategories = Array.from(new Set(notes.map(note => note.category).filter(Boolean)));
    setCategories(uniqueCategories);
  }, [notes]);

  const calculateNoteStats = (content: string) => {
    const words = content.trim().split(/\s+/).length;
    const readTime = Math.ceil(words / 200); // Assuming 200 words per minute reading speed
    return { wordCount: words, readTime };
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      lastModified: new Date(),
      category: selectedCategory === 'all' ? '' : selectedCategory,
      isPinned: false,
      wordCount: 0,
      readTime: 0
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote.id);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(note => {
      if (note.id === id) {
        const updatedNote = { ...note, ...updates, lastModified: new Date() };
        if (updates.content !== undefined) {
          const stats = calculateNoteStats(updates.content);
          updatedNote.wordCount = stats.wordCount;
          updatedNote.readTime = stats.readTime;
        }
        return updatedNote;
      }
      return note;
    }));
  };

  const togglePin = (id: string) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, isPinned: !note.isPinned } : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNote === id) {
      setSelectedNote(notes[0]?.id || null);
    }
  };

  const handleNoteSelect = (id: string) => {
    setSelectedNote(id);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setSelectedCategory(newCategory);
      setNewCategory('');
    }
    setIsAddingCategory(false);
  };

  const exportNote = (note: Note) => {
    const blob = new Blob([`# ${note.title}\n\n${note.content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
  });

  const filteredNotes = sortedNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentNote = notes.find(note => note.id === selectedNote);

  const renderMarkdown = (content: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose max-w-none dark:prose-invert"
      components={{
        code({node, inline, className, children, ...props}) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={tomorrow}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className={`h-screen flex ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
        border-r flex flex-col fixed md:relative z-30 h-full
        ${isSidebarOpen ? 'w-full md:w-72' : 'w-0'} 
        transition-all duration-300 overflow-hidden`}>
        <div className={`p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>SageNote</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={createNewNote}
                className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                title="New Note (Ctrl+N)"
              >
                <Plus className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg md:hidden`}
                >
                  <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-2 pl-8 ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' 
                  : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-200'
              } rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <Search className={`absolute left-2 top-2.5 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
        </div>

        {/* Categories */}
        <div className={`p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Categories</h2>
            <button
              onClick={() => setIsAddingCategory(true)}
              className={`p-1 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded`}
            >
              <Plus className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
          {isAddingCategory ? (
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category"
                className={`flex-1 p-1 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' 
                    : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-200'
                } rounded border`}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              />
              <button
                onClick={addCategory}
                className={`p-1 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} text-white rounded`}
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : null}
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-2 py-1 rounded ${
                selectedCategory === 'all'
                  ? (theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-blue-100 text-blue-800')
                  : (theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')
              }`}
            >
              All Notes
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-2 py-1 rounded flex items-center ${
                  selectedCategory === category
                    ? (theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-blue-100 text-blue-800')
                    : (theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')
                }`}
              >
                <Tag className="w-4 h-4 mr-2" />
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className={`p-4 cursor-pointer border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} ${
                selectedNote === note.id 
                  ? (theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50')
                  : (theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
              }`}
              onClick={() => handleNoteSelect(note.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    {note.isPinned && (
                      <Pin className="w-4 h-4 mr-2 text-yellow-500" />
                    )}
                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'} truncate`}>
                      {note.title}
                    </h3>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1 truncate`}>
                    {note.content}
                  </p>
                  <div className="flex items-center mt-2 space-x-4">
                    {note.category && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {note.category}
                      </span>
                    )}
                    <span className={`text-xs flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FileText className="w-3 h-3 mr-1" />
                      {note.wordCount} words
                    </span>
                    <span className={`text-xs flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {note.readTime} min read
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(note.id);
                    }}
                    className={`p-1 ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} rounded transition-colors`}
                    title={note.isPinned ? "Unpin note" : "Pin note"}
                  >
                    {note.isPinned ? (
                      <PinOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Pin className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportNote(note);
                    }}
                    className={`p-1 ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} rounded transition-colors`}
                  >
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className={`p-1 ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} rounded transition-colors`}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(note.lastModified).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen relative md:ml-0">
        <div className={`${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} 
          border-b p-4 flex items-center justify-between sticky top-0 z-10`}>
          <div className="flex items-center flex-1 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors mr-2`}
            >
              <Menu className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            {currentNote && (
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={currentNote.title}
                  onChange={(e) => updateNote(currentNote.id, { title: e.target.value })}
                  className={`w-full text-xl font-semibold bg-transparent border-none outline-none truncate ${
                    theme === 'dark' ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
                  }`}
                  placeholder="Note title"
                />
                <div className="flex items-center space-x-4 mt-2">
                  <select
                    value={currentNote.category || ''}
                    onChange={(e) => updateNote(currentNote.id, { category: e.target.value })}
                    className={`text-sm ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-gray-100 text-gray-900 border-gray-200'
                    } rounded border px-2 py-1`}
                  >
                    <option value="">No Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => togglePin(currentNote.id)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded ${
                      currentNote.isPinned
                        ? 'text-yellow-500'
                        : (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')
                    }`}
                  >
                    {currentNote.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                    <span className="text-sm">{currentNote.isPinned ? 'Unpin' : 'Pin'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {currentNote && (
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-3 py-1 rounded ${
                  isPreviewMode
                    ? (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                    : (theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')
                }`}
                title="Toggle Preview (Ctrl+/)"
              >
                {isPreviewMode ? 'Edit' : 'Preview'}
              </button>
            )}
            <a
              href="https://x.com/sagevedant"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden md:flex items-center ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              <Twitter className="w-5 h-5" />
              <span className="ml-2">@sagevedant</span>
            </a>
            <button
              onClick={toggleTheme}
              className={`p-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
        {currentNote ? (
          isPreviewMode ? (
            <div className={`flex-1 p-4 md:p-6 overflow-auto ${
              theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'
            }`}>
              {renderMarkdown(currentNote.content)}
            </div>
          ) : (
            <textarea
              value={currentNote.content}
              onChange={(e) => updateNote(currentNote.id, { content: e.target.value })}
              className={`flex-1 p-4 md:p-6 resize-none outline-none ${
                theme === 'dark' 
                  ? 'bg-gray-900 text-white placeholder-gray-500' 
                  : 'bg-transparent text-gray-800 placeholder-gray-400'
              }`}
              placeholder="Start writing... (Markdown supported)"
            />
          )
        ) : (
          <div className={`flex-1 flex items-center justify-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            <div className="text-center p-4">
              <Plus className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg">Create a new note to get started</p>
            </div>
          </div>
        )}
        {currentNote && (
          <div className={`${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} 
            border-t p-4 flex justify-between items-center sticky bottom-0`}>
            <div className={`flex items-center space-x-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Last saved</span> {new Date(currentNote.lastModified).toLocaleTimeString()}
              </div>
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {currentNote.wordCount} words
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {currentNote.readTime} min read
              </div>
            </div>
            <button
              onClick={() => exportNote(currentNote)}
              className={`flex items-center px-3 py-1 rounded ${
                theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;