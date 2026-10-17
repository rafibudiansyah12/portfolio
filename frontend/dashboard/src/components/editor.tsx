import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';
import { Bold, Heading2, Italic, List, ListOrdered, Quote } from 'lucide-react';
import { useEffect } from 'react';

export function RichEditor({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    editorProps: { attributes: { 'aria-label': label, class: 'rich-editor-content' } },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value)
      editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  return (
    <div className="field editor-field">
      <span>{label}</span>
      <div className="editor-shell">
        <div className="editor-toolbar">
          <button
            type="button"
            aria-label="Tebal"
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            aria-label="Miring"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            aria-label="Judul"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 size={15} />
          </button>
          <button
            type="button"
            aria-label="Daftar"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List size={15} />
          </button>
          <button
            type="button"
            aria-label="Daftar bernomor"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={15} />
          </button>
          <button
            type="button"
            aria-label="Kutipan"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            <Quote size={15} />
          </button>
        </div>
        <EditorContent editor={editor} />
      </div>
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}
