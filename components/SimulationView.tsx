import React, { useState } from 'react';
import { AnalysisResult, Simulation, Question } from '../types';
import { generateSimulation } from '../services/geminiService';
import { Play, CheckCircle, XCircle, ChevronRight, RefreshCw, Award } from 'lucide-react';

interface SimulationViewProps {
  analysisData: AnalysisResult;
}

const SimulationView: React.FC<SimulationViewProps> = ({ analysisData }) => {
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setFinished(false);
    setSelectedOptions({});
    setShowExplanation({});
    setCurrentQuestionIndex(0);
    try {
      const topTopics = analysisData.topics
        .filter(t => t.probability === 'Alta' || t.relevance > 70)
        .slice(0, 3)
        .map(t => t.name);
      
      const simData = await generateSimulation(analysisData.profile.name, topTopics);
      setSimulation(simData);
    } catch (e) {
      alert("Erro ao gerar simulado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId: number, optionIdx: number) => {
    if (showExplanation[qId]) return; // Locked
    setSelectedOptions(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleConfirmAnswer = (qId: number) => {
    setShowExplanation(prev => ({ ...prev, [qId]: true }));
  };

  const nextQuestion = () => {
    if (!simulation) return;
    if (currentQuestionIndex < simulation.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const calculateScore = () => {
    if (!simulation) return 0;
    let correct = 0;
    simulation.questions.forEach(q => {
      if (selectedOptions[q.id] === q.correctIndex) correct++;
    });
    return Math.round((correct / simulation.questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] animate-fade-in">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 className="mt-6 text-xl font-bold text-slate-800">Criando Simulado Personalizado...</h3>
        <p className="text-slate-500 mt-2">A IA está elaborando questões baseadas no perfil da banca {analysisData.profile.name}.</p>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play className="w-8 h-8 text-blue-600 ml-1" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Simulado de Alta Precisão</h2>
          <p className="text-slate-600 mb-8">
            Com base na análise da banca <strong>{analysisData.profile.name}</strong>, a IA criará questões focadas nos tópicos com maior probabilidade de cair ({analysisData.heatmap.slice(0, 3).map(h => h.topic).join(", ")}...).
          </p>
          <button 
            onClick={handleGenerate}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all transform hover:scale-105"
          >
            Gerar Simulado Agora
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const score = calculateScore();
    return (
      <div className="max-w-2xl mx-auto py-12 animate-fade-in">
         <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
            <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Simulado Finalizado!</h2>
            <div className="text-5xl font-extrabold text-blue-600 my-6">{score}%</div>
            <p className="text-slate-600 mb-8">
              Você acertou {Object.keys(selectedOptions).filter(k => selectedOptions[Number(k)] === simulation.questions.find(q => q.id === Number(k))?.correctIndex).length} de {simulation.questions.length} questões.
            </p>
            <button 
              onClick={handleGenerate}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Gerar Novo Simulado
            </button>
         </div>
      </div>
    );
  }

  const currentQ = simulation.questions[currentQuestionIndex];
  const isAnswered = showExplanation[currentQ.id];

  return (
    <div className="max-w-3xl mx-auto py-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">{simulation.title}</h2>
        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Questão {currentQuestionIndex + 1} de {simulation.questions.length}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        {/* Question Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider mb-3 inline-block">
            {currentQ.topic}
          </span>
          <p className="text-lg text-slate-800 font-medium leading-relaxed">
            {currentQ.statement}
          </p>
        </div>

        {/* Options */}
        <div className="p-6 space-y-3">
          {currentQ.options.map((opt, idx) => {
            let itemClass = "border-slate-200 hover:border-blue-300 hover:bg-slate-50";
            if (selectedOptions[currentQ.id] === idx) itemClass = "border-blue-500 bg-blue-50 ring-1 ring-blue-500";
            
            if (isAnswered) {
              if (idx === currentQ.correctIndex) itemClass = "border-green-500 bg-green-50 ring-1 ring-green-500";
              else if (selectedOptions[currentQ.id] === idx) itemClass = "border-red-300 bg-red-50";
              else itemClass = "border-slate-100 opacity-50";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(currentQ.id, idx)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-lg border transition-all flex gap-3 ${itemClass}`}
              >
                <span className="font-bold text-slate-400 shrink-0">{String.fromCharCode(65 + idx)}</span>
                <span className="text-slate-700">{opt}</span>
                {isAnswered && idx === currentQ.correctIndex && <CheckCircle className="w-5 h-5 text-green-600 ml-auto shrink-0" />}
                {isAnswered && selectedOptions[currentQ.id] === idx && idx !== currentQ.correctIndex && <XCircle className="w-5 h-5 text-red-500 ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Footer / Explanation */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col gap-4">
          {!isAnswered ? (
            <button
              onClick={() => handleConfirmAnswer(currentQ.id)}
              disabled={selectedOptions[currentQ.id] === undefined}
              className="self-end px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Responder
            </button>
          ) : (
            <div className="animate-fade-in">
              <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
                <h4 className="font-bold text-slate-800 mb-1">Comentário do Professor (IA):</h4>
                <p className="text-slate-600 text-sm">{currentQ.explanation}</p>
              </div>
              <button
                onClick={nextQuestion}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
              >
                {currentQuestionIndex < simulation.questions.length - 1 ? 'Próxima Questão' : 'Finalizar Simulado'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationView;