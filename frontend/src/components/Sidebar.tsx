import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Plus,
  Bell,
  Clock,
  Lightbulb,
  Folder,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useCreateWorkspace } from '../contexts/CreateWorkspaceContext';

export default function Sidebar() {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { openModal } = useCreateWorkspace();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <span className="font-semibold text-lg">Groop</span>
        </div>
      </div>

      {/* Create Button */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Neu erstellen</span>
            </div>
            {showCreateMenu ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {showCreateMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <Link
                to="/ideas"
                className="block px-4 py-2 hover:bg-gray-50 rounded-t-lg"
                onClick={() => setShowCreateMenu(false)}
              >
                Seite in Ideen
              </Link>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg"
                onClick={() => {
                  setShowCreateMenu(false);
                  openModal((workspace: any) => {
                    navigate(`/workspaces/${workspace.id}`);
                  });
                }}
              >
                Neuer Arbeitsbereich
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span>Benachrichtigungen</span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Clock className="w-5 h-5" />
          <span>Zuletzt besucht</span>
        </Link>
        <Link
          to="/ideas"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/ideas' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Lightbulb className="w-5 h-5" />
          <span>Ideen</span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Folder className="w-5 h-5" />
          <span>Arbeitsbereiche</span>
        </Link>
        <Link
          to="/teams"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            location.pathname.startsWith('/teams') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Teams</span>
        </Link>
      </nav>

      {/* Recent Items */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Neueste</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-pointer">
            <Folder className="w-4 h-4" />
            <span>Lager</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded cursor-pointer">
            <Folder className="w-4 h-4" />
            <span>Project</span>
          </div>
        </div>
      </div>
    </div>
  );
}

