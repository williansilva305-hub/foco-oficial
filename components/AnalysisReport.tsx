import React from 'react';
import { AnalysisResult } from '../types';
import { FileText, Lightbulb, Info } from 'lucide-react';

interface AnalysisReportProps {
  data: AnalysisResult;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
            <Lightbulb className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Relatório de Inteligência Preditiva</h2>
        </div>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed text-base">
            {data.predictionReport}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            Metodologia da Banca
          </h3>
          <ul className="space-y-3">
             <li className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-700 pb-2">
               <span className="text-slate-600 dark:text-slate-400">Estilo das Questões</span>
               <span className="font-medium text-slate-800 dark:text-slate-200 text-right w-1/2">{data.profile.styleDescription.split('.')[0]}...</span>
             </li>
             <li className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-700 pb-2">
               <span className="text-slate-600 dark:text-slate-400">Dificuldade Média</span>
               <span className="font-medium text-slate-800 dark:text-slate-200">{data.profile.difficultyLevel}/100</span>
             </li>
             <li className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-700 pb-2">
               <span className="text-slate-600 dark:text-slate-400">Foco em Lei Seca</span>
               <span className="font-medium text-slate-800 dark:text-slate-200">{data.profile.literalityRate}%</span>
             </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
           <h3 className="font-bold text-slate-800 dark:text-white mb-4">Recomendação de Estudo</h3>
           <div className="space-y-4">
             {data.topicsStats.slice(0, 3).map((topic, i) => (
               <div key={i} className="flex items-start gap-3">
                 <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold w-6 h-6 rounded flex items-center justify-center text-xs shrink-0">
                   {i + 1}
                 </div>
                 <div>
                   <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{topic.name}</h4>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Prioridade {topic.importanceLevel} • Tendência {topic.trend}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

    </div>
  );
};

export default AnalysisReport;