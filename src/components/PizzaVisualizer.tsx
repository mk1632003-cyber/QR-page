import React from 'react';
import { motion } from 'motion/react';

interface PizzaVisualizerProps {
  sauceType: 'tomato' | 'bianca' | 'pesto';
  selectedToppings: string[];
  cheeseLevel: 'none' | 'light' | 'regular' | 'extra';
  bakeStyle: 'regular' | 'well-done' | 'charred';
  size: 'personal' | 'medium' | 'large';
  isActive?: boolean;
}

// Deterministic placement points for toppings to keep them looking gourmet and balanced
const TOPPING_POSITIONS = {
  pepperoni: [
    { x: 250, y: 150, rotate: 12 },
    { x: 170, y: 200, rotate: 45 },
    { x: 330, y: 210, rotate: -30 },
    { x: 210, y: 310, rotate: 85 },
    { x: 290, y: 320, rotate: -70 },
    { x: 250, y: 250, rotate: 180 }, // Center-ish
    { x: 150, y: 280, rotate: 110 },
    { x: 350, y: 290, rotate: -15 },
  ],
  basil: [
    { x: 250, y: 170, scale: 0.9, rotate: -40 },
    { x: 190, y: 230, scale: 1.1, rotate: 25 },
    { x: 310, y: 220, scale: 1.0, rotate: 75 },
    { x: 200, y: 300, scale: 0.95, rotate: -120 },
    { x: 290, y: 290, scale: 1.05, rotate: 140 },
  ],
  mushrooms: [
    { x: 220, y: 140, rotate: -15 },
    { x: 280, y: 160, rotate: 30 },
    { x: 160, y: 210, rotate: -65 },
    { x: 340, y: 230, rotate: 80 },
    { x: 180, y: 270, rotate: 125 },
    { x: 310, y: 310, rotate: -45 },
    { x: 240, y: 340, rotate: 200 },
    { x: 240, y: 220, rotate: 95 },
  ],
  olives: [
    { x: 200, y: 170 },
    { x: 300, y: 180 },
    { x: 150, y: 250 },
    { x: 350, y: 260 },
    { x: 220, y: 330 },
    { x: 280, y: 330 },
    { x: 250, y: 280 },
    { x: 180, y: 300 },
  ],
  onions: [
    { x: 230, y: 160, scale: 0.8, rotate: 10 },
    { x: 270, y: 190, scale: 0.9, rotate: 80 },
    { x: 180, y: 200, scale: 1.0, rotate: -40 },
    { x: 320, y: 250, scale: 1.1, rotate: 130 },
    { x: 210, y: 280, scale: 0.85, rotate: 210 },
    { x: 290, y: 280, scale: 0.95, rotate: -90 },
    { x: 250, y: 330, scale: 1.0, rotate: 45 },
  ],
  walnuts: [
    { x: 210, y: 150, rotate: 35 },
    { x: 290, y: 170, rotate: -20 },
    { x: 160, y: 230, rotate: 110 },
    { x: 340, y: 210, rotate: -80 },
    { x: 220, y: 270, rotate: 45 },
    { x: 280, y: 290, rotate: 15 },
    { x: 190, y: 320, rotate: -130 },
    { x: 310, y: 320, rotate: 90 },
  ],
  nduja: [
    { x: 210, y: 180, r: 16 },
    { x: 290, y: 210, r: 14 },
    { x: 180, y: 270, r: 18 },
    { x: 270, y: 300, r: 15 },
    { x: 250, y: 130, r: 12 },
  ]
};

