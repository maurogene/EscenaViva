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

  // Use refs for callbacks to keep them fresh without triggering re-renders/re-effects
  const onResultRef = useRef(onResult);
  const onEndRef = useRef(onEnd);
  const onSilenceRef = useRef(onSilence);

  useEffect(() => {
    onResultRef.current = onResult;
    onEndRef.current = onEnd;
    onSilenceRef.current = onSilence;
  }, [onResult, onEnd, onSilence]);

  // Reset silence timer
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    if (onSilenceRef.current) { // Only set timer if we have a handler
        silenceTimerRef.current = setTimeout(() => {
            // console.log("Silence detected (timer), stopping...");
            if (onSilenceRef.current) onSilenceRef.current();
        }, silenceDuration);
    }
  }, [silenceDuration]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn("Speech recognition not supported in this browser.");
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
        // Reset silence timer whenever we hear something (interim or final)
        resetSilenceTimer();

        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        // Pass result if we have it
        if (finalTranscript && onResultRef.current) {
            onResultRef.current(finalTranscript);
        }
    };

    recognition.onstart = () => {
        setIsListening(true);
    };

    recognition.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (onEndRef.current) onEndRef.current();
    };

    recognition.onerror = (event: any) => {
        // Filter out benign errors to avoid console spam
        if (event.error === 'no-speech' || event.error === 'aborted') {
             // no-speech: User didn't speak. Standard behavior.
             // aborted: We stopped it. Standard behavior.
             return;
        }
        
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    return () => {
        // Cleanup: Abort recognition when component unmounts or config changes
        if (recognition) {
            recognition.abort();
        }
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [continuous, lang, resetSilenceTimer]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Ignore errors if already started (race condition)
        // console.debug("Start listening failed:", e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
          recognitionRef.current.stop();
      } catch (e) {
          // console.debug("Stop listening failed:", e);
      }
      // We rely on onend to set isListening to false, but force it just in case
      // to update UI immediately if needed. 
      // However, strictly waiting for onend is safer for sync. 
      // We'll let onend handle the state change.
    }
  }, []);

  return { isListening, startListening, stopListening };
};
