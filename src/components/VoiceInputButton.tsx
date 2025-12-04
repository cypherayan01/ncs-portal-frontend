import React, { useState, useEffect } from 'react';
import { Mic, Loader2, AlertCircle, Volume2, Languages } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import useVoiceInput from '../hooks/useVoiceInput';

interface VoiceInputButtonProps {
  onTranscript: (text: string, metadata?: {
    originalText?: string;
    translatedText?: string;
    detectedLanguage?: string;
    isTranslated?: boolean;
  }) => void;
  disabled?: boolean;
  className?: string;
  bhasiniApiKey?: string;
  bhasiniUserId?: string;
  showLanguageSelector?: boolean;
  defaultLanguage?: string;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  disabled = false,
  className = '',
  bhasiniApiKey,
  bhasiniUserId,
  showLanguageSelector = true,
  defaultLanguage = 'hi',
}) => {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const {
    isListening,
    isProcessing,
    selectedLanguage,
    supportedLanguages,
    error,
    result,
    startListening,
    stopListening,
    setSelectedLanguage,
    clearResult,
    clearError,
  } = useVoiceInput({
    bhasiniApiKey,
    bhasiniUserId,
    fallbackToWebSpeech: true,
    defaultLanguage,
    autoTranslate: true,
  });

  // Handle voice input result
  useEffect(() => {
    if (result && result.text) {
      onTranscript(result.text, {
        originalText: result.originalText,
        translatedText: result.translatedText,
        detectedLanguage: result.detectedLanguage,
        isTranslated: result.isTranslated,
      });
      setShowResultModal(true);
      
      // Auto-hide result modal after 3 seconds
      const timeout = setTimeout(() => {
        setShowResultModal(false);
        clearResult();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [result, onTranscript, clearResult]);

  const handleVoiceClick = async () => {
    if (disabled) return;

    if (isListening) {
      stopListening();
    } else {
      clearError();
      clearResult();
      await startListening();
    }
  };

  const getButtonState = () => {
    if (isProcessing) return 'processing';
    if (isListening) return 'listening';
    if (error) return 'error';
    return 'idle';
  };

  const getButtonStyles = () => {
    const state = getButtonState();
    const baseStyles = "p-3 rounded-xl transition-all shadow-sm border flex items-center justify-center";
    
    switch (state) {
      case 'listening':
        return `${baseStyles} bg-red-500 text-white border-red-600 animate-pulse`;
      case 'processing':
        return `${baseStyles} bg-blue-500 text-white border-blue-600`;
      case 'error':
        return `${baseStyles} bg-red-100 text-red-600 border-red-300`;
      default:
        return `${baseStyles} text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 border-slate-200 hover:border-indigo-200`;
    }
  };

  const getButtonIcon = () => {
    const state = getButtonState();
    const iconClass = "h-5 w-5";
    
    switch (state) {
      case 'processing':
        return <Loader2 className={`${iconClass} animate-spin`} />;
      case 'listening':
        return <Mic className={iconClass} />;
      case 'error':
        return <AlertCircle className={iconClass} />;
      default:
        return <Mic className={iconClass} />;
    }
  };

  const selectedLangName = supportedLanguages.find(lang => lang.code === selectedLanguage)?.name || 'Hindi';

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        {/* Language Selector */}
        {showLanguageSelector && (
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="p-2 text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all flex items-center gap-1"
              title={`Selected: ${selectedLangName}`}
              disabled={disabled || isListening || isProcessing}
            >
              <Languages className="h-4 w-4" />
              <span className="text-xs font-medium hidden sm:inline">{selectedLanguage.toUpperCase()}</span>
            </button>

            {/* Language Dropdown */}
            <AnimatePresence>
              {showLanguageDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full mb-2 left-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-48"
                >
                  <div className="p-2 border-b border-slate-100">
                    <span className="text-xs font-medium text-slate-600">Select Language</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {supportedLanguages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          setSelectedLanguage(language.code);
                          setShowLanguageDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${
                          selectedLanguage === language.code ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-700'
                        }`}
                      >
                        <span>{language.name}</span>
                        <span className="text-xs text-slate-400">{language.code}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Voice Input Button */}
        <button
          onClick={handleVoiceClick}
          disabled={disabled}
          className={getButtonStyles()}
          title={
            isListening ? "Stop listening" : 
            isProcessing ? "Processing..." : 
            error ? error : 
            `Start voice input (${selectedLangName})`
          }
        >
          {getButtonIcon()}
        </button>
      </div>

      {/* Listening Overlay */}
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[1999] flex items-center justify-center"
              onClick={stopListening}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-red-500 to-red-600 text-white p-8 rounded-2xl shadow-2xl z-[2000] text-center max-w-sm mx-4"
            >
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Mic className="h-8 w-8" />
                </div>
              </div>
              
              <div className="text-xl font-bold mb-2">Listening...</div>
              <div className="text-sm opacity-90 mb-2">
                Speaking in: {selectedLangName}
              </div>
              <div className="text-xs opacity-75 mb-4">
                Click anywhere to stop
              </div>
              
              {/* Audio Wave Animation */}
              <div className="flex justify-center items-center gap-1">
                {[0, 0.1, 0.2, 0.3, 0.4].map((delay, index) => (
                  <motion.div
                    key={index}
                    className="w-1 bg-white rounded-full"
                    animate={{
                      height: [8, 24, 8],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">
              {bhasiniApiKey ? 'Processing with Bhasini...' : 'Processing speech...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {showResultModal && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-4 right-4 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 max-w-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Volume2 className="h-4 w-4 text-green-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 mb-2">Voice Input Result</div>
                
                {result.isTranslated ? (
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Original ({result.detectedLanguage}):</div>
                      <div className="text-sm text-slate-600 italic">{result.originalText}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Translated:</div>
                      <div className="text-sm text-slate-800 font-medium">{result.translatedText}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-800">{result.text}</div>
                )}
                
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    clearResult();
                  }}
                  className="mt-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕ Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium mb-1">Voice Input Error</div>
                <div className="text-xs">{error}</div>
                <button
                  onClick={clearError}
                  className="mt-2 text-xs text-red-500 hover:text-red-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close language dropdown */}
      {showLanguageDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLanguageDropdown(false)}
        />
      )}
    </div>
  );
};

export default VoiceInputButton;