import { useEditor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Minus,
  Undo,
  Redo,
  Table,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: ReturnType<typeof useEditor>;
  onImageUpload?: () => void;
}

export default function EditorToolbar({ editor, onImageUpload }: EditorToolbarProps) {
  if (!editor) return null;

  const Button = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
        <Button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Rückgängig"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Wiederholen"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Fett"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Kursiv"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Code"
        >
          <Code className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Überschrift 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Überschrift 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Überschrift 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Aufzählung"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Nummerierte Liste"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Zitat"
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code-Block"
        >
          <Code2 className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontale Linie"
        >
          <Minus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
        <Button
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          title="Tabelle einfügen"
        >
          <Table className="w-4 h-4" />
        </Button>
        {editor.isActive('table') && (
          <Button
            onClick={() => editor.chain().focus().deleteTable().run()}
            title="Tabelle löschen"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
        {onImageUpload && (
          <Button onClick={onImageUpload} title="Bild einfügen">
            <ImageIcon className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          onClick={() => editor.chain().focus().toggleCallout({ type: 'info' }).run()}
          isActive={editor.isActive('callout', { type: 'info' })}
          title="Info Callout"
        >
          <Info className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCallout({ type: 'warning' }).run()}
          isActive={editor.isActive('callout', { type: 'warning' })}
          title="Warnung Callout"
        >
          <AlertTriangle className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCallout({ type: 'success' }).run()}
          isActive={editor.isActive('callout', { type: 'success' })}
          title="Erfolg Callout"
        >
          <CheckCircle className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCallout({ type: 'error' }).run()}
          isActive={editor.isActive('callout', { type: 'error' })}
          title="Fehler Callout"
        >
          <XCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

