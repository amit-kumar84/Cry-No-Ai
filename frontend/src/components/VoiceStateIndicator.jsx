import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Headphones, 
  Volume2,
  VolumeX,
  Radio,
  Wifi,
  WifiOff,
  MonitorPlay,
  AudioWaveform
} from 'lucide-react';

const VOICE_STATES = {
  none: {
    icon: WifiOff,
    label: 'Not Connected',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    glowColor: 'rgba(107, 114, 128, 0.3)',
    description: 'Not in any voice channel'
  },
  speaking: {
    icon: Mic,
    label: 'Speaking',
    color: 'text-neon-green',
    bgColor: 'bg-neon-green/10',
    borderColor: 'border-neon-green/30',
    glowColor: 'rgba(57, 255, 20, 0.6)',
    description: 'User is currently speaking'
  },
  listening: {
    icon: Headphones,
    label: 'Listening',
    color: 'text-cyber-cyan',
    bgColor: 'bg-cyber-cyan/10',
    borderColor: 'border-cyber-cyan/30',
    glowColor: 'rgba(0, 240, 255, 0.5)',
    description: 'Connected and listening'
  },
  muted: {
    icon: MicOff,
    label: 'Muted',
    color: 'text-neon-yellow',
    bgColor: 'bg-neon-yellow/10',
    borderColor: 'border-neon-yellow/30',
    glowColor: 'rgba(250, 204, 21, 0.4)',
    description: 'Microphone is muted'
  },
  deafened: {
    icon: VolumeX,
    label: 'Deafened',
    color: 'text-glitch-red',
    bgColor: 'bg-glitch-red/10',
    borderColor: 'border-glitch-red/30',
    glowColor: 'rgba(255, 0, 60, 0.4)',
    description: 'Audio output is deafened'
  },
  streaming: {
    icon: MonitorPlay,
    label: 'Streaming',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    description: 'Currently streaming'
  }
};

