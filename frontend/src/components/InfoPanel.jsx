import { motion } from 'framer-motion';
import { Clock, Activity, Cpu, Database } from 'lucide-react';
import { useEffect, useState } from 'react';

export const InfoPanel = ({ status }) => {
  const [uptime, setUptime] = useState('00:00:00');
  const [startTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date() - startTime;
      const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setUptime(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <motion.div 
      className="glass cut-corner-tl relative overflow-hidden"
      data-testid="info-panel"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Header */}
      <div className="border-b border-cyber-cyan/20 p-4">
        <div className="flex items-center gap-2">
          <motion.div 
            className="w-2 h-2 rounded-full bg-cyber-cyan"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs font-mono text-cyber-cyan/70 tracking-widest uppercase">
            System Status
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <SystemStat 
          icon={Clock}
          label="SESSION UPTIME"
          value={uptime}
        />
        <SystemStat 
          icon={Activity}
          label="STATUS UPDATES"
          value={status.timestamp ? formatTimestamp(status.timestamp) : '---'}
        />
        <SystemStat 
          icon={Cpu}
          label="PRESENCE MODE"
          value="ACTIVE"
          active
        />
        <SystemStat 
          icon={Database}
          label="DATA SYNC"
          value="REALTIME"
          active
        />
      </div>

      {/* Live indicator */}
      <div className="absolute bottom-4 right-4">
        <motion.div 
          className="flex items-center gap-2"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-2 h-2 rounded-full bg-glitch-red" />
          <span className="text-[10px] font-mono text-glitch-red tracking-wider">LIVE</span>
        </motion.div>
      </div>

      {/* Decorative */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-cyber-cyan/10" />
    </motion.div>
  );
};

const SystemStat = ({ icon: Icon, label, value, active }) => (
  <div className="flex items-center justify-between p-2 bg-black/20 border border-cyber-cyan/10">
    <div className="flex items-center gap-2">
      <Icon className={`w-3 h-3 ${active ? 'text-neon-green' : 'text-cyber-cyan/50'}`} />
      <span className="text-[10px] text-cyber-cyan/40 uppercase tracking-widest">
        {label}
      </span>
    </div>
    <span className={`text-xs font-mono ${active ? 'text-neon-green' : 'text-cyber-cyan/70'}`}>
      {value}
    </span>
  </div>
);

const formatTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  } catch {
    return '---';
  }
};
