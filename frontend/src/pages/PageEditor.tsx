import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { ArrowLeft, Save } from 'lucide-react';
import { pageService } from '../services/pageService';
import { useSocket } from '../hooks/useSocket';
import type { Page } from '../types';

export default function PageEditor() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { socket, connected } = useSocket();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Beginne mit dem Schreiben...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      if (pageId && socket && connected) {
        socket.emit('content-update', {
          pageId,
          content,
        });
      }
    },
  });

  useEffect(() => {
    if (pageId) {
      loadPage();
      if (socket) {
        socket.emit('join-page', pageId);
        return () => {
          socket.emit('leave-page', pageId);
        };
      }
    }
  }, [pageId, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('content-update', (data: { content: any }) => {
        if (editor && data.content) {
          editor.commands.setContent(data.content, false);
        }
      });

      return () => {
        socket.off('content-update');
      };
    }
  }, [socket, editor]);

  const loadPage = async () => {
    try {
      const data = await pageService.getById(pageId!);
      setPage(data);
      if (editor && data.content) {
        editor.commands.setContent(data.content);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Seite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = useCallback(async () => {
    if (!editor || !pageId) return;

    setSaving(true);
    try {
      const content = editor.getJSON();
      await pageService.update(pageId, content);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    } finally {
      setSaving(false);
    }
  }, [editor, pageId]);

  // Auto-save every 3 seconds
  useEffect(() => {
    if (!editor || !pageId) return;

    const interval = setInterval(() => {
      handleSave();
    }, 3000);

    return () => clearInterval(interval);
  }, [editor, pageId, handleSave]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Lädt...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Seite nicht gefunden</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">{page.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Gespeichert: {lastSaved.toLocaleTimeString('de-DE')}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Speichert...' : 'Speichern'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}