// Sound wave rings animation component
const SoundWaveRings = ({ isActive, color }) => {
  if (!isActive) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{ borderColor: color }}
          initial={{ width: 80, height: 80, opacity: 0.8 }}
          animate={{
            width: [80, 160, 200],
            height: [80, 160, 200],
            opacity: [0.6, 0.3, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
};

// Pulsing dots animation for listening
const ListeningDots = ({ isActive }) => {
  if (!isActive) return null;
  
  return (
    <div className="flex gap-1 mt-2">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-cyber-cyan"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

// Speaking waveform animation
const SpeakingWaveform = ({ isActive }) => {
  if (!isActive) return null;
  
  return (
    <div className="flex items-center gap-[2px] mt-2 h-6">
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-neon-green rounded-full"
          animate={{
            height: [8, 24, 12, 20, 8],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

export const VoiceStateIndicator = ({ voiceState, status }) => {
  const state = VOICE_STATES[voiceState] || VOICE_STATES.none;
  const StateIcon = state.icon;
  const isSpeaking = voiceState === 'speaking';
  const isListening = voiceState === 'listening';

  return (
    <motion.div 
      className="glass cut-corner-tl relative overflow-hidden"
      data-testid="voice-state-indicator"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Animated background glow for active states */}
      <AnimatePresence>
        {(isSpeaking || isListening) && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: `radial-gradient(circle at center, ${state.glowColor} 0%, transparent 70%)`
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b border-cyber-cyan/20 p-4 relative z-10">
        <div className="flex items-center gap-2">
          <motion.div 
            className={`w-2 h-2 rounded-full ${voiceState !== 'none' ? (isSpeaking ? 'bg-neon-green' : 'bg-cyber-cyan') : 'bg-gray-500'}`}
            animate={voiceState !== 'none' ? { 
              scale: [1, 1.5, 1],
              opacity: [1, 0.6, 1]
            } : {}}
            transition={{ duration: isSpeaking ? 0.3 : 1.5, repeat: Infinity }}
          />
          <span className="text-xs font-mono text-cyber-cyan/70 tracking-widest uppercase">
            Voice State
          </span>
          
          {/* Live indicator for active states */}
          {(isSpeaking || isListening) && (
            <motion.span 
              className={`ml-auto text-[10px] font-mono ${isSpeaking ? 'text-neon-green' : 'text-cyber-cyan'} tracking-wider`}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ● LIVE
            </motion.span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={voiceState}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col items-center"
          >
            {/* Main Icon Container with rings */}
            <div className="relative">
              <SoundWaveRings isActive={isSpeaking} color={state.glowColor} />
              
              <motion.div 
                className={`w-24 h-24 rounded-full ${state.bgColor} ${state.borderColor} border-2 flex items-center justify-center relative z-10`}
                animate={isSpeaking ? {
                  boxShadow: [
                    `0 0 20px ${state.glowColor}`,
                    `0 0 50px ${state.glowColor}`,
                    `0 0 20px ${state.glowColor}`
                  ],
                  scale: [1, 1.08, 1]
                } : isListening ? {
                  boxShadow: [
                    `0 0 15px ${state.glowColor}`,
                    `0 0 30px ${state.glowColor}`,
                    `0 0 15px ${state.glowColor}`
                  ],
                  borderColor: ['rgba(0, 240, 255, 0.3)', 'rgba(0, 240, 255, 0.8)', 'rgba(0, 240, 255, 0.3)']
                } : {}}
                transition={{ duration: isSpeaking ? 0.4 : 1.5, repeat: Infinity }}
              >
                <motion.div
                  animate={isSpeaking ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  } : isListening ? {
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{ duration: isSpeaking ? 0.3 : 2, repeat: Infinity }}
                >
                  <StateIcon className={`w-12 h-12 ${state.color}`} />
                </motion.div>
              </motion.div>
            </div>

            {/* State Label with animation */}
            <motion.h3 
              className={`text-2xl font-bold tracking-wide uppercase ${state.color} mt-4`}
              animate={isSpeaking ? {
                textShadow: [
                  '0 0 10px rgba(57, 255, 20, 0.5)',
                  '0 0 25px rgba(57, 255, 20, 0.8)',
                  '0 0 10px rgba(57, 255, 20, 0.5)'
                ]
              } : isListening ? {
                textShadow: [
                  '0 0 10px rgba(0, 240, 255, 0.3)',
                  '0 0 20px rgba(0, 240, 255, 0.6)',
                  '0 0 10px rgba(0, 240, 255, 0.3)'
                ]
              } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {state.label}
            </motion.h3>
            
            <p className="text-xs text-cyber-cyan/50 mt-1">
              {state.description}
            </p>

            {/* State-specific animations */}
            <SpeakingWaveform isActive={isSpeaking} />
            <ListeningDots isActive={isListening} />
          </motion.div>
        </AnimatePresence>

        {/* Quick Status Grid */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <QuickStatus 
            icon={status.is_self_muted ? MicOff : Mic}
            label="MIC"
            active={!status.is_self_muted && status.is_in_vc}
            warning={status.is_self_muted}
            speaking={isSpeaking && !status.is_self_muted}
          />
          <QuickStatus 
            icon={status.is_self_deafened ? VolumeX : Volume2}
            label="AUDIO"
            active={!status.is_self_deafened && status.is_in_vc}
            warning={status.is_self_deafened}
            listening={isListening && !status.is_self_deafened}
          />
          <QuickStatus 
            icon={status.is_streaming ? MonitorPlay : Radio}
            label="STREAM"
            active={status.is_streaming}
          />
          <QuickStatus 
            icon={status.is_in_vc ? Wifi : WifiOff}
            label="VOICE"
            active={status.is_in_vc}
          />
        </div>
      </div>

      {/* Corner decorations with glow */}
      <motion.div 
        className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2"
        style={{ borderColor: isSpeaking ? '#39FF14' : isListening ? '#00F0FF' : 'rgba(0, 240, 255, 0.3)' }}
        animate={(isSpeaking || isListening) ? {
          opacity: [0.5, 1, 0.5]
        } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2"
        style={{ borderColor: isSpeaking ? '#39FF14' : isListening ? '#00F0FF' : 'rgba(0, 240, 255, 0.3)' }}
        animate={(isSpeaking || isListening) ? {
          opacity: [0.5, 1, 0.5]
        } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
      />
    </motion.div>
  );
};

const QuickStatus = ({ icon: Icon, label, active, warning, speaking, listening }) => (
  <motion.div 
    className={`p-2 border ${
      warning ? 'border-neon-yellow/30 bg-neon-yellow/5' :
      speaking ? 'border-neon-green/50 bg-neon-green/10' :
      listening ? 'border-cyber-cyan/50 bg-cyber-cyan/10' :
      active ? 'border-neon-green/30 bg-neon-green/5' : 'border-cyber-cyan/10 bg-black/20'
    }`}
    animate={(speaking || listening) ? {
      borderColor: speaking 
        ? ['rgba(57, 255, 20, 0.3)', 'rgba(57, 255, 20, 0.8)', 'rgba(57, 255, 20, 0.3)']
        : ['rgba(0, 240, 255, 0.3)', 'rgba(0, 240, 255, 0.8)', 'rgba(0, 240, 255, 0.3)']
    } : {}}
    transition={{ duration: 1, repeat: Infinity }}
  >
    <div className="flex items-center gap-2">
      <motion.div
        animate={(speaking || listening) ? {
          scale: [1, 1.2, 1]
        } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <Icon className={`w-3 h-3 ${
          warning ? 'text-neon-yellow' :
          speaking ? 'text-neon-green' :
          listening ? 'text-cyber-cyan' :
          active ? 'text-neon-green' : 'text-gray-600'
        }`} />
      </motion.div>
      <span className="text-[10px] font-mono text-cyber-cyan/50 uppercase">{label}</span>
    </div>
  </motion.div>
);
