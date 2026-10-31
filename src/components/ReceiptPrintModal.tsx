import React from 'react';
import { Printer, X, Flame } from 'lucide-react';
import { Order, StoreSettings } from '../types';

interface ReceiptPrintModalProps {
  order: Order | null;
  settings: StoreSettings | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  order,
  settings,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;



  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-md my-auto bg-white border border-orange-200 rounded-3xl p-6 shadow-2xl text-right animate-fadeIn">
        
        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة</span>
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div
          id="printable-receipt"
          className="bg-white text-black p-6 rounded-2xl font-mono text-xs shadow-inner border border-gray-300 leading-relaxed"
          dir="rtl"
        >
          {/* Receipt Header */}
          <div className="text-center pb-3 border-b-2 border-dashed border-gray-400 space-y-1">
            <div className="flex items-center justify-center gap-1 font-bold text-base text-gray-900">
              <Flame className="w-4 h-4 text-orange-600 inline" />
              <span>Kömür Künefe — كنافة ع الفحم</span>
            </div>
            <p className="text-[11px] text-gray-700">
              {settings?.branch || 'رافِدية - الشارع الرئيسي، نابلس'}
            </p>
            <p className="text-[11px] text-gray-700 dir-ltr text-center">
              هاتف / واتساب: {settings?.phone || '+970 562 606 061'}
            </p>
            <div className="pt-2">
              <span className="inline-block bg-black text-white px-3 py-1 rounded text-sm font-black">
                طلب استلام: {order.orderNumber}
              </span>
            </div>
          </div>

          {/* Customer & Order Metadata */}
          <div className="py-3 border-b-2 border-dashed border-gray-400 space-y-1 text-gray-800">
            <div className="flex justify-between">
              <span>التاريخ:</span>
              <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')} {new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between">
              <span>اسم الزبون:</span>
              <span className="font-bold">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>الهاتف:</span>
              <span className="dir-ltr">{order.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span>وقت الاستلام:</span>
              <span className="font-bold text-orange-950">{order.pickupTime}</span>
            </div>
            <div className="flex justify-between">
              <span>طريقة الدفع:</span>
              <span>{order.paymentMethod === 'mock_online' ? 'دفع إلكتروني (مدفوع)' : 'عند الاستلام في المحل'}</span>
            </div>
            {order.notes && (
              <div className="pt-1 text-[11px] text-gray-600">
                <span className="font-bold">ملاحظات: </span>
                <span>{order.notes}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-3 border-b-2 border-dashed border-gray-400">
            <div className="grid grid-cols-6 font-bold pb-1 text-gray-900 border-b border-gray-200">
              <span className="col-span-3">الصنف</span>
              <span className="col-span-1 text-center">الكمية</span>
              <span className="col-span-2 text-left">السعر</span>
            </div>
            <div className="space-y-1.5 pt-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-6 text-[11px]">
                  <div className="col-span-3">
                    <div className="font-bold">{item.name}</div>
                    <div className="text-[10px] text-gray-500">{item.variantName}</div>
                  </div>
                  <div className="col-span-1 text-center font-bold">{item.quantity}</div>
                  <div className="col-span-2 text-left font-bold">{item.price * item.quantity} ₪</div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 pb-2 flex justify-between items-center text-sm font-black text-gray-900">
            <span>المجموع النهائي:</span>
            <span className="text-base">{order.total} شيكل</span>
          </div>

          {/* Footer note */}
          <div className="text-center pt-3 border-t border-gray-200 text-[10px] text-gray-500 space-y-0.5">
            <p>صحتين وألف عافية! شكراً لاختياركم كُومُر كُونافيه.</p>
            <p>زورونا دائماً في رافدية - الشارع الرئيسي</p>
          </div>
        </div>

      </div>
    </div>
  );
};
