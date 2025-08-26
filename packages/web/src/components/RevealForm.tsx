import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Key, Hash, Unlock, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { revealSeedPhrase } from '@seed-unphrase/lib';
import type { SecurityLevel } from '../App';
import ResultDisplay from './ResultDisplay';

interface RevealFormProps {
  onSecurityChange: (security: SecurityLevel) => void;
  onProcessingChange: (processing: boolean) => void;
  isProcessing: boolean;
}

interface RevealFormData {
  concealedValue: string;
  cipherKey: string;
  salt?: string;
}

interface RevealResult {
  phrase: string;
  wordCount: number;
}

const RevealForm = ({ onSecurityChange, onProcessingChange, isProcessing }: RevealFormProps) => {
  const [showCipherKey, setShowCipherKey] = useState(false);
  const [showSalt, setShowSalt] = useState(false);
  const [useSalt, setUseSalt] = useState(false);
  const [result, setResult] = useState<RevealResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<RevealFormData>();

  const saltValue = watch('salt');

  // Update security level based on salt usage
  useEffect(() => {
    const hasSalt = useSalt && saltValue && saltValue.trim().length > 0;
    const newSecurity: SecurityLevel = {
      level: hasSalt ? 'enhanced' : 'basic',
      hasSalt: !!hasSalt
    };
    onSecurityChange(newSecurity);
  }, [useSalt, saltValue]);

  const onSubmit = async (data: RevealFormData) => {
    setValidationErrors([]);
    setResult(null);
    onProcessingChange(true);

    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const options = {
        concealedValue: data.concealedValue.trim(),
        cipherKey: data.cipherKey.trim(),
        salt: useSalt && data.salt?.trim() ? data.salt.trim() : undefined
      };

      const revealResult = revealSeedPhrase(options);

      if (!revealResult.success) {
        throw new Error(revealResult.error || 'Failed to reveal seed phrase');
      }

      setResult({
        phrase: revealResult.words.join(' '),
        wordCount: revealResult.words.length
      });
      
      toast.success('Seed Phrase Revealed! 🔓', {
        description: 'Your concealed value has been successfully decrypted'
      });

    } catch (error) {
      console.error('Reveal error:', error);
      toast.error('Reveal Failed', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      onProcessingChange(false);
    }
  };

  const handleNewReveal = () => {
    setResult(null);
    setValidationErrors([]);
    reset();
  };

  const toggleSalt = () => {
    setUseSalt(!useSalt);
    if (useSalt) {
      // Clear salt value when disabling
      reset({ ...watch(), salt: '' });
    }
  };

  if (result) {
    return (
      <ResultDisplay
        mode="reveal"
        result={result.phrase}
        onNewAction={handleNewReveal}
        validationErrors={validationErrors}
        metadata={{
          wordCount: result.wordCount,
          hasSalt: !!(useSalt && saltValue && saltValue.trim().length > 0)
        }}
      />
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.div
          className="inline-flex items-center space-x-2 text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Unlock size={28} className="text-cyan-500" />
          <span>Reveal Seed Phrase</span>
        </motion.div>
        <motion.p
          className="text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Transform your concealed value back to the original seed phrase
        </motion.p>
      </div>

      {/* Concealed Value Input */}
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
          <Sparkles size={16} className="text-cyan-400" />
          <span>Concealed Value</span>
        </label>
        <motion.input
          {...register('concealedValue', {
            required: 'Concealed value is required',
            validate: (value) => {
              const trimmed = value.trim();
              if (!trimmed) return 'Concealed value cannot be empty';
              if (!trimmed.includes(':')) return 'Concealed value must be in quotient:remainder format';
              const [quotient, remainder] = trimmed.split(':');
              if (!quotient || !remainder) return 'Invalid format. Use quotient:remainder';
              try {
                BigInt(quotient);
                BigInt(remainder);
                return true;
              } catch {
                return 'Both quotient and remainder must be valid numbers';
              }
            }
          })}
          className={`
            w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500
            backdrop-blur-sm transition-all duration-300
            ${errors.concealedValue ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-cyan-500'}
            focus:outline-none focus:ring-2 focus:ring-cyan-500/20
          `}
          placeholder="Enter your concealed value (quotient:remainder)..."
          disabled={isProcessing}
          whileFocus={{ scale: 1.01 }}
        />
        <AnimatePresence>
          {errors.concealedValue && (
            <motion.div
              className="flex items-center space-x-2 text-red-400 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle size={16} />
              <span>{errors.concealedValue.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Cipher Key Input */}
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
          <Key size={16} className="text-cyan-400" />
          <span>Cipher Key</span>
        </label>
        <div className="relative">
          <motion.input
            {...register('cipherKey', {
              required: 'Cipher key is required',
              validate: (value) => {
                const trimmed = value.trim();
                if (!trimmed) return 'Cipher key cannot be empty';
                try {
                  const bigIntValue = BigInt(trimmed);
                  if (bigIntValue <= 0n) return 'Cipher key must be a positive number';
                  return true;
                } catch {
                  return 'Please enter a valid number';
                }
              }
            })}
            type={showCipherKey ? 'text' : 'password'}
            className={`
              w-full px-4 py-3 pr-12 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500
              backdrop-blur-sm transition-all duration-300
              ${errors.cipherKey ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-cyan-500'}
              focus:outline-none focus:ring-2 focus:ring-cyan-500/20
            `}
            placeholder="Enter the same cipher key used for concealment..."
            disabled={isProcessing}
            whileFocus={{ scale: 1.01 }}
          />
          <motion.button
            type="button"
            onClick={() => setShowCipherKey(!showCipherKey)}
            className="absolute right-3 text-slate-400 hover:text-slate-300 transition-colors"
            style={{ top: '50%', marginTop: '-10px' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showCipherKey ? <EyeOff size={20} /> : <Eye size={20} />}
          </motion.button>
        </div>
        <AnimatePresence>
          {errors.cipherKey && (
            <motion.div
              className="flex items-center space-x-2 text-red-400 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle size={16} />
              <span>{errors.cipherKey.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Salt Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-800/30 border border-slate-600/50 rounded-xl">
        <div className="flex items-center space-x-3">
          <Hash size={20} className="text-emerald-400" />
          <div>
            <h4 className="font-medium text-slate-200">Enhanced Security (Salt)</h4>
            <p className="text-sm text-slate-400">Use the same salt that was used for concealment</p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleSalt}
          className={`
            relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0
            ${useSalt ? 'bg-emerald-500' : 'bg-slate-600'}
          `}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
              useSalt ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Salt Input */}
      <AnimatePresence>
        {useSalt && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
              <Hash size={16} className="text-emerald-400" />
              <span>Salt Value</span>
            </label>
            <div className="relative">
              <motion.input
                {...register('salt')}
                type={showSalt ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                placeholder="Enter the same salt used for concealment..."
                disabled={isProcessing}
                whileFocus={{ scale: 1.01 }}
              />
              <motion.button
                type="button"
                onClick={() => setShowSalt(!showSalt)}
                className="absolute right-3 text-slate-400 hover:text-slate-300 transition-colors"
                style={{ top: '50%', marginTop: '-10px' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showSalt ? <EyeOff size={20} /> : <Eye size={20} />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isProcessing}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300
          ${isProcessing 
            ? 'bg-slate-700 cursor-not-allowed' 
            : 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 shadow-lg hover:shadow-xl'
          }
          focus:outline-none focus:ring-2 focus:ring-cyan-500/50
        `}
        whileHover={!isProcessing ? { scale: 1.02, y: -1 } : undefined}
        whileTap={!isProcessing ? { scale: 0.98 } : undefined}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              className="flex items-center justify-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>Revealing...</span>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center justify-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Unlock size={20} />
              <span>Reveal Seed Phrase</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.form>
  );
};

export default RevealForm;