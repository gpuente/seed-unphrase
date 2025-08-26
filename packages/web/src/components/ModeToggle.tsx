import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';
import type { AppMode } from '../App';

interface ModeToggleProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  disabled?: boolean;
}

const ModeToggle = ({ mode, onModeChange, disabled = false }: ModeToggleProps) => {
  const handleToggle = (newMode: AppMode) => {
    if (!disabled && newMode !== mode) {
      onModeChange(newMode);
    }
  };

  return (
    <div className="relative">
      <motion.div
        className="flex bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-full p-2 shadow-2xl"
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
      >
        {/* Conceal Mode */}
        <motion.button
          onClick={() => handleToggle('conceal')}
          disabled={disabled}
          className={`
            relative flex items-center space-x-3 px-6 py-3 rounded-full font-semibold transition-all duration-300
            ${mode === 'conceal' 
              ? 'text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          whileHover={!disabled && mode !== 'conceal' ? { x: 2 } : undefined}
          whileTap={!disabled ? { scale: 0.95 } : undefined}
        >
          {/* Background glow for active state */}
          {mode === 'conceal' && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full"
              layoutId="activeBackground"
              initial={false}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
            />
          )}
          
          <div className="relative z-10 flex items-center space-x-3">
            <motion.div
              animate={mode === 'conceal' ? { 
                rotateY: [0, 360],
                scale: [1, 1.2, 1]
              } : { 
                rotateY: 0,
                scale: 1 
              }}
              transition={{ 
                duration: mode === 'conceal' ? 0.6 : 0.3,
                ease: "easeInOut"
              }}
            >
              <Lock size={20} />
            </motion.div>
            <span className="font-medium">Conceal</span>
          </div>
        </motion.button>

        {/* Reveal Mode */}
        <motion.button
          onClick={() => handleToggle('reveal')}
          disabled={disabled}
          className={`
            relative flex items-center space-x-3 px-6 py-3 rounded-full font-semibold transition-all duration-300
            ${mode === 'reveal' 
              ? 'text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          whileHover={!disabled && mode !== 'reveal' ? { x: -2 } : undefined}
          whileTap={!disabled ? { scale: 0.95 } : undefined}
        >
          {/* Background glow for active state */}
          {mode === 'reveal' && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-full"
              layoutId="activeBackground"
              initial={false}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
            />
          )}
          
          <div className="relative z-10 flex items-center space-x-3">
            <motion.div
              animate={mode === 'reveal' ? { 
                rotateY: [0, 360],
                scale: [1, 1.2, 1]
              } : { 
                rotateY: 0,
                scale: 1 
              }}
              transition={{ 
                duration: mode === 'reveal' ? 0.6 : 0.3,
                ease: "easeInOut"
              }}
            >
              <Unlock size={20} />
            </motion.div>
            <span className="font-medium">Reveal</span>
          </div>
        </motion.button>
      </motion.div>

      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-full pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 0, opacity: 0 }}
        whileTap={!disabled ? {
          scale: [0, 1.5],
          opacity: [0.3, 0],
        } : undefined}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Hover glow effect */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full blur-sm -z-10"
        animate={!disabled ? {
          opacity: [0, 0.5, 0],
          scale: [0.8, 1.1, 0.8],
        } : { opacity: 0 }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default ModeToggle;