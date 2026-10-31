import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, ShoppingBag, Tag } from 'lucide-react';

type NotificationKind = 'purchase' | 'offer';

interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'purchase-welcome',
    kind: 'purchase',
    title: 'إشعار عملية شراء',
    message: 'تمت عملية الشراء بنجاح! طلبك قيد التحضير على جمر الفحم.',
    timestamp: 'الآن',
    read: false,
  },
  {
    id: 'today-offer',
    kind: 'offer',
    title: 'إشعار عرض',
    message: 'عرض جديد! استمتع بإضافة بوظة مجانية لأي صنف تختاره اليوم.',
    timestamp: 'قبل ساعة',
    read: false,
  },
];

export const NotificationCenter: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const rootRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const markRead = (id: string) => {
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
  };

  const markAllRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  return (
    <div ref={rootRef} className="relative" dir="rtl">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={unreadCount ? `الإشعارات، ${unreadCount} غير مقروءة` : 'الإشعارات'}
        aria-expanded={open}
        aria-controls="notification-panel"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,123,0,0.2)] bg-[#221d19] text-[#F7F0E5] transition hover:border-[#ff7b00]/60 hover:bg-[#26201b] hover:text-[#ff7b00] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7b00]"
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#14110f] bg-[#ff7b00] px-1 text-[10px] font-black leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          id="notification-panel"
          aria-label="الإشعارات"
          className="absolute left-0 top-[calc(100%+0.75rem)] z-50 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[rgba(255,123,0,0.18)] bg-[#1a1614] text-right text-[#F7F0E5] shadow-2xl shadow-black/50"
        >
          <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#221d19] px-4 py-3.5">
            <div>
              <h2 className="text-sm font-black">الإشعارات</h2>
              <p className="mt-1 text-[11px] text-[#a99b90]">
                {unreadCount ? `${unreadCount} إشعارات غير مقروءة` : 'كل الإشعارات مقروءة'}
              </p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-bold text-[#ff9a2f] transition hover:bg-[#ff7b00]/10 disabled:cursor-default disabled:text-[#75675c]"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
              تحديد الكل مقروء
            </button>
          </header>

          <ul className="max-h-[min(65vh,24rem)] overflow-y-auto p-2">
            {notifications.map((notification) => {
              const Icon = notification.kind === 'purchase' ? ShoppingBag : Tag;
              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => markRead(notification.id)}
                    className={`flex w-full items-start gap-3 rounded-xl p-3 text-right transition hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7b00] ${notification.read ? 'opacity-70' : 'bg-[#26201b]'}`}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ff7b00]/20 bg-[#ff7b00]/10 text-[#ff9a2f]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-[#F7F0E5]">{notification.title}</span>
                        {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff7b00]" aria-label="غير مقروء" />}
                      </span>
                      <span className="mt-1.5 block text-xs leading-6 text-[#c7b9ae]">{notification.message}</span>
                      <span className="mt-1.5 block text-[10px] text-[#8d7e73]">{notification.timestamp}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
};
