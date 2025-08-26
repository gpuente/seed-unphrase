import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Key, Hash, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { concealSeedPhrase } from '@seed-unphrase/lib';
import type { SecurityLevel } from '../App';
import ResultDisplay from './ResultDisplay';

interface ConcealFormProps {
  onSecurityChange: (security: SecurityLevel) => void;
  onProcessingChange: (processing: boolean) => void;
  isProcessing: boolean;
}

interface ConcealFormData {
  seedPhrase: string;
  cipherKey: string;
  salt?: string;
}

interface ConcealResult {
  quotient: string;
  remainder: string;
  originalWordCount: number;
}

const ConcealForm = ({ onSecurityChange, onProcessingChange, isProcessing }: ConcealFormProps) => {
  const [showCipherKey, setShowCipherKey] = useState(false);
  const [showSalt, setShowSalt] = useState(false);
  const [useSalt, setUseSalt] = useState(false);
  const [result, setResult] = useState<ConcealResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<ConcealFormData>();

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

  const onSubmit = async (data: ConcealFormData) => {
    setValidationErrors([]);
    setResult(null);
    onProcessingChange(true);

    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const options = {
        phrase: data.seedPhrase.trim(),
        cipherKey: data.cipherKey.trim(),
        salt: useSalt && data.salt?.trim() ? data.salt.trim() : undefined
      };

      const { result: concealResult, validation } = concealSeedPhrase(options);

      // Handle validation warnings
      if (validation.invalidWords.length > 0) {
        const errors = validation.invalidWords.map((word: string) => 
          `"${word}" is not a valid BIP39 word (replaced with "abandon")`
        );
        setValidationErrors(errors);
        
        toast.warning('Invalid Words Detected', {
          description: `${validation.invalidWords.length} invalid word(s) were replaced with "abandon"`
        });
      }

      setResult(concealResult);
      
      toast.success('Seed Phrase Concealed! 🎉', {
        description: 'Your seed phrase has been successfully hidden'
      });

    } catch (error) {
      console.error('Concealment error:', error);
      toast.error('Concealment Failed', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      onProcessingChange(false);
    }
  };

  const handleNewConcealment = () => {
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
        mode="conceal"
        result={`${result.quotient}:${result.remainder}`}
        onNewAction={handleNewConcealment}
        validationErrors={validationErrors}
        metadata={{
          wordCount: result.originalWordCount,
          hasSalt: !!(useSalt && saltValue && saltValue.trim().length > 0)
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text mb-2">
          <Lock size={28} className="text-purple-500" />
          <span>Conceal Seed Phrase</span>
        </div>
        <p className="text-slate-400">
          Transform your seed phrase into a secure concealed value
        </p>
      </div>

      {/* Seed Phrase Input */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
          <Sparkles size={16} className="text-purple-400" />
          <span>Seed Phrase</span>
        </label>
        <textarea
          {...register('seedPhrase', {
            required: 'Seed phrase is required',
            validate: (value) => {
              const words = value.trim().split(/\s+/);
              if (words.length === 0) return 'Please enter at least one word';
              if (words.length > 24) return 'Maximum 24 words allowed';
              return true;
            }
          })}
          className={`
            w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500
            backdrop-blur-sm transition-all duration-300 resize-none
            ${errors.seedPhrase ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-purple-500'}
            focus:outline-none focus:ring-2 focus:ring-purple-500/20
          `}
          placeholder="Enter your seed phrase (space-separated words)..."
          rows={4}
          disabled={isProcessing}
        />
        <AnimatePresence>
          {errors.seedPhrase && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{errors.seedPhrase.message}</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Cipher Key Input */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
          <Key size={16} className="text-cyan-400" />
          <span>Cipher Key</span>
        </label>
        <div className="relative">
          <input
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
            placeholder="Enter your cipher key (any positive number)..."
            disabled={isProcessing}
            />
          <button
            type="button"
            onClick={() => setShowCipherKey(!showCipherKey)}
            className="absolute right-3 text-slate-400 hover:text-slate-300 transition-colors"
            style={{ top: '50%', marginTop: '-10px' }}
          >
            {showCipherKey ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <AnimatePresence>
          {errors.cipherKey && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{errors.cipherKey.message}</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Salt Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-800/30 border border-slate-600/50 rounded-xl">
        <div className="flex items-center space-x-3">
          <Hash size={20} className="text-emerald-400" />
          <div>
            <h4 className="font-medium text-slate-200">Enhanced Security (Salt)</h4>
            <p className="text-sm text-slate-400">Add salt for maximum protection against brute force</p>
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
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
              <Hash size={16} className="text-emerald-400" />
              <span>Salt Value</span>
            </label>
            <div className="relative">
              <input
                {...register('salt')}
                type={showSalt ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                placeholder="Enter your salt (any text for enhanced security)..."
                disabled={isProcessing}
                    />
              <button
                type="button"
                onClick={() => setShowSalt(!showSalt)}
                className="absolute right-3 text-slate-400 hover:text-slate-300 transition-colors"
                style={{ top: '50%', marginTop: '-10px' }}
              >
                {showSalt ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300
          ${isProcessing 
            ? 'bg-slate-700 cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-lg hover:shadow-xl'
          }
          focus:outline-none focus:ring-2 focus:ring-purple-500/50
        `}
      >
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Concealing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Lock size={20} />
              <span>Conceal Seed Phrase</span>
            </div>
          )}
        </AnimatePresence>
      </button>
    </form>
  );
};

export default ConcealForm;