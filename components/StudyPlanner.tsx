import React, { useState, useEffect } from 'react';
import { AnalysisResult, StudyPlan } from '../types';
import { generateStudyPlan } from '../services/aiService';
import { CalendarClock, CheckSquare, Clock } from 'lucide-react';

interface StudyPlannerProps {
  analysisData: AnalysisResult;
}

const StudyPlanner: React.FC<StudyPlannerProps> = ({ analysisData }) => {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const createPlan = async () => {
        setLoading(true);
        try {
            const weaknesses = analysisData.topicsStats
                .filter(t => t.importanceLevel === 'Alta' || t.importanceLevel === 'Muito Alta')
                .slice(0, 5)
                .map(t => t.name);
            
            const generated = await generateStudyPlan(analysisData.profile.name, weaknesses);
            setPlan(generated);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    if (!plan) createPlan();
  }, [analysisData]);

  if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium">IA montando seu cronograma personalizado...</p>
        </div>
      );
  }

  if (!plan) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <CalendarClock className="w-7 h-7 text-blue-600" />
                Cronograma de Alta Performance
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
                Meta da semana: <span className="text-blue-600 font-semibold">{plan.goal}</span>
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.weeklySchedule.map((task, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{task.day}</span>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                            <Clock className="w-3 h-3" /> {task.durationMinutes} min
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{task.focus}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{task.description}</p>
                    
                    <button className="mt-4 w-full py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 group">
                        <CheckSquare className="w-4 h-4 group-hover:text-green-500" /> Marcar como concluído
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default StudyPlanner;