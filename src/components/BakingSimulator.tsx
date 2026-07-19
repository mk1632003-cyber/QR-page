import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PizzaPreset, PizzaCustomization } from '../types';
import { PizzaVisualizer } from './PizzaVisualizer';
import { Flame, X, Sparkles, Trophy, CheckCircle, RefreshCw } from 'lucide-react';

interface BakingSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  preset: PizzaPreset;
  customization: PizzaCustomization;
  onBakeComplete: () => void;
}

const BAKING_STEPS = [
  'Stoking Calabrian Oak firewood...',
  'Preheating lava stone hearth to 485°C...',
  'Bubbling Fior di Latte mozzarella pools...',
  'Blistering crust with crispy leopard spots...',
  'Infusing aromatic essential herb oils...',
];

export const BakingSimulator: React.FC<BakingSimulatorProps> = ({
  isOpen,
  onClose,
  preset,
  customization,
  onBakeComplete,
}) => {
  const [bakingProgress, setBakingProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [score, setScore] = useState(9.8);
  const [comments, setComments] = useState<string[]>([]);

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setBakingProgress(0);
      setStepIndex(0);
      setIsDone(false);
    }
  }, [isOpen]);

  // Baking progression loop
  useEffect(() => {
    if (!isOpen || isDone) return;

    const interval = setInterval(() => {
      setBakingProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(interval);
          handleBakingFinished();
          return 100;
        }
        
        // Dynamically shift the loading step text based on progress percentages
        const index = Math.min(
          Math.floor((next / 100) * BAKING_STEPS.length),
          BAKING_STEPS.length - 1
        );
        setStepIndex(index);

        return next;
      });
    }, 45); // Takes approx 4.5 seconds

    return () => clearInterval(interval);
  }, [isOpen, isDone]);

  // Generate a fun baker's score and evaluation report when baked
  const handleBakingFinished = () => {
    setIsDone(true);
    onBakeComplete();

    // Calculate score based on customization parameters
    let computedScore = 9.0 + Math.random() * 0.9; // 9.0 to 9.9
    const report: string[] = [];

    if (customization.bakeStyle === 'charred') {
      computedScore += 0.1;
      report.push('🔥 Perfect authentic Neapolitan blistering!');
    } else if (customization.bakeStyle === 'well-done') {
      report.push('🍕 Exceptional crispy base crunch factor!');
    } else {
      report.push('🥖 Soft, delicate, chewable crumb structure.');
    }

    if (customization.cheeseLevel === 'extra') {
      report.push('🧀 Magnificently decadent melted cheese pull!');
    } else if (customization.cheeseLevel === 'none') {
      report.push('🌿 Exquisite plant-based Marinara focus.');
    } else {
      report.push('👌 Flawless structural cheese-to-sauce ratio.');
    }

    if (customization.selectedToppings.length > 5) {
      computedScore -= 0.2; // Chef penalizes overcrowded pizzas
      report.push('⚠️ Multi-ingredient complexity! Bold taste profile.');
    } else if (customization.selectedToppings.length === 2) {
      computedScore += 0.1;
      report.push('🎯 Absolute classic minimalist symmetry.');
    }

    setScore(parseFloat(Math.min(computedScore, 10.0).toFixed(1)));
    setComments(report);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/85 backdrop-blur-sm"
        >
          {/* BACKGROUND HEAT GLOW */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[400px] w-[400px] mx-auto rounded-full bg-[#e63946]/10 blur-[120px] pointer-events-none" />

          {/* SIMULATOR WINDOW */}
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
            className="relative w-full max-w-lg bg-[#fdfaf5] border border-[#e9e4db] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e9e4db] bg-[#faf7f2]/95">
              <div className="flex items-center gap-2 text-[#e63946]">
                <Flame className="w-5 h-5 animate-pulse" />
                <h3 className="text-sm font-sans uppercase tracking-widest font-bold">Woodfired Brick Oven</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-stone-100 text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
                aria-label="Close brick oven"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* OVEN CORE COMPARTMENT */}
            <div className="relative h-[320px] bg-stone-950 overflow-hidden flex flex-col items-center justify-center border-b border-[#e9e4db]">
              
              {/* STYLIZED BRICK ARCHWAY OVERLAY */}
              <div className="absolute inset-0 border-[16px] border-stone-900 pointer-events-none rounded-t-2xl z-30 opacity-70" />
              <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-stone-900 to-transparent pointer-events-none z-30" />

              <AnimatePresence mode="wait">
                {!isDone ? (
                  <motion.div
                    key="baking"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center w-full h-full p-6"
                  >
                    {/* GLOWING AMBIENT FIRE STAGE */}
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-orange-600/35 via-amber-600/10 to-transparent pointer-events-none" />
                    
                    {/* PIZZA SLIDING ON WOOD PEEL */}
                    <motion.div 
                      className="relative w-[180px] h-[180px] z-20"
                      animate={{
                        y: [0, -3, 0],
                        rotate: [0, 1, 0],
                        scale: 1 + (bakingProgress / 300) // slight visual rise
                      }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    >
                      {/* Pizza Base */}
                      <PizzaVisualizer
                        sauceType={preset.sauceType}
                        selectedToppings={customization.selectedToppings}
                        cheeseLevel={customization.cheeseLevel}
                        bakeStyle={bakingProgress > 60 ? 'charred' : 'regular'}
                        size={customization.size}
                      />

                      {/* Heat waves shimmer overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 mix-blend-overlay rounded-full animate-pulse" />
                    </motion.div>

                    {/* STEPS & PROGRESS BAR */}
                    <div className="w-full max-w-xs mt-8 text-center z-20">
                      <p className="text-xs font-mono text-orange-400 font-bold tracking-wide h-6">
                        {BAKING_STEPS[stepIndex]}
                      </p>
                      
                      <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden mt-3 p-0.5 border border-stone-700/50">
                        <motion.div 
                          className="bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 h-full rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: `${bakingProgress}%` }}
                          transition={{ ease: 'linear' }}
                        />
                      </div>
                      
                      <span className="text-[10px] font-mono text-stone-400 mt-2 block">
                        Bake Intensity: {bakingProgress}%
                      </span>
                    </div>

                    {/* Animated Embers / Rising Particles */}
                    <div className="absolute inset-x-0 bottom-4 h-24 overflow-hidden pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={`ember-${i}`}
                          className="absolute w-1 h-1 rounded-full bg-orange-400"
                          initial={{ 
                            bottom: 0, 
                            left: `${15 + i * 15}%`, 
                            opacity: 0.8, 
                            scale: Math.random() * 1.5 + 0.5 
                          }}
                          animate={{ 
                            bottom: '100%', 
                            left: `${15 + i * 15 + (Math.random() * 10 - 5)}%`,
                            opacity: 0,
                            scale: 0.1 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: Math.random() * 1.5 + 1.2, 
                            delay: i * 0.2, 
                            ease: 'linear' 
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center w-full h-full p-6 text-center z-20"
                  >
                    {/* BAKE COMPLETION CERTIFICATION BADGE */}
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}
                      className="w-16 h-16 rounded-full bg-[#e63946] text-white flex items-center justify-center shadow-lg"
                    >
                      <Trophy className="w-8 h-8 stroke-[2.5]" />
                    </motion.div>

                    <h4 className="text-xl font-serif text-[#1a1a1a] font-black mt-4">
                      Pizza Bake Certified!
                    </h4>
                    <p className="text-xs font-sans text-[#e63946] font-bold uppercase mt-1">
                      {preset.name} Custom Bake
                    </p>

                    <div className="flex gap-1.5 items-center bg-white border border-[#e9e4db] px-5 py-3 rounded-2xl mt-4 shadow-sm">
                      <span className="text-3xl font-sans font-black text-[#e63946]">{score}</span>
                      <div className="text-left">
                        <p className="text-[9px] font-mono uppercase text-[#b5b0a7] font-bold">Baker Score</p>
                        <p className="text-[10px] font-bold text-[#1a1a1a]">Perfect Hearth Bake</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* LOWER SCORE BOARD & ACTIONS */}
            <div className="bg-[#faf7f2]/95 p-6 flex-1 flex flex-col gap-4 border-t border-[#e9e4db]">
              <AnimatePresence mode="wait">
                {isDone ? (
                  <motion.div
                    key="score-details"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[#b5b0a7] text-left font-bold">
                        Hearthmaster Evaluation
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {comments.map((comment, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-[#6b6b6b] text-left">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{comment}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-[#1a1a1a] text-white hover:bg-[#e63946] font-bold rounded-full text-xs font-sans uppercase tracking-wider transition-all active:scale-95 shadow-md"
                      >
                        Keep Custom Recipe
                      </button>
                      <button
                        onClick={() => {
                          setIsDone(false);
                          setBakingProgress(0);
                        }}
                        className="w-full py-3.5 bg-white text-[#1a1a1a] hover:text-[#e63946] border border-[#dcd7ce] hover:border-[#1a1a1a] font-bold rounded-full text-xs font-sans uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Bake Another
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="baking-tip"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-4 text-xs text-[#6b6b6b] leading-relaxed max-w-sm mx-auto"
                  >
                    <Sparkles className="w-4 h-4 mx-auto text-[#e63946] mb-2 animate-bounce" />
                    <strong>Artisanal Tip:</strong> High-hydration hand-stretched Neapolitan dough requires extremely high temperatures (450°C+) to bake in under 90 seconds, sealing the moisture inside for an airy crust.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
