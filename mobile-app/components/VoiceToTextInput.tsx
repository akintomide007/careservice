import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import Voice from '@react-native-voice/voice';

interface VoiceToTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: any;
}

export default function VoiceToTextInput({
  value,
  onChange,
  placeholder = 'Type or speak...',
  multiline = false,
  numberOfLines = 4,
  style
}: VoiceToTextInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up voice recognition events
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      // Cleanup
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => {
    setIsListening(true);
    setError(null);
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

  const onSpeechResults = (event: any) => {
    if (event.value && event.value.length > 0) {
      const transcript = event.value[0];
      const newValue = value + (value ? ' ' : '') + transcript;
      onChange(newValue);
    }
  };

  const onSpeechError = (event: any) => {
    console.error('Speech error:', event.error);
    setError('Voice input error. Please try again.');
    setIsListening(false);
  };

  const startListening = async () => {
    try {
      setError(null);
      await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setError('Could not start voice input');
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            style
          ]}
        />
        <TouchableOpacity
          onPress={toggleListening}
          style={[
            styles.micButton,
            isListening && styles.micButtonActive
          ]}
        >
          <Text style={styles.micIcon}>{isListening ? '🎤' : '🎙️'}</Text>
        </TouchableOpacity>
      </View>
      
      {isListening && (
        <Text style={styles.listeningText}>🎤 Listening... Speak now</Text>
      )}
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 14,
    paddingRight: 50,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  micButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: '#dc2626',
  },
  micIcon: {
    fontSize: 20,
  },
  listeningText: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
  },
});
