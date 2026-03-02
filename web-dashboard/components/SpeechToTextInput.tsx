'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface SpeechToTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  rows?: number;
}

export default function SpeechToTextInput({
  value,
  onChange,
  placeholder = 'Type or speak...',
  className = '',
  multiline = false,
  rows = 4
}: SpeechToTextInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [useCloudFallback, setUseCloudFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isListeningRef = useRef(false);
  const valueRef = useRef(value); // Store current value in ref
  const onChangeRef = useRef(onChange); // Store current onChange in ref

  // Update refs when props change
  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [value, onChange]);

  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          // Use refs to get current value and onChange
          const currentValue = valueRef.current;
          const currentOnChange = onChangeRef.current;
          const newValue = currentValue + (currentValue ? ' ' : '') + finalTranscript;
          currentOnChange(newValue);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'not-allowed') {
          setError('Please allow microphone access in your browser settings');
        } else if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.');
        } else if (event.error === 'network') {
          setError('Network error. Check your connection.');
        } else {
          setError('Speech recognition error. Please try again.');
        }
        
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        // Use ref instead of state to avoid stale closure
        if (isListeningRef.current) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            setIsListening(false);
            isListeningRef.current = false;
          }
        }
      };
    } else {
      setUseCloudFallback(true);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore
        }
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []); // Empty dependency array is correct - only run on mount

  const startWebSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        setError(null);
        recognitionRef.current.start();
        setIsListening(true);
        isListeningRef.current = true;
      } catch (error) {
        console.error('Error starting recognition:', error);
        setError('Failed to start speech recognition');
      }
    }
  };

  const stopWebSpeechRecognition = () => {
    if (recognitionRef.current) {
      isListeningRef.current = false; // Set ref first to prevent restart
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore
      }
      setIsListening(false);
    }
  };

  const startCloudTranscription = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToBackend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsListening(true);
      isListeningRef.current = true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Please allow microphone access to use speech-to-text');
      setIsListening(false);
    }
  };

  const stopCloudTranscription = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      isListeningRef.current = false;
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const sendAudioToBackend = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('language', 'en-US');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transcribe`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        if (response.status === 503) {
          setError('Cloud service not configured. Please use Chrome, Edge, or Safari for FREE voice input.');
        } else {
          setError(`Transcription failed: ${errorData.message || 'Please try again'}`);
        }
        throw new Error('Transcription request failed');
      }

      const data = await response.json();
      if (data.transcript) {
        // Use refs to get current value and onChange
        const currentValue = valueRef.current;
        const currentOnChange = onChangeRef.current;
        const newValue = currentValue + (currentValue ? ' ' : '') + data.transcript;
        currentOnChange(newValue);
      }
    } catch (error: any) {
      console.error('Transcription error:', error);
      if (!error?.message?.includes('Cloud service')) {
        setError('Cloud transcription not available. Use Chrome, Edge, or Safari for FREE voice input.');
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (useCloudFallback) {
        stopCloudTranscription();
      } else {
        stopWebSpeechRecognition();
      }
    } else {
      if (useCloudFallback || !isSupported) {
        startCloudTranscription();
      } else {
        startWebSpeechRecognition();
      }
    }
  };

  const InputComponent = multiline ? 'textarea' : 'input';
  const baseInputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="relative">
      <InputComponent
        type={multiline ? undefined : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${baseInputClass} ${className} pr-14`}
        rows={multiline ? rows : undefined}
      />
      <button
        type="button"
        onClick={toggleListening}
        className={`absolute right-2 top-2 p-2 rounded-full transition-all ${
          isListening 
            ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        title={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
      
      {useCloudFallback && !error && (
        <p className="text-xs text-amber-600 mt-1 font-medium">
          ⚠️ Cloud transcription requires setup. For FREE voice input, use Chrome, Edge, or Safari.
        </p>
      )}
      
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
      
      {isListening && (
        <p className="text-xs text-blue-600 mt-1 animate-pulse">
          🎤 Listening... Speak now
        </p>
      )}
    </div>
  );
}
