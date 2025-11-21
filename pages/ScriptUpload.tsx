import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, Loader2, CheckCircle, Sparkles, ArrowRight, Scissors, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { parseScriptWithGemini } from '../services/geminiService';
import { AppContext } from '../App';

const ROMEO_JULIET_DEMO = `INT. JARDÍN DE LOS CAPULETO - NOCHE

ROMEO
(Saltando la tapia del jardín)
¿Puedo seguir adelante cuando mi corazón está aquí?
¡Vuelve, torpe tierra, y busca tu centro!

(Julieta aparece arriba, en una ventana)

ROMEO
¡Se ríe de las cicatrices quien nunca ha sentido una herida!
¡Pero, alto! ¿Qué luz se abre paso a través de aquella ventana?
¡Es el oriente, y Julieta es el sol!
¡Surge, espléndido sol, y mata a la envidiosa luna,
que está pálida y enferma de dolor
porque tú, su sirvienta, eres mucho más hermosa que ella!

JULIETA
¡Ay de mí!

ROMEO
Ha hablado. Habla otra vez, ángel resplandeciente.
Pues gloriosa te alzas en esta noche, sobre mi cabeza,
como un alado mensajero del cielo.

JULIETA
¡Oh, Romeo, Romeo! ¿Por qué eres tú Romeo?
Niega a tu padre y rechaza tu nombre;
o, si no quieres, júrame tan sólo que me amas,
y dejaré yo de ser una Capuleto.

ROMEO
(Aparte)
¿Debo escuchar más, o debo responderle a esto?

JULIETA
Sólo tu nombre es mi enemigo.
Tú eres tú mismo, aunque no seas un Montesco.
¡Oh, sé algún otro nombre! ¿Qué hay en un nombre?
Lo que llamamos rosa exhalaría el mismo grato perfume
con cualquier otro nombre.`;

export const ScriptUpload = () => {
  const navigate = useNavigate();
  const { addScript, setSelectedCharacter, scripts, plan, setPlan } = useContext(AppContext);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState(ROMEO_JULIET_DEMO);

  const maxScripts = plan === 'free' ? 1 : 10;
  const canUpload = scripts.length < maxScripts;

  const handleProcess = async (text: string) => {
    if (!canUpload) return;

    setIsProcessing(true);
    try {
        const parsedScript = await parseScriptWithGemini(text);
        addScript(parsedScript);
        setSelectedCharacter(null); // Reset character selection for the new script
        navigate(`/rehearsal/${parsedScript.id}`);
    } catch (e) {
        alert("Error procesando el guion. Intenta de nuevo.");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center justify-center bg-yellowSoft/20 text-yellow-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} className="mr-2" /> Nuevo Proyecto
        </div>
        <h2 className="text-4xl font-extrabold text-textMain tracking-tight">¿Qué vamos a ensayar hoy?</h2>
        <p className="text-textLight text-lg max-w-xl mx-auto">Prepara tu voz. Sube tu libreto o pega el texto para comenzar el análisis con IA.</p>
      </div>

      {!canUpload && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full text-red-500 mb-3">
                  <Lock size={24} />
              </div>
              <h3 className="text-lg font-bold text-red-800 mb-1">Límite de Guiones Alcanzado</h3>
              <p className="text-red-600 text-sm mb-4">Tu plan {plan === 'free' ? 'Gratis' : 'Full'} solo permite {maxScripts} guion(es). Actualiza tu plan para subir más.</p>
              <Button variant="accent" onClick={() => setPlan('pro')}>
                  Actualizar a Pro (10 Guiones)
              </Button>
          </div>
      )}

      <div className={`grid md:grid-cols-2 gap-8 ${!canUpload ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        {/* Upload Card */}
        <div 
            className={`bg-white rounded-[2rem] p-8 shadow-card border-2 transition-all duration-300 flex flex-col items-center text-center justify-center min-h-[300px] ${isDragging ? 'border-primary bg-primary/5' : 'border-transparent hover:border-primary/30'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                alert("Funcionalidad de archivo simulada.");
            }}
        >
            <div className="bg-blueSoft/10 p-6 rounded-full mb-6 text-blueSoft">
                <UploadCloud size={48} />
            </div>
            <h3 className="text-xl font-bold text-textMain mb-2">Subir Archivo</h3>
            <p className="text-textLight text-sm mb-6">Arrastra tu PDF, DOCX o TXT aquí</p>
            <Button variant="outline" size="sm">Buscar en dispositivo</Button>
        </div>

        {/* Paste Text Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-card flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                        <FileText size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-textMain">Texto Directo</h3>
                </div>
                <span className="text-xs font-bold bg-gray-100 text-textLight px-3 py-1 rounded-full">Recomendado</span>
            </div>
            
            <div className="relative flex-1 mb-6">
                <textarea 
                    className="w-full h-64 bg-cream border-2 border-cardBorder rounded-2xl p-5 text-textMain focus:border-primary focus:ring-0 outline-none resize-none font-medium text-sm leading-relaxed"
                    placeholder="Pega aquí tu escena..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <div className="absolute bottom-4 right-4">
                    <button onClick={() => setInputText(ROMEO_JULIET_DEMO)} className="bg-white shadow-sm border border-gray-100 text-xs font-bold text-textMain px-3 py-1.5 rounded-lg flex items-center hover:bg-gray-50">
                        <Scissors size={12} className="mr-1.5"/> Reset Demo
                    </button>
                </div>
            </div>

            <Button 
                onClick={() => handleProcess(inputText)} 
                disabled={!inputText || isProcessing || !canUpload}
                fullWidth
                variant="primary"
                icon={isProcessing ? <Loader2 className="animate-spin"/> : <ArrowRight />}
            >
                {isProcessing ? 'Analizando Escena...' : 'Comenzar Ensayo'}
            </Button>
        </div>
      </div>
    </div>
  );
};