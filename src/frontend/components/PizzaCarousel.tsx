import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'motion/react';
import { PizzaPreset, PRESETS, TOPPINGS } from '../types';
import { PizzaVisualizer } from './PizzaVisualizer';
import { Flame, ChevronLeft, ChevronRight, Sliders, Leaf, ShieldAlert } from 'lucide-react';

const getCategoryName = (id: string) => {
  switch (id) {
    case 'margherita': return 'CLASSIC NEAPOLITAN';
    case 'diavola': return 'FIERY ARTISAN';
    case 'quattro': return 'FOUR CHEESE';
    case 'ortolana': return 'GARDEN FRESH';
    case 'tartufo': return 'EARTHY LUXURY';
    default: return 'ARTISAN SPECIAL';
  }
};

const getIngredientsText = (defaultToppings: string[]) => {
  return defaultToppings
    .map(tid => {
      const topping = TOPPINGS.find(t => t.id === tid);
      return topping ? topping.name : '';
    })
    .filter(Boolean)
    .join(', ');
};

interface PizzaCarouselProps {
  currentIndex: number;
  onIndexChange: (index: number) => void;
  selectedToppings: string[];
  cheeseLevel: 'none' | 'light' | 'regular' | 'extra';
  bakeStyle: 'regular' | 'well-done' | 'charred';
  size: 'personal' | 'medium' | 'large';
}

