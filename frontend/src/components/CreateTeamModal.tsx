import { useState } from 'react';
import { X } from 'lucide-react';
import { teamService } from '../services/teamService';
import type { Team, TeamCreateInput } from '../types';

interface CreateTeamModalProps {
  onClose: () => void;
  onSuccess: (team: Team) => void;
}

export default function CreateTeamModal({ onClose, onSuccess }: CreateTeamModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    try {
      const data: TeamCreateInput = {
        name: name.trim(),
        description: description.trim() || undefined,
      };
      const team = await teamService.create(data);
      onSuccess(team);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Erstellen des Teams');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Neues Team</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              id="team-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Name des Teams..."
            />
          </div>

          <div>
            <label
              htmlFor="team-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Beschreibung
            </label>
            <textarea
              id="team-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Beschreibung des Teams..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Wird erstellt...' : 'Erstellen'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


