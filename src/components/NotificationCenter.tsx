import React, { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Flame, ShoppingBag, Tag, AlertCircle } from 'lucide-react';
import { Order, Offer } from '../types';
import { api } from '../services/api';

export type NotificationKind = 'purchase' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'offer';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
  orderNumber?: string;
  status?: Order['status'];
  offerId?: string;
  timeMs?: number;
}

const STORAGE_READ_KEY = 'komur_read_notification_ids';

function getStoredReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_READ_KEY);
    if (raw) return new Set<string>(JSON.parse(raw));
  } catch {}
  return new Set<string>();
}

function saveStoredReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_READ_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

function formatNotificationTime(isoString?: string): string {
  if (!isoString) return 'الآن';
  try {
    const timeMs = new Date(isoString).getTime();
    if (isNaN(timeMs)) return 'الآن';
    const diffMs = Date.now() - timeMs;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    if (diffHour < 24) return `منذ ${diffHour} ساعة`;
    if (diffDay === 1) return 'أمس';
    if (diffDay < 7) return `منذ ${diffDay} أيام`;
    return new Date(isoString).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  } catch {
    return 'الآن';
  }
}

function orderToNotification(order: Order, readSet: Set<string>): NotificationItem {
  const notifId = `order-${order.id}-${order.status}`;
  const isRead = readSet.has(notifId);
  const itemsSummary = order.items && order.items.length > 0
    ? order.items.map((i) => `${i.name}${i.quantity > 1 ? ` × ${i.quantity}` : ''}`).slice(0, 2).join('، ')
    : 'أصناف الكنافة ع الفحم';

  switch (order.status) {
    case 'new':
      return {
        id: notifId,
        kind: 'purchase',
        title: `تم تأكيد الشراء • طلب #${order.orderNumber}`,
        message: `تمت عملية الشراء بنجاح! طلبك (${itemsSummary}) بقيمة ${order.total} ₪ تم استلامه وبانتظار بدء التحضير على الجمر.`,
        timestamp: formatNotificationTime(order.createdAt),
        read: isRead,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        timeMs: order.createdAt ? new Date(order.createdAt).getTime() : Date.now(),
      };
    case 'preparing':
      return {
        id: notifId,
        kind: 'preparing',
        title: `طلبك قيد التحضير • #${order.orderNumber}`,
        message: `الكنافة تخبز الآن على جمر الفحم! نكهة الجمر الأصلية تفوح وسيكون طلبك جاهزاً قريباً.`,
        timestamp: formatNotificationTime(order.createdAt),
        read: isRead,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        timeMs: order.createdAt ? new Date(order.createdAt).getTime() : Date.now(),
      };
    case 'ready':
      return {
        id: notifId,
        kind: 'ready',
        title: `وصل الطلب وهو جاهز للاستلام • #${order.orderNumber}`,
        message: `طلبك #${order.orderNumber} ساخن ومقرمش وجاهز للاستلام الآن من فرع رافدية!`,
        timestamp: formatNotificationTime(order.createdAt),
        read: isRead,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        timeMs: order.createdAt ? new Date(order.createdAt).getTime() : Date.now(),
      };
    case 'completed':
      return {
        id: notifId,
        kind: 'completed',
        title: `تم تسليم الطلب • #${order.orderNumber}`,
        message: `تم تسليم طلبك بنجاح. صحتين وألف عافية! شكراً لاختياركم كُومُر كُونافيه.`,
        timestamp: formatNotificationTime(order.createdAt),
        read: isRead,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        timeMs: order.createdAt ? new Date(order.createdAt).getTime() : Date.now(),
      };
    case 'cancelled':
    default:
      return {
        id: notifId,
        kind: 'cancelled',
        title: `تم إلغاء الطلب • #${order.orderNumber}`,
        message: `تم إلغاء الطلب #${order.orderNumber}. نعتذر عن أي إزعاج ويسعدنا خدمتكم مجدداً.`,
        timestamp: formatNotificationTime(order.createdAt),
        read: isRead,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        timeMs: order.createdAt ? new Date(order.createdAt).getTime() : Date.now(),
      };
  }
}

