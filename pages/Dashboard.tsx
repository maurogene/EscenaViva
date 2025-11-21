import React from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Calendar, Clock, Zap, Droplets, Activity } from 'lucide-react';

const data = [
  { name: 'L', value: 45 },
  { name: 'M', value: 30 },
  { name: 'X', value: 60 },
  { name: 'J', value: 90 },
  { name: 'V', value: 45 },
  { name: 'S', value: 120 },
  { name: 'D', value: 20 },
];

const StatCard = ({ icon: Icon, label, value, colorClass, subLabel }: any) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-card flex flex-col justify-between h-full relative overflow-hidden group transition-all hover:-translate-y-1">
        <div className={`absolute top-0 right-0 p-8 opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3 ${colorClass.replace('text-', 'bg-')} w-32 h-32`}></div>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-4 rounded-2xl ${colorClass.replace('text-', 'bg-').replace('500', '50')} ${colorClass}`}>
                <Icon size={28} strokeWidth={2.5} />
            </div>
            <div className="flex items-center bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs font-bold">
                <TrendingUp size={12} className="mr-1" /> +12%
            </div>
        </div>
        <div>
            <h3 className="text-4xl font-extrabold text-textMain mb-1 tracking-tight">{value}</h3>
            <p className="text-textLight font-medium">{label}</p>
            {subLabel && <p className="text-xs text-primary font-bold mt-2 uppercase tracking-wide">{subLabel}</p>}
        </div>
    </div>
);

export const Dashboard = () => {
  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-extrabold text-textMain">Hola, Julián 👋</h2>
            <p className="text-textLight font-medium mt-1">Tu racha de ensayos es imparable.</p>
        </div>
        <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100 hidden md:block">
             <div className="flex items-center px-4 py-2 bg-cream rounded-full">
                <Clock size={16} className="text-accent mr-2" />
                <span className="text-sm font-bold text-textMain">14:02 min hoy</span>
             </div>
        </div>
      </header>

      {/* Hero Card - Inspired by "Estado del Cuerpo" */}
      <div className="bg-textMain rounded-[2.5rem] p-8 text-white shadow-card relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
         <div className="z-10 max-w-md space-y-4">
            <div className="inline-flex items-center bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                <Activity size={14} className="mr-2 text-primary" /> 
                <span className="text-xs font-bold">Nivel de Interpretación: Experto</span>
            </div>
            <h3 className="text-3xl font-bold leading-tight">Tu rango emocional ha mejorado un 24% esta semana.</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Tu control sobre la intensidad y el tono en escenas dramáticas está alcanzando niveles profesionales. Sigue así.</p>
         </div>
         
         {/* Abstract Visual */}
         <div className="relative w-40 h-40 md:w-48 md:h-48 mt-6 md:mt-0 flex-shrink-0">
            <div className="absolute inset-0 border-[12px] border-white/10 rounded-full"></div>
            <div className="absolute inset-0 border-[12px] border-primary rounded-full border-l-transparent rotate-45"></div>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                 <Zap size={32} className="text-accent mb-1 fill-current" />
                 <span className="text-2xl font-bold">850</span>
                 <span className="text-[10px] uppercase tracking-widest opacity-60">XP Total</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            icon={Clock} 
            label="Horas Ensayadas" 
            value="12.5h" 
            colorClass="text-blueSoft" 
        />
        <StatCard 
            icon={Zap} 
            label="Energía Promedio" 
            value="Alta" 
            colorClass="text-accent" 
            subLabel="Intensidad Sostenida"
        />
        <StatCard 
            icon={Droplets} 
            label="Fluidez Verbal" 
            value="98%" 
            colorClass="text-primary" 
        />
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-card">
        <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-textMain">Actividad Semanal</h3>
            <select className="bg-gray-50 border-none text-xs font-bold text-textLight rounded-lg px-3 py-2 outline-none">
                <option>Últimos 7 días</option>
                <option>Este Mes</option>
            </select>
        </div>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} 
                        dy={10}
                    />
                    <Tooltip 
                        cursor={{fill: '#FFFBF5'}}
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)'}}
                    />
                    <Bar 
                        dataKey="value" 
                        fill="#FF7E55" 
                        radius={[20, 20, 20, 20]} 
                        barSize={16}
                        background={{ fill: '#F9FAFB', radius: 20 }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};