import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { Mic, Pause, Play, SkipForward, Eye, EyeOff, ArrowLeft, PenTool, Edit3, Sparkles, Check, Volume2, Zap, Settings2, X, FileText, User, Ear, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { analyzeAudioPerformance, reanalyzeScript } from '../services/geminiService';
import { ActingFeedback, Character } from '../types';

export const Rehearsal = () => {
  const { script, setScript, selectedCharacter, setSelectedCharacter, updateScriptLine, language, updateCharacterVoice } = useContext(AppContext);
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEyesClosedMode, setIsEyesClosedMode] = useState(false);
  const [isDirectorMode, setIsDirectorMode] = useState(false);
  const [isFluidMode, setIsFluidMode] = useState(true); // Default to true for better UX
  const [feedback, setFeedback] = useState<ActingFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showVoiceConfig, setShowVoiceConfig] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Reanalysis State
  const [manualCharInput, setManualCharInput] = useState("");
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const { startRecording, stopRecording } = useAudioRecorder();
  
  // Fetch Voices
  useEffect(() => {
      const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          setAvailableVoices(voices);
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleSilenceDetected = () => {
      if (isFluidMode && isListening) {
          // User finished speaking their line
          const pulseElement = document.getElementById('user-mic-button');
          if(pulseElement) {
              pulseElement.classList.add('scale-110', 'bg-green-500');
              setTimeout(() => pulseElement.classList.remove('scale-110', 'bg-green-500'), 300);
          }
          // Small delay to ensure natural flow
          setTimeout(() => {
              setCurrentIndex(prev => prev + 1);
          }, 600);
      }
  };

  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onResult: (text) => { 
        // Optional: You could match text accuracy here in real-time
        console.log("Heard:", text); 
    }, 
    onSilence: handleSilenceDetected, 
    continuous: true,
    lang: language,
    silenceDuration: 1500 // Wait 1.5s of silence before assuming line is done
  });

  const getBestVoiceForCharacter = (charName: string): SpeechSynthesisVoice | null => {
      const character = script?.characters.find(c => c.name === charName);
      if (!character) return null;

      // 1. Explicit Selection
      if (character.voiceURI) {
          const found = availableVoices.find(v => v.voiceURI === character.voiceURI);
          if (found) return found;
      }

      // 2. Smart Default based on Gender & Language
      const langPrefix = language.split('-')[0]; // 'es', 'en'
      const voiceCandidates = availableVoices.filter(v => v.lang.startsWith(langPrefix));
      
      if (character.gender === 'male') {
          return voiceCandidates.find(v => 
            /\b(male|hombre|david|pablo|mark|george|daniel|raul)\b/i.test(v.name)
          ) || voiceCandidates[0];
      } else if (character.gender === 'female') {
           return voiceCandidates.find(v => 
            /\b(female|mujer|zira|helena|laura|sabina|hazel|susan|monica)\b/i.test(v.name)
          ) || voiceCandidates[0];
      }
      
      return voiceCandidates[0] || null;
  };

  const speakLine = (text: string, charName: string) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop any previous speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 1.0; // Normal speed
        
        const voice = getBestVoiceForCharacter(charName);
        if (voice) {
            utterance.voice = voice;
        }

        window.speechSynthesis.speak(utterance);
        
        return new Promise<void>((resolve) => {
            utterance.onend = () => resolve();
        });
    }
    return Promise.resolve();
  };

  const toggleRecording = async () => {
      if (isListening) {
          stopListening();
          // Only analyze if manually toggled off in manual mode
          if (!isFluidMode) {
            setIsAnalyzing(true);
            try {
                const audioBase64 = await stopRecording();
                if (script && audioBase64) {
                    const currentLine = script.lines[currentIndex];
                    if (!currentLine) return;

                    const result = await analyzeAudioPerformance(currentLine.text || "", audioBase64, language, currentLine.directorNote);
                    setFeedback(result);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsAnalyzing(false);
            }
          }
      } else {
          setFeedback(null);
          startListening();
          if (!isFluidMode) startRecording();
      }
  };

  const handleAddNote = (lineId: string, currentNote?: string) => {
      const newNote = window.prompt("Nota del Director:", currentNote || "");
      if (newNote !== null) {
          updateScriptLine(lineId, { directorNote: newNote });
      }
  };

  const handleReanalyze = async () => {
    if (!script) return;
    
    setIsReanalyzing(true);
    try {
        const hints = manualCharInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const updatedScript = await reanalyzeScript(script, hints);
        setScript(updatedScript);
        setManualCharInput("");
    } catch (e) {
        alert("Error reanalizando el guion. Intenta de nuevo.");
    } finally {
        setIsReanalyzing(false);
    }
  };

  // --- MAIN REHEARSAL LOOP ---
  useEffect(() => {
    if (!script || !selectedCharacter) return;
    
    // Safety check for end of script
    if (currentIndex >= script.lines.length) {
        alert("¡Ensayo Completado!");
        // Reset or navigate away could go here
        return; 
    }

    const currentLine = script.lines[currentIndex];
    if (!currentLine) return;

    // Scroll active line into view
    if (scrollRef.current) {
        const el = document.getElementById(`line-${currentIndex}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const lineChar = currentLine.character ? currentLine.character.trim() : "";
    const userChar = selectedCharacter ? selectedCharacter.trim() : "";
    const isUserTurn = lineChar === userChar;

    const processTurn = async () => {
        // 1. AI'S TURN (Dialogue)
        if (!isUserTurn && currentLine.type === 'dialogue') {
            if (isListening) stopListening(); // Ensure mic is off while AI speaks
            
            // Small pause before AI starts speaking for realism
            await new Promise(r => setTimeout(r, 400));
            
            if (currentLine.text) {
                await speakLine(currentLine.text, lineChar);
            }
            // AI done -> Next line
            setCurrentIndex(prev => prev + 1);

        // 2. ACTION / PARENTHETICAL (Non-spoken)
        } else if (currentLine.type !== 'dialogue') {
            // Just wait a moment then skip
            setTimeout(() => setCurrentIndex(prev => prev + 1), 2000);
        
        // 3. USER'S TURN
        } else {
            window.speechSynthesis.cancel(); // Ensure AI is quiet
            setFeedback(null); // Clear previous feedback
            
            if (isFluidMode) {
                // Auto-start mic for user
                // Delay slightly so user processes it's their turn
                setTimeout(() => {
                    startListening();
                }, 300);
            }
        }
    };

    processTurn();

    // Cleanup on unmount or index change
    return () => {
        window.speechSynthesis.cancel();
    };
  }, [currentIndex, script, selectedCharacter, isFluidMode]);

  // --- RENDER HELPERS ---

  if (!script) return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6 p-6">
        <div className="bg-gray-50 p-6 rounded-full text-gray-400">
            <FileText size={48} />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-bold text-textMain">No hay guion activo</h2>
            <Button onClick={() => navigate('/scripts')} icon={<FileText size={18} />}>
                Ir a Mis Guiones
            </Button>
        </div>
    </div>
  );

  if (!selectedCharacter) {
      const charactersToDisplay = script.characters.length > 0 ? script.characters : [];
      const langPrefix = language.split('-')[0];
      const relevantVoices = availableVoices.filter(v => v.lang.startsWith(langPrefix));

      if (charactersToDisplay.length === 0) {
         return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-lg mx-auto p-6 text-center space-y-6">
                <div className="bg-red-50 p-6 rounded-full text-red-500 shadow-sm mb-2"><X size={40} /></div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-textMain">No se encontraron personajes</h2>
                    <p className="text-textLight font-medium">
                        La IA no pudo identificar los nombres automáticamente. 
                        <br/>Ingresa los nombres tú mismo para ayudar al análisis.
                    </p>
                </div>

                <div className="w-full bg-white p-6 rounded-3xl shadow-card border-2 border-red-50">
                    <label className="block text-left text-xs font-bold text-textLight uppercase tracking-wider mb-2">
                        Nombres (separados por comas)
                    </label>
                    <textarea
                        className="w-full h-24 bg-cream border-2 border-gray-200 rounded-xl p-4 text-textMain font-medium focus:border-primary focus:ring-0 outline-none resize-none mb-4"
                        placeholder="Ej: Romeo, Julieta, Narrador..."
                        value={manualCharInput}
                        onChange={(e) => setManualCharInput(e.target.value)}
                    />
                    <div className="space-y-3">
                         <Button 
                            fullWidth 
                            onClick={handleReanalyze} 
                            disabled={isReanalyzing || !manualCharInput.trim()}
                            icon={isReanalyzing ? <Loader2 className="animate-spin" /> : <RotateCcw size={18} />}
                        >
                            {isReanalyzing ? "Reanalizando..." : "Reanalizar Texto"}
                        </Button>
                         <Button 
                            fullWidth 
                            variant="ghost" 
                            onClick={() => navigate('/scripts')}
                            disabled={isReanalyzing}
                        >
                            Cancelar y Volver
                        </Button>
                    </div>
                </div>
            </div>
         );
    }

    const getLineCount = (charName: string) => script.lines.filter(l => l.character === charName && l.type === 'dialogue').length;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 p-6 pb-24">
             <div className="w-full max-w-2xl flex justify-between items-center md:hidden">
                <button onClick={() => navigate('/scripts')} className="p-2 bg-white rounded-full shadow-sm text-textLight"><ArrowLeft size={20}/></button>
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold text-textMain">Selecciona tu Rol</h2>
                <p className="text-textLight">Elige tu personaje y configura las voces del elenco.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                {charactersToDisplay.map(char => {
                    const count = getLineCount(char.name);
                    return (
                        <div key={char.name} className="bg-white rounded-3xl shadow-card border-2 border-transparent hover:border-primary transition-all group overflow-hidden flex flex-col">
                            <div onClick={() => setSelectedCharacter(char.name)} className="p-6 cursor-pointer flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="bg-gray-100 p-3 rounded-full text-gray-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                        <User size={24} />
                                    </div>
                                    {char.gender !== 'neutral' && (
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${char.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                            {char.gender === 'male' ? 'Masc' : 'Fem'}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-textMain mb-1">{char.name}</h3>
                                <span className="text-xs text-textLight font-medium bg-gray-50 px-2 py-1 rounded-md inline-block">{count > 0 ? `${count} líneas` : 'Personaje'}</span>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                                <label className="flex items-center text-[10px] font-bold text-textLight uppercase tracking-wider mb-2">
                                    <Volume2 size={12} className="mr-1.5" />
                                    Voz del Personaje
                                </label>
                                <select 
                                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-textMain outline-none focus:border-primary transition-colors cursor-pointer hover:border-gray-300"
                                    value={char.voiceURI || ''}
                                    onChange={(e) => updateCharacterVoice(char.name, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <option value="">Automática (Recomendada)</option>
                                    {relevantVoices.map(v => (
                                        <option key={v.voiceURI} value={v.voiceURI}>
                                            {v.name.length > 25 ? v.name.substring(0, 25) + '...' : v.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
  }

  const progress = Math.round(((currentIndex) / script.lines.length) * 100);

  return (
    <div className="h-[calc(100vh-2rem)] md:h-[calc(100vh-2rem)] flex flex-col relative max-w-3xl mx-auto">
      {/* Voice Config Modal */}
      {showVoiceConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-[2rem] p-8 shadow-2xl w-full max-w-lg animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-textMain">Configuración de Voces</h3>
                      <button onClick={() => setShowVoiceConfig(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                      {script.characters.filter(c => c.name !== selectedCharacter).map(char => (
                          <div key={char.name} className="bg-gray-50 p-4 rounded-2xl">
                              <div className="flex justify-between items-center mb-2">
                                  <span className="font-bold text-textMain">{char.name}</span>
                                  <span className="text-xs bg-white px-2 py-1 rounded-md border text-textLight">{char.gender}</span>
                              </div>
                              <select 
                                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                                  value={char.voiceURI || ''}
                                  onChange={(e) => updateCharacterVoice(char.name, e.target.value)}
                              >
                                  <option value="">Voz Automática (Defecto)</option>
                                  {availableVoices.filter(v => v.lang.startsWith(language.split('-')[0])).map(v => (
                                      <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
                                  ))}
                              </select>
                          </div>
                      ))}
                  </div>
                  <div className="mt-6">
                      <Button fullWidth onClick={() => setShowVoiceConfig(false)}>Guardar Cambios</Button>
                  </div>
              </div>
          </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between py-4 px-2 mb-4">
        <div className="flex items-center space-x-4">
            <div className="relative w-12 h-12 flex items-center justify-center">
                 <svg className="transform -rotate-90 w-12 h-12">
                    <circle cx="24" cy="24" r="20" stroke="#F3F4F6" strokeWidth="4" fill="transparent" />
                    <circle cx="24" cy="24" r="20" stroke="#00C49A" strokeWidth="4" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * progress) / 100} className="transition-all duration-1000 ease-out" />
                </svg>
                <span className="absolute text-[10px] font-bold text-textMain">{progress}%</span>
            </div>
            <div>
                <h2 className="text-lg font-bold text-textMain leading-tight line-clamp-1">{script.title}</h2>
                <p className="text-xs font-medium text-textLight">Interpretando a <span className="text-primary">{selectedCharacter}</span></p>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
             <button onClick={() => setShowVoiceConfig(true)} className="p-2 rounded-full bg-white border border-gray-100 text-textLight hover:bg-gray-50 hover:text-primary">
                 <Settings2 size={18} />
             </button>

             <button 
                onClick={() => {
                    const newMode = !isFluidMode;
                    setIsFluidMode(newMode);
                    if(!newMode) stopListening(); 
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all border ${
                    isFluidMode 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-white border-gray-100 text-textLight hover:bg-gray-50'
                }`}
            >
                <Zap size={16} className={isFluidMode ? "fill-current" : ""} />
                <span className="text-xs font-bold hidden md:inline">{isFluidMode ? "Modo Fluido" : "Modo Manual"}</span>
            </button>
        </div>
      </div>

      {/* Script View */}
      <div className="flex-1 overflow-y-auto px-2 pb-32 no-scrollbar space-y-6" ref={scrollRef}>
        {script.lines.map((line, idx) => {
            const isActive = idx === currentIndex;
            const lineChar = line.character ? line.character.trim() : "";
            const userChar = selectedCharacter ? selectedCharacter.trim() : "";
            const isUser = lineChar === userChar;
            const isHidden = isEyesClosedMode && isUser && isActive;

            return (
                <div 
                    id={`line-${idx}`}
                    key={line.id} 
                    className={`transition-all duration-500 transform ${isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-40 grayscale'}`}
                >
                    {line.type === 'dialogue' ? (
                        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center mb-2 space-x-2">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-textLight bg-gray-100 px-2 py-0.5 rounded-md">{line.character}</span>
                                {isDirectorMode && (
                                    <button onClick={() => handleAddNote(line.id, line.directorNote)} className="text-accent bg-accent/10 p-1 rounded-full"><Edit3 size={10}/></button>
                                )}
                            </div>
                            
                            <div className={`p-6 md:p-8 rounded-3xl max-w-[95%] md:max-w-xl shadow-card relative transition-colors duration-300 
                                ${isUser 
                                    ? (isActive ? 'bg-gradient-to-br from-primary to-[#00A885] text-white' : 'bg-white text-textMain') 
                                    : 'bg-white text-textMain'
                                }`
                            }>
                                {isUser && isActive && isListening && (
                                    <div className="absolute -top-3 -right-2 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center animate-pulse">
                                        <Ear size={10} className="mr-1" /> Escuchando...
                                    </div>
                                )}

                                {line.directorNote && (
                                    <div className={`text-xs mb-3 px-3 py-1.5 rounded-lg inline-flex items-center ${isUser && isActive ? 'bg-white/20 text-white' : 'bg-yellowSoft/20 text-yellow-700'}`}>
                                        <PenTool size={10} className="mr-1.5"/>
                                        <span className="font-semibold italic">{line.directorNote}</span>
                                    </div>
                                )}

                                <p className={`text-lg md:text-xl font-medium leading-relaxed ${isHidden ? 'blur-md select-none' : ''}`}>
                                    {line.text}
                                </p>
                            </div>
                        </div>
                    ) : (
                         <div className="flex justify-center my-4">
                            <span className="text-xs font-bold italic text-textLight bg-gray-100 px-4 py-2 rounded-full">{line.text}</span>
                         </div>
                    )}
                </div>
            );
        })}
      </div>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center items-end z-30 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-lg p-2 rounded-[2.5rem] shadow-card border border-white/50 pointer-events-auto flex items-center space-x-6">
            <button 
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} 
                className="w-12 h-12 rounded-full bg-gray-100 text-textLight flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
                <SkipForward className="rotate-180" size={20}/>
            </button>

            <button 
                id="user-mic-button"
                onClick={toggleRecording}
                disabled={isAnalyzing}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 
                    ${isFluidMode 
                        ? (isListening ? 'bg-green-500 shadow-glow-primary scale-105' : 'bg-gray-300') 
                        : (isAnalyzing ? 'bg-gray-100' : (isListening ? 'bg-accent shadow-glow-accent animate-pulse' : 'bg-primary shadow-glow-primary hover:scale-105 active:scale-95'))
                    }`}
            >
                {isAnalyzing ? (
                    <div className="w-8 h-8 border-4 border-textLight border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    isListening 
                        ? <Mic size={32} color="white" className={isFluidMode ? "animate-bounce-slight" : ""} /> 
                        : (isFluidMode ? <div className="flex flex-col items-center"><span className="text-[10px] font-bold text-textMain uppercase">Pausa</span></div> : <Mic size={32} color="white" />)
                )}
            </button>

            <button 
                 onClick={() => setCurrentIndex(prev => prev + 1)}
                 className="w-12 h-12 rounded-full bg-gray-100 text-textLight flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
                <SkipForward size={20}/>
            </button>
          </div>
      </div>
    </div>
  );
};