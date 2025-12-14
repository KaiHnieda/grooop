import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Workspace } from '../types';

interface WorkspaceCardProps {
  workspace: Workspace;
  viewMode: 'grid' | 'list';
}

export default function WorkspaceCard({ workspace, viewMode }: WorkspaceCardProps) {
  const formattedDate = format(new Date(workspace.updatedAt), 'd. MMM', { locale: de });

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to={`/workspaces/${workspace.id}`}
          className="card flex items-center gap-4 hover:shadow-md transition-shadow"
        >
        {workspace.imageUrl && (
          <img
            src={workspace.imageUrl}
            alt={workspace.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{workspace.name}</h3>
          {workspace.description && (
            <p className="text-sm text-gray-500 mt-1">{workspace.description}</p>
          )}
        </div>
        <div className="text-sm text-gray-500">{formattedDate}</div>
      </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link
        to={`/workspaces/${workspace.id}`}
        className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all overflow-hidden group"
      >
        {workspace.imageUrl ? (
          <div className="relative w-full h-40 overflow-hidden">
            <img
              src={workspace.imageUrl}
              alt={workspace.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        ) : (
          <div
            className="w-full h-40 relative overflow-hidden"
            style={{
              backgroundColor: workspace.color || '#7c3aed',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent" />
          </div>
        )}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {workspace.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{formattedDate}</p>
          {workspace.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
              {workspace.description}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}



