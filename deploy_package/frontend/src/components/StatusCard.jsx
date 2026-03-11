import { motion } from 'framer-motion';
import { User, Circle } from 'lucide-react';

const STATUS_CONFIG = {
  online: {
    color: 'bg-neon-green',
    glow: 'shadow-glow-green',
    text: 'text-neon-green',
    label: 'ONLINE'
  },
  idle: {
    color: 'bg-neon-yellow',
    glow: 'shadow-glow-yellow',
    text: 'text-neon-yellow',
    label: 'IDLE'
  },
  dnd: {
    color: 'bg-glitch-red',
    glow: 'shadow-glow-red',
    text: 'text-glitch-red',
    label: 'DO NOT DISTURB'
  },
  offline: {
    color: 'bg-gray-500',
    glow: '',
    text: 'text-gray-500',
    label: 'OFFLINE'
  }
};

export const StatusCard = ({ status }) => {
  const statusConfig = STATUS_CONFIG[status.status] || STATUS_CONFIG.offline;

  return (
    <motion.div 
      className="glass cut-corner relative overflow-hidden"
      data-testid="status-card"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Animated border glow */}
      <motion.div 
        className={`absolute inset-0 opacity-30 ${statusConfig.glow}`}
        animate={{
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Header */}
      <div className="border-b border-cyber-cyan/20 p-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
          <span className="text-xs font-mono text-cyber-cyan/70 tracking-widest uppercase">
            User Profile
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <motion.div 
            className={`relative w-24 h-24 rounded-full overflow-hidden border-2 ${statusConfig.color.replace('bg-', 'border-')} ${statusConfig.glow}`}
            animate={{
              boxShadow: status.status === 'online' 
                ? ['0 0 20px rgba(57, 255, 20, 0.3)', '0 0 40px rgba(57, 255, 20, 0.5)', '0 0 20px rgba(57, 255, 20, 0.3)']
                : undefined
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {status.avatar_url ? (
              <img 
                src={status.avatar_url} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-surface flex items-center justify-center">
                <User className="w-12 h-12 text-cyber-cyan/50" />
              </div>
            )}
            
            {/* Status indicator overlay */}
            <div className="absolute bottom-1 right-1">
              <motion.div 
                className={`w-5 h-5 rounded-full ${statusConfig.color} border-2 border-void`}
                animate={{
                  scale: status.status === 'online' ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
          
          {/* Username */}
          <div className="mt-4 text-center">
            <h2 className="text-xl md:text-2xl font-bold tracking-wide text-cyber-cyan">
              {status.username || 'Unknown'}
            </h2>
            {status.discriminator && status.discriminator !== '0' && (
              <span className="text-sm font-mono text-cyber-cyan/50">
                #{status.discriminator}
              </span>
            )}
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex justify-center">
          <motion.div 
            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig.color.replace('bg-', 'border-')} bg-black/50`}
            animate={{
              borderColor: status.status === 'online' 
                ? ['rgba(57, 255, 20, 0.5)', 'rgba(57, 255, 20, 1)', 'rgba(57, 255, 20, 0.5)']
                : undefined
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Circle className={`w-3 h-3 ${statusConfig.text} fill-current`} />
            <span className={`text-sm font-mono tracking-wider ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
          </motion.div>
        </div>
        
        {/* User ID */}
        {status.user_id && (
          <div className="mt-6 p-3 bg-black/30 border border-cyber-cyan/10">
            <div className="text-[10px] text-cyber-cyan/40 uppercase tracking-widest mb-1">
              User ID
            </div>
            <div className="text-xs font-mono text-cyber-cyan/70 truncate">
              {status.user_id}
            </div>
          </div>
        )}
      </div>
      
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-cyan/30" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-cyan/30" />
    </motion.div>
  );
};
