import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, List, Grid, FileText, Folder } from 'lucide-react';
import { workspaceService } from '../services/workspaceService';
import { recentActivityService } from '../services/recentActivityService';
import { useCreateWorkspace } from '../contexts/CreateWorkspaceContext';
import type { Workspace } from '@groop/shared';
import WorkspaceCard from '../components/WorkspaceCard';

type ViewMode = 'grid' | 'list';

function RecentActivityTab() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const data = await recentActivityService.getAll();
      setActivities(data);
    } catch (error) {
      console.error('Fehler beim Laden der Aktivitäten:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Lädt...</div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Noch keine kürzlich verwendete Elemente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <Link
          key={activity.id}
          to={activity.type === 'page' ? `/pages/${activity.entityId}` : `/workspaces/${activity.entityId}`}
          className="card flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          {activity.type === 'page' ? (
            <FileText className="w-5 h-5 text-primary-600" />
          ) : (
            <Folder className="w-5 h-5 text-primary-600" />
          )}
          <div className="flex-1">
            <p className="font-medium">{activity.entityName}</p>
            <p className="text-sm text-gray-500">
              {new Date(activity.createdAt).toLocaleString('de-DE')}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<'workspaces' | 'recent' | 'ideas'>('workspaces');
  const navigate = useNavigate();
  const { openModal } = useCreateWorkspace();

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const data = await workspaceService.getAll();
      setWorkspaces(data);
    } catch (error) {
      console.error('Fehler beim Laden der Arbeitsbereiche:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Cloud className="w-6 h-6 text-primary-600" />
          <h1 className="text-3xl font-bold">{getGreeting()}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('workspaces')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'workspaces'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Arbeitsbereiche
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'recent'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Zuletzt verwendete Komponenten und Seiten
        </button>
        <button
          onClick={() => setActiveTab('ideas')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'ideas'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Ideen
        </button>
      </div>

      {/* Content */}
      {activeTab === 'workspaces' && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {workspaces.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p className="mb-4">Noch keine Arbeitsbereiche vorhanden.</p>
              <button
                onClick={() =>
                  openModal((workspace: any) => {
                    navigate(`/workspaces/${workspace.id}`);
                  })
                }
                className="btn-primary"
              >
                Ersten Arbeitsbereich erstellen
              </button>
            </div>
          ) : (
            workspaces.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} viewMode={viewMode} />
            ))
          )}
        </div>
      )}

      {activeTab === 'recent' && (
        <RecentActivityTab />
      )}

      {activeTab === 'ideas' && (
        <div className="text-center py-12">
          <Link to="/ideas" className="btn-primary">
            Zu den Ideen
          </Link>
        </div>
      )}
    </div>
  );
}
