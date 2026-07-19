import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Topping, TOPPINGS, PizzaPreset } from '../types';
import { Sliders, Plus, Check, RefreshCw, Layers, Compass, Zap } from 'lucide-react';

interface IngredientSelectorProps {
  preset: PizzaPreset;
  selectedToppings: string[];
  onToppingsChange: (toppings: string[]) => void;
  cheeseLevel: 'none' | 'light' | 'regular' | 'extra';
  onCheeseLevelChange: (level: 'none' | 'light' | 'regular' | 'extra') => void;
  bakeStyle: 'regular' | 'well-done' | 'charred';
  onBakeStyleChange: (style: 'regular' | 'well-done' | 'charred') => void;
  size: 'personal' | 'medium' | 'large';
  onSizeChange: (size: 'personal' | 'medium' | 'large') => void;
}

export const IngredientSelector: React.FC<IngredientSelectorProps> = ({
  preset,
  selectedToppings,
  onToppingsChange,
  cheeseLevel,
  onCheeseLevelChange,
  bakeStyle,
  onBakeStyleChange,
  size,
  onSizeChange,
}) => {
  const [activeTab, setActiveTab] = useState<'base' | 'toppings'>('base');
  const [toppingFilter, setToppingFilter] = useState<'all' | 'cheese' | 'meat' | 'veggie' | 'drizzle'>('all');

  // Toggle individual toppings
  const handleToggleTopping = (toppingId: string) => {
    if (selectedToppings.includes(toppingId)) {
      onToppingsChange(selectedToppings.filter((t) => t !== toppingId));
    } else {
      onToppingsChange([...selectedToppings, toppingId]);
    }
  };

  // Reset to preset defaults
  const handleResetToDefault = () => {
    onToppingsChange(preset.defaultToppings);
    onCheeseLevelChange('regular');
    onBakeStyleChange('regular');
    onSizeChange('medium');
  };

  // Filter toppings
  const filteredToppings = TOPPINGS.filter(
    (t) => toppingFilter === 'all' || t.category === toppingFilter
  );

  return (
    <div className="w-full flex flex-col bg-white border border-[#e9e4db] rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
      
      {/* TABS HEADER */}
      <div className="flex border-b border-[#e9e4db] bg-[#fdfaf5] p-1.5">
        <button
          onClick={() => setActiveTab('base')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-sans font-bold tracking-wider uppercase rounded-xl transition-all ${
            activeTab === 'base'
              ? 'bg-[#1a1a1a] text-white font-bold shadow-sm'
              : 'text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-[#faf7f2]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Base Builder
        </button>
        <button
          onClick={() => setActiveTab('toppings')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-sans font-bold tracking-wider uppercase rounded-xl transition-all ${
            activeTab === 'toppings'
              ? 'bg-[#1a1a1a] text-white font-bold shadow-sm'
              : 'text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-[#faf7f2]'
          }`}
        >
          <Layers className="w-4 h-4" />
          Toppings Garden
        </button>
      </div>

      {/* CONTAINER BODY WITH TRANSITIONS */}
      <div className="p-5 flex-1 overflow-y-auto no-scrollbar max-h-[380px] min-h-[340px]">
        <AnimatePresence mode="wait">
          {activeTab === 'base' ? (
            <motion.div
              key="base"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              {/* SIZE SELECTOR */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-mono tracking-wide text-[#6b6b6b]">
                  <span>Platter Diameter Size</span>
                  <span className="text-[#e63946] font-bold">
                    {size === 'personal' && 'Personal - 10" (Chef\'s Snack)'}
                    {size === 'medium' && 'Medium - 12" (Classic Share)'}
                    {size === 'large' && 'Large - 14" (Feast Size)'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-[#fdfaf5] p-1.5 rounded-xl border border-[#dcd7ce]/80">
                  {(['personal', 'medium', 'large'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => onSizeChange(s)}
                      className={`py-2 text-xs font-mono uppercase rounded-lg transition-all ${
                        size === s
                          ? 'bg-white text-[#1a1a1a] border border-[#dcd7ce] font-bold shadow-sm'
                          : 'text-[#6b6b6b] hover:text-[#1a1a1a]'
                      }`}
                    >
                      {s === 'personal' ? '10"' : s === 'medium' ? '12"' : '14"'}
                    </button>
                  ))}
                </div>
              </div>

              {/* CHEESE LEVEL SELECTOR */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-mono tracking-wide text-[#6b6b6b]">
                  <span>Melted Mozzarella Volume</span>
                  <span className="text-[#e63946] font-bold">
                    {cheeseLevel === 'none' && 'Vegan/No Cheese'}
                    {cheeseLevel === 'light' ? 'Light Garnish (Minimal)' : ''}
                    {cheeseLevel === 'regular' ? 'Classic Layer (Balanced)' : ''}
                    {cheeseLevel === 'extra' ? 'Extra Overload (+ $1.50)' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 bg-[#fdfaf5] p-1.5 rounded-xl border border-[#dcd7ce]/80">
                  {(['none', 'light', 'regular', 'extra'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => onCheeseLevelChange(level)}
                      className={`py-2 text-[10px] font-mono uppercase rounded-lg transition-all truncate px-1 ${
                        cheeseLevel === level
                          ? 'bg-white text-[#1a1a1a] border border-[#dcd7ce] font-bold shadow-sm'
                          : 'text-[#6b6b6b] hover:text-[#1a1a1a]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* BAKE STYLE SELECTOR */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-mono tracking-wide text-[#6b6b6b]">
                  <span>Woodfired Blister Char</span>
                  <span className="text-[#e63946] font-bold">
                    {bakeStyle === 'regular' && 'Soft Golden (Traditional)'}
                    {bakeStyle === 'well-done' && 'Crispy Crust (Golden Brown)'}
                    {bakeStyle === 'charred' && 'Leopard Spotted (Napoli Char!)'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-[#fdfaf5] p-1.5 rounded-xl border border-[#dcd7ce]/80">
                  {(['regular', 'well-done', 'charred'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => onBakeStyleChange(style)}
                      className={`py-2 text-[10px] font-mono uppercase rounded-lg transition-all ${
                        bakeStyle === style
                          ? 'bg-white text-[#1a1a1a] border border-[#dcd7ce] font-bold shadow-sm'
                          : 'text-[#6b6b6b] hover:text-[#1a1a1a]'
                      }`}
                    >
                      {style === 'regular' ? 'Regular' : style === 'well-done' ? 'Crisp' : 'Charred'}
                    </button>
                  ))}
                </div>
              </div>

              {/* PRESET INFO SYNC */}
              <div className="mt-2 bg-[#fdfaf5] border border-[#e9e4db] rounded-2xl p-4 flex gap-3 shadow-sm">
                <div className="p-2 rounded-lg bg-[#e63946]/10 text-[#e63946] flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-sans font-bold text-[#1a1a1a]">Artisan Recipe Guideline</h5>
                  <p className="text-[11px] text-[#6b6b6b] mt-0.5 leading-relaxed">
                    This selection is currently calibrated to Chef's <strong>{preset.name}</strong> standards. Customizing toppings or cheese volume will shift base estimates.
                  </p>
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="toppings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              {/* TOPPING FILTERS */}
              <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar border-b border-[#e9e4db]">
                {(['all', 'cheese', 'meat', 'veggie', 'drizzle'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setToppingFilter(cat)}
                    className={`px-3 py-1.5 text-[10px] font-mono uppercase rounded-full transition-all shrink-0 ${
                      toppingFilter === cat
                        ? 'bg-[#1a1a1a] text-white font-bold'
                        : 'text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-[#fdfaf5]'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat === 'cheese' ? 'Cheeses' : cat === 'meat' ? 'Meats' : cat === 'veggie' ? 'Veggies' : 'Finishes'}
                  </button>
                ))}
              </div>

              {/* TOPPINGS GRID */}
              <div className="grid grid-cols-2 gap-2">
                {filteredToppings.map((topping) => {
                  const isSelected = selectedToppings.includes(topping.id);
                  const isDefault = preset.defaultToppings.includes(topping.id);

                  return (
                    <motion.button
                      key={topping.id}
                      onClick={() => handleToggleTopping(topping.id)}
                      whileTap={{ scale: 0.97 }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-white border-[#e63946]/40 text-[#1a1a1a] shadow-[0_4px_15px_rgba(230,57,70,0.05)]'
                          : 'bg-white/50 border-[#dcd7ce] text-[#6b6b6b] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base select-none">{topping.icon}</span>
                        <div className="truncate">
                          <p className={`text-xs font-medium truncate ${isSelected ? 'text-[#e63946]' : ''}`}>
                            {topping.name}
                          </p>
                          <p className="text-[9px] text-[#b5b0a7] font-mono">
                            {isDefault ? 'Default' : `+ $${topping.price.toFixed(2)}`}
                          </p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? 'bg-[#e63946] border-[#e63946] text-white'
                          : 'border-[#dcd7ce] text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER CONTROLS (RESET) */}
      <div className="border-t border-[#e9e4db] bg-[#fdfaf5] px-5 py-3 flex items-center justify-between gap-4">
        <p className="text-[10px] font-mono text-[#6b6b6b] max-w-[200px] leading-tight">
          Custom ingredients increase price based on standard premium market rate.
        </p>
        <button
          onClick={handleResetToDefault}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase text-[#6b6b6b] hover:text-[#e63946] bg-white hover:bg-stone-50 border border-[#dcd7ce] rounded-full transition-all active:scale-95 shrink-0 shadow-sm"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Preset
        </button>
      </div>

    </div>
  );
};
