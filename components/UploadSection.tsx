import React, { useState, useCallback } from 'react';
import { Upload, FileText, Search, AlertCircle, Sparkles, FileType } from 'lucide-react';
import { extractTextFromPDF } from '../services/pdfService';

interface UploadSectionProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const processFile = async (file: File) => {
    if (file.type === 'application/pdf') {
      setIsReadingPdf(true);
      setPdfProgress(0);
      try {
        const extracted = await extractTextFromPDF(file, (progress) => setPdfProgress(progress));
        setText(extracted);
      } catch (e: any) {
        alert(e.message);
      } finally {
        setIsReadingPdf(false);
      }
    } else {
      alert("Por favor, envie apenas arquivos PDF.");
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in pb-10">
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
          FocoConcurso AI
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Sua aprovação acelerada por inteligência artificial.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[650px]">
        
        {/* Toolbar */}
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
          <div className="flex gap-3">
             <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">
                <FileType className="w-4 h-4 text-blue-500" />
                Upload Prova/Edital
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileInput} />
             </label>
          </div>
          <div className="text-xs font-mono text-slate-400">
            {text.length} caracteres
          </div>
        </div>

        {/* Drop Zone / Text Area */}
        <div 
          className={`flex-1 relative transition-colors ${isDragOver ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-slate-50/50 dark:bg-slate-900/50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isReadingPdf ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <div className="w-64 bg-slate-200 rounded-full h-2 mb-4 overflow-hidden">
                <div className="bg-blue-600 h-2 transition-all duration-300" style={{ width: `${pdfProgress}%` }}></div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">Lendo PDF... {pdfProgress}%</p>
            </div>
          ) : (
            <textarea
              className="w-full h-full p-8 bg-transparent resize-none outline-none text-slate-700 dark:text-slate-300 font-mono text-sm leading-relaxed"
              placeholder="Arraste seu PDF aqui ou cole o texto..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
          )}

          {!text && !isReadingPdf && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 p-6">
              <div className={`p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 transition-transform ${isDragOver ? 'scale-110 bg-blue-100 dark:bg-blue-900' : ''}`}>
                <Upload className={`w-10 h-10 ${isDragOver ? 'text-blue-600' : 'text-slate-400'}`} />
              </div>
              <p className="text-lg font-bold text-slate-600 dark:text-slate-400">Arraste e solte seus PDFs</p>
              <p className="text-sm opacity-60 mt-1">Extraímos o texto automaticamente</p>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-5 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-100 dark:border-amber-900/50">
             <AlertCircle className="w-3 h-3" />
             Quanto mais conteúdo (múltiplos PDFs), maior a precisão da IA.
          </div>
          
          <button
            onClick={() => onAnalyze(text)}
            disabled={isLoading || !text || text.length < 50}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all
              ${isLoading || !text || text.length < 50
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30 hover:scale-105 active:scale-95'}
            `}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processando Inteligência...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Gerar Análise Completa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;