import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Route,
  MapPin,
  Users,
  Bell,
  Camera,
  TrendingDown,
  BarChart3,
  Shield,
  Menu,
  X,
  Map,
  Settings,
  Bot
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'assistant', label: 'Assistant IA', icon: Bot },
  { id: 'map', label: 'Cartographie avancée', icon: Map },
  { id: 'camera-setup', label: 'Installation caméras', icon: Settings },
  { id: 'main-courante', label: 'Main courante', icon: BookOpen },
  { id: 'rondes', label: 'Rondes', icon: Route },
  { id: 'alarmes', label: 'Alarmes', icon: Bell },
  { id: 'cameras', label: 'Vidéosurveillance', icon: Camera },
  { id: 'sites', label: 'Sites', icon: MapPin },
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'demarque', label: 'Démarque inconnue', icon: TrendingDown },
  { id: 'reporting', label: 'Reporting', icon: BarChart3 },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen, onToggle }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden bg-slate-800 text-white p-2 rounded-lg shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">SecureRetail</h1>
              <p className="text-xs text-slate-400">Ops Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Supervision
            </span>
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">
              DS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Direction Sûreté</p>
              <p className="text-xs text-slate-400">Paris / G. Couronne</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
