import React, { useState } from 'react';
import { UploadCloud, FileText, Search, Play } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const sampleText = `
DIREITO CONSTITUCIONAL E ADMINISTRATIVO. 
Questão 1: A respeito dos direitos e garantias fundamentais, assinale a opção correta. Conforme jurisprudência do STF, o direito à vida não é absoluto...
Questão 2: Sobre atos administrativos, a imperatividade é atributo que permite à administração...
Questão 3: Controle de constitucionalidade. Ação Direta de Inconstitucionalidade (ADI). Legitimidade ativa...
Questão 4 (FGV - 2023): João, servidor público, praticou ato de improbidade. A lei 8.429/92 alterada pela lei 14.230/21 exige dolo específico...
Questão 5: Licitações. Nova Lei de Licitações (Lei 14.133/2021). Modalidades. O diálogo competitivo é cabível quando...
`;

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');

  const handleAnalyze = () => {
    if (text.trim().length < 50) {
      alert("Por favor, insira mais texto para uma análise precisa.");
      return;
    }
    onAnalyze(text);
  };

  const loadSample = () => {
    setText(sampleText.trim());
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <h2 className="text-3xl font-bold mb-2">Analisador de Bancas</h2>
          <p className="text-slate-300">
            Cole questões de provas antigas, editais ou resumos. A IA identificará o padrão da banca e o que você deve priorizar.
          </p>
        </div>
        
        <div className="p-8 space-y-6">
          
          <div className="relative">
            <textarea
              className="w-full h-64 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-700 placeholder-slate-400 resize-none font-mono text-sm shadow-inner"
              placeholder="Cole aqui o texto de provas anteriores (Ctrl+V)... Ex: Questões de Direito Constitucional da FGV 2023..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
            <div className="absolute bottom-4 right-4 text-xs text-slate-400 bg-white/80 px-2 py-1 rounded">
              {text.length} caracteres
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={loadSample}
              disabled={isLoading}
              className="text-sm text-slate-500 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Carregar Exemplo (Direito)
            </button>

            <button
              onClick={handleAnalyze}
              disabled={isLoading || !text}
              className={`
                flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white shadow-lg transform transition-all
                ${isLoading || !text 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 hover:shadow-blue-500/30'}
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analisando Padrões...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analisar Agora
                </>
              )}
            </button>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start">
            <div className="bg-blue-100 p-2 rounded-full">
               <UploadCloud className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900">Dica Pro</h4>
              <p className="text-xs text-blue-700 mt-1">
                Para melhores resultados, cole textos de <strong>múltiplas questões</strong> da mesma banca. Quanto mais conteúdo, mais preciso será o reconhecimento de padrões e pegadinhas.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InputSection;