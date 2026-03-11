import { motion } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const ConnectionStatus = ({ connected }) => {
  return (
    <motion.div 
      className={`flex items-center gap-2 px-4 py-2 border ${
        connected 
          ? 'border-neon-green/30 bg-neon-green/10' 
          : 'border-glitch-red/30 bg-glitch-red/10'
      }`}
      data-testid="connection-status"
      animate={connected ? {} : { 
        borderColor: ['rgba(255, 0, 60, 0.3)', 'rgba(255, 0, 60, 0.6)', 'rgba(255, 0, 60, 0.3)']
      }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      {connected ? (
        <>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Wifi className="w-4 h-4 text-neon-green" />
          </motion.div>
          <span className="text-xs font-mono text-neon-green tracking-wider">
            CONNECTED
          </span>
        </>
      ) : (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="w-4 h-4 text-glitch-red" />
          </motion.div>
          <span className="text-xs font-mono text-glitch-red tracking-wider">
            RECONNECTING...
          </span>
        </>
      )}
    </motion.div>
  );
};
