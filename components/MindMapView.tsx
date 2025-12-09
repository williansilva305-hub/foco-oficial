import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { AnalysisResult, MindMap } from '../types';
import { generateMindMap } from '../services/aiService';
import { Network, ZoomIn, ZoomOut, Download, Sparkles } from 'lucide-react';

interface MindMapViewProps {
  analysisData: AnalysisResult;
}

const MindMapView: React.FC<MindMapViewProps> = ({ analysisData }) => {
  const [topic, setTopic] = useState('');
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ 
        startOnLoad: true, 
        theme: 'base',
        themeVariables: {
            primaryColor: '#e0e7ff',
            primaryTextColor: '#1e293b',
            primaryBorderColor: '#6366f1',
            lineColor: '#94a3b8',
            secondaryColor: '#f1f5f9',
            tertiaryColor: '#ffffff'
        }
    });
  }, []);

  useEffect(() => {
    if (mindMap && containerRef.current) {
        containerRef.current.innerHTML = '';
        const id = `mermaid-${Date.now()}`;
        const div = document.createElement('div');
        div.id = id;
        div.className = 'mermaid';
        div.textContent = mindMap.mermaidContent;
        containerRef.current.appendChild(div);
        
        mermaid.run({
            nodes: [div]
        }).catch(err => console.error(err));
    }
  }, [mindMap]);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
        const result = await generateMindMap(topic);
        setMindMap(result);
    } catch (e) {
        alert("Erro ao gerar mapa mental");
    } finally {
        setLoading(false);
    }
  };

  const suggestions = analysisData.topThemes.slice(0, 4).map(t => t.name);

  return (
    <div className="max-w-6xl mx-auto py-6 animate-fade-in px-4">
        
        {/* Input Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Network className="w-6 h-6 text-indigo-600" />
                Mapas Mentais Neurais
            </h2>
            
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Digite um tema complexo (ex: Controle de Constitucionalidade)" 
                        className="w-full pl-4 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                    />
                </div>
                <button 
                    onClick={handleGenerate}
                    disabled={loading || !topic}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           Criando...
                        </>
                    ) : (
                        <>
                           <Sparkles className="w-4 h-4" />
                           Gerar Mapa
                        </>
                    )}
                </button>
            </div>
            
            <div className="flex gap-2 flex-wrap items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Sugestões da Banca:</span>
                {suggestions.map(s => (
                    <button 
                        key={s} 
                        onClick={() => setTopic(s)}
                        className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300 transition-colors border border-transparent hover:border-indigo-200"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>

        {/* Canvas */}
        {mindMap ? (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in">
                 <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Network className="w-4 h-4 text-indigo-500" />
                        {mindMap.title}
                    </h3>
                    <div className="text-xs text-slate-400">Gerado por IA</div>
                 </div>
                 <div className="p-10 overflow-x-auto flex justify-center bg-white min-h-[500px]" ref={containerRef}>
                    {/* Mermaid renders here */}
                 </div>
            </div>
        ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 h-64 flex flex-col items-center justify-center text-slate-400">
                <Network className="w-12 h-12 mb-4 opacity-20" />
                <p>Seu mapa mental aparecerá aqui</p>
            </div>
        )}
    </div>
  );
};

export default MindMapView;
