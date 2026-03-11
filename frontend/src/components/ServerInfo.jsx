import { motion, AnimatePresence } from 'framer-motion';
import { Server, Hash, Users, Radio, Wifi } from 'lucide-react';

export const ServerInfo = ({ status }) => {
  const isConnected = status.is_in_vc && status.server_name;

  return (
    <motion.div 
      className="glass cut-corner relative overflow-hidden"
      data-testid="server-info"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Header */}
      <div className="border-b border-cyber-cyan/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div 
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neon-green' : 'bg-gray-500'}`}
              animate={isConnected ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-mono text-cyber-cyan/70 tracking-widest uppercase">
              Server Info
            </span>
          </div>
          <Wifi className={`w-4 h-4 ${isConnected ? 'text-neon-green' : 'text-gray-500'}`} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <AnimatePresence mode="wait">
          {isConnected ? (
            <motion.div
              key="connected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Server Name */}
              <InfoRow 
                icon={Server}
                label="SERVER"
                value={status.server_name || 'Unknown'}
                highlight
              />

              {/* Channel Name */}
              <InfoRow 
                icon={Hash}
                label="CHANNEL"
                value={status.channel_name || 'Unknown'}
              />

              {/* Server Members */}
              <InfoRow 
                icon={Users}
                label="SERVER MEMBERS"
                value={status.server_member_count?.toLocaleString() || '0'}
                isNumber
              />

              {/* VC Members */}
              <InfoRow 
                icon={Radio}
                label="IN VOICE CHANNEL"
                value={status.channel_member_count?.toString() || '0'}
                isNumber
                active
              />
            </motion.div>
          ) : (
            <motion.div
              key="disconnected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                <Server className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Not connected to<br />any voice channel
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative */}
      <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-cyber-cyan/10" />
    </motion.div>
  );
};

const InfoRow = ({ icon: Icon, label, value, highlight, isNumber, active }) => (
  <div className={`p-3 border ${active ? 'border-neon-green/30 bg-neon-green/5' : 'border-cyber-cyan/10 bg-black/20'}`}>
    <div className="flex items-center gap-2 mb-1">
      <Icon className={`w-3 h-3 ${active ? 'text-neon-green' : 'text-cyber-cyan/50'}`} />
      <span className="text-[10px] text-cyber-cyan/40 uppercase tracking-widest">
        {label}
      </span>
    </div>
    <div className={`${isNumber ? 'font-mono text-lg' : 'text-sm'} ${
      highlight ? 'text-cyber-cyan' : active ? 'text-neon-green' : 'text-cyber-cyan/80'
    } truncate`}>
      {value}
    </div>
  </div>
);
