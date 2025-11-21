import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionProps {
  onResult: (text: string) => void;
  onEnd?: () => void;
  onSilence?: () => void; // New callback for silence detection
  continuous?: boolean;
  lang?: string;
  silenceDuration?: number; // How long to wait before assuming end of speech
}

export const useSpeechRecognition = ({ 
  onResult, 
  onEnd, 
  onSilence,
  continuous = false, 
  lang = 'es-ES',
  silenceDuration = 1500 
}: SpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset silence timer
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    if (isListening && onSilence) {
        silenceTimerRef.current = setTimeout(() => {
            console.log("Silence detected, stopping...");
            onSilence();
        }, silenceDuration);
    }
  }, [isListening, onSilence, silenceDuration]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = lang;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        
        // Reset silence timer whenever we hear something
        resetSilenceTimer();

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
            onResult(finalTranscript);
        }
      };

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        // Start the timer immediately in case they never speak (optional, but good for flow)
        // But usually we wait for at least some sound. 
        // Let's only set it if we want to timeout empty silence too.
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (onEnd) onEnd();
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };
    }
  }, [continuous, lang, onResult, onEnd, resetSilenceTimer]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Start error", e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    }
  }, [isListening]);

  return { isListening, startListening, stopListening };
};