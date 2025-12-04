# Bhasini API Integration for Voice Input

This document explains how to set up and use the Bhasini API for multilingual speech-to-text functionality in your chat application.

## Overview

The application now supports native language voice input using India's Bhasini API, which provides:
- Speech-to-text recognition for 22+ Indian languages
- Automatic translation to English
- Fallback to Web Speech Recognition API
- Modern, user-friendly interface with language selection

## Supported Languages

- Hindi (hi) - हिन्दी
- Bengali (bn) - বাংলা
- Tamil (ta) - தமிழ்
- Telugu (te) - తెలుగు
- Malayalam (ml) - മലയാളം
- Kannada (kn) - ಕನ್ನಡ
- Gujarati (gu) - ગુજરાતી
- Marathi (mr) - मराठी
- Odia (or) - ଓଡ଼ିଆ
- Punjabi (pa) - ਪੰਜਾਬੀ
- Assamese (as) - অসমীয়া
- Nepali (ne) - नेपाली
- Urdu (ur) - اردو
- English (en) - English

## Setup Instructions

### 1. Register for Bhasini API

1. Visit the Bhasini registration page: https://bhashini.gov.in/ulca/user/register
2. Fill out the registration form with your details
3. Check your email for verification and complete the email authentication
4. Login to the Bhasini portal: https://bhashini.gov.in/ulca/user/login

### 2. Generate API Credentials

1. After logging in, navigate to "My Profile" section
2. Click "Generate" button under the API Key section
3. Provide an app name (must use lowercase words, may contain underscores)
4. Copy both the generated API Key and your User ID

**Important Notes:**
- Maximum of 5 API keys can be generated per account
- App name must follow naming conventions (lowercase, underscores allowed)
- Current usage is for PoC (Proof of Concept) purposes only

### 3. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your Bhasini credentials:
   ```env
   VITE_BHASINI_API_KEY=your_actual_api_key_here
   VITE_BHASINI_USER_ID=your_actual_user_id_here
   ```

### 4. Start the Application

```bash
npm install
npm run dev
```

The application will be available at http://localhost:5173/

## Usage

### Voice Input Features

1. **Language Selection**: Click the language selector button (globe icon) to choose your preferred language
2. **Voice Recording**: Click the microphone button to start recording
3. **Multi-modal Interface**: The interface provides visual feedback during recording and processing
4. **Automatic Translation**: Native language speech is automatically translated to English
5. **Fallback Support**: If Bhasini API is unavailable, the system falls back to Web Speech Recognition

### Voice Input Flow

1. Select your preferred language from the dropdown
2. Click the microphone button to start recording
3. Speak clearly in your selected language
4. Click anywhere or wait for automatic stop
5. The system processes your speech and displays:
   - Original text (in native language)
   - Translated text (in English)
   - Confidence indicators

### Error Handling

The application includes comprehensive error handling:
- Network connectivity issues
- API rate limiting
- Unsupported audio formats
- Microphone permission errors
- Service unavailability

## Technical Architecture

### Components Created

1. **BhasiniService** (`src/services/bhasiniService.ts`)
   - Core API integration
   - Speech-to-text processing
   - Translation handling
   - Error management

2. **useVoiceInput Hook** (`src/hooks/useVoiceInput.ts`)
   - State management for voice input
   - Audio recording with MediaRecorder API
   - Fallback to Web Speech Recognition
   - Result processing

3. **VoiceInputButton** (`src/components/VoiceInputButton.tsx`)
   - User interface component
   - Visual feedback and animations
   - Language selection
   - Error display

4. **LanguageSelector** (`src/components/LanguageSelector.tsx`)
   - Language selection dropdown
   - Support for all Bhasini languages

### API Integration Flow

1. **Pipeline Config Call**: Get available speech recognition pipeline
2. **Audio Recording**: Capture audio using MediaRecorder API
3. **Pipeline Compute Call**: Send audio to Bhasini for processing
4. **Translation** (optional): Translate result to English
5. **Result Display**: Show original and translated text

## Configuration Options

### Environment Variables

```env
# Required for Bhasini API
VITE_BHASINI_API_KEY=your_api_key
VITE_BHASINI_USER_ID=your_user_id

# Backend API (existing)
VITE_SEARCH_JOBS_URL=http://localhost:8888
VITE_UPLOAD_CV_URL=http://localhost:8888
```

### VoiceInputButton Props

```typescript
interface VoiceInputButtonProps {
  onTranscript: (text: string, metadata?: {...}) => void;
  disabled?: boolean;
  bhasiniApiKey?: string;
  bhasiniUserId?: string;
  showLanguageSelector?: boolean;
  defaultLanguage?: string;
}
```

## Limitations and Considerations

### Current Limitations

1. **PoC Only**: Bhasini APIs are currently for proof-of-concept use
2. **Rate Limiting**: Free tier has usage limitations
3. **Audio Format**: Requires WAV format at 16kHz sample rate
4. **Network Dependency**: Requires stable internet connection

### Production Considerations

1. **Commercial License**: Contact Bhasini team for production API access
2. **Error Handling**: Implement robust fallback mechanisms
3. **Caching**: Consider caching frequently used translations
4. **Performance**: Monitor API response times and implement timeouts

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify credentials in .env file
   - Check if API key is active in Bhasini portal
   - Ensure User ID matches the API key

2. **Microphone Permission Denied**
   - Check browser permissions
   - Ensure HTTPS in production
   - Test with different browsers

3. **Network Errors**
   - Check internet connectivity
   - Verify Bhasini service status
   - Test with fallback Web Speech Recognition

4. **Audio Processing Errors**
   - Check microphone functionality
   - Verify audio format support
   - Test with different audio devices

### Debug Mode

Enable console logging to debug issues:
```javascript
// In browser console
localStorage.setItem('debug', 'bhasini:*');
```

## Support and Documentation

- **Bhasini Official Docs**: https://bhashini.gitbook.io/bhashini-apis/
- **API Documentation**: https://dibdbhashini.gitbook.io/api-docs
- **Registration Portal**: https://bhashini.gov.in/ulca
- **Support**: Contact through Bhasini portal

## Future Enhancements

1. **Language Auto-Detection**: Implement automatic language detection
2. **Offline Support**: Add offline speech recognition capabilities
3. **Voice Commands**: Implement voice command recognition
4. **Performance Optimization**: Add response caching and optimization
5. **Analytics**: Add usage analytics and performance monitoring

---

**Note**: This implementation provides a foundation for multilingual voice input. For production deployment, ensure you have appropriate Bhasini commercial licenses and implement additional security measures.