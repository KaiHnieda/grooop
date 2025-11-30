import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Workspace } from '@groop/shared';

interface WorkspaceCardProps {
  workspace: Workspace;
  viewMode: 'grid' | 'list';
}

export default function WorkspaceCard({ workspace, viewMode }: WorkspaceCardProps) {
  const formattedDate = format(new Date(workspace.updatedAt), 'd. MMM', { locale: de });

  if (viewMode === 'list') {
    return (
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
    );
  }

  return (
    <Link
      to={`/workspaces/${workspace.id}`}
      className="card hover:shadow-md transition-shadow overflow-hidden"
    >
      {workspace.imageUrl ? (
        <img
          src={workspace.imageUrl}
          alt={workspace.name}
          className="w-full h-32 object-cover mb-3"
        />
      ) : (
        <div className="w-full h-32 bg-gradient-to-br from-primary-400 to-primary-600 mb-3" />
      )}
      <h3 className="font-semibold text-lg mb-1">{workspace.name}</h3>
      <p className="text-sm text-gray-500">{formattedDate}</p>
    </Link>
  );
}



