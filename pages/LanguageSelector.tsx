import React, { useContext } from 'react';
import { AppContext } from '../App';
import { LanguageCode, LanguageOption } from '../types';
import { Globe, ChevronRight } from 'lucide-react';

const LANGUAGES: LanguageOption[] = [
    { code: 'es-ES', label: 'Español', flag: 'es', greeting: '¡Hola!' },
    { code: 'en-US', label: 'English', flag: 'us', greeting: 'Hello!' },
    { code: 'fr-FR', label: 'Français', flag: 'fr', greeting: 'Bonjour!' },
    { code: 'pt-BR', label: 'Português', flag: 'br', greeting: 'Olá!' },
    { code: 'de-DE', label: 'Deutsch', flag: 'de', greeting: 'Hallo!' },
    { code: 'it-IT', label: 'Italiano', flag: 'it', greeting: 'Ciao!' },
];

export const LanguageSelector = () => {
  const { setLanguage } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-md w-full">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-card mb-6 text-primary rotate-3">
                    <Globe size={40} />
                </div>
                <h1 className="text-4xl font-extrabold text-textMain mb-3 tracking-tight">Escena<span className="text-primary">Viva</span></h1>
                <p className="text-textLight text-lg">Select your language to start rehearsing.</p>
            </div>

            <div className="space-y-3">
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code as LanguageCode)}
                        className="w-full bg-white hover:bg-gray-50 p-4 rounded-2xl shadow-sm hover:shadow-md border-2 border-transparent hover:border-primary transition-all duration-300 group flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-8 rounded-lg overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
                                <img 
                                    src={`https://flagcdn.com/w160/${lang.flag}.png`} 
                                    alt={lang.label} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="text-left">
                                <span className="block text-sm text-textLight font-medium mb-0.5">{lang.greeting}</span>
                                <span className="block text-lg font-bold text-textMain">{lang.label}</span>
                            </div>
                        </div>
                        <div className="text-gray-300 group-hover:text-primary transition-colors">
                            <ChevronRight size={24} />
                        </div>
                    </button>
                ))}
            </div>
            
            <p className="text-center text-xs text-textLight mt-8 font-medium">
                You can change this later in settings.
            </p>
        </div>
    </div>
  );
};