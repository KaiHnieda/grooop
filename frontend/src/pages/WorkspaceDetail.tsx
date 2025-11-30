import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, FileText, ArrowLeft } from 'lucide-react';
import { workspaceService } from '../services/workspaceService';
import { pageService } from '../services/pageService';
import type { Workspace, Page } from '@groop/shared';

export default function WorkspaceDetail() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  useEffect(() => {
    if (workspaceId) {
      loadWorkspace();
      loadPages();
    }
  }, [workspaceId]);

  const loadWorkspace = async () => {
    try {
      const data = await workspaceService.getById(workspaceId!);
      setWorkspace(data);
    } catch (error) {
      console.error('Fehler beim Laden des Arbeitsbereichs:', error);
    }
  };

  const loadPages = async () => {
    try {
      const data = await pageService.getByWorkspace(workspaceId!);
      setPages(data);
    } catch (error) {
      console.error('Fehler beim Laden der Seiten:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim() || !workspaceId) return;

    try {
      const page = await pageService.create({
        title: newPageTitle,
        workspaceId,
      });
      navigate(`/pages/${page.id}`);
    } catch (error) {
      console.error('Fehler beim Erstellen der Seite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Lädt...</div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Arbeitsbereich nicht gefunden</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück</span>
        </button>
        <h1 className="text-3xl font-bold mb-2">{workspace.name}</h1>
        {workspace.description && (
          <p className="text-gray-600 mb-2">{workspace.description}</p>
        )}
        {workspace.team && (
          <div className="flex items-center gap-2 text-sm text-primary-600">
            <span>Team:</span>
            <Link
              to={`/teams/${workspace.team.id}`}
              className="font-medium hover:underline"
            >
              {workspace.team.name}
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Seiten</h2>
        <button
          onClick={() => setShowCreatePage(!showCreatePage)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Neue Seite
        </button>
      </div>

      {showCreatePage && (
        <form onSubmit={handleCreatePage} className="card mb-6">
          <div className="mb-4">
            <label htmlFor="page-title" className="block text-sm font-medium text-gray-700 mb-1">
              Seitentitel
            </label>
            <input
              id="page-title"
              type="text"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              placeholder="Titel der Seite..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              Erstellen
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreatePage(false);
                setNewPageTitle('');
              }}
              className="btn-secondary"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {pages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="mb-4">Noch keine Seiten vorhanden.</p>
          <button onClick={() => setShowCreatePage(true)} className="btn-primary">
            Erste Seite erstellen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <Link
              key={page.id}
              to={`/pages/${page.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <FileText className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-semibold text-lg mb-1">{page.title}</h3>
              <p className="text-sm text-gray-500">
                Zuletzt bearbeitet: {new Date(page.updatedAt).toLocaleDateString('de-DE')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


