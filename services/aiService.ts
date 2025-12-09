import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Simulation, QuestionStyle, Flashcard, MindMap, StudyPlan } from "../types";

// CORREÇÃO CRÍTICA: Uso do VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
const ai = new GoogleGenAI({ apiKey: apiKey });

const AI_MODEL = "gemini-2.5-flash"; 

const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const cleanMermaid = (text: string) => {
    return text.replace(/```mermaid/g, '').replace(/```/g, '').trim();
}

// 1. ANALYZE BANK PROFILE (Chamado por App.tsx)
export const analyzeBankProfile = async (text: string): Promise<AnalysisResult> => {
  if (!apiKey) throw new Error("API Key VITE_GEMINI_API_KEY required");

  const model = "gemini-2.5-flash"; 
  const prompt = `Atue como um Arquiteto de Dados de Concursos. Analise o texto: "${text.substring(0, 50000)}"... [Resto do prompt original]`;

  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: 'application/json' } });

  if (!response.text) throw new Error("No response");
  const data = JSON.parse(cleanJson(response.text));
  data.topics = data.topicsStats.map((t: any) => ({ name: t.name, relevance: t.relevance, probability: t.probability }));
  return data;
};

// 2. SIMULATION (Chamado por SimulationMode.tsx)
export const generateSimulation = async (profileName: string, topics: string[], style: QuestionStyle, questionCount: number = 5): Promise<Simulation> => {
    if (!apiKey) throw new Error("API Key VITE_GEMINI_API_KEY required");
    const model = "gemini-2.5-flash"; 
    const prompt = `Crie um simulado de ${questionCount} questões. Banca: ${profileName} Tópicos: ${topics.join(", ")} Estilo: ${style} [Resto do prompt original]`;

    const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: 'application/json' } });

    if (!response.text) throw new Error("No response");
    const data = JSON.parse(cleanJson(response.text));
    
    return { ...data, id: Date.now().toString(), createdAt: new Date().toISOString(), style };
};

// 3. FLASHCARDS (Chamado por FlashcardsView.tsx)
export const generateFlashcards = async (topics: string[], count: number = 10): Promise<Flashcard[]> => {
    if (!apiKey) throw new Error("API Key VITE_GEMINI_API_KEY required");
    const model = "gemini-2.5-flash";
    const prompt = `Crie ${count} flashcards avançados sobre: ${topics.join(", ")}. Foco em conceitos difíceis, prazos e exceções. [Resto do prompt original]`;

    const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: 'application/json' } });

    if (!response.text) throw new Error("Error");
    const rawCards = JSON.parse(cleanJson(response.text));
    
    return rawCards.map((c: any, i: number) => ({
        ...c, id: Date.now() + i + '', status: 'new', nextReview: new Date().toISOString(), interval: 0, easeFactor: 2.5, repetitions: 0
    }));
};

// 4. MIND MAP (Chamado por MindMapView.tsx)
export const generateMindMap = async (topic: string): Promise<MindMap> => {
    if (!apiKey) throw new Error("API Key VITE_GEMINI_API_KEY required");
    const model = "gemini-2.5-flash";
    const prompt = `Crie um diagrama Mermaid.js (graph LR ou TD) sobre: ${topic}. RETORNE APENAS O CÓDIGO MERMAID. [Resto do prompt original]`;

    const response = await ai.models.generateContent({ model, contents: prompt });

    if (!response.text) throw new Error("Error");
    
    return {
        id: Date.now().toString(),
        title: topic,
        mermaidContent: cleanMermaid(response.text),
        createdAt: new Date().toISOString()
    };
};

// 5. STUDY PLAN (Chamado por StudyPlanner.tsx)
export const generateStudyPlan = async (profile: string, weaknesses: string[]): Promise<StudyPlan> => {
    if (!apiKey) throw new Error("API Key VITE_GEMINI_API_KEY required");
    const model = "gemini-2.5-flash";
    const prompt = `Crie um plano de estudo de 7 dias para a banca ${profile}. Foco: ${weaknesses.join(", ")}. JSON: {...} [Resto do prompt original]`;

    const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: 'application/json' } });

    if (!response.text) throw new Error("Error");
    return { ...JSON.parse(cleanJson(response.text)), id: Date.now().toString() };
};
