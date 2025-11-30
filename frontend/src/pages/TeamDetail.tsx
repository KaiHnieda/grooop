import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, ArrowLeft, UserPlus, Trash2, Folder } from 'lucide-react';
import { teamService } from '../services/teamService';
import { workspaceService } from '../services/workspaceService';
import type { Team, Workspace } from '@groop/shared';

export default function TeamDetail() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');

  useEffect(() => {
    if (teamId) {
      loadTeam();
      loadWorkspaces();
    }
  }, [teamId]);

  const loadTeam = async () => {
    try {
      const data = await teamService.getById(teamId!);
      setTeam(data);
    } catch (error) {
      console.error('Fehler beim Laden des Teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspaces = async () => {
    try {
      const allWorkspaces = await workspaceService.getAll();
      const teamWorkspaces = allWorkspaces.filter((w: any) => w.teamId === teamId);
      setWorkspaces(teamWorkspaces);
    } catch (error) {
      console.error('Fehler beim Laden der Arbeitsbereiche:', error);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim() || !teamId) return;

    try {
      await teamService.addMember(teamId, memberEmail);
      setMemberEmail('');
      setShowAddMember(false);
      loadTeam();
    } catch (error: any) {
      alert(error.message || 'Fehler beim Hinzufügen des Mitglieds');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Möchten Sie dieses Mitglied wirklich entfernen?')) return;

    try {
      await teamService.removeMember(teamId!, userId);
      loadTeam();
    } catch (error) {
      console.error('Fehler beim Entfernen des Mitglieds:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Lädt...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Team nicht gefunden</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/teams')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zu Teams</span>
        </button>
        <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
        {team.description && (
          <p className="text-gray-600">{team.description}</p>
        )}
      </div>

      {/* Members Section */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Mitglieder ({team.members?.length || 0})
          </h2>
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Mitglied hinzufügen
          </button>
        </div>

        {showAddMember && (
          <form onSubmit={handleAddMember} className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-2">
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="E-Mail-Adresse des Benutzers..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
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
          {team.members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                  {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium">{member.user?.name || 'Unbekannt'}</p>
                  <p className="text-sm text-gray-500">{member.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                  {member.role}
                </span>
                {member.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workspaces Section */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Folder className="w-5 h-5" />
          Arbeitsbereiche ({workspaces.length})
        </h2>
        {workspaces.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Noch keine Arbeitsbereiche in diesem Team.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                to={`/workspaces/${workspace.id}`}
                className="card hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-1">{workspace.name}</h3>
                {workspace.description && (
                  <p className="text-sm text-gray-500">{workspace.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

