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
    localStorage.setItem('foco_
