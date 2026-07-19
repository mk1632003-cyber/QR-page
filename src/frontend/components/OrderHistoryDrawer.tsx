import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, CheckCircle2, AlertCircle, ShoppingBag, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { auth } from '../lib/firebase.ts';
import { PRESETS } from '../types';

interface OrderHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderRecord {
  id: number;
  orderNumber: string;
  presetId: string;
  selectedToppings: string; // JSON String
  crustType: string;
  cheeseLevel: string;
  bakeStyle: string;
  size: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export const OrderHistoryDrawer: React.FC<OrderHistoryDrawerProps> = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!auth.currentUser) {
          throw new Error("You must be logged in to view your order history.");
        }
        const token = await auth.currentUser.getIdToken();
        const res = await fetch('/api/orders/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("Failed to retrieve order history from PostgreSQL.");
        }

        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An unexpected error occurred while fetching orders.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isOpen]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'prepped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'baking': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'done': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const getPaymentBadgeColor = (pStatus: string) => {
    switch (pStatus) {
      case 'paid': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-red-500/10 text-red-600 border-red-500/20';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-[#1a1a1a]/70 backdrop-blur-sm"
        >
          {/* BACKDROP CLOSER */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* DRAWER PANEL */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            className="relative w-full max-w-md h-full bg-[#fdfaf5] border-l border-[#e9e4db] shadow-2xl flex flex-col z-20"
          >
            {/* PANEL HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e9e4db] bg-[#faf7f2]/95 shrink-0">
              <div className="flex items-center gap-2 text-stone-800">
                <ShoppingBag className="w-5 h-5" />
                <h3 className="text-sm font-sans uppercase tracking-widest font-extrabold">Your Woodfired History</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-stone-100 text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PANEL BODY */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
                  <div className="w-8 h-8 border-3 border-[#e63946] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-mono text-[#b5b0a7] uppercase tracking-widest">Querying Postgres...</p>
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                  <p className="text-sm font-serif italic text-stone-800">{error}</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
                  <ShoppingBag className="w-10 h-10 text-stone-300 stroke-[1.5]" />
                  <h4 className="text-lg font-serif font-bold text-stone-700">No Orders Found</h4>
                  <p className="text-xs text-[#6b6b6b] max-w-[250px]">
                    You haven't placed any artisan pizza orders yet. Bake a fresh one from our brick oven!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-mono text-[#b5b0a7] uppercase tracking-wider font-extrabold">
                    {orders.length} SQL Order Records Found
                  </span>
                  
                  {orders.map((ord) => {
                    const preset = PRESETS.find((p) => p.id === ord.presetId);
                    const toppingsList: string[] = JSON.parse(ord.selectedToppings || '[]');

                    return (
                      <div 
                        key={ord.id}
                        className="bg-white border border-[#e9e4db] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 relative overflow-hidden group"
                      >
                        {/* Header of Item */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-mono font-bold text-stone-400">
                              {ord.orderNumber}
                            </span>
                            <h4 className="text-base font-serif font-black text-stone-900 group-hover:text-[#e63946] transition-colors mt-0.5">
                              {preset?.name || 'Custom Pizza'}
                            </h4>
                          </div>
                          <span className="text-sm font-sans font-black text-stone-900">
                            ${ord.totalPrice.toFixed(2)}
                          </span>
                        </div>

                        {/* Middle of Item - Customization parameters */}
                        <div className="text-[11px] text-stone-500 font-sans flex flex-col gap-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                          <div className="flex justify-between">
                            <span>Crust: <strong className="text-stone-700 capitalize">{ord.crustType}</strong></span>
                            <span>Size: <strong className="text-stone-700 capitalize">{ord.size}</strong></span>
                          </div>
                          <div>
                            Toppings: <span className="text-stone-700">{toppingsList.join(', ') || 'Cheese only'}</span>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                          <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(ord.createdAt)}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wider rounded border ${getPaymentBadgeColor(ord.paymentStatus)}`}>
                              {ord.paymentStatus}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wider rounded border ${getStatusBadgeColor(ord.status)}`}>
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
