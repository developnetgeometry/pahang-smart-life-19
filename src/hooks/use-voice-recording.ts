import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';

interface UseVoiceRecordingOptions {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
}

export const useVoiceRecording = ({
  onTranscription,
  onError
}: UseVoiceRecordingOptions = {}) => {
  const { language } = useAuth();
  const { t } = useTranslation(language);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        
        try {
          const audioBlob = new Blob(chunksRef.current, {
            type: 'audio/webm;codecs=opus'
          });

          // Convert to base64
          const arrayBuffer = await audioBlob.arrayBuffer();
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

          // Send to voice-to-text function
          const { data, error } = await supabase.functions.invoke('voice-to-text', {
            body: { 
              audio: base64Audio,
              language: language || 'ms'
            }
          });

          if (error) {
            throw new Error(error.message);
          }

          if (data.text && onTranscription) {
            onTranscription(data.text);
          }
        } catch (error) {
          console.error('Voice processing error:', error);
          if (onError) {
            onError(error instanceof Error ? error.message : t('voiceProcessingFailed'));
          }
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      durationIntervalRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Recording start error:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : t('failedToStartRecording'));
      }
    }
  }, [language, onTranscription, onError, t]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      setDuration(0);

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (mediaRecorderRef.current) {
        mediaRecorderRef.current = null;
      }

      chunksRef.current = [];
    }
  }, [isRecording]);

  return {
    isRecording,
    isProcessing,
    duration,
    startRecording,
    stopRecording,
    cancelRecording
  };
};