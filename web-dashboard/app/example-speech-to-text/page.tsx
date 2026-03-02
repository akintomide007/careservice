'use client';

import { useState } from 'react';
import SpeechToTextInput from '@/components/SpeechToTextInput';

export default function ExampleSpeechToTextPage() {
  const [formData, setFormData] = useState({
    reasonForService: '',
    supportsProvided: '',
    progressNotes: '',
    observations: '',
    nextSteps: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Form data logged to console');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Speech-to-Text Demo
          </h1>
          <p className="text-gray-600 mb-6">
            Click the microphone button to start speaking. The system will transcribe your speech 
            and supports multiple accents (American, British, Indian, Australian, and more).
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reason for Service */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Service
              </label>
              <SpeechToTextInput
                value={formData.reasonForService}
                onChange={(val) => setFormData({...formData, reasonForService: val})}
                placeholder="Type or click microphone to speak..."
                multiline
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: "Client requested support with community activities and social skills development"
              </p>
            </div>

            {/* Supports Provided */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supports Provided
              </label>
              <SpeechToTextInput
                value={formData.supportsProvided}
                onChange={(val) => setFormData({...formData, supportsProvided: val})}
                placeholder="Type or click microphone to speak..."
                multiline
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: "Provided verbal prompts and modeling for appropriate social interactions"
              </p>
            </div>

            {/* Progress Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Notes
              </label>
              <SpeechToTextInput
                value={formData.progressNotes}
                onChange={(val) => setFormData({...formData, progressNotes: val})}
                placeholder="Type or click microphone to speak..."
                multiline
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: "Client demonstrated improved social awareness and initiated conversation with peers"
              </p>
            </div>

            {/* Observations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observations
              </label>
              <SpeechToTextInput
                value={formData.observations}
                onChange={(val) => setFormData({...formData, observations: val})}
                placeholder="Type or click microphone to speak..."
                multiline
                rows={3}
              />
            </div>

            {/* Next Steps */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Steps
              </label>
              <SpeechToTextInput
                value={formData.nextSteps}
                onChange={(val) => setFormData({...formData, nextSteps: val})}
                placeholder="Type or click microphone to speak..."
                multiline
                rows={2}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Submit Form
              </button>
              <button
                type="button"
                onClick={() => setFormData({
                  reasonForService: '',
                  supportsProvided: '',
                  progressNotes: '',
                  observations: '',
                  nextSteps: ''
                })}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear All
              </button>
            </div>
          </form>

          {/* Tips Section */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for Best Results:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Speak clearly and at a normal pace</li>
              <li>• Allow microphone access when prompted</li>
              <li>• Click the microphone button again to stop recording</li>
              <li>• The system works with multiple accents automatically</li>
              <li>• For better accuracy in noisy environments, cloud transcription is used</li>
              <li>• You can edit the text after transcription</li>
            </ul>
          </div>

          {/* Browser Compatibility */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Browser Compatibility:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✅ <strong>Chrome/Edge:</strong> Full support with Web Speech API (free)</li>
              <li>✅ <strong>Safari:</strong> Full support with Web Speech API (free)</li>
              <li>⚠️ <strong>Firefox:</strong> Uses cloud fallback (requires API key)</li>
              <li>⚠️ <strong>Mobile:</strong> Uses cloud fallback for better accuracy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
