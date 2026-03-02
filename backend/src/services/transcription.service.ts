import axios from 'axios';

interface TranscriptionResult {
  transcript: string;
  confidence: number;
  detectedLanguage: string;
}

export class TranscriptionService {
  private apiKey: string;
  private useAssemblyAI: boolean;

  constructor() {
    this.apiKey = process.env.ASSEMBLYAI_API_KEY || '';
    this.useAssemblyAI = !!this.apiKey;
  }

  async transcribe(audioBuffer: Buffer, language: string = 'en'): Promise<TranscriptionResult> {
    if (!this.useAssemblyAI) {
      throw new Error('AssemblyAI API key not configured. Please set ASSEMBLYAI_API_KEY in environment variables.');
    }

    try {
      // Step 1: Upload audio file to AssemblyAI
      const uploadResponse = await axios.post(
        'https://api.assemblyai.com/v2/upload',
        audioBuffer,
        {
          headers: {
            'authorization': this.apiKey,
            'content-type': 'application/octet-stream'
          }
        }
      );

      const audioUrl = uploadResponse.data.upload_url;

      // Step 2: Request transcription with enhanced settings
      const transcriptResponse = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        {
          audio_url: audioUrl,
          language_code: language,
          
          // Enable automatic punctuation and formatting
          punctuate: true,
          format_text: true,
          
          // Enable multi-language detection for better accent support
          language_detection: true,
          
          // Boost healthcare and care-related vocabulary
          word_boost: [
            'progress note',
            'medication',
            'behavioral support',
            'ISP goal',
            'community based support',
            'incident report',
            'client',
            'individual',
            'support provided',
            'safety',
            'dignity',
            'next steps',
            'assessment'
          ],
          boost_param: 'high',
          
          // Filter profanity if needed (optional)
          filter_profanity: false,
          
          // Enable speaker labels for future use
          speaker_labels: false
        },
        {
          headers: {
            'authorization': this.apiKey,
            'content-type': 'application/json'
          }
        }
      );

      const transcriptId = transcriptResponse.data.id;

      // Step 3: Poll for completion (max 60 seconds)
      let transcript = null;
      let attempts = 0;
      const maxAttempts = 60;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const pollingResponse = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          {
            headers: {
              'authorization': this.apiKey
            }
          }
        );
        
        transcript = pollingResponse.data;
        
        if (transcript.status === 'completed') {
          break;
        }
        
        if (transcript.status === 'error') {
          throw new Error(`AssemblyAI transcription error: ${transcript.error}`);
        }
        
        attempts++;
      }

      if (!transcript || transcript.status !== 'completed') {
        throw new Error('Transcription timeout - please try again with shorter audio');
      }

      return {
        transcript: transcript.text || '',
        confidence: transcript.confidence || 0,
        detectedLanguage: transcript.language_code || language
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('AssemblyAI API error:', error.response?.data || error.message);
        throw new Error(`Transcription service error: ${error.response?.data?.error || error.message}`);
      }
      
      console.error('Transcription error:', error);
      throw new Error('Transcription failed - please try again');
    }
  }

  isConfigured(): boolean {
    return this.useAssemblyAI;
  }
}
