import React, { useContext } from 'react';
import { AppContext } from '../App';
import { Check, Crown, Star, Zap, Shield } from 'lucide-react';

export const Subscription = () => {
  const { plan, setPlan } = useContext(AppContext);

  return (
    <div className="pb-20 animate-[fadeIn_0.5s_ease-out]">
      <div className="text-center mb-12 space-y-4">
          <span className="inline-block bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full text-sm tracking-wider uppercase">Planes de Estudio</span>
          <h2 className="text-4xl font-extrabold text-textMain">Elige tu nivel de compromiso</h2>
          <p className="text-textLight text-lg max-w-2xl mx-auto">Desde actores principiantes hasta profesionales. Desbloquea todo tu potencial con EscenaViva Pro.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all relative ${plan === 'free' ? 'border-gray-200 shadow-lg' : 'border-transparent shadow-card opacity-80 hover:opacity-100'}`}>
              <div className="mb-6">
                  <h3 className="text-2xl font-bold text-textMain mb-2">Actor Novel</h3>
                  <div className="flex items-baseline">
                      <span className="text-4xl font-extrabold text-textMain">Gratis</span>
                  </div>
                  <p className="text-textLight mt-2">Para ensayos casuales y estudiantes.</p>
              </div>

              <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-textMain font-medium">
                      <div className="bg-gray-100 p-1 rounded-full mr-3"><Check size={14} /></div>
                      1 Guion activo
                  </li>
                  <li className="flex items-center text-textMain font-medium">
                      <div className="bg-gray-100 p-1 rounded-full mr-3"><Check size={14} /></div>
                      Análisis de texto básico
                  </li>
                  <li className="flex items-center text-textMain font-medium">
                      <div className="bg-gray-100 p-1 rounded-full mr-3"><Check size={14} /></div>
                      Modo Ensayo Fluido
                  </li>
              </ul>

              <button 
                onClick={() => setPlan('free')}
                disabled={plan === 'free'}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                    plan === 'free' 
                    ? 'bg-gray-100 text-textLight cursor-default' 
                    : 'bg-white border-2 border-gray-200 text-textMain hover:border-primary hover:text-primary'
                }`}
              >
                  {plan === 'free' ? 'Plan Actual' : 'Seleccionar Gratis'}
              </button>
          </div>

          {/* Pro Plan */}
          <div className={`bg-textMain p-8 rounded-[2.5rem] relative overflow-hidden border-2 border-transparent transform transition-all ${plan === 'pro' ? 'scale-105 shadow-2xl ring-4 ring-primary/20' : 'hover:scale-105 shadow-xl'}`}>
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-2 rounded-bl-2xl">RECOMENDADO</div>
              
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10">
                  <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-2">
                          <Crown className="text-yellow-400 fill-current" size={24}/>
                          <h3 className="text-2xl font-bold text-white">Estrella Pro</h3>
                      </div>
                      <div className="flex items-baseline text-white">
                          <span className="text-4xl font-extrabold">$9.99</span>
                          <span className="text-white/60 ml-2">/mes</span>
                      </div>
                      <p className="text-gray-400 mt-2">Para actores serios y directores.</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                      <li className="flex items-center text-white font-medium">
                          <div className="bg-primary p-1 rounded-full mr-3 text-white"><Check size={14} /></div>
                          <span className="flex-1">10 Guiones activos</span>
                      </li>
                      <li className="flex items-center text-white font-medium">
                          <div className="bg-primary p-1 rounded-full mr-3 text-white"><Check size={14} /></div>
                          <span className="flex-1">Análisis de voz avanzado (Gemini AI)</span>
                      </li>
                      <li className="flex items-center text-white font-medium">
                          <div className="bg-primary p-1 rounded-full mr-3 text-white"><Check size={14} /></div>
                          <span className="flex-1">Configuración de voces personalizadas</span>
                      </li>
                      <li className="flex items-center text-white font-medium">
                          <div className="bg-primary p-1 rounded-full mr-3 text-white"><Check size={14} /></div>
                          <span className="flex-1">Feedback de Director en tiempo real</span>
                      </li>
                  </ul>

                  <button 
                    onClick={() => setPlan('pro')}
                    disabled={plan === 'pro'}
                    className={`w-full py-4 rounded-xl font-bold transition-all ${
                        plan === 'pro' 
                        ? 'bg-green-900/30 text-green-400 border border-green-800 cursor-default' 
                        : 'bg-primary text-white hover:bg-white hover:text-primary shadow-glow-primary'
                    }`}
                  >
                      {plan === 'pro' ? 'Plan Activo' : 'Mejorar a Pro'}
                  </button>
              </div>
          </div>
      </div>

      {/* Trust Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-soft">
              <Shield className="text-blueSoft mb-3" size={32} />
              <h4 className="font-bold text-textMain">Pago Seguro</h4>
              <p className="text-xs text-textLight mt-1">Procesado por Stripe con encriptación SSL.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-soft">
              <Zap className="text-accent mb-3" size={32} />
              <h4 className="font-bold text-textMain">Cancelación Flexible</h4>
              <p className="text-xs text-textLight mt-1">Cancela cuando quieras, sin preguntas.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-3xl shadow-soft">
              <Star className="text-yellowSoft mb-3" size={32} />
              <h4 className="font-bold text-textMain">Soporte Prioritario</h4>
              <p className="text-xs text-textLight mt-1">Acceso directo a coaches de actuación.</p>
          </div>
      </div>
    </div>
  );
};