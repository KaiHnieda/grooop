import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error) {
      console.error('Fehler beim Laden der Benachrichtigungen:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Fehler beim Markieren als gelesen:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error('Fehler beim Markieren aller als gelesen:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold">Benachrichtigungen</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Alle als gelesen markieren
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Keine Benachrichtigungen
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString('de-DE')}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full ml-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}



