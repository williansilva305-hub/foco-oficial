import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Subject } from '../types';

// O modelo é hardcoded para Gemini 2.5 Pro por questões de precisão
const AI_MODEL = "gemini-2.5-pro";
const ai = new GoogleGenAI({}); // Assume GEMINI_API_KEY is in environment variables

/**
 * Função para gerar flashcards detalhados.
 * @param subjects As disciplinas para as quais gerar flashcards.
 * @returns Promessa com os flashcards formatados.
 */
export async function generateFlashcards(subjects: Subject[]): Promise<string> {
    const systemInstruction = `
        Você é um criador de flashcards. Sua tarefa é criar 10 flashcards de estudo e revisão para as disciplinas fornecidas.
        Devolva os flashcards em um formato de lista Markdown claro (Pergunta: X, Resposta: Y).
    `;
    
    const subjectsList = subjects.map(s => `- ${s.name}: ${s.topics.length} tópicos`).join('\n');
    
    const prompt = `
        Crie 10 flashcards (pergunta e resposta) para as disciplinas listadas.
        ---
        Disciplinas:
        ${subjectsList}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: AI_MODEL,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Erro na chamada da API Gemini para flashcards:", error);
        return "Erro ao gerar flashcards. Tente novamente mais tarde.";
    }
}


/**
 * Função para gerar um plano de estudos detalhado.
 * @param subjects As disciplinas extraídas do edital.
 * @returns Promessa com o plano de estudos formatado em string.
 */
export async function generateStudyPlan(subjects: Subject[]): Promise<string> {
    const systemInstruction = `
        Você é um planejador de estudos especializado. Sua tarefa é criar um cronograma de estudos realista com base nas disciplinas fornecidas.
        Devolva um plano de estudos detalhado de 6 semanas em formato Markdown.
    `;
    
    const subjectsList = subjects.map(s => `- ${s.name}: ${s.topics.length} tópicos`).join('\n');
    
    const prompt = `
        Crie um plano de estudos de 6 semanas, dividindo o tempo de forma inteligente para cobrir as seguintes disciplinas. 
        Seja realista. Use o formato Markdown.
        ---
        Disciplinas:
        ${subjectsList}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: AI_MODEL,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Erro na chamada da API Gemini para plano de estudos:", error);
        return "Erro ao gerar plano de estudos. Tente novamente mais tarde.";
    }
}


/**
 * Prompt para formatar e analisar o edital (Função original).
 * @param editalText O texto completo do edital.
 * @returns Promessa com o resultado formatado em JSON.
 */
export async function analyzeEdital(editalText: string): Promise<AnalysisResult> {
  const systemInstruction = `
    Você é um assistente de inteligência artificial de análise de concursos públicos, especializado em extrair informações de editais e formatá-las em um objeto JSON estritamente estruturado para um aplicativo de estudo.
    Sua resposta deve ser *apenas* o objeto JSON que corresponde à interface AnalysisResult. Não adicione nenhum texto introdutório, explicações ou notas antes ou depois do JSON.
    O campo 'date' deve ser a data de publicação do edital, formatada em YYYY-MM-DD.
    A 'difficulty' deve ser um número de 1 (Fácil) a 5 (Extremamente difícil).
    As 'subjects' devem conter uma lista detalhada de disciplinas e tópicos de estudo extraídos do edital.
    A 'timeline' deve ser um cronograma extraído com pelo menos 5 eventos importantes.
    A 'summary' deve ser uma visão geral de alto nível.
    A 'requiredKnowledge' deve ser baseada nos requisitos do cargo (nível, experiência, etc.).
    O campo 'pdfDownloadLink' deve ser uma string de URL fictícia se não for encontrado: 'https://exemplo.com/edital_download'.
  `;

  const prompt = `
    Analise o seguinte texto de edital e devolva a análise completa no formato JSON estritamente definido pela interface AnalysisResult. 
    ---
    TEXTO DO EDITAL:
    ${editalText.substring(0, 30000)}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text.trim();
    if (jsonText.startsWith('```') && jsonText.endsWith('```')) {
        // Remove markdown formatting if the AI insists on including it
        const cleanedText = jsonText.substring(jsonText.indexOf('{'), jsonText.lastIndexOf('}') + 1);
        return JSON.parse(cleanedText) as AnalysisResult;
    }

    return JSON.parse(jsonText) as AnalysisResult;

  } catch (error) {
    console.error("Erro na chamada da API Gemini:", error);
    // Retornar um resultado mockado em caso de erro para não quebrar a UI
    return {
      title: "Análise Mockada (Erro API)",
      date: "2025-01-01",
      difficulty: 3,
      summary: "Falha ao conectar na API Gemini. Verifique sua chave de API.",
      timeline: [],
      requiredKnowledge: "Verifique a configuração do seu .env.local.",
      pdfDownloadLink: "https://erro.com",
      subjects: [
        { name: "Erro", topics: ["Não foi possível gerar análise. Verifique o console."] }
      ]
    } as AnalysisResult;
  }
}
