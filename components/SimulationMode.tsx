import React, { useState, useEffect } from 'react';
import { Simulation, Question, QuestionStyle, AnalysisResult } from '../types';
import { generateSimulation } from '../services/aiService';
import { Play, Clock, CheckCircle, XCircle, ChevronRight, Award, Zap, BrainCircuit } from 'lucide-react';

interface SimulationModeProps {
  analysisData: AnalysisResult;
}

const SimulationMode: React.FC<SimulationModeProps> = ({ analysisData }) => {
  // Setup State
  const [step, setStep] = useState<'setup' | 'active' | 'results'>('setup');
  const [selectedStyle, setSelectedStyle] = useState<QuestionStyle>('BancaReal');
  const [questionCount, setQuestionCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  // Quiz State
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // qId -> selectedIndex
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: number;
    if (step === 'active') {
      interval = window.setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const topics = analysisData.topThemes.slice(0, 3).map(t => t.name);
      const sim = await generateSimulation(analysisData.profile.name, topics, selectedStyle, questionCount);
      setSimulation(sim);
      setStep('active');
      setTimer(0);
      setAnswers({});
      setShowExplanation({});
      setCurrentIndex(0);
    } catch (e) {
      alert("Erro ao gerar simulado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (optionIdx: number) => {
    if (!simulation) return;
    if (answers[simulation.questions[currentIndex].id] !== undefined) return;
    
    setAnswers(prev => ({ ...prev, [simulation.questions[currentIndex].id]: optionIdx }));
    setShowExplanation(prev => ({ ...prev, [simulation.questions[currentIndex].id]: true }));
  };

  const calculateScore = () => {
    if (!simulation) return 0;
    let correct = 0;
    simulation.questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    return Math.round((correct / simulation.questions.length) * 100);
  };

  // 1. Setup Screen
  if (step === 'setup') {
    return (
      <div className="max-w-3xl mx-auto py-8 animate-fade-in">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-8 text-center text-white">
            <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold">Configurar Simulado Inteligente</h2>
            <p className="opacity-90 mt-2">Personalize o treino baseado no perfil {analysisData.profile.name}</p>
          </div>

          <div className="p-8 space-y-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Estilo das Questões</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setSelectedStyle('QConcursos')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${selectedStyle === 'QConcursos' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}
                >
                  <div className="font-bold text-slate-800 dark:text-white">Estilo QConcursos</div>
                  <div className="text-xs text-slate-500 mt-1">Direto e objetivo</div>
                </button>
                <button 
                  onClick={() => setSelectedStyle('TecConcursos')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${selectedStyle === 'TecConcursos' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}
                >
                  <div className="font-bold text-slate-800 dark:text-white">Estilo TecConcursos</div>
                  <div className="text-xs text-slate-500 mt-1">Comentado e classificado</div>
                </button>
                <button 
                  onClick={() => setSelectedStyle('BancaReal')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${selectedStyle === 'BancaReal' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}
                >
                  <div className="font-bold text-slate-800 dark:text-white">Estilo {analysisData.profile.name}</div>
                  <div className="text-xs text-slate-500 mt-1">Imitação fiel da banca</div>
                </button>
              </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Quantidade de Questões</label>
               <div className="flex gap-4">
                 {[5, 10, 15].map(num => (
                   <button 
                    key={num}
                    onClick={() => setQuestionCount(num)}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${questionCount === num ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                   >
                     {num}
                   </button>
                 ))}
               </div>
            </div>

            <button
              onClick={handleStart}
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>Criando Questões Inéditas...</>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Iniciar Simulado
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Results Screen
  if (step === 'results') {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-fade-in text-center">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700">
          <Award className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Simulado Finalizado!</h2>
          <p className="text-slate-500">Tempo total: {formatTime(timer)}</p>
          
          <div className="my-8">
            <span className="text-6xl font-black text-indigo-600">{calculateScore()}%</span>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Aproveitamento</p>
          </div>

          <button 
            onClick={() => setStep('setup')}
            className="px-8 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:scale-105 transition-transform"
          >
            Novo Simulado
          </button>
        </div>
      </div>
    );
  }

  // 3. Active Quiz Screen
  if (!simulation) return null;
  const question = simulation.questions[currentIndex];
  const isAnswered = answers[question.id] !== undefined;
  
  return (
    <div className="max-w-4xl mx-auto py-6 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex justify-between items-center mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-500">Q{currentIndex + 1}/{simulation.questions.length}</span>
          <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300" 
              style={{ width: `${((currentIndex + 1) / simulation.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg">
          <Clock className="w-4 h-4" />
          {formatTime(timer)}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
             <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded uppercase tracking-wider">
               {question.topic}
             </span>
             {question.level && (
               <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                 Nível {question.level}
               </span>
             )}
          </div>
          <p className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {question.statement}
          </p>
        </div>

        <div className="p-8 space-y-3 bg-slate-50/50 dark:bg-slate-800/50">
          {question.options.map((opt, idx) => {
            const isSelected = answers[question.id] === idx;
            const isCorrect = idx === question.correctIndex;
            
            let style = "border-slate-200 dark:border-slate-600 hover:border-indigo-400 hover:bg-white dark:hover:bg-slate-700";
            
            if (isAnswered) {
              if (isCorrect) style = "border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500";
              else if (isSelected) style = "border-red-400 bg-red-50 dark:bg-red-900/20 opacity-80";
              else style = "border-slate-200 opacity-50";
            } else if (isSelected) {
              style = "border-indigo-500 bg-indigo-50";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex gap-4 items-start ${style}`}
              >
                <span className={`font-bold shrink-0 ${isAnswered && isCorrect ? 'text-green-600' : 'text-slate-400'}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                {isAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-green-500 ml-auto shrink-0" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation Footer */}
        {isAnswered && (
          <div className="p-8 bg-indigo-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Comentário do Professor
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
              {question.explanation}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (currentIndex < simulation.questions.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                  } else {
                    setStep('results');
                  }
                }}
                className="bg-slate-900 dark:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
              >
                {currentIndex < simulation.questions.length - 1 ? 'Próxima' : 'Ver Resultado'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationMode;