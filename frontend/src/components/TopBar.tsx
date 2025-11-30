import { useAuthStore } from '../store/authStore';
import { Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';

export default function TopBar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Groop</span>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationBell />
        <Link
          to="/settings"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Einstellungen"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user ? getInitials(user.name) : 'U'}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Abmelden"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