export const PizzaCarousel: React.FC<PizzaCarouselProps> = ({
  currentIndex,
  onIndexChange,
  selectedToppings,
  cheeseLevel,
  bakeStyle,
  size,
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const startDragX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion value for smooth interpolation of carousel angle
  const targetIndexMV = useMotionValue(currentIndex);
  
  // Spring configuration for that satisfying "bouncy" premium landing
  const smoothIndexMV = useSpring(targetIndexMV, {
    stiffness: 110,
    damping: 18,
    mass: 0.8
  });

  const [displayIndex, setDisplayIndex] = useState(currentIndex);
  const [containerWidth, setContainerWidth] = useState(500);
  const [fractionalIndex, setFractionalIndex] = useState(currentIndex);

  // Measure container dimensions dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Sync index to motion value when parent index changes
  useEffect(() => {
    if (!isDragging.current) {
      const currentVal = targetIndexMV.get();
      const currentNormalized = ((currentVal % 5) + 5) % 5;
      let diff = currentIndex - currentNormalized;
      while (diff > 2.5) diff -= 5;
      while (diff < -2.5) diff += 5;
      
      const targetVal = currentVal + diff;

      animate(targetIndexMV, targetVal, {
        type: 'spring',
        stiffness: 100,
        damping: 16,
      });
    }
  }, [currentIndex, targetIndexMV]);

  // Keep track of the current fractional position for real-time calculations
  useEffect(() => {
    const unsubscribe = smoothIndexMV.on('change', (latest) => {
      const numericLatest = typeof latest === 'number' ? latest : parseFloat(latest as string);
      setFractionalIndex(numericLatest);

      // Find the closest whole index for updating local highlights
      const rounded = Math.round(numericLatest);
      const normalizedIndex = ((rounded % 5) + 5) % 5;
      setDisplayIndex(normalizedIndex);
    });
    return () => unsubscribe();
  }, [smoothIndexMV]);

  // Orbit parameters
  const radius = 220; // 3D Orbit radius

  const getCardStyle = (index: number, activeIndexFractional: number, width: number) => {
    let diff = index - activeIndexFractional;
    // Wrap around -2.5 to 2.5 for a continuous loop
    while (diff > 2.5) diff -= 5;
    while (diff < -2.5) diff += 5;

    // Standard spacing between pizza centers (horizontal only).
    // Dynamically scaled on smaller screens to prevent clipping or off-screen overflow.
    const spacing = Math.min(310, width * 0.58);
    
    const x = diff * spacing;
    const y = 0; // Perfectly flat horizontal line to match the image
    const z = 0; // No 3D depth needed since zIndex, scale and opacity create the exact layers

    const absDiff = Math.abs(diff);

    // Calculate scale smoothly (active is 1.0, adjacent is ~0.64, far is ~0.4)
    let scale = 1.0;
    if (absDiff <= 1) {
      scale = 1.0 - absDiff * 0.36;
    } else {
      scale = 0.64 - (absDiff - 1) * 0.24;
    }
    scale = Math.max(0.35, scale);

    // Calculate opacity (active is 1.0, adjacent is 0.70, far fades away to 0.12)
    let opacity = 1.0;
    if (absDiff <= 1) {
      opacity = 1.0 - absDiff * 0.30;
    } else {
      opacity = 0.70 - (absDiff - 1) * 0.55;
    }
    opacity = Math.max(0.08, opacity);

    // Calculate blur (active is 0px, adjacent is ~4px, far is ~8px) for photographic depth-of-field
    let blur = 0;
    if (absDiff > 0.05) {
      blur = absDiff * 4.5;
    }

    // Calculate brightness
    const brightness = 100 - absDiff * 15;

    // zIndex sorting (active center on top)
    const zIndex = Math.round((2.5 - absDiff) * 100);

    return { x, y, z, scale, opacity, brightness, blur, zIndex };
  };

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startDragX.current = e.clientX;
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - startDragX.current;
    // Convert pixels to fractional index shift (300px drag = full 1 index rotation)
    const indexShift = -deltaX / 320;
    setDragOffset(indexShift);
    targetIndexMV.set(currentIndex + indexShift);
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    // Snap to the closest whole pizza
    const finalVal = targetIndexMV.get();
    const rounded = Math.round(finalVal);
    const normalizedIndex = ((rounded % 5) + 5) % 5;
    
    onIndexChange(normalizedIndex);
    setDragOffset(0);
    
    // Animate smoothly to the snapped index
    animate(targetIndexMV, rounded, {
      type: 'spring',
      stiffness: 140,
      damping: 18,
    });
  };

  // Touch event handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    startDragX.current = e.touches[0].clientX;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.touches[0].clientX - startDragX.current;
    const indexShift = -deltaX / 280;
    setDragOffset(indexShift);
    targetIndexMV.set(currentIndex + indexShift);
  };

  // Navigation handlers
  const handlePrev = () => {
    if (isDragging.current) return;
    const prevIndex = ((currentIndex - 1) % 5 + 5) % 5;
    onIndexChange(prevIndex);
  };

  const handleNext = () => {
    if (isDragging.current) return;
    const nextIndex = ((currentIndex + 1) % 5 + 5) % 5;
    onIndexChange(nextIndex);
  };

  // Slider change handler (Real-time scrubbing)
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    isDragging.current = true;
    targetIndexMV.set(val);
  };

  const handleSliderRelease = (e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    isDragging.current = false;
    const val = targetIndexMV.get();
    const finalIndex = Math.round(val);
    const normalizedIndex = ((finalIndex % 5) + 5) % 5;
    
    onIndexChange(normalizedIndex);
    
    animate(targetIndexMV, finalIndex, {
      type: 'spring',
      stiffness: 140,
      damping: 18,
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* TURNTABLE STAGE CONTAINER */}
      <div 
        ref={containerRef}
        className="relative w-full h-[450px] md:h-[510px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Pristine clean background with no helper lines to exactly match the image */}

        {/* Dynamic Pizzas List */}
        <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] flex items-center justify-center">
          {PRESETS.map((preset, i) => {
            const style = getCardStyle(i, fractionalIndex, containerWidth);
            const isActive = displayIndex === i;

            return (
              <div
                key={preset.id}
                onClick={() => {
                  if (!isDragging.current && !isActive) {
                    onIndexChange(i);
                  }
                }}
                className={`absolute w-full h-full flex items-center justify-center ${
                  isActive ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
                style={{
                  transform: `translate3d(${style.x}px, ${style.y}px, ${style.z}px) scale(${style.scale})`,
                  opacity: style.opacity,
                  filter: style.blur > 0.1 ? `blur(${style.blur}px) brightness(${style.brightness}%)` : `brightness(${style.brightness}%)`,
                  zIndex: style.zIndex,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Visual wrapper for the pizza visualizer & labels */}
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center">
                    <PizzaVisualizer
                      sauceType={preset.sauceType}
                      selectedToppings={isActive ? selectedToppings : preset.defaultToppings}
                      cheeseLevel={isActive ? cheeseLevel : 'regular'}
                      bakeStyle={isActive ? bakeStyle : 'regular'}
                      size={isActive ? size : 'medium'}
                      isActive={isActive}
                    />
                  </div>

                  {/* Elegant dynamic labels mapped exactly to the provided image layout */}
                  {isActive ? (
                    <div className="absolute top-[90%] md:top-[94%] flex flex-col items-center text-center w-[280px] md:w-[360px] pointer-events-none transition-all duration-300">
                      <span className="text-[10px] md:text-[11px] font-sans tracking-[0.25em] text-[#8c867a] uppercase font-medium mb-1">
                        {getCategoryName(preset.id)}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#1a1a1a] tracking-tight">
                        {preset.name}
                      </h3>
                      <p className="text-[11px] md:text-xs text-[#6b6b6b] font-sans max-w-[260px] leading-relaxed mt-1">
                        {getIngredientsText(preset.defaultToppings)}
                      </p>
                      <span className="text-sm md:text-base font-serif font-bold text-[#b45309] mt-1.5 tracking-wide">
                        ${preset.basePrice.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-[88%] md:top-[92%] flex flex-col items-center text-center w-[200px] pointer-events-none">
                      <span className="text-[9px] font-sans tracking-[0.2em] text-[#8c867a] uppercase font-medium">
                        {getCategoryName(preset.id)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Next / Prev Quick Arrows */}
        <button 
          onClick={handlePrev}
          className="absolute left-4 p-3 rounded-full bg-white/95 hover:bg-stone-50 text-[#1a1a1a] hover:text-[#e63946] border border-[#dcd7ce] hover:border-[#1a1a1a] backdrop-blur-md transition-all active:scale-95 shadow-md group"
          aria-label="Previous pizza"
          id="prevPizzaBtn"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-4 p-3 rounded-full bg-white/95 hover:bg-stone-50 text-[#1a1a1a] hover:text-[#e63946] border border-[#dcd7ce] hover:border-[#1a1a1a] backdrop-blur-md transition-all active:scale-95 shadow-md group"
          aria-label="Next pizza"
          id="nextPizzaBtn"
        >
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* DETAILED SCRUBBER & SPICINESS METER PANELS */}
      <div className="w-full max-w-md px-6 mt-4">
        
        {/* Real-time Pizza Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-mono tracking-wider text-[#6b6b6b] uppercase font-bold">
            <span>Select Crust Recipe</span>
            <span className="text-[#e63946] font-bold">{PRESETS[displayIndex].name}</span>
          </div>

          <div className="relative flex items-center h-8">
            {/* Custom Track Background */}
            <div className="absolute inset-x-0 h-[1.5px] bg-[#dcd7ce]" />
            <div 
              className="absolute left-0 h-[2px] bg-[#e63946]" 
              style={{ width: `${(displayIndex / 4) * 100}%` }}
            />
            
            {/* Custom Range Input */}
            <input
              type="range"
              id="pizzaSlider"
              min="0"
              max="4"
              step="0.01"
              value={((targetIndexMV.get() % 5) + 5) % 5}
              onChange={handleSliderChange}
              onMouseUp={handleSliderRelease}
              onTouchEnd={handleSliderRelease}
              onKeyUp={handleSliderRelease}
              className="absolute w-full h-2 appearance-none bg-transparent cursor-pointer outline-none focus:outline-none focus:ring-0 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#e63946] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-125"
            />
          </div>

          {/* Stepped Labels */}
          <div className="flex justify-between px-1 text-[10px] font-mono text-[#b5b0a7] font-bold">
            {PRESETS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => onIndexChange(idx)}
                className={`transition-colors uppercase tracking-tight ${
                  displayIndex === idx ? 'text-[#e63946] font-extrabold' : 'hover:text-[#1a1a1a]'
                }`}
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Spiciness indicator widget */}
        <div className="flex items-center justify-between mt-6 bg-white border border-[#e9e4db] rounded-2xl p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              PRESETS[displayIndex].spiciness > 0 ? 'bg-red-50 text-[#e63946]' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {PRESETS[displayIndex].spiciness > 0 ? (
                <Flame className="w-4 h-4 animate-pulse" />
              ) : (
                <Leaf className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-[10px] text-[#b5b0a7] font-mono uppercase font-bold">Heat Scale</p>
              <h4 className="text-sm font-bold text-[#1a1a1a]">
                {PRESETS[displayIndex].spiciness === 0 && 'Classic Mild'}
                {PRESETS[displayIndex].spiciness === 1 && 'Gentle Warmth'}
                {PRESETS[displayIndex].spiciness === 2 && 'Medium Zesty'}
                {PRESETS[displayIndex].spiciness === 3 && 'Calabrian Fiery!'}
              </h4>
            </div>
          </div>

          {/* Heat Dots representation */}
          <div className="flex gap-1.5">
            {[1, 2, 3].map((dot) => (
              <span
                key={dot}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  dot <= PRESETS[displayIndex].spiciness
                    ? 'bg-[#e63946] scale-110 shadow-sm'
                    : 'bg-[#dcd7ce]'
                }`}
              />
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
