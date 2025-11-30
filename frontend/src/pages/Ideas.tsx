import { useState, useEffect } from 'react';
import { Plus, Lightbulb, Trash2 } from 'lucide-react';
import { ideaService } from '../services/ideaService';
import type { Idea } from '@groop/shared';

export default function Ideas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const data = await ideaService.getAll();
      setIdeas(data);
    } catch (error) {
      console.error('Fehler beim Laden der Ideen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await ideaService.create({ title, description: description || undefined });
      setTitle('');
      setDescription('');
      setShowCreateForm(false);
      loadIdeas();
    } catch (error) {
      console.error('Fehler beim Erstellen der Idee:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diese Idee wirklich löschen?')) return;

    try {
      await ideaService.delete(id);
      loadIdeas();
    } catch (error) {
      console.error('Fehler beim Löschen der Idee:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Lädt...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold">Ideen</h1>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Neue Idee
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="card mb-6">
          <div className="mb-4">
            <label htmlFor="idea-title" className="block text-sm font-medium text-gray-700 mb-1">
              Titel
            </label>
            <input
              id="idea-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titel der Idee..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="idea-description" className="block text-sm font-medium text-gray-700 mb-1">
              Beschreibung
            </label>
            <textarea
              id="idea-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreibung der Idee..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              Erstellen
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setTitle('');
                setDescription('');
              }}
              className="btn-secondary"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {ideas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="mb-4">Noch keine Ideen vorhanden.</p>
          <button onClick={() => setShowCreateForm(true)} className="btn-primary">
            Erste Idee erstellen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg flex-1">{idea.title}</h3>
                <button
                  onClick={() => handleDelete(idea.id)}
                  className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {idea.description && (
                <p className="text-gray-600 text-sm mb-3">{idea.description}</p>
              )}
              <p className="text-xs text-gray-400">
                {new Date(idea.createdAt).toLocaleDateString('de-DE')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


