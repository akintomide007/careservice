import { Response } from 'express';
import { AuthRequest } from '../types';
import { TranscriptionService } from '../services/transcription.service';

const transcriptionService = new TranscriptionService();

export const transcriptionController = {
  async transcribe(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Check if transcription service is configured
      if (!transcriptionService.isConfigured()) {
        res.status(503).json({ 
          error: 'Transcription service not configured',
          message: 'AssemblyAI API key is missing. Contact your administrator.'
        });
        return;
      }

      // Check if audio file was provided
      if (!req.file) {
        res.status(400).json({ 
          error: 'No audio file provided',
          message: 'Please provide an audio file in the request'
        });
        return;
      }

      const language = req.body.language || 'en';
      
      console.log(`Transcribing audio for user ${req.user?.userId}, language: ${language}, size: ${req.file.size} bytes`);

      // Perform transcription
      const result = await transcriptionService.transcribe(
        req.file.buffer,
        language
      );

      console.log(`Transcription successful: ${result.transcript.length} characters, confidence: ${result.confidence}`);

      res.json({
        success: true,
        transcript: result.transcript,
        confidence: result.confidence,
        language: result.detectedLanguage
      });
    } catch (error) {
      console.error('Transcription controller error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      res.status(500).json({ 
        error: 'Transcription failed',
        message: errorMessage
      });
    }
  },

  async getStatus(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const isConfigured = transcriptionService.isConfigured();
      
      res.json({
        available: isConfigured,
        provider: isConfigured ? 'AssemblyAI' : 'none',
        message: isConfigured 
          ? 'Speech-to-text service is available' 
          : 'Speech-to-text service is not configured'
      });
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ 
        error: 'Failed to check service status'
      });
    }
  }
};
