import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { Mic, Radio, Waves, Activity, AudioWaveform, Headphones } from 'lucide-react';

const BAR_COUNT = 40;

// Circular audio visualizer component
const CircularVisualizer = ({ bars, isActive, isSpeaking }) => {
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  
  return (
    <svg width="200" height="200" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30">
      {bars.slice(0, 24).map((height, index) => {
        const angle = (index / 24) * Math.PI * 2 - Math.PI / 2;
        const innerRadius = radius - 10;
        const outerRadius = radius + (height / 100) * 40;
        
        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;
        
        return (
          <motion.line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isSpeaking ? '#39FF14' : isActive ? '#00F0FF' : '#1F2937'}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 0.8 : 0.3 }}
          />
        );
      })}
    </svg>
  );
};

export const AudioVisualizer = ({ isActive, isSpeaking, status }) => {
  const [bars, setBars] = useState(Array(BAR_COUNT).fill(5));
  const [peaks, setPeaks] = useState(Array(BAR_COUNT).fill(5));

  // Generate bars with smoother animation
  useEffect(() => {
    const intervalId = setInterval(() => {
      setBars(prev => prev.map((bar, i) => {
        if (isSpeaking) {
          // Dynamic speaking pattern - more variation
          const base = Math.sin(Date.now() / 100 + i * 0.5) * 20;
          const random = Math.random() * 60;
          return Math.max(15, Math.min(95, base + random + 30));
        } else if (isActive) {
          // Subtle listening pattern - gentle waves
          const wave = Math.sin(Date.now() / 200 + i * 0.3) * 15;
          return Math.max(5, Math.min(40, wave + 20 + Math.random() * 10));
        } else {
          // Idle - minimal movement
          return Math.random() * 8 + 2;
        }
      }));
      
      // Update peaks (they fall slower)
      setPeaks(prev => prev.map((peak, i) => {
        const currentBar = bars[i] || 5;
        if (currentBar > peak) return currentBar;
        return Math.max(currentBar, peak - 2);
      }));
    }, 50);

    return () => clearInterval(intervalId);
  }, [isActive, isSpeaking, bars]);

  const getStateInfo = () => {
    if (!status.is_in_vc) {
      return { label: 'NOT IN VOICE', color: 'text-gray-500', icon: Radio, bgGlow: 'transparent' };
    }
    if (status.is_self_deafened || status.is_deafened) {
      return { label: 'DEAFENED', color: 'text-glitch-red', icon: Activity, bgGlow: 'rgba(255, 0, 60, 0.1)' };
    }
    if (status.is_self_muted || status.is_muted) {
      return { label: 'MUTED', color: 'text-neon-yellow', icon: Mic, bgGlow: 'rgba(250, 204, 21, 0.1)' };
    }
    if (isSpeaking) {
      return { label: 'SPEAKING', color: 'text-neon-green', icon: Waves, bgGlow: 'rgba(57, 255, 20, 0.15)' };
    }
    return { label: 'LISTENING', color: 'text-cyber-cyan', icon: Headphones, bgGlow: 'rgba(0, 240, 255, 0.1)' };
  };

  const stateInfo = getStateInfo();
  const StateIcon = stateInfo.icon;

  // Calculate average amplitude for stats
  const avgAmplitude = useMemo(() => 
    Math.floor(bars.reduce((a, b) => a + b, 0) / BAR_COUNT), 
    [bars]
  );

  return (
    <motion.div 
      className="glass cut-corner h-full min-h-[300px] md:min-h-[400px] relative overflow-hidden"
      data-testid="audio-visualizer"
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: stateInfo.bgGlow
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Header */}
      <div className="border-b border-cyber-cyan/20 p-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div 
              className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-neon-green' : isActive ? 'bg-cyber-cyan' : 'bg-gray-500'}`}
              animate={isActive ? { 
                scale: [1, 1.5, 1],
                boxShadow: isSpeaking 
                  ? ['0 0 5px #39FF14', '0 0 15px #39FF14', '0 0 5px #39FF14']
                  : ['0 0 5px #00F0FF', '0 0 10px #00F0FF', '0 0 5px #00F0FF']
              } : {}}
              transition={{ duration: isSpeaking ? 0.3 : 0.8, repeat: Infinity }}
            />
            <span className="text-xs font-mono text-cyber-cyan/70 tracking-widest uppercase">
              Audio Analysis
            </span>
          </div>
          <motion.div 
            className={`flex items-center gap-2 ${stateInfo.color}`}
            animate={isActive ? {
              textShadow: isSpeaking 
                ? ['0 0 5px rgba(57, 255, 20, 0.5)', '0 0 15px rgba(57, 255, 20, 0.8)', '0 0 5px rgba(57, 255, 20, 0.5)']
                : ['0 0 5px rgba(0, 240, 255, 0.3)', '0 0 10px rgba(0, 240, 255, 0.5)', '0 0 5px rgba(0, 240, 255, 0.3)']
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <motion.div
              animate={isActive ? { rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <StateIcon className="w-4 h-4" />
            </motion.div>
            <span className="text-xs font-mono tracking-wider">{stateInfo.label}</span>
          </motion.div>
        </div>
      </div>

      {/* Visualizer Container */}
      <div className="p-6 h-[calc(100%-60px)] flex flex-col relative">
        {/* Circular visualizer background */}
        <CircularVisualizer bars={bars} isActive={isActive} isSpeaking={isSpeaking} />
        
        {/* Main Bar Visualizer */}
        <div className="flex-1 flex items-end justify-center gap-[2px] md:gap-1 px-2 relative z-10">
          {bars.map((height, index) => (
            <div key={index} className="flex-1 max-w-2 relative flex flex-col items-center">
              {/* Peak indicator */}
              <motion.div
                className="w-full h-1 rounded-full absolute"
                style={{
                  bottom: `${peaks[index]}%`,
                  background: isSpeaking ? '#39FF14' : isActive ? '#00F0FF' : '#1F2937',
                  boxShadow: isActive ? `0 0 5px ${isSpeaking ? '#39FF14' : '#00F0FF'}` : 'none'
                }}
                animate={{
                  opacity: isActive ? [0.8, 1, 0.8] : 0.3
                }}
                transition={{ duration: 0.5, repeat: Infinity, delay: index * 0.02 }}
              />
              
              {/* Main bar */}
              <motion.div
                className="w-full rounded-t"
                style={{
                  background: isSpeaking 
                    ? `linear-gradient(180deg, #39FF14 0%, #00F0FF 40%, #FF003C 100%)`
                    : isActive
                      ? `linear-gradient(180deg, #00F0FF 0%, #0080FF 100%)`
                      : `linear-gradient(180deg, #1F2937 0%, #0A0A0F 100%)`,
                  boxShadow: isSpeaking 
                    ? '0 0 10px rgba(57, 255, 20, 0.5)' 
                    : isActive 
                      ? '0 0 5px rgba(0, 240, 255, 0.3)' 
                      : 'none'
                }}
                animate={{
                  height: `${height}%`,
                  opacity: isActive ? 1 : 0.3
                }}
                transition={{
                  height: { duration: 0.05, ease: 'linear' },
                }}
              />
            </div>
          ))}
        </div>

        {/* Waveform Line */}
        <div className="mt-4 h-20 relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
            {/* Grid lines */}
            {[...Array(5)].map((_, i) => (
              <line
                key={i}
                x1="0"
                y1={i * 20}
                x2="400"
                y2={i * 20}
                stroke="rgba(0, 240, 255, 0.1)"
                strokeWidth="1"
              />
            ))}
            
            {/* Waveform fill */}
            <motion.path
              d={`M 0 40 ${bars.map((h, i) => `L ${(i / BAR_COUNT) * 400} ${40 - (h / 100) * 35}`).join(' ')} L 400 40 L 400 80 L 0 80 Z`}
              fill={isSpeaking ? 'rgba(57, 255, 20, 0.1)' : isActive ? 'rgba(0, 240, 255, 0.1)' : 'rgba(31, 41, 55, 0.2)'}
            />
            
            {/* Main waveform line */}
            <motion.path
              d={`M 0 40 ${bars.map((h, i) => `L ${(i / BAR_COUNT) * 400} ${40 - (h / 100) * 35}`).join(' ')} L 400 40`}
              fill="none"
              stroke={isSpeaking ? '#39FF14' : isActive ? '#00F0FF' : '#1F2937'}
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Glow effect line */}
            <motion.path
              d={`M 0 40 ${bars.map((h, i) => `L ${(i / BAR_COUNT) * 400} ${40 - (h / 100) * 35}`).join(' ')} L 400 40`}
              fill="none"
              stroke={isSpeaking ? '#39FF14' : isActive ? '#00F0FF' : '#1F2937'}
              strokeWidth="6"
              opacity="0.3"
              filter="blur(4px)"
            />

            {/* Mirror waveform (below center) */}
            <motion.path
              d={`M 0 40 ${bars.map((h, i) => `L ${(i / BAR_COUNT) * 400} ${40 + (h / 100) * 20}`).join(' ')} L 400 40`}
              fill="none"
              stroke={isSpeaking ? '#39FF14' : isActive ? '#00F0FF' : '#1F2937'}
              strokeWidth="1"
              opacity="0.4"
            />
          </svg>
          
          {/* Center line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-cyber-cyan/30" />
          
          {/* Animated scan line */}
          {isActive && (
            <motion.div
              className="absolute top-0 bottom-0 w-1"
              style={{
                background: `linear-gradient(180deg, transparent 0%, ${isSpeaking ? '#39FF14' : '#00F0FF'} 50%, transparent 100%)`,
                boxShadow: `0 0 10px ${isSpeaking ? '#39FF14' : '#00F0FF'}`
              }}
              animate={{
                left: ['0%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          )}
        </div>

        {/* Stats with live values */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <StatBox 
            label="FREQUENCY" 
            value={isActive ? `${Math.floor(200 + avgAmplitude * 5)}Hz` : '---'} 
            active={isActive}
            speaking={isSpeaking}
          />
          <StatBox 
            label="AMPLITUDE" 
            value={isActive ? `${avgAmplitude}%` : '---'} 
            active={isActive}
            speaking={isSpeaking}
            highlight={avgAmplitude > 60}
          />
          <StatBox 
            label="SIGNAL" 
            value={isActive ? (isSpeaking ? 'STRONG' : 'NORMAL') : '---'} 
            active={isActive}
            speaking={isSpeaking}
          />
        </div>
      </div>

      {/* Decorative corner elements */}
      <motion.div 
        className="absolute top-0 right-0 w-24 h-24 border-t border-r"
        style={{ borderColor: isSpeaking ? 'rgba(57, 255, 20, 0.3)' : 'rgba(0, 240, 255, 0.1)' }}
        animate={isActive ? { borderColor: isSpeaking ? ['rgba(57, 255, 20, 0.2)', 'rgba(57, 255, 20, 0.5)', 'rgba(57, 255, 20, 0.2)'] : ['rgba(0, 240, 255, 0.1)', 'rgba(0, 240, 255, 0.3)', 'rgba(0, 240, 255, 0.1)'] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-24 h-24 border-b border-l"
        style={{ borderColor: isSpeaking ? 'rgba(57, 255, 20, 0.3)' : 'rgba(0, 240, 255, 0.1)' }}
        animate={isActive ? { borderColor: isSpeaking ? ['rgba(57, 255, 20, 0.2)', 'rgba(57, 255, 20, 0.5)', 'rgba(57, 255, 20, 0.2)'] : ['rgba(0, 240, 255, 0.1)', 'rgba(0, 240, 255, 0.3)', 'rgba(0, 240, 255, 0.1)'] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
      />
      
      {/* Active state overlay glow */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.3, 0.5, 0.3],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{
              background: 'radial-gradient(ellipse at center bottom, rgba(57, 255, 20, 0.2) 0%, transparent 60%)'
            }}
          />
        )}
        {isActive && !isSpeaking && (
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.2, 0.3, 0.2],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              background: 'radial-gradient(ellipse at center bottom, rgba(0, 240, 255, 0.1) 0%, transparent 60%)'
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const StatBox = ({ label, value, active, speaking, highlight }) => (
  <motion.div 
    className={`p-3 border ${
      speaking ? 'bg-neon-green/10 border-neon-green/30' :
      active ? 'bg-cyber-cyan/5 border-cyber-cyan/20' : 'bg-black/30 border-cyber-cyan/10'
    }`}
    animate={speaking ? {
      borderColor: ['rgba(57, 255, 20, 0.2)', 'rgba(57, 255, 20, 0.5)', 'rgba(57, 255, 20, 0.2)']
    } : {}}
    transition={{ duration: 1, repeat: Infinity }}
  >
    <div className="text-[10px] text-cyber-cyan/40 uppercase tracking-widest mb-1">
      {label}
    </div>
    <motion.div 
      className={`text-sm font-mono ${
        highlight ? 'text-neon-green' :
        speaking ? 'text-neon-green' :
        active ? 'text-cyber-cyan' : 'text-gray-600'
      }`}
      animate={highlight ? {
        textShadow: ['0 0 5px rgba(57, 255, 20, 0.5)', '0 0 15px rgba(57, 255, 20, 0.8)', '0 0 5px rgba(57, 255, 20, 0.5)']
      } : {}}
      transition={{ duration: 0.5, repeat: Infinity }}
    >
      {value}
    </motion.div>
  </motion.div>
);
