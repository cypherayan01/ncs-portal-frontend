// Bhasini API Service for Speech-to-Text and Translation
// Documentation: https://bhashini.gitbook.io/bhashini-apis/

export interface BhasiniConfig {
  apiKey: string;
  userId: string;
  baseUrl?: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface PipelineTask {
  taskType: string;
  config: {
    language: {
      sourceLanguage: string;
      targetLanguage?: string;
    };
  };
}

export interface ASRResponse {
  output: Array<{
    source: string;
  }>;
}

export interface TranslationResponse {
  output: Array<{
    target: string;
  }>;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'kn', name: 'Kannada' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'mr', name: 'Marathi' },
  { code: 'or', name: 'Odia' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'as', name: 'Assamese' },
  { code: 'ne', name: 'Nepali' },
  { code: 'ur', name: 'Urdu' },
  { code: 'en', name: 'English' },
];

class BhasiniService {
  private config: BhasiniConfig;
  private baseUrl: string = 'https://meity-auth.ulcacontrib.org';

  constructor(config: BhasiniConfig) {
    this.config = config;
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }

  // Step 1: Pipeline Config Call (Get available pipeline for ASR)
  private async getPipelineConfig(sourceLanguage: string, taskType: string = 'asr'): Promise<any> {
    const url = `${this.baseUrl}/ulca/apis/v0/model/getModelsPipeline`;
    
    const payload = {
      pipelineTasks: [
        {
          taskType,
          config: {
            language: {
              sourceLanguage,
            },
          },
        },
      ],
      pipelineRequestConfig: {
        pipelineId: "64392f96daac500b55c543cd"
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userID': this.config.userId,
          'ulcaApiKey': this.config.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Pipeline config failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting pipeline config:', error);
      throw error;
    }
  }

  // Step 2: Pipeline Compute Call (Perform ASR)
  private async performASR(audioData: Blob, pipelineConfig: any): Promise<ASRResponse> {
    const serviceId = pipelineConfig.pipelineResponseConfig[0].config[0].serviceId;
    const url = `${this.baseUrl}/ulca/apis/v0/model/compute`;

    // Convert audio blob to base64
    const base64Audio = await this.blobToBase64(audioData);

    const payload = {
      pipelineTasks: [
        {
          taskType: 'asr',
          config: {
            language: {
              sourceLanguage: pipelineConfig.languages[0].sourceLanguage,
            },
            serviceId: serviceId,
            audioFormat: 'wav',
            samplingRate: 16000,
          },
        },
      ],
      inputData: {
        audio: [
          {
            audioContent: base64Audio.split(',')[1], // Remove data:audio/wav;base64, prefix
          },
        ],
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userID': this.config.userId,
          'ulcaApiKey': this.config.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`ASR compute failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error performing ASR:', error);
      throw error;
    }
  }

  // Step 3: Translation (if needed)
  private async translateText(text: string, sourceLanguage: string, targetLanguage: string = 'en'): Promise<string> {
    try {
      // Get translation pipeline config
      const pipelineConfig = await this.getPipelineConfig(sourceLanguage, 'translation');
      const serviceId = pipelineConfig.pipelineResponseConfig[0].config[0].serviceId;
      
      const url = `${this.baseUrl}/ulca/apis/v0/model/compute`;

      const payload = {
        pipelineTasks: [
          {
            taskType: 'translation',
            config: {
              language: {
                sourceLanguage,
                targetLanguage,
              },
              serviceId: serviceId,
            },
          },
        ],
        inputData: {
          input: [
            {
              source: text,
            },
          ],
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userID': this.config.userId,
          'ulcaApiKey': this.config.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const result: TranslationResponse = await response.json();
      return result.output[0]?.target || text;
    } catch (error) {
      console.error('Error translating text:', error);
      return text; // Return original text if translation fails
    }
  }

  // Main method: Convert speech to text with optional translation
  async speechToText(audioBlob: Blob, sourceLanguage: string, translateToEnglish: boolean = true): Promise<{
    originalText: string;
    translatedText?: string;
    detectedLanguage: string;
  }> {
    try {
      // Step 1: Get pipeline configuration for ASR
      const pipelineConfig = await this.getPipelineConfig(sourceLanguage, 'asr');
      
      // Step 2: Perform speech recognition
      const asrResult = await this.performASR(audioBlob, pipelineConfig);
      const originalText = asrResult.output[0]?.source || '';

      if (!originalText) {
        throw new Error('No speech detected');
      }

      // Step 3: Translate to English if requested and source language is not English
      let translatedText: string | undefined;
      if (translateToEnglish && sourceLanguage !== 'en') {
        translatedText = await this.translateText(originalText, sourceLanguage, 'en');
      }

      return {
        originalText,
        translatedText,
        detectedLanguage: sourceLanguage,
      };
    } catch (error) {
      console.error('Speech to text error:', error);
      throw new Error(`Failed to process speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Utility method to convert blob to base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Method to check if service is available
  async testConnection(): Promise<boolean> {
    try {
      // Try to get pipeline config for Hindi as a test
      await this.getPipelineConfig('hi', 'asr');
      return true;
    } catch (error) {
      console.error('Bhasini service test failed:', error);
      return false;
    }
  }

  // Method to get supported languages
  static getSupportedLanguages(): Language[] {
    return SUPPORTED_LANGUAGES;
  }
}

export default BhasiniService;

// Utility function to create service instance
export const createBhasiniService = (apiKey: string, userId: string): BhasiniService => {
  return new BhasiniService({ apiKey, userId });
};

// Language detection utility (basic implementation)
export const detectLanguageFromText = (text: string): string => {
  // Basic language detection based on script/characters
  // This is a simplified implementation - you might want to use a proper language detection library
  
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari (Hindi)
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'; // Gujarati
  if (/[\u0600-\u06FF]/.test(text)) return 'ur'; // Arabic script (Urdu)
  
  return 'en'; // Default to English
};