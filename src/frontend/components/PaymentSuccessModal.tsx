import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Check, Flame, Pizza, Receipt, ShieldCheck, ShoppingBag, Sparkles, X } from 'lucide-react';
import { PRESETS } from '../types';

interface PaymentSuccessModalProps {
  orderId: string | null;
  sessionId: string | null;
  onClose: () => void;
}

interface OrderRecord {
  id: number;
  orderNumber: string;
  presetId: string;
  selectedToppings: string;
  crustType: string;
  cheeseLevel: string;
  bakeStyle: string;
  size: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({ orderId, sessionId, onClose }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bakeStage, setBakeStage] = useState<'received' | 'prepped' | 'baking' | 'done'>('received');

  useEffect(() => {
    if (!orderId || !sessionId) return;

    const verifyPaymentAndFetchOrder = async () => {
      try {
        setIsVerifying(true);
        setError(null);
        
        // 1. Verify Stripe payment on the backend
        const res = await fetch(`/api/orders/${orderId}/verify-payment?session_id=${sessionId}`);
        if (!res.ok) {
          throw new Error("Failed to verify Stripe Checkout session.");
        }

        const data = await res.json();
        setOrder(data);
        setBakeStage(data.status || 'prepped');

        // 2. Trigger high quality double confetti blast for payment celebration
        triggerConfettiBlast();

      } catch (err: any) {
        console.error("Payment verification failed:", err);
        setError(err.message || "An error occurred while verifying your payment.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPaymentAndFetchOrder();
  }, [orderId, sessionId]);

  // Periodic polling for real-time oven baking status updates from PostgreSQL
  useEffect(() => {
    if (!orderId || isVerifying || error) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders`);
        if (res.ok) {
          const list: OrderRecord[] = await res.json();
          const target = list.find(o => o.id === parseInt(orderId));
          if (target) {
            setBakeStage(target.status as any);
            setOrder(target);
          }
        }
      } catch (err) {
        console.warn("Polling order status failed:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, isVerifying, error]);

  const triggerConfettiBlast = () => {
    // Left burst
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#ffb703', '#e63946', '#ffffff']
    });
    // Right burst
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#ffb703', '#e63946', '#ffffff']
    });
  };

  const stages = [
    { id: 'received', title: 'Ticket Received', desc: 'Order logged into PostgreSQL', icon: Receipt },
    { id: 'prepped', title: 'Pizza Stretched', desc: 'Artisan dough hand tossed', icon: Pizza },
    { id: 'baking', title: 'Brick Oven', desc: 'Roaring oak wood fire baking', icon: Flame },
    { id: 'done', title: 'Done & Served', desc: 'Serrated slicing completed!', icon: Sparkles },
  ];

  const currentStageIndex = stages.findIndex(s => s.id === bakeStage);
  const preset = order ? PRESETS.find(p => p.id === order.presetId) : null;

  return (
    <AnimatePresence>
      {(orderId && sessionId) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/85 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-[#fdfaf5] border border-[#e9e4db] rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto relative"
          >
            {/* Header / Dismiss */}
            <div className="flex justify-between items-center border-b border-[#e9e4db] pb-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="w-5 h-5 fill-emerald-500/10" />
                <span className="text-xs font-mono uppercase tracking-widest font-extrabold">Stripe Secure Payment</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-stone-100 text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isVerifying ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-10 h-10 border-4 border-[#e63946] border-t-transparent rounded-full animate-spin" />
                <h4 className="text-base font-serif font-black text-stone-900 mt-2">Verifying Payment Status</h4>
                <p className="text-xs text-[#6b6b6b]">Contacting Stripe to process authorization session...</p>
              </div>
            ) : error ? (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
                  <X className="w-8 h-8 stroke-[3]" />
                </div>
                <h4 className="text-xl font-serif font-bold text-stone-900">Verification Failed</h4>
                <p className="text-xs text-red-600 font-mono">{error}</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#e63946] text-white text-xs font-mono uppercase font-bold rounded-full hover:bg-stone-900 transition-all"
                >
                  Dismiss
                </button>
              </div>
            ) : order ? (
              <div className="flex flex-col gap-6">
                {/* Visual success banner */}
                <div className="flex flex-col items-center text-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-8 h-8 stroke-[3]" />
                  </motion.div>
                  <h3 className="text-3xl font-serif italic font-black text-[#1a1a1a] mt-2">
                    Payment Successful!
                  </h3>
                  <p className="text-xs text-emerald-600 font-mono uppercase tracking-widest font-bold">
                    PostgreSQL synchronized • Order {order.orderNumber}
                  </p>
                </div>

                {/* Receipt mini breakdown */}
                <div className="bg-white border border-[#e9e4db] rounded-2xl p-4 flex flex-col gap-2 shadow-sm text-xs font-sans text-stone-600">
                  <div className="flex justify-between border-b border-stone-100 pb-2">
                    <span className="font-bold text-stone-800">Pizza Selection:</span>
                    <span className="text-stone-900">{preset?.name || 'Custom Pizza'} ({order.size.toUpperCase()})</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-2">
                    <span className="font-bold text-stone-800">Crust:</span>
                    <span className="text-stone-900 capitalize">{order.crustType}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-2">
                    <span className="font-bold text-stone-800">Oak fired bake:</span>
                    <span className="text-stone-900 capitalize">{order.bakeStyle}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-bold text-sm text-stone-900">
                    <span>Authorized Charge:</span>
                    <span className="text-emerald-600">${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Real-time Baking Simulator Stages */}
                <div className="flex flex-col gap-4 mt-2">
                  <span className="text-[10px] font-mono text-[#b5b0a7] uppercase tracking-widest font-extrabold border-b border-[#e9e4db] pb-2">
                    Oven Tracking (Live updates from DB)
                  </span>

                  <div className="grid grid-cols-1 gap-3">
                    {stages.map((stg, idx) => {
                      const Icon = stg.icon;
                      const isActive = idx === currentStageIndex;
                      const isCompleted = idx < currentStageIndex;

                      return (
                        <div 
                          key={stg.id}
                          className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                            isActive 
                              ? 'bg-[#e63946]/5 border-[#e63946] shadow-sm' 
                              : isCompleted 
                                ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80' 
                                : 'bg-stone-50/50 border-transparent opacity-40'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            isActive 
                              ? 'bg-[#e63946] text-white' 
                              : isCompleted 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-stone-200 text-stone-500'
                          }`}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex-1">
                            <h5 className={`text-xs font-bold ${isActive ? 'text-[#1a1a1a]' : 'text-stone-700'}`}>
                              {stg.title}
                              {isActive && <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                            </h5>
                            <p className="text-[10px] text-stone-500 mt-0.5">{stg.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={onClose}
                  className="w-full py-3.5 bg-[#1a1a1a] hover:bg-[#e63946] text-white text-xs font-mono uppercase tracking-widest font-bold rounded-full transition-all mt-4"
                >
                  Return to Kitchen Customizer
                </button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