interface NotificationCenterProps {
  onNavigate?: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => getStoredReadIds());
  const rootRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  // Load live initial notifications from DB orders & offers
  useEffect(() => {
    let isCancelled = false;

    const loadLiveNotifications = async () => {
      try {
        const [orders, offers, products] = await Promise.all([
          api.getAdminToken() ? api.getOrders() : api.getMyOrders(),
          api.getOffers(),
          api.getProducts(),
        ]);

        if (isCancelled) return;

        const currentReadIds = getStoredReadIds();
        const orderNotifs: NotificationItem[] = (orders || [])
          .slice(0, 8)
          .map((order) => orderToNotification(order, currentReadIds));

        let favorites: Array<{ name: string; category?: string; count: number }> = [];
        try { favorites = Object.values(JSON.parse(localStorage.getItem('komur_favorite_products') || '{}')); } catch {}
        const offerNotifs: NotificationItem[] = (offers || [])
          .filter((o: Offer) => o.isActive && (!o.startDate || o.startDate <= new Date().toISOString().slice(0, 10)) && (!o.endDate || o.endDate >= new Date().toISOString().slice(0, 10)))
          .sort((a: Offer, b: Offer) => Number(b.id.split('-').pop()) - Number(a.id.split('-').pop()))
          .slice(0, 8)
          .map((offer: Offer) => ({
            id: `offer-${offer.id}`,
            offerId: offer.id,
            kind: 'offer',
            title: `عرض حصري • ${offer.title}`,
            message: (() => {
              const offerCategories = (products || []).filter((product) => offer.includedProductNames?.some((name) => name.toLowerCase() === product.name.toLowerCase())).map((product) => product.category);
              const favorite = [...favorites].sort((a, b) => b.count - a.count).find((item) => offer.includedProductNames?.some((name) => name.toLowerCase() === item.name.toLowerCase()) || (!!item.category && offerCategories.some(category => category === item.category)));
              const deal = offer.type === 'coupon' && offer.couponCode ? `كوبون ${offer.couponCode} بخصم ${offer.discountPercent}%` : offer.description || 'استمتع بأقوى عروض الكنافة ع الفحم اليوم!';
              return favorite ? `عرض يناسب طلباتك المتكررة من ${favorite.name}: ${deal}` : deal;
            })(),
            timestamp: 'عرض اليوم',
            read: currentReadIds.has(`offer-${offer.id}`),
            timeMs: Date.now() - 3600000,
          }));

        // Merge, sort newest first
        const merged = [...orderNotifs, ...offerNotifs].sort(
          (a, b) => (b.timeMs || 0) - (a.timeMs || 0)
        );

        setNotifications(merged);
      } catch (err) {
        console.error('Failed to load initial notifications:', err);
      }
    };

    loadLiveNotifications();

    // Subscribe to live order updates (via SSE, CustomEvents, and StorageEvents)
    const unsubscribe = api.subscribeToOrderUpdates((updatedOrder: Order) => {
      setNotifications((prev) => {
        const currentRead = getStoredReadIds();
        const newNotif = orderToNotification(updatedOrder, currentRead);

        // Replace any existing notification for this same order or prepend new status
        const filtered = prev.filter((item) => item.orderId !== updatedOrder.id);
        return [newNotif, ...filtered];
      });
    });

    // Also poll every 12 seconds as a fallback
    window.addEventListener('komur_offer_published', loadLiveNotifications);
    const interval = setInterval(loadLiveNotifications, 5000);

    return () => {
      isCancelled = true;
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener('komur_offer_published', loadLiveNotifications);
    };
  }, []);

  // Close popup on outside click or Escape
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
    const updated = new Set(readIds);
    updated.add(id);
    setReadIds(updated);
    saveStoredReadIds(updated);
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const markAllRead = () => {
    const updated = new Set(readIds);
    notifications.forEach((item) => updated.add(item.id));
    setReadIds(updated);
    saveStoredReadIds(updated);
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    markRead(notification.id);
    if (notification.orderNumber && onNavigate) {
      try {
        sessionStorage.setItem('komur_track_query', notification.orderNumber);
        sessionStorage.setItem('komur_track_from_notification', 'true');
      } catch {}
      setOpen(false);
      onNavigate('track');
      window.history.replaceState(null, '', `/track?order=${encodeURIComponent(notification.orderNumber)}&from=notification`);
      window.dispatchEvent(new CustomEvent('komur_track_order', { detail: notification.orderNumber }));
    } else if (notification.kind === 'offer' && onNavigate) {
      setOpen(false);
      onNavigate('offers');
    }
  };

  const getIconForKind = (kind: NotificationKind) => {
    switch (kind) {
      case 'preparing':
        return {
          Icon: Flame,
          containerClass: 'border-[#ff7b00]/30 bg-[#ff7b00]/10 text-[#ea580c]',
        };
      case 'ready':
        return {
          Icon: CheckCheck,
          containerClass: 'border-emerald-300 bg-emerald-50 text-emerald-600',
        };
      case 'completed':
        return {
          Icon: CheckCheck,
          containerClass: 'border-stone-300 bg-stone-100 text-stone-600',
        };
      case 'offer':
        return {
          Icon: Tag,
          containerClass: 'border-[#DAB775]/40 bg-[#DAB775]/15 text-[#B88930]',
        };
      case 'cancelled':
        return {
          Icon: AlertCircle,
          containerClass: 'border-rose-300 bg-rose-50 text-rose-600',
        };
      case 'purchase':
      default:
        return {
          Icon: ShoppingBag,
          containerClass: 'border-[#ff7b00]/25 bg-[#ff7b00]/10 text-[#ff7b00]',
        };
    }
  };

  return (
    <div ref={rootRef} className="relative" dir="rtl">
      {/* Notifications Bell Trigger */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={unreadCount ? `الإشعارات، ${unreadCount} غير مقروءة` : 'الإشعارات'}
        aria-expanded={open}
        aria-controls="notification-panel"
        className="relative flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[rgba(255,123,0,0.2)] bg-[#221d19] text-[#F7F0E5] transition hover:border-[#ff7b00]/60 hover:bg-[#26201b] hover:text-[#ff7b00] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7b00] cursor-pointer"
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#14110f] bg-[#ff7b00] px-1 text-[10px] font-black leading-none text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <section
          id="notification-panel"
          aria-label="الإشعارات"
          className="absolute left-0 top-[calc(100%+0.75rem)] z-50 w-[min(23rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[#DAB775]/35 bg-[#F7F0E5] text-right shadow-2xl shadow-black/40"
        >
          {/* Header (Background color unchanged as requested: bg-[#221d19]) */}
          <header className="flex items-center justify-between gap-3 border-b border-[#DAB775]/20 bg-[#221d19] px-4 py-3.5 text-[#F7F0E5]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-[#F7F0E5]">الإشعارات</h2>
                <span className="flex h-2 w-2 rounded-full bg-[#10b981]" title="محدث بالبيانات الحية المباشرة" />
              </div>
              <p className="mt-0.5 text-[11px] text-[#a99b90]">
                {unreadCount ? `${unreadCount} إشعارات غير مقروءة` : 'كل الإشعارات مقروءة'}
              </p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-[#ff9a2f] transition hover:bg-[#ff7b00]/10 disabled:cursor-default disabled:text-[#75675c] cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
              تحديد الكل مقروء
            </button>
          </header>

          {/* Lower Section (Warm cream/beige background color matching website identity: bg-[#F7F0E5]) */}
          <div className="bg-[#F7F0E5]">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EFE5D6] text-[#A68F7E] mb-3">
                  <Bell className="h-5 w-5 opacity-60" />
                </div>
                <p className="text-xs font-bold text-[#35241A]">لا توجد إشعارات حالياً</p>
                <p className="mt-1 text-[11px] text-[#8C7A6E]">ستصلك هنا إشعارات فورية بحالة طلباتك والعروض الحصرية</p>
              </div>
            ) : (
              <ul className="max-h-[min(65vh,24rem)] overflow-y-auto p-3 space-y-2.5">
                {notifications.map((notification) => {
                  const { Icon, containerClass } = getIconForKind(notification.kind);
                  const isUnread = !notification.read;

                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-right transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7b00] ${
                          isUnread
                            ? 'border-[#DAB775]/40 bg-white shadow-xs hover:border-[#ff7b00]/60 hover:shadow-md'
                            : 'border-stone-200/70 bg-[#FAF7F2]/90 opacity-75 hover:opacity-100 hover:bg-white'
                        }`}
                      >
                        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${containerClass}`}>
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-[#211814]">{notification.title}</span>
                            {isUnread && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff7b00] ring-2 ring-orange-200" aria-label="غير مقروء" />
                            )}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[#54453A]">{notification.message}</span>
                          <span className="mt-1.5 flex items-center justify-between text-[10px] font-medium text-[#8C7A6E]">
                            <span>{notification.timestamp}</span>
                            {notification.orderNumber && (
                              <span className="text-[#C7652D] font-bold hover:underline">
                                تتبع الطلب ←
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
