import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CreditCard, Lock, Sparkles, AlertCircle, RefreshCw, Landmark, Heart } from 'lucide-react';
import { PRESETS } from '../types';

interface SandboxCheckoutModalProps {
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

export const SandboxCheckoutModal: React.FC<SandboxCheckoutModalProps> = ({ orderId, sessionId, onClose }) => {
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [email, setEmail] = useState('pizza_lover@neapolitan.com');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('424');
  const [nameOnCard, setNameOnCard] = useState('Don Peppino');
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          throw new Error('Failed to load order details for checkout simulation.');
        }
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading checkout order.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleSimulatePayment = () => {
    setIsPaying(true);
    // Simulate natural gateway network delay
    setTimeout(() => {
      setIsPaying(false);
      // Redirect to success URL with the original parameters
      window.location.href = `/?payment_success=true&session_id=${sessionId}&order_id=${orderId}`;
    }, 1800);
  };

  const handleQuickFill = () => {
    setCardNumber('4242 4242 4242 4242');
    setExpiry('12/29');
    setCvc('999');
    setNameOnCard('Enzo Coccia');
  };

  const preset = order ? PRESETS.find(p => p.id === order.presetId) : null;

  return (
    <AnimatePresence>
      {(orderId && sessionId) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 max-h-[90vh]"
          >
            {/* LEFT SECTION: BRANDING & AMOUNT DUE (md:col-span-5) */}
            <div className="md:col-span-5 bg-[#faf7f2] p-6 md:p-8 border-r border-[#e9e4db] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-stone-600 font-mono text-[10px] uppercase tracking-wider mb-6">
                  <Landmark className="w-4 h-4 text-[#e63946]" />
                  <span>Pizzeria del Sole</span>
                </div>

                {isLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-center">
                    <div className="w-6 h-6 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono text-stone-400 uppercase">Calculating...</span>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                ) : order ? (
                  <div className="flex flex-col gap-4">
                    <span className="text-xs text-stone-400 font-mono">Amount due</span>
                    <h2 className="text-4xl font-serif font-black text-stone-900">${order.totalPrice.toFixed(2)}</h2>
                    
                    <div className="mt-4 pt-4 border-t border-dashed border-stone-200 text-xs text-stone-600 flex flex-col gap-2">
                      <div className="flex justify-between font-bold">
                        <span>{preset?.name || 'Custom Pizza'}</span>
                        <span className="font-mono text-[#e63946] capitalize">{order.size}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 leading-relaxed">
                        Crust: <strong className="capitalize">{order.crustType}</strong> • Bake: <strong className="capitalize">{order.bakeStyle}</strong>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Secure lock footer */}
              <div className="pt-6 border-t border-stone-200 mt-6 md:mt-0">
                <div className="flex items-center gap-2 text-[11px] text-stone-500">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Stripe test-mode gateway integration</span>
                </div>
              </div>
            </div>

            {/* RIGHT SECTION: CREDIT CARD SIMULATOR (md:col-span-7) */}
            <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between">
              <div className="flex flex-col gap-5">
                {/* Mode alert banner */}
                <div className="p-3.5 bg-[#e63946]/5 border border-[#e63946]/20 rounded-2xl flex items-start gap-3">
                  <div className="p-1.5 bg-[#e63946] text-white rounded-lg shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-stone-900">Stripe Sandbox Checkout Mode</h5>
                    <p className="text-[10px] text-stone-500 mt-0.5 leading-relaxed">
                      Stripe API keys are not declared. We spawned a secure sandbox sandbox checkout to test database workflows instantly.
                    </p>
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="flex flex-col gap-3.5 text-xs text-stone-700">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-stone-800">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 focus:border-[#e63946] focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-stone-800">Card Information</label>
                      <button
                        type="button"
                        onClick={handleQuickFill}
                        className="text-[10px] text-[#e63946] hover:underline font-mono font-bold uppercase"
                      >
                        ⚡ Autofill Test Card
                      </button>
                    </div>
                    <div className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-200 focus-within:border-[#e63946]">
                      <div className="flex items-center px-3.5 py-2.5 bg-stone-50/50">
                        <CreditCard className="w-4 h-4 text-stone-400 mr-2.5" />
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          className="w-full bg-transparent outline-none focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-stone-200">
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="px-3.5 py-2.5 bg-transparent outline-none focus:outline-none text-center"
                        />
                        <input
                          type="text"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          placeholder="CVC"
                          className="px-3.5 py-2.5 bg-transparent outline-none focus:outline-none text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-[#1a1a1a]">Name on Card</label>
                    <input
                      type="text"
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 focus:border-[#e63946] focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Secure pay button */}
              <div className="mt-8 pt-4 border-t border-stone-100 flex flex-col gap-3">
                <button
                  onClick={handleSimulatePayment}
                  disabled={isPaying || isLoading || !order}
                  className="w-full py-3.5 bg-[#e63946] hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold font-sans uppercase tracking-widest text-xs rounded-full flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md cursor-pointer"
                >
                  {isPaying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Authorizing Simulated Funds...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Authorize Mock Payment of ${order ? order.totalPrice.toFixed(2) : '0.00'}
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="text-center text-[11px] text-stone-400 hover:text-stone-600 underline font-mono"
                >
                  Cancel Checkout and Return
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
