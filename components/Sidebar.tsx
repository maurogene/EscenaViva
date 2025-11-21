import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, Theater, User, X, Sparkles, Crown, CreditCard } from 'lucide-react';
import { AppContext } from '../App';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const { plan } = useContext(AppContext);

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label, extraClass }: { to: string, icon: any, label: string, extraClass?: string }) => {
    const active = isActive(to);
    return (
      <Link 
        to={to} 
        onClick={() => setIsOpen(false)}
        className={`flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-300 mb-1 ${
          active 
            ? 'bg-primary/10 text-primary font-bold' 
            : 'text-textLight hover:text-textMain hover:bg-gray-100 font-medium'
        } ${extraClass || ''}`}
      >
        <Icon size={22} strokeWidth={active ? 2.5 : 2} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`w-72 bg-white flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 shadow-card ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 overflow-y-auto no-scrollbar`}
      >
        <div className="p-8 flex items-center justify-between">
          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="bg-accent p-2 rounded-xl text-white transform rotate-3">
                <Sparkles size={20} fill="currentColor" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-textMain tracking-tight">Escena<span className="text-primary">Viva</span></h1>
            </div>
          </Link>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-textLight hover:text-textMain bg-gray-100 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-6 mt-4">
          <NavItem to="/" icon={LayoutDashboard} label="Progreso" />
          <NavItem to="/scripts" icon={FileText} label="Mis Guiones" />
          <NavItem to="/profile" icon={User} label="Perfil" />
          
          <div className="pt-4 mt-4 border-t border-gray-50">
            <NavItem 
                to="/subscription" 
                icon={plan === 'pro' ? Crown : CreditCard} 
                label={plan === 'pro' ? 'Plan Pro Activo' : 'Mejorar Plan'}
                extraClass={plan === 'pro' ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' : ''}
            />
            <NavItem to="/settings" icon={Settings} label="Ajustes" />
          </div>
        </nav>

        <div className="p-6 space-y-6">
          {/* Continue Reading Card */}
          <div className="bg-gradient-to-br from-blueSoft to-blue-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Theater size={80} />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">Siguiente Ensayo</p>
              <p className="text-lg font-bold mb-3">Hamlet - Acto III</p>
              <div className="bg-white/20 rounded-full h-2 w-full mb-2">
                  <div className="bg-white h-full rounded-full w-3/4"></div>
              </div>
              <p className="text-xs font-medium opacity-90">75% Completado</p>
          </div>
        </div>
      </aside>
    </>
  );
};