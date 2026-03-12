import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiscordStatus } from '../hooks/useDiscordStatus';
import { StatusCard } from '../components/StatusCard';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { InfoPanel } from '../components/InfoPanel';
import { VoiceStateIndicator } from '../components/VoiceStateIndicator';
import { ServerInfo } from '../components/ServerInfo';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { DiscordInviteButton } from '../components/DiscordInviteButton';
import { 
  Wifi, 
  WifiOff, 
  Radio,
  Mic,
  MicOff,
  Headphones,
  Volume2,
  VolumeX,
  Monitor,
  Users
} from 'lucide-react';

export default function Dashboard() {
  const { status, connected, error } = useDiscordStatus();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden" data-testid="discord-dashboard">
      {/* Cyberpunk Background */}
      <div className="cyber-background" />
      <div className="cyber-grid opacity-30" />
      <div className="vignette" />
      
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-[-2] opacity-20"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/18545023/pexels-photo-18545023.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-4 md:p-8 lg:p-12">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.div 
                className="w-3 h-3 rounded-full bg-cyber-cyan"
                animate={{ 
                  boxShadow: connected 
                    ? ['0 0 10px #00F0FF', '0 0 30px #00F0FF', '0 0 10px #00F0FF']
                    : ['0 0 10px #FF003C', '0 0 20px #FF003C', '0 0 10px #FF003C']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-widest uppercase text-glow-cyan font-rajdhani">
                CRY-NO-AI
              </h1>
              <p className="text-xs md:text-sm text-cyber-cyan/60 tracking-wider font-mono">
                DISCORD PRESENCE MONITOR v2.0
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <ConnectionStatus connected={connected} />
            <div className="text-right">
              <div className="text-xl md:text-2xl font-mono text-cyber-cyan tracking-wider">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-cyber-cyan/50 font-mono tracking-wider">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
          {/* Left Column - User Status */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-4 md:space-y-6"
          >
            <StatusCard status={status} />
            <VoiceStateIndicator voiceState={status.voice_state} status={status} />
            {/* Discord Invite Button - Below Voice State */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <DiscordInviteButton />
            </motion.div>
          </motion.div>

          {/* Center Column - Audio Visualizer */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5"
          >
            <AudioVisualizer 
              isActive={status.voice_state === 'speaking' || status.voice_state === 'listening'} 
              isSpeaking={status.voice_state === 'speaking'}
              status={status}
            />
          </motion.div>

          {/* Right Column - Server Info */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3 space-y-4 md:space-y-6"
          >
            <ServerInfo status={status} />
            <InfoPanel status={status} />
          </motion.div>
        </div>

        {/* Bottom Status Bar */}
        <motion.footer 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 md:mt-12"
        >
          <div className="glass cut-corner p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <StatusIndicator 
                  icon={status.is_in_vc ? <Headphones className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  label="Voice"
                  value={status.is_in_vc ? 'Connected' : 'Disconnected'}
                  active={status.is_in_vc}
                />
                <StatusIndicator 
                  icon={status.is_self_muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  label="Mic"
                  value={status.is_self_muted ? 'Muted' : 'Active'}
                  active={!status.is_self_muted && status.is_in_vc}
                  warning={status.is_self_muted}
                />
                <StatusIndicator 
                  icon={status.is_self_deafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  label="Audio"
                  value={status.is_self_deafened ? 'Deafened' : 'Active'}
                  active={!status.is_self_deafened && status.is_in_vc}
                  warning={status.is_self_deafened}
                />
                <StatusIndicator 
                  icon={<Monitor className="w-4 h-4" />}
                  label="Stream"
                  value={status.is_streaming ? 'Live' : 'Off'}
                  active={status.is_streaming}
                />
              </div>
              
              <div className="flex items-center gap-2 text-xs font-mono text-cyber-cyan/50">
                <Radio className="w-3 h-3" />
                <span>SIGNAL: {connected ? 'STRONG' : 'LOST'}</span>
                <span className="mx-2">|</span>
                <span>LATENCY: {connected ? '~45ms' : '---'}</span>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>

      {/* Scanlines overlay */}
      <div className="scanlines pointer-events-none" />
    </div>
  );
}

// Status Indicator Component
const StatusIndicator = ({ icon, label, value, active, warning }) => (
  <div className="flex items-center gap-2">
    <div className={`p-2 rounded ${
      warning ? 'bg-glitch-red/20 text-glitch-red' :
      active ? 'bg-neon-green/20 text-neon-green' : 'bg-surface text-cyber-cyan/50'
    }`}>
      {icon}
    </div>
    <div>
      <div className="text-[10px] uppercase tracking-wider text-cyber-cyan/50">{label}</div>
      <div className={`text-xs font-mono ${
        warning ? 'text-glitch-red' :
        active ? 'text-neon-green' : 'text-cyber-cyan/70'
      }`}>
        {value}
      </div>
    </div>
  </div>
);
