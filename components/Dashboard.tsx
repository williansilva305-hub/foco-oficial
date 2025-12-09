import React from 'react';
import { AnalysisResult } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, AlertTriangle, Crosshair, Calendar, BookOpen, Clock, Activity } from 'lucide-react';

interface DashboardProps {
  data: AnalysisResult;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      {/* 0. Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-end bg-gradient-to-r from-slate-900 to-indigo-900 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
         <div className="relative z-10">
           <h1 className="text-3xl font-bold mb-2">{greeting}, Estudante.</h1>
           <p className="text-indigo-200 opacity-90 max-w-xl">
             Sua análise da banca <strong className="text-white">{data.profile.name}</strong> está pronta. 
             Focamos em {data.topThemes.length} tópicos prioritários para hoje.
           </p>
         </div>
         <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <Activity className="w-64 h-64 -mb-10 -mr-10" />
         </div>
         <div className="relative z-10 mt-6 md:mt-0 flex gap-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 text-center">
               <div className="text-xs text-indigo-300 uppercase tracking-wider">Meta Diária</div>
               <div className="text-xl font-bold">2h 30m</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 text-center">
               <div className="text-xs text-indigo-300 uppercase tracking-wider">Questões</div>
               <div className="text-xl font-bold">0 / 50</div>
            </div>
         </div>
      </div>

      {/* 1. Header Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Dificuldade</div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{data.profile.difficultyLevel}<span className="text-sm text-slate-400 font-normal">/100</span></div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-3">
            <div className={`h-1.5 rounded-full ${data.profile.difficultyLevel > 70 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${data.profile.difficultyLevel}%` }}></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Lei Seca</div>
          <div className="text-3xl font-bold text-indigo-600 mt-2">{data.profile.literalityRate}%</div>
          <div className="text-xs text-slate-400 mt-1">Cobrança literal</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Jurisprudência</div>
          <div className="text-3xl font-bold text-violet-600 mt-2">{data.profile.jurisprudenceRate}%</div>
          <div className="text-xs text-slate-400 mt-1">Súmulas/STF/STJ</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Pegadinhas</div>
          <div className="text-3xl font-bold text-amber-500 mt-2">{data.profile.trickeryRate}%</div>
          <div className="text-xs text-slate-400 mt-1">Índice de malícia</div>
        </div>
      </div>

      {/* 2. Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Probability Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Probabilidade de Cobrança (Pareto 80/20)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topThemes} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={160} 
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="probabilityNextExam" barSize={24} radius={[0, 4, 4, 0]}>
                  {data.topThemes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.probabilityNextExam > 80 ? '#ef4444' : entry.probabilityNextExam > 50 ? '#f59e0b' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Bank Profile */}
        <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10"></div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
            <Crosshair className="w-5 h-5 text-indigo-300" />
            DNA da Banca
          </h3>
          <p className="text-indigo-100 text-sm mb-6 leading-relaxed relative z-10">
            {data.profile.styleDescription}
          </p>
          
          <div className="space-y-4 relative z-10 mt-auto">
            <div>
              <span className="text-xs text-indigo-300 uppercase font-bold tracking-wider mb-2 block">Palavras-Chave</span>
              <div className="flex flex-wrap gap-2">
                {data.profile.keywords.slice(0, 6).map((kw, i) => (
                  <span key={i} className="text-[11px] bg-indigo-800/50 px-2 py-1 rounded border border-indigo-700/50 text-indigo-100">{kw}</span>
                ))}
              </div>
            </div>
            
            {data.abandonedThemes.length > 0 && (
              <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <span className="text-xs text-red-300 uppercase font-bold tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Evitar (Baixa Incidência)
                </span>
                <p className="text-xs text-red-100 mt-1 opacity-80">{data.abandonedThemes.slice(0, 3).join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Heatmap Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Mapa de Calor: Onde Focar</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {data.heatmap.map((item, idx) => (
            <div 
              key={idx} 
              className="p-3 rounded-lg border flex flex-col justify-between h-24 transition-all hover:scale-105 cursor-default relative overflow-hidden"
              style={{ 
                backgroundColor: `${item.color}08`, 
                borderColor: `${item.color}30`
              }}
            >
              <div className="absolute top-0 right-0 w-8 h-8 rounded-full blur-xl -mr-2 -mt-2 opacity-50" style={{ backgroundColor: item.color }}></div>
              <span className="text-xs font-bold leading-tight line-clamp-2 text-slate-700 dark:text-slate-200 z-10" title={item.topic}>{item.topic}</span>
              <div className="flex justify-between items-end mt-2 z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500">Prob.</span>
                  <span className="text-lg font-bold" style={{ color: item.color }}>{item.probability}%</span>
                </div>
                <span className="text-[10px] bg-white dark:bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-500">
                  {item.lastAppearance}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
