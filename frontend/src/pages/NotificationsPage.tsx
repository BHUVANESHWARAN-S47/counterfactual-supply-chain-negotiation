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
          <h2 className="text-xl font-bold text-white tracking-tight">Notifications & Workflow Alerts</h2>
          <p className="text-xs text-slate-400">
            Database-backed role notifications dispatched by the Notification Agent.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
            />
            Unread Only
          </label>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark All as Read
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notifications available for current filters.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 transition flex items-start justify-between gap-4 ${
                n.is_read ? 'bg-slate-950/40 opacity-75' : 'bg-slate-900/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-850 border border-slate-700/80 mt-0.5">
                  {getEventIcon(n.event_type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-bold text-white">{n.title}</h4>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {n.role}
                    </span>
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
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
