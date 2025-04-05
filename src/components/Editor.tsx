import { useCallback, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { CodeHighlightPlugin } from '@lexical/react/LexicalCodeHighlightPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { useTheme } from '../ThemeContext';

const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
    h5: 'editor-heading-h5'
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem'
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem'
  },
  image: 'editor-image',
  link: 'editor-link',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
    code: 'editor-text-code',
    strikethrough: 'editor-text-strikethrough',
    underlineStrikethrough: 'editor-text-underlineStrikethrough'
  }
};

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function Editor({ content, onChange }: EditorProps) {
  const { theme: appTheme } = useTheme();

  const initialConfig = {
    namespace: 'SageNote',
    theme,
    onError: (error: Error) => {
      console.error(error);
    },
  };

  const handleChange = useCallback((editorState: any) => {
    editorState.read(() => {
      const markdown = JSON.stringify(editorState.toJSON());
      onChange(markdown);
    });
  }, [onChange]);

  return (
    <div className={`editor-container ${appTheme === 'dark' ? 'dark' : ''}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<div className="editor-placeholder">Start writing...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <CodeHighlightPlugin />
          <MarkdownShortcutPlugin />
        </div>
      </LexicalComposer>
    </div>
  );
}