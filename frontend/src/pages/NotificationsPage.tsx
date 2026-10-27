import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Bell, CheckCheck, Check, Clock, AlertTriangle, ShoppingCart, Award, Truck } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { role } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications(role, unreadOnly);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [role, unreadOnly]);

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead(role);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'APPROVAL_REQUIRED':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'ORDER_INTAKE':
      case 'ORDER_UPDATE':
        return <ShoppingCart className="h-4 w-4 text-blue-400" />;
      case 'PO_ISSUED':
        return <Award className="h-4 w-4 text-emerald-400" />;
      case 'SHIPMENT_UPDATE':
      case 'DELIVERY_CONFIRMED':
        return <Truck className="h-4 w-4 text-indigo-400" />;
      default:
        return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Notifications & Workflow Alerts</h2>
          <p className="text-xs text-gray-500">
            Database-backed role notifications dispatched by the Notification Agent.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded bg-white border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Unread Only
          </label>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold shadow-xs transition"
          >
            <CheckCheck className="h-3.5 w-3.5 text-blue-600" /> Mark All as Read
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs divide-y divide-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No notifications available for current filters.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 transition flex items-start justify-between gap-4 ${
                n.is_read ? 'bg-gray-50/50 opacity-80' : 'bg-white hover:bg-blue-50/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gray-100 border border-gray-200 mt-0.5">
                  {getEventIcon(n.event_type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-bold text-gray-900">{n.title}</h4>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                      {n.role}
                    </span>
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition text-xs border border-gray-200"
                  title="Mark as Read"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
