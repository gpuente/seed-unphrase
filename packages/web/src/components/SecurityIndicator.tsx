import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import type { SecurityLevel } from '../App';

interface SecurityIndicatorProps {
  security: SecurityLevel;
  isProcessing?: boolean;
}

const SecurityIndicator = ({ security, isProcessing = false }: SecurityIndicatorProps) => {
  const getSecurityConfig = () => {
    if (security.hasSalt) {
      return {
        level: 'Enhanced Security',
        color: 'from-emerald-500 to-green-400',
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500/30',
        icon: ShieldCheck,
        description: 'Salt protection active - Maximum security against brute force attacks',
        particles: true
      };
    } else {
      return {
        level: 'Basic Security', 
        color: 'from-amber-500 to-orange-400',
        bgColor: 'bg-amber-500/20',
        borderColor: 'border-amber-500/30',
        icon: AlertTriangle,
        description: 'Consider adding salt for enhanced protection',
        particles: false
      };
    }
  };

  const config = getSecurityConfig();
  const Icon = config.icon;

  return (
    <motion.div
      className={`
        relative px-6 py-4 rounded-2xl backdrop-blur-sm border ${config.borderColor} ${config.bgColor}
        shadow-lg max-w-md
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Background glow effect */}
      <motion.div
        className={`absolute -inset-0.5 bg-gradient-to-r ${config.color} rounded-2xl blur opacity-30`}
        animate={{
          opacity: security.hasSalt ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative flex items-center space-x-4">
        {/* Animated icon */}
        <motion.div
          className="relative"
          animate={isProcessing ? {
            rotate: 360,
            scale: [1, 1.1, 1]
          } : security.hasSalt ? {
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{
            duration: isProcessing ? 1 : 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon 
            size={28} 
            className={`text-transparent bg-gradient-to-r ${config.color} bg-clip-text`}
          />
          
          {/* Particle effects for enhanced security */}
          <AnimatePresence>
            {config.particles && (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-emerald-400 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ 
                      scale: 0,
                      x: 0,
                      y: 0,
                      opacity: 1 
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      x: [0, Math.cos(i * 60) * 30],
                      y: [0, Math.sin(i * 60) * 30],
                      opacity: [1, 0.8, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex-1">
          <motion.h3 
            className={`font-semibold text-transparent bg-gradient-to-r ${config.color} bg-clip-text`}
            layoutId="securityLevel"
          >
            {config.level}
          </motion.h3>
          
          <motion.p 
            className="text-sm text-slate-300 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {config.description}
          </motion.p>
        </div>

        {/* Info tooltip trigger */}
        <motion.div
          className="relative group cursor-help"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Info size={16} className="text-slate-400" />
          
          {/* Tooltip */}
          <motion.div
            className="absolute bottom-full right-0 mb-2 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 w-64"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            whileHover={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{ pointerEvents: 'none' }}
          >
            <div className="text-xs text-slate-300">
              <div className="font-semibold mb-2 text-white">Security Levels:</div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <AlertTriangle size={12} className="text-amber-400" />
                  <span><strong>Basic:</strong> Standard encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span><strong>Enhanced:</strong> Salt protection prevents brute force</span>
                </div>
              </div>
            </div>
            
            {/* Tooltip arrow */}
            <div className="absolute top-full right-4 w-2 h-2 bg-slate-800 border-r border-b border-slate-700 transform rotate-45 translate-y-[-1px]" />
          </motion.div>
        </motion.div>
      </div>

      {/* Processing indicator */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex items-center space-x-2 text-slate-300"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <motion.div
                className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-sm font-medium">Processing...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SecurityIndicator;