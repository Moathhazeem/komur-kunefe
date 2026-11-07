import React, { useRef } from 'react';
import { Printer, X } from 'lucide-react';
import { Order, StoreSettings } from '../types';

interface ReceiptPrintModalProps {
  order: Order | null;
  settings: StoreSettings | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({ order, settings, isOpen, onClose }) => {
  const printLock = useRef(false);

  if (!isOpen || !order) return null;

  const itemSubtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = order.subtotal ?? itemSubtotal;
  const discount = order.discountAmount ?? 0;
  const delivery = order.deliveryFee ?? (order.fulfillment === 'delivery' ? 15 : 0);
  const date = new Date(order.createdAt);
  const invoiceId = `INV-${order.orderNumber}`;

  const handlePrint = () => {
    if (printLock.current) return;
    printLock.current = true;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      printLock.current = false;
      window.alert('تعذر فتح نافذة الطباعة. اسمح بالنوافذ المنبثقة ثم حاول مجدداً.');
      return;
    }

    const invoice = document.querySelector('.invoice-print-root');
    if (!invoice) {
      printWindow.close();
      printLock.current = false;
      return;
    }

    const stylesheets = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
      .map((link) => `<link rel="stylesheet" href="${link.href}">`).join('');
    const inlineStyles = Array.from(document.querySelectorAll('style')).map((style) => style.textContent || '').join('\n');
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${stylesheets}<style>${inlineStyles}</style><style>
      @page { size: A4 portrait; margin: 12mm; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; width: 100%; background: #fff; color: #111827; font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.45; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .invoice-print-root { display: block; position: static !important; width: 100% !important; max-width: none !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; }
      table { width: 100%; border-collapse: collapse; }
      tr, header, section, footer { break-inside: avoid; page-break-inside: avoid; }
      th, td { padding-top: 7pt !important; padding-bottom: 7pt !important; }
      @media screen { body { padding: 12mm; } }
    </style></head><body>${invoice.outerHTML}</body></html>`);
    printWindow.document.close();

    let didPrint = false;
    const printOnce = () => {
      if (didPrint || printWindow.closed) return;
      didPrint = true;
      printWindow.focus();
      printWindow.onafterprint = () => { printLock.current = false; printWindow.close(); };
      try {
        printWindow.print();
      } catch {
        printLock.current = false;
        printWindow.close();
      }
      window.setTimeout(() => { printLock.current = false; if (!printWindow.closed) printWindow.close(); }, 120000);
    };
    printWindow.document.fonts?.ready.then(printOnce).catch(printOnce);
    window.setTimeout(printOnce, 500);
  };

  return (
    <div className="invoice-modal-overlay fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="invoice-modal-shell relative my-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-6">
        <div className="no-print mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <button onClick={onClose} className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200" aria-label="إغلاق الفاتورة"><X className="h-5 w-5" /></button>
          <button onClick={handlePrint} className="flex min-h-11 items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-700"><Printer className="h-4 w-4" /> طباعة الفاتورة</button>
        </div>

        <article className="invoice-print-root mx-auto w-full max-w-[190mm] bg-white p-5 text-slate-900 sm:p-10" dir="rtl">
          <header className="flex flex-col justify-between gap-6 border-b-2 border-slate-900 pb-6 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-orange-700">فاتورة تجارية</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">{settings?.storeName || 'Kömür Künefe — كنافة ع الفحم'}</h1>
              <p className="mt-2 text-sm text-slate-600">{settings?.branch || 'رافِدية - الشارع الرئيسي، نابلس'}</p>
              <p className="text-sm text-slate-600">هاتف / واتساب: <span dir="ltr" className="inline-block">{settings?.phone || '+970 562 606 061'}</span></p>
              <p className="text-sm text-slate-600">الرقم الضريبي / VAT: {settings?.taxNumber || 'غير مسجل'}</p>
            </div>
            <div className="min-w-52 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-4"><span className="text-slate-500">رقم الفاتورة</span><strong dir="ltr">{invoiceId}</strong></div>
              <div className="mt-2 flex justify-between gap-4"><span className="text-slate-500">التاريخ</span><strong>{date.toLocaleDateString('ar-PS')}</strong></div>
              <div className="mt-2 flex justify-between gap-4"><span className="text-slate-500">الوقت</span><strong>{date.toLocaleTimeString('ar-PS', { hour: '2-digit', minute: '2-digit' })}</strong></div>
              <div className="mt-2 flex justify-between gap-4"><span className="text-slate-500">رقم الطلب</span><strong>{order.orderNumber}</strong></div>
            </div>
          </header>

          <section className="grid gap-4 border-b border-slate-200 py-5 sm:grid-cols-2">
            <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">فاتورة إلى</p><p className="mt-1 font-bold">{order.customerName}</p><p dir="ltr" className="text-right text-sm text-slate-600">{order.customerPhone}</p></div>
            <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">طريقة الاستلام والدفع</p><p className="mt-1 font-bold">{order.fulfillment === 'delivery' ? 'توصيل' : 'استلام من الفرع'} · {order.paymentMethod === 'mock_online' ? 'دفع إلكتروني' : 'الدفع عند الاستلام'}</p>{order.fulfillment === 'delivery' && <p className="text-sm text-slate-600">{order.deliveryAddress}</p>}</div>
          </section>

          <section className="py-5">
            <table className="w-full border-collapse text-sm">
              <thead><tr className="border-b-2 border-slate-800 text-right"><th className="py-3 pl-2">الصنف</th><th className="w-20 py-3 text-center">الكمية</th><th className="w-28 py-3 text-left">سعر الوحدة</th><th className="w-28 py-3 text-left">الإجمالي</th></tr></thead>
              <tbody>{order.items.map((item, index) => <tr key={`${item.productId}-${item.variantId}-${index}`} className="border-b border-slate-200"><td className="py-3 pl-2"><strong className="block">{item.name}</strong><span className="text-xs text-slate-500">{item.variantName}</span></td><td className="py-3 text-center">{item.quantity}</td><td className="py-3 text-left">{item.price.toFixed(2)} ₪</td><td className="py-3 text-left font-bold">{(item.price * item.quantity).toFixed(2)} ₪</td></tr>)}</tbody>
            </table>
          </section>

          <section className="ml-auto w-full max-w-sm border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between py-1.5"><span className="text-slate-600">المجموع الفرعي</span><span>{subtotal.toFixed(2)} ₪</span></div>
            {discount > 0 && <div className="flex justify-between py-1.5 text-emerald-700"><span>خصم {order.couponCode ? `(${order.couponCode})` : ''}</span><span>−{discount.toFixed(2)} ₪</span></div>}
            <div className="flex justify-between py-1.5"><span className="text-slate-600">رسوم التوصيل</span><span>{delivery.toFixed(2)} ₪</span></div>
            <div className="mt-3 flex justify-between border-t-2 border-slate-900 pt-3 text-xl font-black"><span>الإجمالي المستحق</span><span>{order.total.toFixed(2)} ₪</span></div>
            <p className="mt-2 text-xs text-slate-500">ضريبة القيمة المضافة غير مفصلة بشكل منفصل.</p>
          </section>

          {order.notes && <p className="mt-5 border-t border-slate-200 pt-4 text-sm"><strong>ملاحظات الطلب: </strong>{order.notes}</p>}
          <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-500"><p className="font-bold text-slate-700">شكراً لاختياركم Kömür Künefe</p><p className="mt-1">نتمنى لكم وقتاً طيباً وصحتين وعافية</p></footer>
        </article>
      </div>
    </div>
  );
};
