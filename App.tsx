import React, { useState, useEffect } from 'react';
import { AnalysisResult, ViewMode, User } from './types';
import { analyzeBankProfile } from './services/aiService';
import Sidebar from './components/Sidebar';
import UploadSection from './components/UploadSection';
import Dashboard from './components/Dashboard';
import AnalysisReport from './components/AnalysisReport';
import SimulationMode from './components/SimulationMode';
import LoginScreen from './components/LoginScreen';
import FlashcardsView from './components/FlashcardsView';
import MindMapView from './components/MindMapView';
import StudyPlanner from './components/StudyPlanner';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // App State
  const [view, setView] = useState<ViewMode>('upload');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setView('upload');
    setAnalysisResult(null);
  };

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // Call the new AI Service with the robust prompt
      const data = await analyzeBankProfile(text);
      setAnalysisResult(data);
      setView('dashboard');
    } catch (error: any) {
      console.error(error);
      setErrorMsg("Ocorreu um erro ao analisar o texto. A IA pode estar sobrecarregada ou o texto é insuficiente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex font-sans transition-colors duration-300">
      
      <Sidebar 
        currentView={view} 
        onChangeView={setView} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        hasAnalysis={!!analysisResult}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 md:ml-64 min-h-screen flex flex-col relative`}>
        
        {/* Top Bar for Mobile & Theme Toggle */}
        <div className="h-16 flex items-center justify-end px-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
           <button 
             onClick={() => setIsDarkMode(!isDarkMode)}
             className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
           >
             {isDarkMode ? '☀️' : '🌙'}
           </button>
        </div>

        <div className="p-4 md:p-8 flex-1 overflow-x-hidden">
          
          {errorMsg && (
            <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm flex justify-between items-center animate-fade-in">
              <p>{errorMsg}</p>
              <button onClick={() => setErrorMsg('')} className="font-bold">✕</button>
            </div>
          )}

          {view === 'upload' && (
            <UploadSection onAnalyze={handleAnalyze} isLoading={isLoading} />
          )}

          {view === 'dashboard' && analysisResult && (
            <Dashboard data={analysisResult} />
          )}

          {view === 'analysis' && analysisResult && (
             <AnalysisReport data={analysisResult} />
          )}

          {view === 'flashcards' && analysisResult && (
             <FlashcardsView analysisData={analysisResult} />
          )}

          {view === 'mindmap' && analysisResult && (
             <MindMapView analysisData={analysisResult} />
          )}

          {view === 'study_plan' && analysisResult && (
             <StudyPlanner analysisData={analysisResult} />
          )}

          {view.startsWith('simulation') && analysisResult && (
            <SimulationMode analysisData={analysisResult} />
          )}
          
        </div>
        
        {/* Footer */}
        <footer className="py-6 text-center text-slate-400 text-xs border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <p>© 2024 FocoConcurso AI. Sua aprovação acelerada.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;