import React from 'react';
import { LayoutDashboard, FileText, BrainCircuit, PenTool, Menu, X, LogOut, User as UserIcon, PieChart, Layers, Network, CalendarClock, ChevronRight } from 'lucide-react';
import { ViewMode, User } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  hasAnalysis: boolean;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen, hasAnalysis, user, onLogout }) => {
  
  const menuGroups = [
    {
      title: "PRINCIPAL",
      items: [
        { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard, disabled: !hasAnalysis },
        { id: 'upload' as ViewMode, label: 'Nova Análise', icon: FileText, disabled: false },
        { id: 'analysis' as ViewMode, label: 'Inteligência', icon: PieChart, disabled: !hasAnalysis },
      ]
    },
    {
      title: "ESTUDO ATIVO",
      items: [
        { id: 'flashcards' as ViewMode, label: 'Flashcards SRS', icon: Layers, disabled: !hasAnalysis },
        { id: 'mindmap' as ViewMode, label: 'Mapas Mentais', icon: Network, disabled: !hasAnalysis },
        { id: 'simulation_setup' as ViewMode, label: 'Simulados', icon: PenTool, disabled: !hasAnalysis },
      ]
    },
    {
      title: "PLANEJAMENTO",
      items: [
        { id: 'study_plan' as ViewMode, label: 'Cronograma', icon: CalendarClock, disabled: !hasAnalysis },
      ]
    }
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md md:hidden border border-slate-200 dark:border-slate-700"
      >
        {isOpen ? <X className="w-6 h-6 text-slate-700 dark:text-white" /> : <Menu className="w-6 h-6 text-slate-700 dark:text-white" />}
      </button>

      <aside className={`
        fixed top-0 left-0 z-40 h-screen bg-slate-900 text-white transition-transform duration-300 ease-in-out w-72 flex flex-col justify-between border-r border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-2xl
      `}>
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight block leading-none">FocoConcurso</span>
              <span className="text-[10px] text-indigo-400 font-medium tracking-wider">AI PLATFORM</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar">
            {menuGroups.map((group, idx) => (
              <div key={idx}>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">{group.title}</h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = currentView === item.id || (item.id === 'simulation_setup' && currentView.startsWith('simulation'));
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (!item.disabled) {
                            onChangeView(item.id);
                            if (window.innerWidth < 768) setIsOpen(false);
                          }
                        }}
                        disabled={item.disabled}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-medium group
                          ${isActive
                            ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
                            : item.disabled 
                              ? 'text-slate-600 cursor-not-allowed opacity-60' 
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          {item.label}
                        </div>
                        {isActive && <ChevronRight className="w-3 h-3 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile */}
        <div
