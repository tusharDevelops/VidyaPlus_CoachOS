import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  Bell, BellOff, Check, CheckCircle2, AlertTriangle, RefreshCw, Loader2, X
} from 'lucide-react';
import Pagination from '../../components/Pagination';

interface NotificationItem {
  id: string;
  content: string;
  channel: string;
  status: 'unread' | 'read' | 'queued';
  createdAt: string;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications', { params: { page, limit: 20 } });
      setNotifications(data.data.notifications);
      if (data.meta) setMeta(data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, status: 'read' } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerFeeReminders = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post('/notifications/triggers/reminders');
      alert(data.message || 'Fee reminders scan triggered successfully!');
      fetchNotifications();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to scan dues and create reminders');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return n.status === 'unread' || n.status === 'queued';
    return true;
  });

  const unreadCount = notifications.filter(n => n.status === 'unread' || n.status === 'queued').length;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-500" /> Notifications & Alerts
          </h1>
          <p className="text-sm text-surface-500 mt-1">Manage all in-app notifications, absences, and fee reminders</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button onClick={handleTriggerFeeReminders} disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent-50 text-accent-700 hover:bg-accent-100 rounded-xl border border-accent-200 text-sm font-medium transition-colors">
            <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} /> Scan for Upcoming Dues
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-100 text-surface-700 hover:bg-surface-200 rounded-xl border border-surface-200 text-sm font-medium transition-colors">
              <CheckCircle2 className="w-4 h-4" /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-surface-100 border border-surface-200 rounded-xl mb-6 max-w-xs">
        <button onClick={() => setFilter('all')}
          className={`flex-1 py-2 text-center text-sm font-medium rounded-lg transition-all ${filter === 'all' ? 'bg-white text-surface-900 shadow-sm font-semibold' : 'text-surface-500 hover:text-surface-800'}`}>
          All ({notifications.length})
        </button>
        <button onClick={() => setFilter('unread')}
          className={`flex-1 py-2 text-center text-sm font-medium rounded-lg transition-all ${filter === 'unread' ? 'bg-white text-surface-900 shadow-sm font-semibold' : 'text-surface-500 hover:text-surface-800'}`}>
          Unread ({unreadCount})
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-surface-100 rounded-2xl shadow-card">
          <div className="w-12 h-12 rounded-xl bg-surface-50 flex items-center justify-center mb-3">
            <BellOff className="w-6 h-6 text-surface-400" />
          </div>
          <p className="text-sm text-surface-500">No {filter === 'unread' ? 'unread' : ''} alerts found.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <>
          <div className="space-y-3">
          {filtered.map((n) => {
            const isUnread = n.status === 'unread' || n.status === 'queued';
            const isFee = n.content.toLowerCase().includes('fee');
            return (
              <div key={n.id} className={`flex items-start justify-between gap-4 p-4 bg-white border rounded-2xl shadow-sm transition-all duration-300 hover:shadow-card hover:border-surface-200 ${isUnread ? 'border-primary-100 bg-primary-50/20' : 'border-surface-100'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isUnread ? 'bg-primary-50 text-primary-600' : 'bg-surface-50 text-surface-400'}`}>
                    {isFee ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className={`text-sm ${isUnread ? 'text-surface-900 font-semibold' : 'text-surface-600'}`}>
                      {n.content}
                    </p>
                    <p className="text-xs text-surface-400 mt-1.5 flex items-center gap-1.5">
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                      {isUnread && <span className="w-1.5 h-1.5 bg-primary-500 rounded-full inline-block" />}
                    </p>
                  </div>
                </div>

                {isUnread && (
                  <button onClick={() => handleMarkAsRead(n.id)}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors flex-shrink-0" title="Mark as read">
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </div>
            );
          })}
          </div>
          <div className="mt-6">
            <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} limit={meta.limit} onPageChange={(p) => fetchNotifications(p)} />
          </div>
        </>
      )}
    </div>
  );
}
