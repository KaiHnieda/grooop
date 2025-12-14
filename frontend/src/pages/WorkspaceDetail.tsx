import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, FileText, ArrowLeft, Palette, Users, UserPlus, Trash2 } from 'lucide-react';
import { workspaceService } from '../services/workspaceService';
import { pageService } from '../services/pageService';
import { SkeletonList, Skeleton } from '../components/Skeleton';
import Spinner from '../components/Spinner';
import WorkspaceCustomizeModal from '../components/WorkspaceCustomizeModal';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../contexts/ToastContext';
import type { Workspace, Page, WorkspaceMember } from '../types';

export default function WorkspaceDetail() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const user = useAuthStore((state) => state.user);
  const { success, error } = useToast();

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
    } catch (error: any) {
      console.error('Fehler beim Laden des Arbeitsbereichs:', error);
      if (error.response?.status === 404) {
        // Workspace nicht gefunden - zurück zum Dashboard
        navigate('/dashboard');
      } else if (error.response?.status === 401) {
        // Nicht autorisiert - wird bereits vom API-Interceptor behandelt
      } else {
        console.error('Unerwarteter Fehler:', error.response?.data || error.message);
      }
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

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim() || !workspaceId) return;

    try {
      await workspaceService.addMember(workspaceId, memberEmail);
      setMemberEmail('');
      setShowAddMember(false);
      success('Mitglied erfolgreich hinzugefügt');
      loadWorkspace();
    } catch (err: any) {
      error(err.response?.data?.error || 'Fehler beim Hinzufügen des Mitglieds');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!workspaceId) return;
    if (!confirm('Möchtest du dieses Mitglied wirklich entfernen?')) return;

    try {
      await workspaceService.removeMember(workspaceId, userId);
      success('Mitglied erfolgreich entfernt');
      loadWorkspace();
    } catch (err: any) {
      error(err.response?.data?.error || 'Fehler beim Entfernen des Mitglieds');
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceId || !workspace) return;
    if (!confirm(`Möchtest du den Arbeitsbereich "${workspace.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return;
    }

    try {
      await workspaceService.delete(workspaceId);
      success('Arbeitsbereich erfolgreich gelöscht');
      navigate('/');
    } catch (err: any) {
      error(err.response?.data?.error || 'Fehler beim Löschen des Arbeitsbereichs');
    }
  };

  // Check if current user can manage members (owner or admin)
  const canManageMembers = () => {
    if (!workspace || !user) return false;
    if (workspace.ownerId === user.id) return true;
    const currentMember = workspace.members?.find((m: WorkspaceMember) => m.userId === user.id);
    return currentMember?.role === 'owner' || currentMember?.role === 'admin';
  };

  // Get current user's role in workspace
  const getCurrentUserRole = () => {
    if (!workspace || !user) return null;
    if (workspace.ownerId === user.id) return 'owner';
    const currentMember = workspace.members?.find((m: WorkspaceMember) => m.userId === user.id);
    return currentMember?.role || null;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Skeleton variant="text" width={300} height={32} />
        </div>
        <SkeletonList count={5} />
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
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zurück</span>
          </button>
          <div className="flex items-center gap-2">
            {canManageMembers() && (
              <button
                onClick={handleDeleteWorkspace}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                title="Arbeitsbereich löschen"
              >
                <Trash2 className="w-4 h-4" />
                <span>Löschen</span>
              </button>
            )}
            <button
              onClick={() => setShowCustomizeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Palette className="w-4 h-4" />
              <span>Anpassen</span>
            </button>
          </div>
        </div>
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

      {/* Members Section */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Mitglieder ({workspace.members?.length || 0})
          </h2>
          {canManageMembers() && (
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Mitglied hinzufügen
            </button>
          )}
        </div>

        {showAddMember && (
          <form onSubmit={handleAddMember} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex gap-2">
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="E-Mail-Adresse des Benutzers..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                required
              />
              <button type="submit" className="btn-primary">
                Einladen
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddMember(false);
                  setMemberEmail('');
                }}
                className="btn-secondary"
              >
                Abbrechen
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {/* Owner */}
          {workspace.owner && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                  {workspace.owner.name?.charAt(0).toUpperCase() || 'O'}
                </div>
                <div>
                  <p className="font-medium dark:text-white">{workspace.owner.name || 'Unbekannt'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{workspace.owner.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded">
                  Owner
                </span>
              </div>
            </div>
          )}

          {/* Members */}
          {workspace.members?.map((member: WorkspaceMember) => {
            // Skip if this member is the owner (already shown above)
            if (member.userId === workspace.ownerId) return null;
            
            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                    {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium dark:text-white">{member.user?.name || 'Unbekannt'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded">
                    {member.role}
                  </span>
                  {canManageMembers() && member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400 transition-colors"
                      title="Mitglied entfernen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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

      {showCustomizeModal && workspace && (
        <WorkspaceCustomizeModal
          workspace={workspace}
          onClose={() => setShowCustomizeModal(false)}
          onUpdate={(updated) => {
            setWorkspace(updated);
            setShowCustomizeModal(false);
          }}
          onDelete={() => {
            navigate('/');
          }}
        />
      )}
    </div>
  );
}


