import React, { useState, useEffect, useRef } from 'react';
import { Mic, AlertCircle, Volume2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  disabled = false,
  className = '',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setResult(transcript);
          onTranscript(transcript);
          setShowResultModal(true);
          setIsListening(false);
          
          // Auto-hide result modal after 3 seconds
          setTimeout(() => {
            setShowResultModal(false);
            setResult(null);
          }, 3000);
        };

        recognitionRef.current.onerror = (event: any) => {
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    } else {
      setError('Speech recognition not supported in this browser');
    }
  }, [onTranscript]);

  const handleVoiceClick = () => {
    if (disabled) return;

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      setError(null);
      setResult(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
          setError('Failed to start speech recognition');
        }
      } else {
        setError('Speech recognition not available');
      }
    }
  };

  const getButtonState = () => {
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
      case 'listening':
        return <Mic className={iconClass} />;
      case 'error':
        return <AlertCircle className={iconClass} />;
      default:
        return <Mic className={iconClass} />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Voice Input Button */}
      <button
        onClick={handleVoiceClick}
        disabled={disabled}
        className={getButtonStyles()}
        title={
          isListening ? "Stop listening" : 
          error ? error : 
          "Start voice input"
        }
      >
        {getButtonIcon()}
      </button>

      {/* Listening Overlay */}
      {isListening &&
  createPortal(
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[9998]"
          onClick={() => {
            recognitionRef.current?.stop();
            setIsListening(false);
          }}
        />

        {/* Centered Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-[9999] grid place-items-center"
        >
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-8 rounded-2xl shadow-2xl text-center w-[320px]">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Mic className="h-8 w-8" />
            </div>

            <div className="text-xl font-bold mb-2">Listening...</div>
            <div className="text-xs opacity-75 mb-4">
              Speak now — tap anywhere to stop
            </div>

            <div className="flex justify-center gap-1">
              {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-white rounded-full"
                  animate={{ height: [8, 24, 8] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>,
    document.getElementById('overlay-root')!
  )}


      {/* Result Modal */}
      {/* <AnimatePresence>
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
                <div className="text-sm text-slate-800">{result}</div>
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    setResult(null);
                  }}
                  className="mt-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕ Close
                </button>
              </div> 
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}

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
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-red-500 hover:text-red-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInputButton;