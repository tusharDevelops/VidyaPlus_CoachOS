import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
  Bell, BellOff, CheckCheck, Loader2, ArrowLeft,
  Calendar, CheckCircle, RefreshCw, MailOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ notifications: [], unreadCount: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      // local update to state to make interaction instant
      setData((prev: any) => ({
        unreadCount: 0,
        notifications: prev.notifications.map((n: any) => ({ ...n, status: 'read' })),
      }));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleMarkAsRead = async (id: string, currentStatus: string) => {
    if (currentStatus === 'read') return;
    try {
      await api.patch(`/notifications/${id}/read`);
      setData((prev: any) => {
        const notifications = prev.notifications.map((n: any) => {
          if (n.id === id) {
            return { ...n, status: 'read' };
          }
          return n;
        });
        const unreadCount = Math.max(0, prev.unreadCount - 1);
        return { unreadCount, notifications };
      });
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <p className="text-[11px] font-bold text-steel uppercase tracking-widest">Loading notifications...</p>
      </div>
    );
  }

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="space-y-6 pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 border border-hairline bg-surface rounded-full flex items-center justify-center hover:bg-surface-hover text-steel hover:text-ink active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-ink tracking-tight">Inbox</h1>
            <p className="text-xs text-steel">In-app notifications and announcements.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="h-9 px-3.5 border border-hairline bg-surface rounded-full text-xs font-bold text-ink hover:bg-surface-hover active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-brand-green-deep" />
              Mark all read
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-9 h-9 border border-hairline bg-surface rounded-full flex items-center justify-center hover:bg-surface-hover text-steel hover:text-ink active:scale-95 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Unread Alert Banner */}
      {unreadCount > 0 && (
        <div className="p-4 rounded-xl bg-brand-green-soft border border-brand-green/20 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-green/25 flex items-center justify-center text-brand-green-deep">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-black text-brand-green-deep uppercase tracking-wider">Unread Alerts</p>
              <p className="text-xs text-ink-muted mt-0.5">
                You have <span className="font-bold text-brand-green-deep">{unreadCount}</span> pending notifications.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List container */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif: any) => {
            const isUnread = notif.status !== 'read';
            const dateLabel = new Date(notif.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id, notif.status)}
                className={`mint-card p-4 transition-all duration-200 cursor-pointer ${
                  isUnread
                    ? 'border-brand-green bg-gradient-to-r from-brand-green-soft/10 via-transparent to-transparent'
                    : 'opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isUnread ? 'bg-brand-green animate-pulse' : 'bg-stone/40'
                        }`}
                      />
                      <span className="text-[10px] font-bold text-stone uppercase tracking-widest font-mono">
                        {notif.channel || 'IN_APP'}
                      </span>
                    </div>

                    <p className={`text-sm leading-relaxed ${isUnread ? 'font-bold text-ink' : 'text-charcoal'}`}>
                      {notif.content}
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-stone font-bold uppercase tracking-wider mt-1">
                      <Calendar className="w-3.5 h-3.5 text-stone" />
                      <span>{dateLabel}</span>
                    </div>
                  </div>

                  {isUnread && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif.id, notif.status);
                      }}
                      className="text-[10px] font-bold text-brand-green-deep hover:underline flex-shrink-0 flex items-center gap-1"
                      title="Mark as read"
                    >
                      <MailOpen className="w-3.5 h-3.5" /> Read
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="mint-card p-12 text-center text-steel flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-stone border border-hairline">
              <BellOff className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-ink">Your inbox is clear</p>
              <p className="text-xs text-steel">Announcements and receipts will appear here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
