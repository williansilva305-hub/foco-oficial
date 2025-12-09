import React, { useState, useEffect } from 'react';
import { AnalysisResult, ViewMode, User } from './types';
import { analyzeBankProfile } from './services/aiService'; // <-- CORREÇÃO CRÍTICA AQUI!
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
      // Chamando a função corrigida
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
