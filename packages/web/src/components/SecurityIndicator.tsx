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
        description: 'Salt protection active - Maximum security against brute force attacks'
      };
    } else {
      return {
        level: 'Basic Security', 
        color: 'from-amber-500 to-orange-400',
        bgColor: 'bg-amber-500/20',
        borderColor: 'border-amber-500/30',
        icon: AlertTriangle,
        description: 'Consider adding salt for enhanced protection'
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
    >
      {/* Static background glow effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${config.color} rounded-2xl blur opacity-20`} />

      <div className="relative flex items-center space-x-4">
        {/* Icon with minimal processing animation */}
        <motion.div
          className="relative"
          animate={isProcessing ? {
            rotate: 360
          } : {}}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Icon 
            size={28} 
            className={`text-transparent bg-gradient-to-r ${config.color} bg-clip-text`}
          />
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
        <div className="relative group cursor-help">
          <Info size={16} className="text-slate-400" />
          
          {/* Tooltip */}
          <div
            className="absolute bottom-full right-0 mb-2 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
          </div>
        </div>
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