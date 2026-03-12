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
  AudioWaveform,
  UserPlus,
  ExternalLink
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

// Discord Invite Button Component
const InviteButton = () => {
  // Discord Bot Invite URL - Replace CLIENT_ID with your actual Discord Application ID
  const DISCORD_CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID || '656804552175124481';
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=3147776&scope=bot%20applications.commands`;

  return (
    <motion.a
      href={inviteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#5865F2]/20 border border-[#5865F2]/50 rounded-none cut-corner cursor-pointer group relative overflow-hidden"
      data-testid="discord-invite-btn"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#5865F2]/0 via-[#5865F2]/20 to-[#5865F2]/0"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      
      {/* Discord Logo SVG */}
      <motion.div
        className="relative z-10"
        animate={{
          rotate: [0, -5, 5, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="text-[#5865F2] group-hover:text-white transition-colors duration-300"
        >
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      </motion.div>

      {/* Button Text */}
      <span className="relative z-10 text-sm font-semibold tracking-wide text-[#5865F2] group-hover:text-white transition-colors duration-300">
        Invite me to your Discord Server
      </span>

      {/* External Link Icon */}
      <motion.div
        className="relative z-10"
        animate={{
          x: [0, 3, 0],
          y: [0, -3, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <ExternalLink className="w-4 h-4 text-[#5865F2]/70 group-hover:text-white/70 transition-colors duration-300" />
      </motion.div>

      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: '0 0 20px rgba(88, 101, 242, 0.5), inset 0 0 20px rgba(88, 101, 242, 0.1)'
        }}
      />
    </motion.a>
  );
};
