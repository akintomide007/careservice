# Speech-to-Text Implementation Guide

## Overview

This system implements AI-powered speech-to-text functionality with multi-accent support for DSP form fields. It uses a hybrid approach:

1. **Primary**: Browser's Web Speech API (FREE, works offline)
2. **Fallback**: AssemblyAI cloud service (better accuracy, multi-accent support)

---

## Features

✅ **Multi-Accent Support**: Automatically recognizes:
- American English
- British English
- Australian English
- Indian English
- Canadian English
- And many more regional accents

✅ **Hybrid Approach**: 
- Free Web Speech API for most browsers
- Cloud fallback for unsupported browsers or better accuracy

✅ **Healthcare Vocabulary**: 
- Optimized for care-related terminology
- Boosts recognition of terms like "medication", "ISP goal", "behavioral support"

✅ **Real-Time Transcription**: 
- Instant feedback as you speak
- Visual indicators for recording status

---

## Setup Instructions

### Step 1: Get AssemblyAI API Key (Optional but Recommended)

The Web Speech API works for free in most browsers, but AssemblyAI provides:
- Better accuracy in noisy environments
- More reliable multi-accent support
- Works in all browsers

**Get your free API key:**

1. Go to https://www.assemblyai.com/
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes: **5 hours of transcription per month**

### Step 2: Configure Backend

Add to your `.env` file:

```bash
# Speech-to-Text Configuration
ASSEMBLYAI_API_KEY=your_api_key_here
```

**Without API Key:**
- Web Speech API still works (free)
- Cloud fallback won't be available
- Most users won't notice the difference

### Step 3: Install Dependencies

Backend dependencies are already installed. If needed:

```bash
cd backend
npm install axios
```

### Step 4: Test the System

1. Start the backend:
```bash
cd backend
npm run dev
```

2. Start the web dashboard:
```bash
cd web-dashboard
npm run dev
```

3. Visit the demo page:
```
http://localhost:3010/example-speech-to-text
```

---

## Usage in Your Forms

### Basic Usage

```typescript
import SpeechToTextInput from '@/components/SpeechToTextInput';

function MyForm() {
  const [notes, setNotes] = useState('');

  return (
    <SpeechToTextInput
      value={notes}
      onChange={setNotes}
      placeholder="Type or speak your notes..."
      multiline
      rows={4}
    />
  );
}
```

### Full Example with Progress Note Form

```typescript
'use client';

import { useState } from 'react';
import SpeechToTextInput from '@/components/SpeechToTextInput';

export default function ProgressNoteForm() {
  const [formData, setFormData] = useState({
    reasonForService: '',
    supportsProvided: '',
    progressNotes: '',
    safetyNotes: '',
    nextSteps: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Submit to API
    const response = await fetch('/api/progress-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    // Handle response...
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Reason for Service
        </label>
        <SpeechToTextInput
          value={formData.reasonForService}
          onChange={(val) => setFormData({...formData, reasonForService: val})}
          placeholder="Type or speak..."
          multiline
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Supports Provided
        </label>
        <SpeechToTextInput
          value={formData.supportsProvided}
          onChange={(val) => setFormData({...formData, supportsProvided: val})}
          placeholder="Type or speak..."
          multiline
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Progress Notes
        </label>
        <SpeechToTextInput
          value={formData.progressNotes}
          onChange={(val) => setFormData({...formData, progressNotes: val})}
          placeholder="Type or speak..."
          multiline
          rows={4}
        />
      </div>

      <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg">
        Submit Progress Note
      </button>
    </form>
  );
}
```

---

## Component Props

```typescript
interface SpeechToTextInputProps {
  value: string;              // Current text value
  onChange: (value: string) => void;  // Called when text changes
  placeholder?: string;        // Placeholder text
  className?: string;          // Additional CSS classes
  multiline?: boolean;         // Use textarea instead of input
  rows?: number;               // Number of rows for textarea (default: 4)
}
```

---

## API Endpoints

### POST /api/transcribe
Transcribe audio to text using cloud service.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Authorization: Bearer {token}

**Body:**
```
audio: <audio file blob>
language: en-US (optional)
```

**Response:**
```json
{
  "success": true,
  "transcript": "The transcribed text goes here",
  "confidence": 0.95,
  "language": "en"
}
```

### GET /api/transcribe/status
Check if transcription service is available.

**Response:**
```json
{
  "available": true,
  "provider": "AssemblyAI",
  "message": "Speech-to-text service is available"
}
```

---

## How It Works

### 1. Web Speech API (Primary)

```
User clicks mic → Browser starts listening → 
Real-time transcription → Text added to field
```

**Advantages:**
- ✅ Free
- ✅ Fast (no network delay)
- ✅ Works offline
- ✅ Good for most accents

**Limitations:**
- ⚠️ Not supported in Firefox
- ⚠️ May be less accurate in noisy environments

### 2. Cloud Transcription (Fallback)

```
User clicks mic → Record audio → 
Send to backend → Forward to AssemblyAI → 
Receive transcription → Add to field
```

**Advantages:**
- ✅ Better accuracy
- ✅ Excellent multi-accent support
- ✅ Works in all browsers
- ✅ Better for noisy environments

**Limitations:**
- ⚠️ Requires API key
- ⚠️ ~2-5 second delay for transcription
- ⚠️ Requires internet connection

---

## Cost Analysis

### AssemblyAI Pricing

**Free Tier:**
- 5 hours/month FREE
- Perfect for testing

**Pay-as-you-go:**
- $0.00025 per second
- $0.015 per minute
- $0.90 per hour

