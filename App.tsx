import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import UploadSection from './components/UploadSection';
import AnalysisReport from './components/AnalysisReport';
import StudyPlanner from './components/StudyPlanner';
import FlashcardsView from './components/FlashcardsView';
import MindMapView from './components/MindMapView';
import SimulationMode from './components/SimulationMode';
import LoginScreen from './components/LoginScreen';
import { ViewMode, User, AnalysisResult } from './types';
import { extractTextFromPDF } from './services/pdfService';
import { analyzeEdital } from './services/aiService';

// Fallback user for demo
const DEMO_USER: User = {
  id: 'demo-123',
  name: 'Concurseiro Focado',
  email: 'usuario@exemplo.com',
  avatarUrl: ''
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAnalysis = localStorage.getItem('lastAnalysis');
    const savedUser = localStorage.getItem('foco_user');
    
    if (savedAnalysis) {
      try {
        setAnalysisData(JSON.parse(savedAnalysis));
      } catch (e) {
        console.error("Erro ao carregar análise salva", e);
      }
    }
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Erro ao carregar usuário", e);
      }
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('foco_user', JSON.stringify(u)); 
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('foco_user');
    setAnalysisData(null);
    localStorage.removeItem('lastAnalysis');
    setCurrentView('dashboard');
  };

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    setUploadProgress(10);
    
    try {
      // 1. Extract Text
      setUploadProgress(30);
      const text = await extractTextFromPDF(file, (p) => setUploadProgress(30 + (p * 0.2)));
      
      // 2. Analyze with AI
      setUploadProgress(60);
      // Note: In a real app, we would send 'text' to the AI. 
      // For this demo, we might use a mock or the real key if configured.
      const result = await analyzeEdital(text);
      
      setAnalysisData(result);
      localStorage.setItem('lastAnalysis', JSON.stringify(result));
      setUploadProgress(100);
      setCurrentView('dashboard');
      
    } catch (error) {
      console.error(error);
      alert("Erro na análise. Verifique sua chave API ou o arquivo.");
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Sidebar 
        currentView={currentView}
        onChangeView={setCurrentView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        hasAnalysis={!!analysisData}
        user={user}
        onLogout={handleLogout}
      />

      <main className={`
        flex-1 transition-all duration-300 ease-in-out p-4 md:p-8
        ${isSidebarOpen ? 'md:ml-72' : 'ml-0'}
      `}>
        <div className="max-w-7xl mx-auto pt-12 md:pt-0">
          
          {currentView === 'dashboard' && (
            <Dashboard 
              data={analysisData} 
              onNewAnalysis={() => setCurrentView('upload')}
              userName={user.name}
            />
          )}

          {currentView === 'upload' && (
            <UploadSection 
              onUpload={handleFileUpload} 
              isAnalyzing={isAnalyzing}
              progress={uploadProgress}
            />
          )}

          {currentView === 'analysis' && analysisData && (
            <AnalysisReport data={analysisData} />
          )}

          {currentView === 'study_plan' && analysisData && (
            <StudyPlanner subjects={analysisData.subjects} />
          )}

          {currentView === 'flashcards' && analysisData && (
            <FlashcardsView subjects={analysisData.subjects} />
          )}

          {currentView === 'mindmap' && analysisData && (
            <MindMapView subjects={analysisData.subjects} />
          )}

          {currentView.startsWith('simulation') && analysisData && (
            <SimulationMode subjects={analysisData.subjects} />
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
