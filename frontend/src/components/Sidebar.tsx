import { useState, useEffect } from 'react';
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
  X,
} from 'lucide-react';
import { useCreateWorkspace } from '../contexts/CreateWorkspaceContext';
import { workspaceService } from '../services/workspaceService';
import { motion, AnimatePresence } from 'framer-motion';
import type { Workspace } from '../types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [lastAccessed, setLastAccessed] = useState<Workspace[]>([]);
  const [newest, setNewest] = useState<Workspace[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { openModal } = useCreateWorkspace();

  useEffect(() => {
    loadRecentWorkspaces();
  }, []);

  // Reload recent workspaces when location changes (e.g., after opening a workspace)
  useEffect(() => {
    if (location.pathname.startsWith('/workspaces/')) {
      loadRecentWorkspaces();
    }
  }, [location.pathname]);

  const loadRecentWorkspaces = async () => {
    try {
      const data = await workspaceService.getRecent();
      setLastAccessed(data.lastAccessed);
      setNewest(data.newest);
    } catch (error) {
      console.error('Fehler beim Laden der Workspaces:', error);
    } finally {
      setLoadingRecent(false);
    }
  };

  const sidebarContent = (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <span className="font-semibold text-lg dark:text-white">Groop</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        )}
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
            location.pathname === '/' 
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span>Benachrichtigungen</span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Clock className="w-5 h-5" />
          <span>Zuletzt besucht</span>
        </Link>
        <Link
          to="/ideas"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/ideas' 
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Lightbulb className="w-5 h-5" />
          <span>Ideen</span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Folder className="w-5 h-5" />
          <span>Arbeitsbereiche</span>
        </Link>
        <Link
          to="/teams"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            location.pathname.startsWith('/teams') 
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Teams</span>
        </Link>
      </nav>

      {/* Recent Items */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Neueste</h3>
        {loadingRecent ? (
          <div className="text-xs text-gray-500 dark:text-gray-400 py-2">Lädt...</div>
        ) : (
          <div className="space-y-3">
            {/* Zuletzt besucht */}
            {lastAccessed.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">Zuletzt besucht</h4>
                <div className="space-y-1">
                  {lastAccessed.map((workspace) => (
                    <Link
                      key={workspace.id}
                      to={`/workspaces/${workspace.id}`}
                      className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
                      onClick={onClose}
                    >
                      <Folder className="w-4 h-4" />
                      <span className="truncate">{workspace.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Neueste */}
            {newest.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">Neueste</h4>
                <div className="space-y-1">
                  {newest
                    .filter((ws) => !lastAccessed.find((la) => la.id === ws.id)) // Filter duplicates
                    .slice(0, 5)
                    .map((workspace) => (
                      <Link
                        key={workspace.id}
                        to={`/workspaces/${workspace.id}`}
                        className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
                        onClick={onClose}
                      >
                        <Folder className="w-4 h-4" />
                        <span className="truncate">{workspace.name}</span>
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {!loadingRecent && lastAccessed.length === 0 && newest.length === 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 py-2">
                Noch keine Workspaces
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Desktop: Always visible sidebar
  const desktopSidebar = (
    <div className="hidden lg:block">
      {sidebarContent}
    </div>
  );

  // Mobile: Drawer
  const mobileSidebar = onClose ? (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
          >
            {sidebarContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  ) : null;

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
}

