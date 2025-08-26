import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, CheckCircle, AlertCircle, Lock, Unlock, RotateCcw, Eye, EyeOff, Hash, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface ResultDisplayProps {
  mode: 'conceal' | 'reveal';
  result: string;
  onNewAction: () => void;
  validationErrors?: string[];
  metadata?: {
    wordCount: number;
    hasSalt: boolean;
  };
}

const ResultDisplay = ({ mode, result, onNewAction, validationErrors = [], metadata }: ResultDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast.success('Copied to Clipboard! 📋', {
        description: `${mode === 'conceal' ? 'Concealed value' : 'Seed phrase'} copied successfully`
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Copy Failed', {
        description: 'Unable to copy to clipboard'
      });
    }
  };

  const toggleVisibility = () => {
    setShowResult(!showResult);
  };

  const isMultiLine = mode === 'reveal' || result.length > 50;
  const displayResult = showResult ? result : '*'.repeat(Math.min(result.length, 40));

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          className={`inline-flex items-center space-x-2 text-2xl font-bold text-transparent bg-gradient-to-r ${
            mode === 'conceal' 
              ? 'from-purple-400 to-purple-600' 
              : 'from-cyan-400 to-cyan-600'
          } bg-clip-text mb-2`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {mode === 'conceal' ? (
            <Lock size={28} className="text-purple-500" />
          ) : (
            <Unlock size={28} className="text-cyan-500" />
          )}
          <span>
            {mode === 'conceal' ? 'Concealment Complete!' : 'Reveal Complete!'}
          </span>
        </motion.div>
        
        <motion.p
          className="text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {mode === 'conceal' 
            ? 'Your seed phrase has been successfully concealed' 
            : 'Your concealed value has been successfully revealed'
          }
        </motion.p>
      </div>

      {/* Metadata */}
      {metadata && (
        <motion.div
          className="flex items-center justify-center space-x-6 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-2 text-slate-300">
            <Hash size={16} className="text-amber-400" />
            <span className="text-sm font-medium">{metadata.wordCount} words</span>
          </div>
          
          {metadata.hasSalt && (
            <div className="flex items-center space-x-2 text-slate-300">
              <Shield size={16} className="text-emerald-400" />
              <span className="text-sm font-medium">Salt Protected</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Validation Errors */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start space-x-3">
              <AlertCircle size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-amber-300 mb-2">Validation Warnings</h4>
                <ul className="space-y-1 text-sm text-amber-200">
                  {validationErrors.map((error, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      • {error}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Display */}
      <motion.div
        className="relative p-6 bg-slate-800/50 border border-slate-600/50 rounded-xl backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.01 }}
      >
        {/* Background glow */}
        <motion.div
          className={`absolute -inset-0.5 bg-gradient-to-r ${
            mode === 'conceal' 
              ? 'from-purple-500/20 to-purple-600/20' 
              : 'from-cyan-500/20 to-cyan-600/20'
          } rounded-xl blur opacity-50`}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-200">
              {mode === 'conceal' ? 'Concealed Value' : 'Revealed Seed Phrase'}
            </h3>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={toggleVisibility}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={showResult ? 'Hide result' : 'Show result'}
              >
                {showResult ? <EyeOff size={16} /> : <Eye size={16} />}
              </motion.button>
              <motion.button
                onClick={handleCopy}
                className={`p-2 rounded-lg transition-colors ${
                  copied 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Copy to clipboard"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle size={16} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy size={16} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          <motion.div
            className={`${
              isMultiLine ? 'min-h-[120px]' : 'min-h-[60px]'
            } p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg font-mono text-sm leading-relaxed overflow-hidden`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={showResult ? 'visible' : 'hidden'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`${
                  showResult 
                    ? 'text-slate-100 break-all' 
                    : 'text-slate-500 select-none pointer-events-none'
                }`}
                style={{
                  wordBreak: isMultiLine ? 'break-all' : 'break-word',
                  whiteSpace: isMultiLine ? 'pre-wrap' : 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {displayResult}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {!showResult && (
            <motion.p
              className="text-xs text-slate-500 mt-2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Click the eye icon to reveal the {mode === 'conceal' ? 'concealed value' : 'seed phrase'}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Security Notice */}
      {showResult && (
        <motion.div
          className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-start space-x-3">
            <AlertCircle size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-amber-300 mb-1">Security Reminder</h4>
              <p className="text-sm text-amber-200">
                {mode === 'conceal' 
                  ? 'Store your concealed value and cipher key safely. You need both to recover your seed phrase.'
                  : 'Keep your recovered seed phrase secure and never share it with anyone.'
                }
                {metadata?.hasSalt && ' Remember to also keep your salt value safe.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Button */}
      <motion.button
        onClick={onNewAction}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-to-r ${
          mode === 'conceal'
            ? 'from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'
            : 'from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600'
        } shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 ${
          mode === 'conceal' ? 'focus:ring-purple-500/50' : 'focus:ring-cyan-500/50'
        }`}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-center space-x-2">
          <RotateCcw size={20} />
          <span>
            {mode === 'conceal' ? 'Conceal Another Phrase' : 'Reveal Another Value'}
          </span>
        </div>
      </motion.button>
    </motion.div>
  );
};

export default ResultDisplay;