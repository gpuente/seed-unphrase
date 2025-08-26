import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSInstalled = (window.navigator as any).standalone === true;
    
    if (isStandalone || isIOSInstalled) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after a delay to not be too aggressive
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install prompt failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already installed or dismissed this session
  if (isInstalled || sessionStorage.getItem('installPromptDismissed')) {
    return null;
  }

  return (
    <AnimatePresence>
      {showInstallPrompt && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm"
        >
          <div className="bg-gradient-to-r from-yellow-400/90 to-yellow-500/90 backdrop-blur-sm border border-yellow-300/50 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 93.63 122.88" className="fill-white">
                    <path d="M6,47.51H87.64a6,6,0,0,1,6,6v63.38a6,6,0,0,1-6,6H6a6,6,0,0,1-6-6V53.5a6,6,0,0,1,6-6Z"/>
                    <path d="M41.89,89.26l-6.47,16.95H58.21L52.21,89a11.79,11.79,0,1,0-10.32.24Z"/>
                    <path d="M83.57,47.51H72.22V38.09a27.32,27.32,0,0,0-7.54-19,24.4,24.4,0,0,0-35.73,0,27.32,27.32,0,0,0-7.54,19v9.42H10.06V38.09A38.73,38.73,0,0,1,20.78,11.28a35.69,35.69,0,0,1,52.07,0A38.67,38.67,0,0,1,83.57,38.09v9.42Z"/>
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Install Seed Concealer
                  </h3>
                  <button
                    onClick={handleDismiss}
                    className="text-gray-700 hover:text-gray-900 transition-colors"
                    aria-label="Dismiss install prompt"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <p className="text-xs text-gray-800 mb-3">
                  Add to your home screen for quick access and offline use
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 bg-white/90 hover:bg-white text-gray-900 text-xs font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download size={14} />
                    Install App
                  </button>
                  
                  <button
                    onClick={handleDismiss}
                    className="text-xs text-gray-700 hover:text-gray-900 px-3 py-2 transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-yellow-300/30">
              <Smartphone size={12} className="text-gray-700" />
              <span className="text-xs text-gray-700">
                Works offline • No app store needed
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}