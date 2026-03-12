import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

// Discord Invite Button - 3D Cyberpunk Style
export const DiscordInviteButton = () => {
  const DISCORD_CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID || '656804552175124481';
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=3147776&scope=bot%20applications.commands`;

  return (
    <motion.a
      href={inviteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="relative group block w-full cursor-pointer"
      data-testid="discord-invite-btn"
      initial={{ opacity: 0, y: 20, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      whileHover={{ 
        scale: 1.03,
        rotateX: 5,
        rotateY: -2,
        z: 50
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      {/* 3D Shadow Layer */}
      <div 
        className="absolute inset-0 bg-[#5865F2]/30 blur-xl transform translate-y-2 translate-x-1 group-hover:translate-y-4 group-hover:blur-2xl transition-all duration-300"
        style={{ transform: 'translateZ(-20px)' }}
      />

      {/* Glowing border effect */}
      <motion.div
        className="absolute -inset-[2px] rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, #5865F2, #00F0FF, #39FF14, #5865F2)',
          backgroundSize: '300% 100%',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Main Button Container */}
      <div 
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0A0A0F 0%, #12121A 50%, #0A0A0F 100%)',
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
          transform: 'translateZ(0)',
        }}
      >
        {/* Animated cyber grid background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(88, 101, 242, 0.1) 1px, transparent 1px),
              linear-gradient(rgba(88, 101, 242, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Scanning line effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(88, 101, 242, 0.3) 50%, transparent 100%)',
            height: '30%',
          }}
          animate={{
            top: ['-30%', '130%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        />

        {/* Inner content */}
        <div className="relative px-6 py-5 flex items-center justify-center gap-4">
          {/* Discord Logo with 3D effect */}
          <motion.div
            className="relative"
            animate={{
              rotateY: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Logo glow */}
            <div className="absolute inset-0 blur-md bg-[#5865F2] opacity-50 group-hover:opacity-80 transition-opacity" />
            
            {/* Discord SVG */}
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="relative z-10 text-white drop-shadow-[0_0_10px_rgba(88,101,242,0.8)]"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </motion.div>

          {/* Text with cyberpunk styling */}
          <div className="flex flex-col items-start">
            <motion.span 
              className="text-[10px] font-mono text-[#5865F2]/70 tracking-[0.3em] uppercase"
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              // CONNECT
            </motion.span>
            <span className="text-base md:text-lg font-bold tracking-wide text-white group-hover:text-[#5865F2] transition-colors duration-300">
              Invite me to your Discord Server
            </span>
          </div>

          {/* Animated arrow */}
          <motion.div
            className="ml-auto"
            animate={{
              x: [0, 5, 0],
              rotateZ: [0, -10, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <ExternalLink className="w-5 h-5 text-[#5865F2] group-hover:text-cyber-cyan transition-colors" />
          </motion.div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#5865F2]/50 group-hover:border-cyber-cyan transition-colors" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#5865F2]/50 group-hover:border-cyber-cyan transition-colors" />
        
        {/* Top highlight line */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent, #5865F2, #00F0FF, #5865F2, transparent)'
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Bottom highlight line */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent, #39FF14, #00F0FF, #39FF14, transparent)'
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />

        {/* Holographic shimmer on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(0, 240, 255, 0.1) 50%, transparent 70%)',
          }}
          animate={{
            backgroundPosition: ['-200% 0', '200% 0']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#5865F2] rounded-full opacity-0 group-hover:opacity-60"
            style={{
              left: `${15 + i * 15}%`,
              bottom: '0%',
            }}
            animate={{
              y: [0, -60, -80],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeOut'
            }}
          />
        ))}
      </div>
    </motion.a>
  );
};
