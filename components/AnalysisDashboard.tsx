import React from 'react';
import { AnalysisResult } from '../types';
import { 
  BarChart, 
  Bar, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { AlertTriangle, BookOpen, Target, TrendingUp, Zap, Thermometer } from 'lucide-react';

interface AnalysisDashboardProps {
  data: AnalysisResult;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data }) => {
  const sortedTopics = [...data.topics].sort((a, b) => b.relevance - a.relevance);
  const topTopics = sortedTopics.slice(0, 7);

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* 1. Header & Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                Perfil da Banca: {data.profile.name}
              </h2>
              <p className="text-slate-500 mt-1">{data.profile.styleDescription}</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <span className={`px-4 py-2 rounded-lg text-sm font-bold border ${
                data.profile.difficultyLevel.includes('Difícil') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                Nível: {data.profile.difficultyLevel}
              </span>
              <span className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Pegadinhas: {data.profile.trickeryLevel}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 self-center">Palavras-chave:</span>
            {data.profile.keywords.map((kw, i) => (
              <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Probability Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Top Assuntos Recorrentes
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTopics} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={140} 
                  tick={{fontSize: 11, fill: '#475569', fontWeight: 500}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'}}
                />
                <Bar dataKey="relevance" radius={[0, 4, 4, 0]} barSize={24}>
                  {topTopics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.probability === 'Alta' ? '#3b82f6' : 
                      entry.probability === 'Média' ? '#8b5cf6' : '#94a3b8'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Priority Recommendations */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Foco Imediato (Pareto)
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
             {data.recommendations.sort((a,b) => a.priority - b.priority).map((rec, idx) => (
               <div key={idx} className="p-3 bg-red-50/50 border-l-4 border-red-400 rounded-r-md">
                 <div className="flex justify-between items-start mb-1">
                   <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">{rec.focusArea}</h4>
                   <span className="bg-white text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200">
                     #{rec.priority}
                   </span>
                 </div>
                 <p className="text-xs text-slate-600 leading-snug">{rec.action}</p>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* 4. Heatmap Grid */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-orange-500" />
          Mapa de Calor de Tópicos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.heatmap.map((item, idx) => (
            <div key={idx} className="border border-slate-100 rounded-lg p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold text-slate-700 leading-tight">{item.topic}</span>
                  {item.frequency === 'Muito Alta' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
               </div>
               <div className="flex items-center gap-2 mt-auto pt-2">
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                   item.frequency === 'Muito Alta' ? 'bg-red-100 text-red-700' :
                   item.frequency === 'Alta' ? 'bg-orange-100 text-orange-700' :
                   item.frequency === 'Média' ? 'bg-yellow-100 text-yellow-700' :
                   'bg-slate-100 text-slate-600'
                 }`}>
                   {item.frequency}
                 </span>
                 <span className={`text-[10px] flex items-center gap-1 ${
                   item.trend === 'Crescente' ? 'text-green-600' : 
                   item.trend === 'Decrescente' ? 'text-red-500' : 'text-slate-400'
                 }`}>
                   {item.trend === 'Crescente' ? '↑' : item.trend === 'Decrescente' ? '↓' : '•'} {item.trend}
                 </span>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Prediction Text */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-xl shadow-lg text-white">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-200">
          <TrendingUp className="w-5 h-5" />
          Previsão de Inteligência: Próxima Prova
        </h3>
        <div className="prose prose-invert prose-sm max-w-none text-indigo-100/90 leading-relaxed">
           <div className="whitespace-pre-wrap">{data.predictionReport}</div>
        </div>
      </div>

    </div>
  );
};

export default AnalysisDashboard;