export const PizzaVisualizer: React.FC<PizzaVisualizerProps> = React.memo(({
  sauceType,
  selectedToppings,
  cheeseLevel,
  bakeStyle,
  size,
  isActive = true,
}) => {
  // Determine sizing scale factor
  const sizeScale = size === 'personal' ? 0.85 : size === 'large' ? 1.1 : 1.0;

  // Render Toppings with falling spring effect
  const hasTopping = (id: string) => selectedToppings.includes(id);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      {/* Dynamic Floor Shadow beneath the pizza plate */}
      <div 
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-[24px] rounded-full blur-xl bg-black/50 transition-all duration-700"
        style={{
          transform: `translateX(-50%) scale(${sizeScale * (isActive ? 1.15 : 0.9)})`,
          opacity: isActive ? 0.75 : 0.4
        }}
      />

      {/* SVG Canvas */}
      <motion.svg
        viewBox="0 0 500 500"
        className="w-full h-full drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)] select-none pointer-events-none"
        style={{ transformOrigin: 'center center' }}
        animate={{
          scale: sizeScale,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        <defs>
          {/* Radial Gradients for Sauces */}
          <radialGradient id="tomatoSauce" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#bf1d1d" />
            <stop offset="65%" stopColor="#a31414" />
            <stop offset="90%" stopColor="#800a0a" />
            <stop offset="100%" stopColor="#5d0000" />
          </radialGradient>

          <radialGradient id="pestoSauce" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3d8e3c" />
            <stop offset="60%" stopColor="#226f21" />
            <stop offset="90%" stopColor="#154915" />
            <stop offset="100%" stopColor="#0d2c0d" />
          </radialGradient>

          <radialGradient id="biancaSauce" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fefdec" />
            <stop offset="45%" stopColor="#f7f2cd" />
            <stop offset="85%" stopColor="#ebd6aa" />
            <stop offset="100%" stopColor="#caaf7b" />
          </radialGradient>

          {/* Golden Woodfired Crust Gradients */}
          <radialGradient id="crustBase" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#f1cd93" />
            <stop offset="82%" stopColor="#dfa762" />
            <stop offset="91%" stopColor="#be7632" />
            <stop offset="96%" stopColor="#8c4715" />
            <stop offset="100%" stopColor="#4c1e05" />
          </radialGradient>

          {/* Shadow Overlay for depth inside pizza base */}
          <radialGradient id="innerShadow" cx="50%" cy="50%" r="50%">
            <stop offset="75%" stopColor="rgba(0,0,0,0)" />
            <stop offset="93%" stopColor="rgba(0,0,0,0.15)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
          </radialGradient>

          {/* Pepperoni Gradients */}
          <radialGradient id="pepperoniGrad" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="60%" stopColor="#dc2626" />
            <stop offset="85%" stopColor="#b91c1c" />
            <stop offset="95%" stopColor="#7f1d1d" />
            <stop offset="100%" stopColor="#450a0a" />
          </radialGradient>

          {/* Cheese Melt Gradient */}
          <radialGradient id="cheeseGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#fefce8" />
            <stop offset="65%" stopColor="#fef08a" />
            <stop offset="90%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0.8" />
          </radialGradient>

          {/* Burnt Leopard spots for charred baking style */}
          <filter id="spotBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>

          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodOpacity="0.4" />
          </filter>

          <filter id="gourmetShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="5" stdDeviation="3.5" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Ceramic Plate Underneath with clean subtle inner and outer lines */}
        <circle cx="250" cy="250" r="242" fill="#fcfbf7" stroke="#eae7df" strokeWidth="2" />
        <circle cx="250" cy="250" r="236" fill="none" stroke="#f4f1ea" strokeWidth="1" />
        <circle cx="250" cy="250" r="228" fill="#fcfbf7" />

        {/* 1. OUTER WOODFIRED CRUST PLATTER */}
        <circle cx="250" cy="250" r="225" fill="url(#crustBase)" />

        {/* Baked Char Effects (Leopard Spots) */}
        <g opacity={bakeStyle === 'charred' ? 0.95 : bakeStyle === 'well-done' ? 0.75 : 0.45}>
          {/* Scatter Leopard Spots on the puffy crust rim */}
          <circle cx="250" cy="45" r="8" fill="#1e130a" filter="url(#spotBlur)" />
          <circle cx="110" cy="90" r="11" fill="#150b04" filter="url(#spotBlur)" />
          <circle cx="395" cy="110" r="9" fill="#110702" filter="url(#spotBlur)" />
          <path d="M 60 210 Q 55 220 58 230" stroke="#120701" strokeWidth="8" strokeLinecap="round" fill="none" filter="url(#spotBlur)" />
          <circle cx="445" cy="245" r="10" fill="#1b1008" filter="url(#spotBlur)" />
          <circle cx="95" cy="385" r="9" fill="#160d06" filter="url(#spotBlur)" />
          <circle cx="380" cy="390" r="12" fill="#0c0401" filter="url(#spotBlur)" />
          <path d="M 230 445 Q 242 448 255 444" stroke="#180e06" strokeWidth="9" strokeLinecap="round" fill="none" filter="url(#spotBlur)" />

          {/* Charred Bubbles / Cracks inside crust */}
          <circle cx="160" cy="55" r="5" fill="#301b0c" filter="url(#spotBlur)" />
          <circle cx="340" cy="65" r="6" fill="#301b0c" filter="url(#spotBlur)" />
          <circle cx="430" cy="180" r="7" fill="#251306" filter="url(#spotBlur)" />
          <circle cx="65" cy="300" r="6" fill="#2d1709" filter="url(#spotBlur)" />
          <circle cx="320" cy="435" r="7" fill="#1f0f04" filter="url(#spotBlur)" />
        </g>

        {/* 2. CORE SAUCE LAYER */}
        <circle 
          cx="250" 
          cy="250" 
          r="182" 
          fill={
            sauceType === 'tomato' 
              ? 'url(#tomatoSauce)' 
              : sauceType === 'pesto' 
                ? 'url(#pestoSauce)' 
                : 'url(#biancaSauce)'
          } 
        />

        {/* Inner shadow overlay for realistic saucer edge height */}
        <circle cx="250" cy="250" r="182" fill="url(#innerShadow)" />

        {/* Herb Specks or Olive Oil pools in Sauce */}
        {sauceType === 'tomato' && (
          <g opacity="0.6">
            <circle cx="200" cy="200" r="1.5" fill="#ffffff" opacity="0.4" />
            <circle cx="310" cy="210" r="2" fill="#223e13" />
            <circle cx="240" cy="310" r="1" fill="#223e13" />
            <circle cx="290" cy="280" r="1.5" fill="#facc15" opacity="0.5" />
            <circle cx="180" cy="270" r="2" fill="#223e13" />
            <circle cx="250" cy="170" r="1" fill="#facc15" opacity="0.6" />
          </g>
        )}
        {sauceType === 'pesto' && (
          <g opacity="0.8">
            <circle cx="230" cy="190" r="1.5" fill="#fcd34d" opacity="0.6" />
            <circle cx="280" cy="220" r="2.5" fill="#14532d" />
            <circle cx="170" cy="280" r="2" fill="#166534" />
            <circle cx="320" cy="290" r="2" fill="#14532d" />
            <circle cx="240" cy="330" r="1.5" fill="#15803d" />
          </g>
        )}

        {/* 3. DYNAMIC MELTED MOZZARELLA CHEESE BLOB PATTERN */}
        {cheeseLevel !== 'none' && (
          <g filter="url(#softShadow)">
            {/* We render a collection of organic melting cheese pools */}
            {/* The count & size depends on the cheese level selected */}
            <g opacity={cheeseLevel === 'light' ? 0.65 : cheeseLevel === 'regular' ? 0.9 : 1.0}>
              {/* Outer Pools */}
              <path d="M 220 150 Q 250 130 270 160 Q 290 190 250 210 Q 190 190 220 150 Z" fill="url(#cheeseGrad)" />
              <path d="M 160 220 Q 200 200 210 240 Q 220 280 180 270 Q 140 250 160 220 Z" fill="url(#cheeseGrad)" />
              <path d="M 310 230 Q 350 210 340 250 Q 330 290 290 270 Q 280 240 310 230 Z" fill="url(#cheeseGrad)" />
              <path d="M 210 320 Q 250 300 280 330 Q 260 370 220 360 Q 180 340 210 320 Z" fill="url(#cheeseGrad)" />
              
              {/* Extra cheese adds overlapping delicious melted paths */}
              {cheeseLevel === 'extra' && (
                <g>
                  <path d="M 230 220 Q 250 200 270 230 Q 260 270 220 260 Q 200 240 230 220 Z" fill="url(#cheeseGrad)" />
                  <path d="M 180 170 Q 210 160 220 190 Q 190 210 170 200 Q 160 180 180 170 Z" fill="url(#cheeseGrad)" opacity="0.9" />
                  <path d="M 300 180 Q 320 160 340 190 Q 320 210 290 200 Z" fill="url(#cheeseGrad)" opacity="0.9" />
                  <path d="M 160 290 Q 180 310 160 330 Q 130 310 160 290 Z" fill="url(#cheeseGrad)" opacity="0.8" />
                  <path d="M 310 300 Q 340 290 320 330 Q 290 320 310 300 Z" fill="url(#cheeseGrad)" opacity="0.8" />
                </g>
              )}

              {/* Little scattered mozzarella chunks */}
              <circle cx="250" cy="110" r="12" fill="url(#cheeseGrad)" />
              <circle cx="130" cy="180" r="14" fill="url(#cheeseGrad)" />
              <circle cx="370" cy="200" r="13" fill="url(#cheeseGrad)" />
              <circle cx="140" cy="310" r="11" fill="url(#cheeseGrad)" />
              <circle cx="340" cy="320" r="15" fill="url(#cheeseGrad)" />
              <circle cx="280" cy="115" r="10" fill="url(#cheeseGrad)" />
              <circle cx="330" cy="140" r="8" fill="url(#cheeseGrad)" />
              <circle cx="160" cy="135" r="9" fill="url(#cheeseGrad)" />
              <circle cx="200" cy="370" r="11" fill="url(#cheeseGrad)" />
              <circle cx="300" cy="365" r="12" fill="url(#cheeseGrad)" />
            </g>
          </g>
        )}

        {/* 4. PREMIUM TOPPING RENDERING */}

        {/* A. SPICY 'NDUJA DOLLOPS */}
        {hasTopping('nduja') && (
          <g filter="url(#gourmetShadow)">
            {TOPPING_POSITIONS.nduja.map((pos, idx) => (
              <motion.path
                key={`nduja-${idx}`}
                initial={{ opacity: 0, scale: 0.2, y: -80 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 10, delay: idx * 0.04 }}
                d={`M ${pos.x} ${pos.y - pos.r} 
                   C ${pos.x + pos.r * 1.1} ${pos.y - pos.r * 0.8}, ${pos.x + pos.r * 1.2} ${pos.y + pos.r * 0.9}, ${pos.x} ${pos.y + pos.r} 
                   C ${pos.x - pos.r * 0.9} ${pos.y + pos.r * 1.1}, ${pos.x - pos.r * 1.1} ${pos.y - pos.r * 0.9}, ${pos.x} ${pos.y - pos.r} Z`}
                fill="#881337"
                stroke="#4c0519"
                strokeWidth="1.5"
              />
            ))}
          </g>
        )}

        {/* B. SPICY PEPPERONI SLICES */}
        {hasTopping('pepperoni') && (
          <g filter="url(#gourmetShadow)">
            {TOPPING_POSITIONS.pepperoni.map((pos, idx) => (
              <motion.g
                key={`pep-${idx}`}
                initial={{ opacity: 0, scale: 0.3, y: -100, rotate: pos.rotate - 45 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: pos.rotate }}
                transition={{ type: 'spring', stiffness: 140, damping: 12, delay: idx * 0.03 }}
                transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotate})`}
              >
                {/* Outer curled pepperoni cup */}
                <circle cx="0" cy="0" r="22" fill="url(#pepperoniGrad)" stroke="#520505" strokeWidth="2.5" />
                
                {/* Cupped dark charred rim */}
                <circle cx="0" cy="0" r="20" fill="none" stroke="#3b0707" strokeWidth="1" opacity="0.8" />
                
                {/* Spicy glistening fat droplets */}
                <circle cx="-6" cy="-6" r="2.5" fill="#f59e0b" opacity="0.85" />
                <circle cx="8" cy="4" r="1.5" fill="#f59e0b" opacity="0.75" />
                <circle cx="2" cy="-9" r="2" fill="#ffffff" opacity="0.5" />
                <circle cx="-5" cy="7" r="1.8" fill="#f59e0b" opacity="0.8" />
                
                {/* Texture grains */}
                <circle cx="-10" cy="-1" r="1" fill="#450a0a" />
                <circle cx="5" cy="-5" r="1" fill="#450a0a" />
                <circle cx="1" cy="11" r="1" fill="#450a0a" />
                <circle cx="9" cy="-1" r="1.2" fill="#7f1d1d" />
              </motion.g>
            ))}
          </g>
        )}

        {/* C. WILD PORCINI MUSHROOMS */}
        {hasTopping('mushrooms') && (
          <g filter="url(#softShadow)">
            {TOPPING_POSITIONS.mushrooms.map((pos, idx) => (
              <motion.g
                key={`mush-${idx}`}
                initial={{ opacity: 0, scale: 0.1, y: -120, rotate: pos.rotate - 90 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: pos.rotate }}
                transition={{ type: 'spring', stiffness: 110, damping: 13, delay: idx * 0.03 }}
                transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotate})`}
              >
                {/* Mushroom Cap */}
                <path d="M -16 -4 C -16 -16, 16 -16, 16 -4 C 16 -1, 10 -1, 7 -4 C 4 -7, -4 -7, -7 -4 C -10 -1, -16 -1, -16 -4 Z" fill="#84715f" stroke="#4a3e35" strokeWidth="1.5" />
                {/* Mushroom Gills underneath cap */}
                <path d="M -15 -4 Q 0 -6 15 -4" fill="none" stroke="#5c4e42" strokeWidth="1.5" />
                {/* Mushroom Stem */}
                <path d="M -5 -3 C -5 6, -8 11, -8 14 C -8 16, 8 16, 8 14 C 8 11, 5 6, 5 -3 Z" fill="#e7e5e4" stroke="#78716c" strokeWidth="1" />
              </motion.g>
            ))}
          </g>
        )}

        {/* D. CARAMELIZED ONIONS (Curly purple ribbons) */}
        {hasTopping('onions') && (
          <g filter="url(#softShadow)">
            {TOPPING_POSITIONS.onions.map((pos, idx) => (
              <motion.g
                key={`onion-${idx}`}
                initial={{ opacity: 0, scale: 0.1, rotate: pos.rotate - 180 }}
                animate={{ opacity: 1, scale: pos.scale, rotate: pos.rotate }}
                transition={{ type: 'spring', stiffness: 90, damping: 12, delay: idx * 0.02 }}
                transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotate})`}
              >
                <path 
                  d="M -15 -10 Q -5 -25 15 -15 Q 25 5 5 15" 
                  fill="none" 
                  stroke="#a21caf" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  opacity="0.85"
                />
                <path 
                  d="M -15 -10 Q -5 -25 15 -15 Q 25 5 5 15" 
                  fill="none" 
                  stroke="#f472b6" 
                  strokeWidth="1" 
                  strokeLinecap="round" 
                  opacity="0.6"
                />
              </motion.g>
            ))}
          </g>
        )}

        {/* E. KALAMATA OLIVES (Black rings) */}
        {hasTopping('olives') && (
          <g filter="url(#softShadow)">
            {TOPPING_POSITIONS.olives.map((pos, idx) => (
              <motion.g
                key={`olive-${idx}`}
                initial={{ opacity: 0, scale: 0.1, y: -90 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 14, delay: idx * 0.02 }}
                transform={`translate(${pos.x}, ${pos.y})`}
              >
                {/* Outer Ring */}
                <circle cx="0" cy="0" r="9" fill="#1e1b4b" stroke="#090514" strokeWidth="1.5" />
                {/* Inner Ring (hollow slice) */}
                <circle cx="0" cy="0" r="4.5" fill={sauceType === 'tomato' ? '#800a0a' : sauceType === 'pesto' ? '#154915' : '#ebd6aa'} opacity="0.9" />
                {/* Glistening olive skin highlight */}
                <circle cx="-4" cy="-4" r="1.5" fill="#ffffff" opacity="0.6" />
              </motion.g>
            ))}
          </g>
        )}

        {/* F. TOASTED WALNUTS */}
        {hasTopping('walnuts') && (
          <g filter="url(#softShadow)">
            {TOPPING_POSITIONS.walnuts.map((pos, idx) => (
              <motion.g
                key={`walnut-${idx}`}
                initial={{ opacity: 0, scale: 0.1, rotate: pos.rotate - 60 }}
                animate={{ opacity: 1, scale: 1, rotate: pos.rotate }}
                transition={{ type: 'spring', stiffness: 100, damping: 11, delay: idx * 0.02 }}
                transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotate})`}
              >
                {/* Brain-like curly walnut shape */}
                <path d="M -8 -5 C -12 -5 -12 2 -8 2 C -11 5 -6 9 -3 6 C -2 10 5 8 4 4 C 8 3 7 -3 3 -3 C 5 -7 -1 -8 -4 -5 Z" fill="#d97706" stroke="#78350f" strokeWidth="1.2" />
                <path d="M -5 -2 Q -2 -5 1 -2" fill="none" stroke="#78350f" strokeWidth="1" />
              </motion.g>
            ))}
          </g>
        )}

        {/* G. FRESH BASIL LEAVES (Torn, real-looking, dynamic shading) */}
        {hasTopping('basil') && (
          <g filter="url(#gourmetShadow)">
            {TOPPING_POSITIONS.basil.map((pos, idx) => (
              <motion.g
                key={`basil-${idx}`}
                initial={{ opacity: 0, scale: 0, y: -150, rotate: pos.rotate + 120 }}
                animate={{ opacity: 1, scale: pos.scale, y: 0, rotate: pos.rotate }}
                transition={{ type: 'spring', stiffness: 100, damping: 11, delay: idx * 0.04 }}
                transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotate})`}
              >
                {/* Left leaf lobe */}
                <path d="M 0 0 C -12 -18, -25 -5, 0 16" fill="#15803d" stroke="#166534" strokeWidth="1" />
                {/* Right leaf lobe */}
                <path d="M 0 0 C 12 -18, 25 -5, 0 16" fill="#16a34a" stroke="#15803d" strokeWidth="1" />
                {/* Central leaf spine */}
                <path d="M 0 -8 Q 1 4 0 16" fill="none" stroke="#22c55e" strokeWidth="1.5" />
                {/* Small shiny water droplet */}
                <circle cx="-4" cy="2" r="1.5" fill="#ffffff" opacity="0.4" />
              </motion.g>
            ))}
          </g>
        )}

        {/* 5. Glistening oil or hot honey spiral drizzle on top */}
        {hasTopping('hot_honey') && (
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.3 }}
            d="M 250 250 M 250 250 Q 230 220 210 250 Q 190 290 250 310 Q 330 310 320 230 Q 300 140 210 160 Q 120 180 150 290 Q 180 390 320 360"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#softShadow)"
          />
        )}

        {hasTopping('truffle_oil') && (
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.75 }}
            transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
            d="M 250 250 M 230 230 Q 270 210 260 270 Q 190 300 170 220 Q 210 130 310 170 Q 360 250 290 330 Q 170 360 140 260"
            fill="none"
            stroke="#eab308"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#softShadow)"
            strokeDasharray="8,6"
          />
        )}
      </motion.svg>
    </div>
  );
});
