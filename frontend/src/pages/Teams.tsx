import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Plus, Settings, Trash2 } from 'lucide-react';
import { teamService } from '../services/teamService';
import { useCreateTeam } from '../contexts/CreateTeamContext';
import type { Team } from '@groop/shared';

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { openModal } = useCreateTeam();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await teamService.getAll();
      setTeams(data);
    } catch (error) {
      console.error('Fehler beim Laden der Teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie dieses Team wirklich löschen?')) return;

    try {
      await teamService.delete(id);
      loadTeams();
    } catch (error) {
      console.error('Fehler beim Löschen des Teams:', error);
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
          <Users className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold">Teams</h1>
        </div>
        <button
          onClick={() => openModal((team) => navigate(`/teams/${team.id}`))}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Neues Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="mb-4">Noch keine Teams vorhanden.</p>
          <button onClick={() => openModal()} className="btn-primary">
            Erstes Team erstellen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{team.name}</h3>
                  {team.description && (
                    <p className="text-sm text-gray-600 mb-2">{team.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(team.id)}
                  className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                  title="Team löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>{team.members?.length || 0} Mitglieder</span>
                <span>•</span>
                <span>{(team as any)._count?.workspaces || 0} Arbeitsbereiche</span>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/teams/${team.id}`}
                  className="flex-1 btn-primary text-center"
                >
                  Öffnen
                </Link>
                <button
                  onClick={() => navigate(`/teams/${team.id}`)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Einstellungen"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

