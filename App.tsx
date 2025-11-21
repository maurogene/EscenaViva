import React, { useState, createContext, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ScriptUpload } from './pages/ScriptUpload';
import { Rehearsal } from './pages/Rehearsal';
import { Subscription } from './pages/Subscription';
import { LanguageSelector } from './pages/LanguageSelector';
import { Script, ScriptLine, LanguageCode, PlanType, Character } from './types';
import { Menu } from 'lucide-react';

interface AppState {
  script: Script | null; // The currently active script
  setScript: (s: Script) => void;
  scripts: Script[]; // All saved scripts
  addScript: (s: Script) => void;
  selectedCharacter: string | null;
  setSelectedCharacter: (c: string) => void;
  updateScriptLine: (lineId: string, updates: Partial<ScriptLine>) => void;
  updateCharacterVoice: (characterName: string, voiceURI: string) => void;
  language: LanguageCode;
  setLanguage: (l: LanguageCode) => void;
  plan: PlanType;
  setPlan: (p: PlanType) => void;
}

export const AppContext = createContext<AppState>({
  script: null,
  setScript: () => {},
  scripts: [],
  addScript: () => {},
  selectedCharacter: null,
  setSelectedCharacter: () => {},
  updateScriptLine: () => {},
  updateCharacterVoice: () => {},
  language: 'es-ES',
  setLanguage: () => {},
  plan: 'free',
  setPlan: () => {}
});

const AppContent = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    
    // Hide sidebar on language selection screen
    const isLanguageScreen = location.pathname === '/language';

    return (
        <div className="flex min-h-screen bg-cream font-sans selection:bg-primary selection:text-white">
            {!isLanguageScreen && <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />}
            
            <main className={`flex-1 transition-all duration-300 ${!isLanguageScreen ? 'md:ml-72' : ''} w-full p-6 md:p-10 overflow-hidden`}>
            {!isLanguageScreen && (
                <div className="md:hidden mb-8 flex items-center justify-between">
                    <div className="flex items-center">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="p-3 bg-white rounded-xl text-textMain shadow-sm hover:shadow-md"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-bold text-xl text-textMain">Escena<span className="text-primary">Viva</span></span>
                    </div>
                </div>
            )}

            <div className={`h-full ${!isLanguageScreen ? 'max-w-5xl mx-auto' : ''}`}>
                <Routes>
                    <Route path="/language" element={<LanguageSelector />} />
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/scripts" element={<ScriptUpload />} />
                    <Route path="/subscription" element={<Subscription />} />
                    <Route path="/rehearsal/:id" element={<Rehearsal />} />
                    <Route path="/profile" element={<div className="flex items-center justify-center h-64 text-textLight font-medium">Perfil en construcción...</div>} />
                    <Route path="/settings" element={<div className="flex items-center justify-center h-64 text-textLight font-medium">Ajustes en construcción...</div>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
            </main>
        </div>
    );
}

const App = () => {
  const [script, setScript] = useState<Script | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [language, setLanguageState] = useState<LanguageCode>('es-ES');
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);
  const [plan, setPlan] = useState<PlanType>('free');

  const setLanguage = (lang: LanguageCode) => {
      setLanguageState(lang);
      setHasSelectedLanguage(true);
      localStorage.setItem('appLanguage', lang);
  };

  const addScript = (newScript: Script) => {
      setScripts(prev => [...prev, newScript]);
      setScript(newScript);
  };

  useEffect(() => {
      const savedLang = localStorage.getItem('appLanguage');
      if (savedLang) {
          setLanguageState(savedLang as LanguageCode);
          setHasSelectedLanguage(true);
      }
  }, []);

  const updateScriptLine = (lineId: string, updates: Partial<ScriptLine>) => {
    setScript(prev => {
        if (!prev) return null;
        const newLines = prev.lines.map(line => 
            line.id === lineId ? { ...line, ...updates } : line
        );
        return { ...prev, lines: newLines };
    });
  };

  const updateCharacterVoice = (characterName: string, voiceURI: string) => {
      setScript(prev => {
          if (!prev) return null;
          const newChars = prev.characters.map(char => 
              char.name === characterName ? { ...char, voiceURI } : char
          );
          return { ...prev, characters: newChars };
      });
  };

  return (
    <AppContext.Provider value={{ 
        script, 
        setScript, 
        scripts,
        addScript,
        selectedCharacter, 
        setSelectedCharacter, 
        updateScriptLine, 
        updateCharacterVoice,
        language, 
        setLanguage,
        plan,
        setPlan
    }}>
      <HashRouter>
         {!hasSelectedLanguage ? (
             <LanguageSelector />
         ) : (
             <AppContent />
         )}
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;