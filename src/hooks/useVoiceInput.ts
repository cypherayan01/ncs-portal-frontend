import { useState, useRef, useCallback } from 'react';
import BhasiniService, { createBhasiniService, SUPPORTED_LANGUAGES } from '../services/bhasiniService';

interface VoiceInputConfig {
  bhasiniApiKey?: string;
  bhasiniUserId?: string;
  fallbackToWebSpeech?: boolean;
  defaultLanguage?: string;
  autoTranslate?: boolean;
}

interface VoiceInputResult {
  text: string;
  originalText?: string;
  translatedText?: string;
  detectedLanguage?: string;
  isTranslated: boolean;
}

interface VoiceInputHook {
  isListening: boolean;
  isProcessing: boolean;
  selectedLanguage: string;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  error: string | null;
  result: VoiceInputResult | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  setSelectedLanguage: (language: string) => void;
  clearResult: () => void;
  clearError: () => void;
}

export const useVoiceInput = (config: VoiceInputConfig = {}): VoiceInputHook => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(config.defaultLanguage || 'hi');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VoiceInputResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const webSpeechRecognitionRef = useRef<any>(null);
  const bhasiniServiceRef = useRef<BhasiniService | null>(null);

  // Initialize Bhasini service if credentials are provided
  const initializeBhasiniService = useCallback(() => {
    if (config.bhasiniApiKey && config.bhasiniUserId && !bhasiniServiceRef.current) {
      bhasiniServiceRef.current = createBhasiniService(config.bhasiniApiKey, config.bhasiniUserId);
    }
  }, [config.bhasiniApiKey, config.bhasiniUserId]);

  // Initialize Web Speech Recognition as fallback
  const initializeWebSpeechRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      webSpeechRecognitionRef.current = new SpeechRecognition();
      
      if (webSpeechRecognitionRef.current) {
        webSpeechRecognitionRef.current.continuous = false;
        webSpeechRecognitionRef.current.interimResults = false;
        webSpeechRecognitionRef.current.lang = selectedLanguage === 'hi' ? 'hi-IN' : 
                                             selectedLanguage === 'bn' ? 'bn-BD' :
                                             selectedLanguage === 'ta' ? 'ta-IN' :
                                             selectedLanguage === 'te' ? 'te-IN' :
                                             selectedLanguage === 'ml' ? 'ml-IN' :
                                             selectedLanguage === 'kn' ? 'kn-IN' :
                                             selectedLanguage === 'gu' ? 'gu-IN' :
                                             selectedLanguage === 'mr' ? 'mr-IN' :
                                             selectedLanguage === 'ur' ? 'ur-PK' :
                                             'en-US';

        webSpeechRecognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setResult({
            text: transcript,
            originalText: transcript,
            detectedLanguage: selectedLanguage,
            isTranslated: false,
          });
          setIsListening(false);
          setIsProcessing(false);
        };

        webSpeechRecognitionRef.current.onerror = (event: any) => {
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
          setIsProcessing(false);
        };

        webSpeechRecognitionRef.current.onend = () => {
          setIsListening(false);
          setIsProcessing(false);
        };
      }
    }
  }, [selectedLanguage]);

  // Process audio with Bhasini API
  const processBhasiniAudio = useCallback(async (audioBlob: Blob) => {
    if (!bhasiniServiceRef.current) {
      throw new Error('Bhasini service not initialized');
    }

    try {
      const result = await bhasiniServiceRef.current.speechToText(
        audioBlob, 
        selectedLanguage, 
        config.autoTranslate ?? true
      );

      return {
        text: result.translatedText || result.originalText,
        originalText: result.originalText,
        translatedText: result.translatedText,
        detectedLanguage: result.detectedLanguage,
        isTranslated: !!result.translatedText,
      };
    } catch (error) {
      throw new Error(`Bhasini processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [selectedLanguage, config.autoTranslate]);

  // Start recording with MediaRecorder for Bhasini API
  const startBhasiniRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/wav',
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const result = await processBhasiniAudio(audioBlob);
          setResult(result);
          setError(null);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to process audio');
          
          // Fallback to Web Speech Recognition if available
          if (config.fallbackToWebSpeech && webSpeechRecognitionRef.current) {
            try {
              webSpeechRecognitionRef.current.start();
              setIsListening(true);
              return; // Don't set processing to false yet
            } catch (fallbackError) {
              setError('Both Bhasini and Web Speech Recognition failed');
            }
          }
        } finally {
          setIsProcessing(false);
          // Clean up stream
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      setError(null);
    } catch (error) {
      setError('Failed to access microphone');
      setIsProcessing(false);
      setIsListening(false);
    }
  }, [processBhasiniAudio, config.fallbackToWebSpeech]);

  // Start Web Speech Recognition fallback
  const startWebSpeechRecognition = useCallback(() => {
    if (!webSpeechRecognitionRef.current) {
      setError('Web Speech Recognition not supported');
      return;
    }

    try {
      webSpeechRecognitionRef.current.start();
      setIsListening(true);
      setError(null);
    } catch (error) {
      setError('Failed to start Web Speech Recognition');
    }
  }, []);

  // Main start listening function
  const startListening = useCallback(async () => {
    if (isListening || isProcessing) return;

    setResult(null);
    setError(null);

    // Try Bhasini API first if configured
    if (config.bhasiniApiKey && config.bhasiniUserId) {
      initializeBhasiniService();
      await startBhasiniRecording();
    } else if (config.fallbackToWebSpeech !== false) {
      // Fallback to Web Speech Recognition
      initializeWebSpeechRecognition();
      startWebSpeechRecognition();
    } else {
      setError('No voice input service configured');
    }
  }, [
    isListening, 
    isProcessing, 
    config.bhasiniApiKey, 
    config.bhasiniUserId, 
    config.fallbackToWebSpeech,
    initializeBhasiniService,
    startBhasiniRecording,
    initializeWebSpeechRecognition,
    startWebSpeechRecognition
  ]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (webSpeechRecognitionRef.current) {
      try {
        webSpeechRecognitionRef.current.stop();
      } catch (error) {
        // Ignore errors when stopping
      }
    }

    setIsListening(false);
  }, []);

  // Clear result
  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isListening,
    isProcessing,
    selectedLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    error,
    result,
    startListening,
    stopListening,
    setSelectedLanguage,
    clearResult,
    clearError,
  };
};

export default useVoiceInput;