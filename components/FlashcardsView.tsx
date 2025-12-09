import React, { useState, useEffect } from 'react';
import { AnalysisResult, Flashcard } from '../types';
import { generateFlashcards } from '../services/aiService';
import { RefreshCw, RotateCw, Layers, Brain, Check, Clock, TrendingUp } from 'lucide-react';
import { addDays, format, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FlashcardsViewProps {
  analysisData: AnalysisResult;
}

const FlashcardsView: React.FC<FlashcardsViewProps> = ({ analysisData }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'review' | 'learn'>('learn');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Load from local storage or generate
  useEffect(() => {
    const saved = localStorage.getItem('foco_flashcards');
    if (saved) {
      setCards(JSON.parse(saved));
    } else {
      fetchCards();
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem('foco_flashcards', JSON.stringify(cards));
    }
  }, [cards]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const topTopics = analysisData.topThemes.map(t => t.name).slice(0, 3);
      const generated = await generateFlashcards(topTopics, 10);
      setCards(prev => [...prev, ...generated]); // Append new cards
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar flashcards.");
    } finally {
      setLoading(false);
    }
  };

  const getDueCards = () => {
    const now = new Date();
    return cards.filter(c => c.status !== 'new' && isBefore(parseISO(c.nextReview), now));
  };

  const getNewCards = () => {
    return cards.filter(c => c.status === 'new');
  };

  const activeDeck = activeTab === 'review' ? getDueCards() : getNewCards();
  const currentCard = activeDeck[currentCardIndex];

  const handleRate = (rating: 'easy' | 'good' | 'hard') => {
    if (!currentCard) return;

    let newInterval = 1;
    let newEase = currentCard.easeFactor;
    let newRepetitions = currentCard.repetitions;

    // Simplified SuperMemo-2 Algorithm
    if (rating === 'hard') {
      newRepetitions = 0;
      newInterval = 1;
      newEase = Math.max(1.3, newEase - 0.2);
    } else if (rating === 'good') {
      newRepetitions += 1;
      if (newRepetitions === 1) newInterval = 1;
      else if (newRepetitions === 2) newInterval = 6;
      else newInterval = Math.round(currentCard.interval * newEase);
    } else if (rating === 'easy') {
      newRepetitions += 1;
      if (newRepetitions === 1) newInterval = 4;
      else if (newRepetitions === 2) newInterval = 10;
      else newInterval = Math.round(currentCard.interval * newEase * 1.3);
      newEase += 0.15;
    }

    const updatedCard: Flashcard = {
      ...currentCard,
      status: 'review',
      repetitions: newRepetitions,
      easeFactor: newEase,
      interval: newInterval,
      nextReview: addDays(new Date(), newInterval).toISOString()
    };

    setCards(prev => prev.map(c => c.id === currentCard.id ? updatedCard : c));
    setIsFlipped(false);

    if (currentCardIndex < activeDeck.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="mt-6 text-slate-500 font-medium">A IA está criando seus cards...</p>
        </div>
     );
  }

  // Dashboard View
  if (!currentCard && !sessionCompleted) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
             <Layers className="w-7 h-7 text-indigo-600" />
             Estudo Espaçado (SRS)
           </h2>
           <button onClick={fetchCards} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
             <RefreshCw className="w-4 h-4" /> Gerar Mais
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Review Stats */}
          <div 
            onClick={() => { setActiveTab('review'); setSessionCompleted(false); setCurrentCardIndex(0); }}
            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer hover:scale-[1.02] ${activeTab === 'review' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white">Revisões Pendentes</h3>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">{getDueCards().length}</p>
            <p className="text-sm text-slate-500">Cards para revisar hoje</p>
          </div>

          {/* New Stats */}
          <div 
             onClick={() => { setActiveTab('learn'); setSessionCompleted(false); setCurrentCardIndex(0); }}
             className={`p-6 rounded-2xl border-2 transition-all cursor-pointer hover:scale-[1.02] ${activeTab === 'learn' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white">Novos Conceitos</h3>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">{getNewCards().length}</p>
            <p className="text-sm text-slate-500">Cards nunca vistos</p>
          </div>
        </div>

        {cards.length === 0 && (
           <div className="mt-8 text-center p-8 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300">
             <p className="text-slate-500">Nenhum card disponível. Gere cards com a IA.</p>
             <button onClick={fetchCards} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
               Criar Deck Inicial
             </button>
           </div>
        )}
      </div>
    )
  }

  if (sessionCompleted) {
    return (
      <div className="max-w-md mx-auto py-12 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Sessão Concluída!</h2>
        <p className="text-slate-500 mt-2">Você completou todos os cards desta fila.</p>
        <button 
          onClick={() => { setSessionCompleted(false); setCurrentCardIndex(0); setActiveTab(prev => prev === 'learn' ? 'review' : 'learn'); }}
          className="mt-8 px-8 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          Trocar Modo
        </button>
      </div>
    )
  }

  // Card View
  return (
    <div className="max-w-2xl mx-auto py-6 px-4 animate-fade-in flex flex-col h-[calc(100vh-100px)]">
      
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentCardIndex(-1)} className="text-sm text-slate-400 hover:text-indigo-500 font-medium">
          ← Voltar
        </button>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
           {activeTab === 'learn' ? 'Aprendendo' : 'Revisando'} {currentCardIndex + 1} / {activeDeck.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col">
        <div 
          className="relative flex-1 perspective-1000 cursor-pointer group mb-8"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`
              w-full h-full relative preserve-3d transition-all duration-500 
              ${isFlipped ? 'rotate-y-180' : ''}
          `}>
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                    {currentCard.topic}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{currentCard.front}</h3>
                  <div className="absolute bottom-6 text-slate-400 flex flex-col items-center gap-2">
                      <span className="text-xs font-medium">Toque para ver a resposta</span>
                      <RotateCw className="w-4 h-4" /> 
                  </div>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 dark:bg-indigo-900 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center text-center text-white border-2 border-slate-700">
                  <h3 className="text-xl font-medium leading-relaxed">{currentCard.back}</h3>
              </div>
          </div>
        </div>

        {isFlipped && (
          <div className="grid grid-cols-3 gap-4 h-24 animate-slide-in">
            <button 
                onClick={(e) => { e.stopPropagation(); handleRate('hard'); }}
                className="flex flex-col items-center justify-center bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors group"
            >
                <span className="text-red-600 font-bold text-lg">Difícil</span>
                <span className="text-xs text-red-400 group-hover:text-red-500">1 dia</span>
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); handleRate('good'); }}
                className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors group"
            >
                <span className="text-blue-600 font-bold text-lg">Bom</span>
                <span className="text-xs text-blue-400 group-hover:text-blue-500">3 dias</span>
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); handleRate('easy'); }}
                className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors group"
            >
                <span className="text-green-600 font-bold text-lg">Fácil</span>
                <span className="text-xs text-green-400 group-hover:text-green-500">5 dias</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashcardsView;
