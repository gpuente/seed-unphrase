import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Toaster } from 'sonner';
import Background from './components/Background';
import ModeToggle from './components/ModeToggle';
import ConcealForm from './components/ConcealForm';
import RevealForm from './components/RevealForm';
import SecurityIndicator from './components/SecurityIndicator';
import './styles/globals.css';

export type AppMode = 'conceal' | 'reveal';

export interface SecurityLevel {
  level: 'basic' | 'enhanced';
  hasSalt: boolean;
}

function App() {
  const [mode, setMode] = useState<AppMode>('conceal');
  const [security, setSecurity] = useState<SecurityLevel>({ 
    level: 'basic', 
    hasSalt: false 
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Add a subtle entrance animation
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
  };

  const handleSecurityChange = (newSecurity: SecurityLevel) => {
    setSecurity(newSecurity);
  };

  const pageVariants: Variants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const formVariants: Variants = {
    hidden: { 
      opacity: 0,
      x: mode === 'conceal' ? -50 : 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0,
      x: mode === 'conceal' ? 50 : -50,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 360, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Background />
      
      <motion.main
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 min-h-screen flex flex-col"
      >
        {/* Header */}
        <motion.header 
          className="px-4 py-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold gradient-text mb-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            🌱 Seed Concealer
          </motion.h1>
          <motion.p 
            className="text-lg text-slate-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Securely hide and reveal your crypto seed phrases with advanced salt-enhanced protection
          </motion.p>
        </motion.header>

        {/* Security Indicator */}
        <motion.div
          className="px-4 mb-8 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <SecurityIndicator 
            security={security}
            isProcessing={isProcessing}
          />
        </motion.div>

        {/* Mode Toggle */}
        <motion.div
          className="px-4 mb-12 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <ModeToggle 
            mode={mode} 
            onModeChange={handleModeChange}
            disabled={isProcessing}
          />
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 pb-8">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="glass rounded-2xl p-8 border border-white/10 shadow-2xl"
              >
                {mode === 'conceal' ? (
                  <ConcealForm 
                    onSecurityChange={handleSecurityChange}
                    onProcessingChange={setIsProcessing}
                    isProcessing={isProcessing}
                  />
                ) : (
                  <RevealForm 
                    onSecurityChange={handleSecurityChange}
                    onProcessingChange={setIsProcessing}
                    isProcessing={isProcessing}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <motion.footer 
          className="px-4 py-6 text-center text-sm text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="mb-2">
            ⚠️ Keep your cipher key and salt safe. This tool is for educational purposes.
          </p>
          <p>
            Built with ❤️ using React, Framer Motion, and some cryptographic techniques
          </p>
        </motion.footer>
      </motion.main>

      {/* Toast Notifications */}
      <Toaster 
        theme="dark"
        position="bottom-right"
        richColors
        expand
        closeButton
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
    </div>
  );
}

export default App;