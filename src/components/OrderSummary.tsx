import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { PizzaPreset, PizzaCustomization, Topping, TOPPINGS } from '../types';
import { X, Check, CreditCard, ShoppingBag, Gift, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OrderSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  preset: PizzaPreset;
  customization: PizzaCustomization;
  calculateTotalPrice: () => number;
  onOrderPlaced: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  isOpen,
  onClose,
  preset,
  customization,
  calculateTotalPrice,
  onOrderPlaced,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('Via dei Tribunali, 32, Naples');

  const basePrice = preset.basePrice;
  const sizeAdjustment = customization.size === 'personal' ? -2.0 : customization.size === 'large' ? 3.5 : 0;
  const cheeseAdjustment = customization.cheeseLevel === 'extra' ? 1.5 : 0;
  
  const additionalToppings = customization.selectedToppings.filter(
    (id) => !preset.defaultToppings.includes(id)
  );

  const appliedToppingObjects = TOPPINGS.filter((t) => additionalToppings.includes(t.id));

  const subtotal = calculateTotalPrice();
  const appliedDiscountValue = subtotal * discount;
  const grandTotal = subtotal - appliedDiscountValue;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'NEAPOLITAN' || couponCode.toUpperCase() === 'CHEF15') {
      setDiscount(0.15); // 15% Off
      setCouponApplied(true);
      setCouponError(false);
    } else {
      setCouponError(true);
    }
  };

  const triggerConfetti = () => {
    // Stage 1: Central explosive burst with Neapolitan sunset colors (reds, ambers, golds, whites)
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#e63946', '#ffb703', '#fb8500', '#2a9d8f', '#ffffff'],
      disableForReducedMotion: true
    });

    // Stage 2: Left corner rocket launch
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 60,
        origin: { x: 0.05, y: 0.8 },
        colors: ['#e63946', '#ffb703', '#ffffff'],
        disableForReducedMotion: true
      });
    }, 200);

    // Stage 3: Right corner rocket launch
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 60,
        origin: { x: 0.95, y: 0.8 },
        colors: ['#e63946', '#ffb703', '#ffffff'],
        disableForReducedMotion: true
      });
    }, 400);

    // Stage 4: Gentle golden rain drift
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 90,
        spread: 120,
        origin: { y: 0.4 },
        colors: ['#ffb703', '#fb8500'],
        scalar: 1.2,
        disableForReducedMotion: true
      });
    }, 750);
  };

  const handlePlaceOrder = () => {
    triggerConfetti();
    setOrderComplete(true);
    setTimeout(() => {
      onOrderPlaced();
      setOrderComplete(false);
      onClose();
    }, 4500);
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
          {/* BACKGROUND CLOSER CLICKER */}
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
              <div className="flex items-center gap-2 text-[#e63946]">
                <ShoppingBag className="w-5 h-5" />
                <h3 className="text-sm font-sans uppercase tracking-widest font-extrabold">Artisan Ticket</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-stone-100 text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                aria-label="Close ticket drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ORDER PROCESS BODY */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {!orderComplete ? (
                  <motion.div
                    key="checkout"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-6"
                  >
                    
                    {/* VINTAGE RECEIPT SLIP PAPER DESIGN */}
                    <div className="relative bg-[#faf7f0] text-stone-900 rounded-xl p-5 shadow-xl border border-stone-200">
                      {/* Zigzag Paper Tops simulation using css gradients */}
                      <div className="absolute -top-1.5 inset-x-3 h-3 bg-[radial-gradient(circle,transparent_50%,#faf7f0_50%)] bg-[length:12px_12px] bg-repeat-x pointer-events-none" />

                      {/* Header Logo */}
                      <div className="text-center pb-4 border-b border-dashed border-stone-300">
                        <h4 className="font-serif text-lg font-bold uppercase tracking-tight text-stone-800">Pizzeria del Sole</h4>
                        <p className="text-[10px] font-mono uppercase text-stone-500 tracking-wider">Lava Stone Woodfired Oven</p>
                        <p className="text-[9px] font-mono text-stone-400 mt-0.5">Naples, Italy • Ticket #{Math.floor(Math.random() * 9000) + 1000}</p>
                      </div>

                      {/* Line Items */}
                      <div className="py-4 flex flex-col gap-3 text-xs border-b border-dashed border-stone-300">
                        
                        {/* Pizza Base */}
                        <div className="flex justify-between font-serif">
                          <div>
                            <span className="font-bold">{preset.name}</span>
                            <span className="text-[10px] block font-sans text-stone-500 capitalize">
                              Base Crust • {customization.crustType === 'neapolitan' ? 'Airy Neapolitan' : customization.crustType === 'thin-crust' ? 'Roman Thin' : 'Gluten-Free'}
                            </span>
                          </div>
                          <span className="font-mono">${basePrice.toFixed(2)}</span>
                        </div>

                        {/* Size adjustment */}
                        {sizeAdjustment !== 0 && (
                          <div className="flex justify-between text-stone-600 font-mono text-[11px]">
                            <span className="capitalize">{customization.size} Size adjustment</span>
                            <span>{sizeAdjustment > 0 ? `+$${sizeAdjustment.toFixed(2)}` : `-$${Math.abs(sizeAdjustment).toFixed(2)}`}</span>
                          </div>
                        )}

                        {/* Cheese level adjustment */}
                        {cheeseAdjustment > 0 && (
                          <div className="flex justify-between text-stone-600 font-mono text-[11px]">
                            <span>Extra Fior di Latte</span>
                            <span>+${cheeseAdjustment.toFixed(2)}</span>
                          </div>
                        )}

                        {/* Baked Char Style Info */}
                        <div className="flex justify-between text-stone-500 text-[11px] italic">
                          <span>Baking Char Level</span>
                          <span className="capitalize">{customization.bakeStyle}</span>
                        </div>

                        {/* Toppings Subtitle */}
                        {appliedToppingObjects.length > 0 && (
                          <div className="pt-2 flex flex-col gap-1.5 border-t border-dashed border-stone-200">
                            <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wide">Custom Toppings Garden</p>
                            {appliedToppingObjects.map((topping) => (
                              <div key={topping.id} className="flex justify-between text-stone-700 text-[11px]">
                                <span>{topping.icon} {topping.name}</span>
                                <span className="font-mono">+${topping.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>

                      {/* Calculations Details */}
                      <div className="pt-4 flex flex-col gap-2 font-mono text-xs">
                        <div className="flex justify-between text-stone-600">
                          <span>Subtotal</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>

                        {couponApplied && (
                          <div className="flex justify-between text-emerald-700 font-bold">
                            <span>Promo Discount (15%)</span>
                            <span>-${appliedDiscountValue.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-stone-600">
                          <span>Delivery Surcharge</span>
                          <span className="text-stone-400">FREE</span>
                        </div>

                        <div className="flex justify-between text-sm font-bold font-serif text-stone-900 border-t border-stone-300 pt-3">
                          <span>Grand Total Due</span>
                          <span>${grandTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="absolute -bottom-1.5 inset-x-3 h-3 bg-[radial-gradient(circle,transparent_50%,#faf7f0_50%)] bg-[length:12px_12px] bg-repeat-x rotate-180 pointer-events-none" />
                    </div>

                    {/* PROMO INPUT PANEL */}
                    <div className="flex flex-col gap-1.5 bg-white p-4 rounded-2xl border border-[#e9e4db] shadow-sm">
                      <div className="flex justify-between text-[10px] font-mono uppercase text-[#b5b0a7] font-bold">
                        <span>Have a Promo Code?</span>
                        <span className="text-[#e63946] font-bold">Use CHEF15</span>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="text"
                          placeholder="ENTER COUPON CODE"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value);
                            setCouponError(false);
                          }}
                          disabled={couponApplied}
                          className="flex-1 bg-[#fdfaf5] border border-[#dcd7ce] focus:border-[#e63946] rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase tracking-wider text-[#1a1a1a] focus:outline-none disabled:opacity-50"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponApplied || !couponCode}
                          className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#e63946] text-white font-mono text-xs uppercase font-bold rounded-xl transition-all disabled:opacity-40 shrink-0 cursor-pointer"
                        >
                          {couponApplied ? 'Applied' : 'Apply'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[10px] font-mono text-[#e63946] mt-1">
                          * Invalid promo code. Try &ldquo;NEAPOLITAN&rdquo; or &ldquo;CHEF15&rdquo;.
                        </p>
                      )}
                    </div>

                    {/* DELIVERY LOCATION PANEL */}
                    <div className="flex flex-col gap-1.5 bg-white p-4 rounded-2xl border border-[#e9e4db] shadow-sm">
                      <label className="text-[10px] font-mono uppercase text-[#b5b0a7] font-bold">Delivery Hearth Location</label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="bg-[#fdfaf5] border border-[#dcd7ce] focus:border-[#e63946] rounded-xl px-3.5 py-2.5 text-xs text-[#1a1a1a] outline-none mt-1 focus:outline-none"
                      />
                    </div>

                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex-1 flex flex-col items-center justify-center text-center p-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-10 h-10 stroke-[3]" />
                    </motion.div>

                    <h4 className="text-2xl font-serif text-[#1a1a1a] font-black mt-6">Order Dispatched!</h4>
                    <p className="text-xs font-sans text-emerald-600 mt-2 uppercase tracking-widest font-bold">Stoking woodfire oven</p>
                    
                    <p className="text-xs text-[#6b6b6b] mt-4 leading-relaxed max-w-xs">
                      Chef has received your custom pizza ticket. The oak fire is roaring, and your dough is being stretched. Estimating delivery in <strong>12 minutes</strong>!
                    </p>

                    {/* Delivery Progress Bar */}
                    <div className="w-full max-w-xs bg-stone-200 h-1.5 rounded-full overflow-hidden mt-6">
                      <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 4.0, ease: 'linear' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ACTION FOOTER */}
              {!orderComplete && (
                <div className="pt-4 mt-6 border-t border-[#e9e4db] bg-[#faf7f2]/90">
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full py-4.5 bg-[#e63946] hover:bg-[#1a1a1a] text-white font-bold font-sans uppercase tracking-widest text-xs rounded-full flex items-center justify-center gap-2 transition-all active:scale-98 shadow-lg group cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    Place Woodfired Order • ${grandTotal.toFixed(2)}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
