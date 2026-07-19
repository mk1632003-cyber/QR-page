import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PRESETS, TOPPINGS, PizzaCustomization } from './types';
import { PizzaCarousel } from './components/PizzaCarousel';
import { IngredientSelector } from './components/IngredientSelector';
import { BakingSimulator } from './components/BakingSimulator';
import { OrderSummary } from './components/OrderSummary';
import { OrderHistoryDrawer } from './components/OrderHistoryDrawer.tsx';
import { PaymentSuccessModal } from './components/PaymentSuccessModal.tsx';
import { SandboxCheckoutModal } from './components/SandboxCheckoutModal.tsx';
import { auth, googleAuthProvider, signInWithPopup } from './lib/firebase.ts';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Flame, Receipt, ShoppingCart, Info, Sparkles, Compass, ChefHat, Check, Heart, Pizza, UtensilsCrossed, LogOut, History, User as UserIcon } from 'lucide-react';

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedToppings, setSelectedToppings] = useState<string[]>(PRESETS[0].defaultToppings);
  const [cheeseLevel, setCheeseLevel] = useState<'none' | 'light' | 'regular' | 'extra'>('regular');
  const [bakeStyle, setBakeStyle] = useState<'regular' | 'well-done' | 'charred'>('regular');
  const [size, setSize] = useState<'personal' | 'medium' | 'large'>('medium');
  const [crustType, setCrustType] = useState<'neapolitan' | 'thin-crust' | 'gluten-free'>('neapolitan');

  // Modal drawer states
  const [isBakingOpen, setIsBakingOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Authentication & Stripe Success States
  const [user, setUser] = useState<User | null>(null);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);

  // Sandbox Mode Checkout Simulation
  const [sandboxOrderId, setSandboxOrderId] = useState<string | null>(null);
  const [sandboxSessionId, setSandboxSessionId] = useState<string | null>(null);

  const currentPreset = PRESETS[currentIndex];

  // Monitor Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Monitor redirect callbacks from Stripe checkout session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
      setPaymentOrderId(params.get('order_id'));
      setPaymentSessionId(params.get('session_id'));
    } else if (params.get('sandbox_checkout') === 'true') {
      setSandboxOrderId(params.get('order_id'));
      setSandboxSessionId(params.get('session_id'));
    }
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleClosePaymentSuccess = () => {
    setPaymentOrderId(null);
    setPaymentSessionId(null);
    // Remove search query params from browser location bar cleanly
    const url = new URL(window.location.href);
    url.searchParams.delete('payment_success');
    url.searchParams.delete('session_id');
    url.searchParams.delete('order_id');
    url.searchParams.delete('payment_cancel');
    window.history.replaceState({}, '', url.toString());
  };

  const handleCloseSandboxCheckout = () => {
    setSandboxOrderId(null);
    setSandboxSessionId(null);
    // Remove search query params from browser location bar cleanly
    const url = new URL(window.location.href);
    url.searchParams.delete('sandbox_checkout');
    url.searchParams.delete('session_id');
    url.searchParams.delete('order_id');
    window.history.replaceState({}, '', url.toString());
  };

  // Automatically load preset defaults when switching pizzas
  useEffect(() => {
    setSelectedToppings(currentPreset.defaultToppings);
    setCheeseLevel('regular');
    setBakeStyle('regular');
    setSize('medium');
    setCrustType('neapolitan');
  }, [currentIndex]);

  // Compute total price
  const calculateTotalPrice = () => {
    let price = currentPreset.basePrice;

    // Size adjustment
    if (size === 'personal') price -= 2.0;
    if (size === 'large') price += 3.5;

    // Cheese level adjustment
    if (cheeseLevel === 'extra') price += 1.5;

    // Toppings adjustment (Only charge for non-default toppings)
    const extraToppings = selectedToppings.filter(
      (id) => !currentPreset.defaultToppings.includes(id)
    );
    extraToppings.forEach((id) => {
      const topping = TOPPINGS.find((t) => t.id === id);
      if (topping) {
        price += topping.price;
      }
    });

    return price;
  };

  const handleOrderPlaced = () => {
    setCartCount((prev) => prev + 1);
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
    }, 4000);
  };

  const customization: PizzaCustomization = {
    presetId: currentPreset.id,
    selectedToppings,
    crustType,
    cheeseLevel,
    bakeStyle,
    size,
  };

  return (
    <div className="min-h-screen bg-[#fdfaf5] text-[#1a1a1a] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#e63946] selection:text-white">
      
      {/* Decorative Background Rings & Accents */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] border border-dashed border-[#dcd7ce] rounded-full -z-0 opacity-40 pointer-events-none" />
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] border border-[#dcd7ce] rounded-full -z-0 opacity-25 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#fae6e1] to-transparent opacity-60 -z-0 pointer-events-none" />

      {/* HEADER BAR */}
      <header className="relative border-b border-[#e9e4db] bg-[#fdfaf5]/85 backdrop-blur-md px-8 py-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <motion.div 
            className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 p-[2px] flex items-center justify-center shadow-md shadow-amber-500/10 border border-amber-200/20 overflow-visible cursor-pointer"
            whileHover={{ scale: 1.08, rotate: [0, -6, 6, 0] }}
            transition={{ 
              scale: { type: "spring", stiffness: 400, damping: 15 },
              rotate: { duration: 0.4, ease: "easeInOut" }
            }}
          >
            <div className="w-full h-full rounded-[14px] bg-[#fdfaf5] flex items-center justify-center shadow-inner">
              <UtensilsCrossed className="w-5 h-5 text-amber-600 stroke-[2.25]" />
            </div>
            <motion.div 
              className="absolute -top-1.5 -right-1.5 bg-[#e63946] text-white text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase font-sans shadow-md border border-white flex items-center gap-0.5"
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Sparkles className="w-2.5 h-2.5 text-white fill-white" />
              HOT
            </motion.div>
          </motion.div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter font-sans text-[#1a1a1a]">
              Serve Me
            </h1>
            <p className="text-[10px] font-mono text-[#6b6b6b] uppercase tracking-wider font-semibold">
              Scan Order & Relax • We Serve
            </p>
          </div>
        </div>

        {/* STATUS & CART & AUTHENTICATION */}
        <div className="flex items-center gap-3">
          {/* SQL History access if logged in */}
          {user ? (
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#dcd7ce] hover:border-[#e63946] text-[#1a1a1a] font-mono text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
              title="View your database order history"
            >
              <History className="w-3.5 h-3.5 text-[#e63946]" />
              <span className="hidden sm:inline">My Orders</span>
            </button>
          ) : (
            <button 
              onClick={handleLogin}
              className="px-3.5 py-2 rounded-xl bg-[#e63946]/10 hover:bg-[#e63946] text-[#e63946] hover:text-white font-mono text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 border border-[#e63946]/20 shadow-sm"
              title="Sign in with Google to synchronize database"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}

          {/* User Profile avatar + logout */}
          {user && (
            <div className="flex items-center gap-2 border-l border-[#e9e4db] pl-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-stone-300" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs">
                  {user.email?.slice(0, 1).toUpperCase()}
                </div>
              )}
              <button 
                onClick={handleLogout}
                className="p-2 text-[#6b6b6b] hover:text-[#e63946] transition-colors rounded-full hover:bg-stone-100"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <button 
            onClick={() => setIsTicketOpen(true)}
            className="relative p-2.5 rounded-full bg-white border border-[#dcd7ce] text-[#1a1a1a] hover:border-[#1a1a1a] transition-all active:scale-95 flex items-center justify-center shadow-sm ml-1"
            aria-label="View Ticket Receipt"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#e63946] text-white text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER WORKSPACE */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative z-30">
        
        {/* LEFT COLUMN: 3D TURNTABLE STAGE */}
        <div className="lg:col-span-7 flex flex-col items-center">
          


          {/* Core 3D Wheel widget */}
          <PizzaCarousel
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
            selectedToppings={selectedToppings}
            cheeseLevel={cheeseLevel}
            bakeStyle={bakeStyle}
            size={size}
          />

        </div>

        {/* RIGHT COLUMN: INTERACTIVE CHEF MENU & INGREDIENT CONTROLS */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          
          {/* DYNAMIC RECIPE CARD */}
          <motion.div 
            whileHover={{ y: -6, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-white border border-[#e9e4db] rounded-3xl p-6 relative overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] cursor-default"
          >
            
            {/* Background Accent Gradient behind names */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${currentPreset.bgGradient} opacity-10 blur-3xl rounded-full`} />

            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e63946]/10 text-[#e63946] text-[10px] font-mono uppercase font-bold tracking-widest border border-[#e63946]/20">
                  <ChefHat className="w-3 h-3" />
                  Napoli Artisan Recipe
                </span>
                <h3 className="text-5xl font-serif font-black italic tracking-tight text-[#1a1a1a] mt-3">
                  {currentPreset.name}
                </h3>
                <p className="text-xs text-[#e63946] font-sans uppercase tracking-[0.2em] font-bold mt-1.5">
                  {currentPreset.subtitle}
                </p>
              </div>

              {/* Dynamic Live Pricing */}
              <div className="text-right flex flex-col items-end">
                <span className="text-[9px] font-mono text-[#b5b0a7] uppercase tracking-widest font-bold">
                  Live Estimate
                </span>
                <span className="text-3xl font-sans font-black text-[#1a1a1a]">
                  ${calculateTotalPrice().toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-base text-[#6b6b6b] mt-4 leading-relaxed font-serif italic">
              "{currentPreset.description}"
            </p>

            {/* Chef defaults list */}
            <div className="flex gap-1.5 flex-wrap mt-5 pt-4 border-t border-[#e9e4db]">
              <span className="text-[10px] font-mono text-[#b5b0a7] uppercase flex items-center mr-1 tracking-widest font-bold">
                Base Toppings:
              </span>
              {currentPreset.defaultToppings.map((tId) => {
                const topping = TOPPINGS.find((top) => top.id === tId);
                return (
                  <span
                    key={tId}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#dcd7ce] text-[10px] text-[#1a1a1a] font-sans font-medium shadow-sm"
                  >
                    <span>{topping?.icon}</span>
                    <span>{topping?.name}</span>
                  </span>
                );
              })}
            </div>

          </motion.div>

          {/* INGREDIENTS BUILDER MODULE */}
          <IngredientSelector
            preset={currentPreset}
            selectedToppings={selectedToppings}
            onToppingsChange={setSelectedToppings}
            cheeseLevel={cheeseLevel}
            onCheeseLevelChange={setCheeseLevel}
            bakeStyle={bakeStyle}
            onBakeStyleChange={setBakeStyle}
            size={size}
            onSizeChange={setSize}
          />

          {/* QUICK INTERACTIVE BAKING CALL-TO-ACTIONS */}
          <div className="grid grid-cols-2 gap-4">
            
            <button
              onClick={() => setIsBakingOpen(true)}
              className="py-4 bg-[#1a1a1a] hover:bg-[#e63946] text-white font-sans font-bold uppercase tracking-[0.15em] text-xs rounded-full flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl"
              id="bakePizzaBtn"
            >
              <Flame className="w-4.5 h-4.5 animate-pulse" />
              Bake in Brick Oven
            </button>

            <button
              onClick={() => setIsTicketOpen(true)}
              className="py-4 bg-white hover:bg-stone-50 text-[#1a1a1a] hover:text-[#e63946] border border-[#dcd7ce] hover:border-[#1a1a1a] font-sans font-bold uppercase tracking-[0.15em] text-xs rounded-full flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
              id="orderReceiptBtn"
            >
              <Receipt className="w-4.5 h-4.5" />
              Order Ticket
            </button>

          </div>

        </div>

      </main>

      {/* DISPATCH CELEBRATION FLOATING POPUP */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-white border border-[#e9e4db] text-[#1a1a1a] px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h5 className="text-xs font-sans font-bold uppercase text-[#1a1a1a] tracking-wider">Ticket Dispatched</h5>
              <p className="text-[10px] text-[#6b6b6b] mt-0.5">Woodfired oven preheated. Cooking underway!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVEN BAKING SIMULATOR MODAL OVERLAY */}
      <BakingSimulator
        isOpen={isBakingOpen}
        onClose={() => setIsBakingOpen(false)}
        preset={currentPreset}
        customization={customization}
        onBakeComplete={() => {
          // Change the bakeStyle of the pizza to well-done or charred permanently in local view
        }}
      />

      {/* ORDER CHECKOUT TICKET MODAL OVERLAY */}
      <OrderSummary
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        preset={currentPreset}
        customization={customization}
        calculateTotalPrice={calculateTotalPrice}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* FIREBASE AUTH POSTGRES ORDER HISTORY DRAWER */}
      <OrderHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* STRIPE SECURE PAYMENT SUCCESS OVERLAY MODAL */}
      <PaymentSuccessModal
        orderId={paymentOrderId}
        sessionId={paymentSessionId}
        onClose={handleClosePaymentSuccess}
      />

      {/* STRIPE SECURE SANDBOX CHECKOUT SIMULATOR OVERLAY MODAL */}
      <SandboxCheckoutModal
        orderId={sandboxOrderId}
        sessionId={sandboxSessionId}
        onClose={handleCloseSandboxCheckout}
      />

    </div>
  );
}