**Example Monthly Cost:**

For 50 DSPs using 30 minutes/day:
```
50 DSPs × 30 min/day × 20 work days = 30,000 minutes/month
30,000 min × $0.015 = $450/month
```

**Optimization Tip:**
Most users will use the free Web Speech API, so actual cloud usage will be much lower (maybe 10-20% of total usage).

**Realistic estimate:** $50-100/month for 50 DSPs

---

## Browser Compatibility

| Browser | Web Speech API | Cloud Fallback | Recommended |
|---------|----------------|----------------|-------------|
| Chrome | ✅ Full Support | ✅ Available | Use Web Speech |
| Edge | ✅ Full Support | ✅ Available | Use Web Speech |
| Safari | ✅ Full Support | ✅ Available | Use Web Speech |
| Firefox | ❌ Not Supported | ✅ Available | Use Cloud |
| Mobile Chrome | ✅ Full Support | ✅ Available | Use Web Speech |
| Mobile Safari | ✅ Full Support | ✅ Available | Use Web Speech |

---

## Testing Multi-Accent Support

The system automatically handles different accents. Test with:

1. **American English**: Standard US pronunciation
2. **British English**: UK pronunciation and vocabulary
3. **Indian English**: Indian accent and intonation
4. **Australian English**: Australian accent
5. **Regional accents**: Southern US, Northeastern US, etc.

**How to test:**
1. Go to `/example-speech-to-text`
2. Click microphone button
3. Speak with your natural accent
4. System will transcribe accurately

---

## Troubleshooting

### Issue: Microphone button doesn't work

**Solution:**
1. Check browser permissions
2. Make sure HTTPS is enabled (required for microphone access)
3. Check browser console for errors

### Issue: "Please allow microphone access"

**Solution:**
1. Browser blocked microphone
2. Click the 🔒 icon in address bar
3. Enable microphone permissions
4. Refresh page

### Issue: Cloud transcription not working

**Solution:**
1. Check ASSEMBLYAI_API_KEY in `.env`
2. Verify backend is running
3. Check API key is valid
4. Check network connection

### Issue: Poor transcription accuracy

**Solution:**
1. Speak clearly and at normal pace
2. Reduce background noise
3. Use cloud fallback (better accuracy)
4. Check microphone quality

### Issue: Transcription timeout

**Solution:**
1. Speak in shorter segments (< 30 seconds)
2. Click mic button to stop/start
3. Check internet connection speed

---

## Best Practices

### For DSPs Using the System

1. **Environment**: Find a quiet space when possible
2. **Speaking**: Speak clearly at a normal pace
3. **Punctuation**: Say "period" or "comma" for punctuation
4. **Editing**: Review and edit transcription before submitting
5. **Short segments**: Stop and start for long notes

### For Developers

1. **Always provide fallback**: Don't rely only on Web Speech API
2. **Show visual feedback**: Users need to know when recording
3. **Handle errors gracefully**: Provide clear error messages
4. **Test on mobile**: Mobile behavior is different
5. **Monitor API usage**: Track AssemblyAI usage to control costs

---

## Mobile App Integration (Future)

When implementing in React Native:

```typescript
// Install dependencies
npm install react-native-voice
npm install @react-native-community/audio-toolkit

// Use expo-speech if using Expo
expo install expo-speech
```

Mobile implementation will be similar but use native APIs for better performance.

---

## Security Considerations

✅ **Implemented:**
- JWT authentication required for API
- File size limits (10MB)
- File type validation (audio only)
- User-specific transcription

⚠️ **Consider Adding:**
- Rate limiting per user
- Audio file encryption
- Transcription history logging
- GDPR compliance for audio storage

---

## Performance Optimization

### Current Implementation:
- ✅ Client-side processing (Web Speech)
- ✅ Streaming for real-time feedback
- ✅ Memory-efficient audio handling
- ✅ Automatic cleanup

### Future Improvements:
- [ ] Cache common phrases
- [ ] Batch processing for multiple fields
- [ ] Custom language models
- [ ] Edge computing for transcription

---

## Support

### Getting Help

1. **Check Status Endpoint:**
   ```bash
   curl http://localhost:3001/api/transcribe/status \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **View Backend Logs:**
   ```bash
   cd backend
   npm run dev
   # Watch console for transcription logs
   ```

3. **Test with Demo Page:**
   Visit `/example-speech-to-text` to test functionality

### Common Questions

**Q: Does this work offline?**
A: Yes, Web Speech API works offline. Cloud fallback requires internet.

**Q: How accurate is it?**
A: Web Speech API: 85-95% accuracy. AssemblyAI: 90-98% accuracy.

**Q: Can I use other languages?**
A: Yes! Change the language parameter. Supports 100+ languages.

**Q: What about HIPAA compliance?**
A: AssemblyAI is HIPAA compliant. Enable encryption and signed BAA.

**Q: How much does it cost?**
A: Web Speech API is FREE. AssemblyAI: $0.015/minute after free tier.

---

## Next Steps

1. ✅ Set up AssemblyAI account and get API key
2. ✅ Add API key to `.env` file
3. ✅ Test with demo page
4. ✅ Integrate into your forms
5. ⏳ Monitor usage and costs
6. ⏳ Collect user feedback
7. ⏳ Optimize based on real-world usage

---

**Questions? Issues?**
- Check the demo page: `/example-speech-to-text`
- Review browser console for errors
- Contact system administrator

---

**Last Updated:** February 23, 2026  
**Version:** 1.0.0
