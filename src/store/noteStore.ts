import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  category: string;
  isPinned?: boolean;
  wordCount?: number;
  readTime?: number;
  tags: string[];
  dueDate?: Date | null;
  template?: string;
  version: number;
  versions: {
    content: string;
    timestamp: Date;
    version: number;
  }[];
  collaborators: string[];
  isArchived: boolean;
  attachments: {
    id: string;
    type: string;
    url: string;
    name: string;
  }[];
  todos: {
    id: string;
    text: string;
    completed: boolean;
    dueDate?: Date;
  }[];
}

interface NoteStore {
  notes: Note[];
  templates: {
    id: string;
    name: string;
    content: string;
  }[];
  categories: string[];
  tags: string[];
  selectedNote: string | null;
  searchTerm: string;
  selectedCategory: string;
  isPreviewMode: boolean;
  createNote: (template?: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setSelectedNote: (id: string | null) => void;
  addTemplate: (name: string, content: string) => void;
  addTag: (noteId: string, tag: string) => void;
  removeTag: (noteId: string, tag: string) => void;
  addTodo: (noteId: string, text: string, dueDate?: Date) => void;
  toggleTodo: (noteId: string, todoId: string) => void;
  addAttachment: (noteId: string, attachment: { type: string; url: string; name: string }) => void;
  archiveNote: (id: string) => void;
  restoreNote: (id: string) => void;
  addCollaborator: (noteId: string, email: string) => void;
  removeCollaborator: (noteId: string, email: string) => void;
  createVersion: (noteId: string) => void;
  revertToVersion: (noteId: string, version: number) => void;
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      notes: [],
      templates: [
        {
          id: 'meeting',
          name: 'Meeting Notes',
          content: '# Meeting: [Title]\n\n## Date: [Date]\n\n## Attendees\n- \n\n## Agenda\n1. \n\n## Notes\n\n## Action Items\n- [ ] ',
        },
        {
          id: 'journal',
          name: 'Daily Journal',
          content: '# Journal Entry: [Date]\n\n## Mood\n\n## Highlights\n- \n\n## Thoughts\n\n## Goals for Tomorrow\n- ',
        },
      ],
      categories: [],
      tags: [],
      selectedNote: null,
      searchTerm: '',
      selectedCategory: 'all',
      isPreviewMode: false,

      createNote: (template) => {
        const notes = get().notes;
        const newNote: Note = {
          id: Date.now().toString(),
          title: 'Untitled Note',
          content: template ? get().templates.find(t => t.id === template)?.content || '' : '',
          lastModified: new Date(),
          category: get().selectedCategory === 'all' ? '' : get().selectedCategory,
          isPinned: false,
          wordCount: 0,
          readTime: 0,
          tags: [],
          version: 1,
          versions: [],
          collaborators: [],
          isArchived: false,
          attachments: [],
          todos: [],
        };
        set({ notes: [newNote, ...notes], selectedNote: newNote.id });
      },

      updateNote: (id, updates) => {
        const notes = get().notes.map(note => {
          if (note.id === id) {
            const updatedNote = { ...note, ...updates, lastModified: new Date() };
            if (updates.content !== undefined) {
              const words = updates.content.trim().split(/\s+/).length;
              updatedNote.wordCount = words;
              updatedNote.readTime = Math.ceil(words / 200);
            }
            return updatedNote;
          }
          return note;
        });
        set({ notes });
      },

      deleteNote: (id) => {
        const notes = get().notes.filter(note => note.id !== id);
        set({ 
          notes,
          selectedNote: notes[0]?.id || null
        });
      },

      setSelectedNote: (id) => set({ selectedNote: id }),

      addTemplate: (name, content) => {
        const templates = [...get().templates, {
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          content
        }];
        set({ templates });
      },

      addTag: (noteId, tag) => {
        const notes = get().notes.map(note => {
          if (note.id === noteId && !note.tags.includes(tag)) {
            return { ...note, tags: [...note.tags, tag] };
          }
          return note;
        });
        set({ notes });
      },

      removeTag: (noteId, tag) => {
        const notes = get().notes.map(note => {
          if (note.id === noteId) {
            return { ...note, tags: note.tags.filter(t => t !== tag) };
          }
          return note;
        });
        set({ notes });
      },

      addTodo: (noteId, text, dueDate) => {
        const notes = get().notes.map(note => {
          if (note.id === noteId) {
            return {
              ...note,
              todos: [...note.todos, {
                id: Date.now().toString(),
                text,
                completed: false,
                dueDate
              }]
            };
          }
          return note;
        });
        set({ notes });
      },

      toggleTodo: (noteId, todoId) => {
        const notes = get().notes.map(note => {
          if (note.id === noteId) {
            return {
              ...note,
              todos: note.todos.map(todo => 
                todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
              )
            };
          }
          return note;
        });
        set({ notes });
      },

      addAttachment: (noteId, attachment) => {
        const notes = get().notes.map(note => {
          if (note.id === noteId) {
            return {
              ...note,
              attachments: [...note.attachments, { id: Date.now().toString(), ...attachment }]
            };
          }
          return note;
        });
        set({ notes });
      },

      archiveNote: (id) => {
        const notes = get().notes.map(note => 
          note.id === id ? { ...note, isArchived: true } : note
        );
        set({ notes });
      },

      restoreNote: (id) => {
        const notes = get().notes.map(note => 
          note.id === id ? { ...note, isArchived: false } : note
        );
        set({ notes });
      },

      addCollaborator: (noteId, email) => {
        const notes = get().notes.map(note => {
          if (note.id === noteId && !note.collaborators.includes(email)) {
            return { ...note, collaborators: [...note.collaborators, email] };
          }
          return note;
        });
        set({ notes });
      },

      removeCollaborator: (noteId, email) => {
        const notes = get().notes.map(note => {
          if (note.id === noteId) {
            return { ...note, collaborators: note.collaborators.filter(e => e !== email) };
          }
          return note;
        });
        set({ notes });
      },

      createVersion: (noteId) => {
        const notes = get().notes.map(note => {
          if (note.id === noteId) {
            const newVersion = note.version + 1;
            return {
              ...note,
              version: newVersion,
              versions: [...note.versions, {
                content: note.content,
                timestamp: new Date(),
                version: newVersion
              }]
            };
          }
          return note;
        });
        set({ notes });
      },

      revertToVersion: (noteId, version) => {
        const notes = get().notes.map(note => {
          if (note.id === noteId) {
            const targetVersion = note.versions.find(v => v.version === version);
            if (targetVersion) {
              return {
                ...note,
                content: targetVersion.content,
                lastModified: new Date()
              };
            }
          }
          return note;
        });
        set({ notes });
      }
    }),
    {
      name: 'note-store'
    }
  )
);