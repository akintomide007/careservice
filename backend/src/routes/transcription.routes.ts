import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { transcriptionController } from '../controllers/transcription.controller';

const router = Router();

// Configure multer for audio file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm') {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Transcribe audio to text
router.post('/transcribe', 
  authenticate, 
  upload.single('audio'), 
  transcriptionController.transcribe
);

// Check if transcription service is available
router.get('/transcribe/status',
  authenticate,
  transcriptionController.getStatus
);

export default router;
