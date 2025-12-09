import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Simulation, QuestionStyle, Flashcard, MindMap, StudyPlan } from "../types";

// CORREÇÃO CRÍTICA: Uso do VITE_GEMINI_API_KEY para ambiente Vite/Vercel
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
const ai = new GoogleGenAI({ apiKey: apiKey });

const AI_MODEL = "gemini-2.5-flash"; 

const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const cleanMermaid = (text: string) => {
    return text.replace(/```mermaid/g, '').replace(/```/g, '').trim();
}

export const analyzeBankProfile = async (text: string): Promise<AnalysisResult> => {
  if (!apiKey) throw new Error("API Key VITE_GEMINI_API_KEY required");

  const model = "gemini-2.5-flash"; 

  const prompt = `
    Atue como um Arquiteto de Dados de Concursos. Analise o texto:
    "${text.substring(0, 50000)}"

    Gere um JSON estrito com esta estrutura:
    {
      "profile": {
        "name": "Nome da Banca",
        "styleDescription": "Resumo executivo do estilo",
        "literalityRate": 0-100,
        "jurisprudenceRate": 0-100,
        "trickeryRate": 0-100,
        "difficultyLevel": 0-100,
        "keywords": ["tag1", "tag2"]
      },
      "topicsStats": [
        {
          "name": "Tema",
          "relevance": 0-100,
          "probability": "Alta/Média/Baixa",
          "frequency": 0-100,
          "trend": "Crescente/Estável/Decrescente",
          "probabilityNextExam": 0-100,
          "importanceLevel": "Alta"
        }
      ],
      "heatmap": [
        {
          "topic": "Tema",
          "frequency": "Alta",
          "probability": 85,
          "color": "#ef4444",
          "lastAppearance": "2023",
          "trend": "Crescente"
        }
      ],
      "topThemes": [], // top 5 from topicsStats
      "abandonedThemes": ["tema1"],
      "recommendations": [{"focusArea": "X", "action": "Y", "priority": 1}],
      "predictionReport": "Texto detalhado sobre o que esperar.",
      "topics": [] // simplified list for compatibility
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });

  if (!response.text) throw new Error("No response");
  
  const data = JSON.parse(cleanJson(response.text));
  data.topics = data.topicsStats.map((t: any) => ({ name: t.name, relevance: t.relevance, probability: t.probability }));
  return data;
};

export const generateSimulation = async (
  profileName: string, 
  topics: string[], 
  style: QuestionStyle, 
  questionCount: number = 5
): Promise<Simulation> => {
    if (!apiKey) throw new Error("API Key VITE_GEMINI_API_KEY required");
    const model = "gemini-2.5-flash"; 
    const prompt = `
        Crie um simulado de ${questionCount} questões. Banca: ${profileName} Tópicos: ${topics.join(", ")} Estilo: ${style}
        JSON: { "title": "Simulado IA", "questions": [ { "id": 1, "statement": "...", "options": ["A", "B", "C", "D", "E"], "correctIndex": 0, "explanation": "...", "topic": "...", "level": 3 } ] }
    `;

    const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: 'application/json' } });

    if (!response.text) throw new Error("No response");
    const data = JSON.parse(cleanJson(response.text));
    
    return { ...data, id: Date.now().toString(), createdAt: new Date().toISOString(), style };
};

export const generateFlashcards = async (topics: string[], count: number = 10): Promise<Flashcard[]> => {
    if (!apiKey) throw new Error("API Key VITE_GEMINI_API_KEY required");
    const model = "gemini-2.5-flash";
    const prompt = `
        Crie ${count} flashcards avançados sobre: ${topics.join(", ")}. Foco em conceitos difíceis, prazos e exceções.
        JSON: [ { "id": "uuid", "front": "Pergunta", "back": "Resposta", "topic": "Tema" } ]
    `;

    const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: 'application/json' } });

    if (!response.text) throw new Error("Error");
    const rawCards = JSON.parse(cleanJson(response.text));
    
    return rawCards.map((c: any, i: number) => ({
        ...c, id: Date.now() + i + '', status: 'new', nextReview: new Date().toISOString(), interval: 0, easeFactor: 2.5, repetitions: 0
    }));
};

export const generateMindMap = async (topic: string): Promise<MindMap> => {
    if (!apiKey) throw new Error("API Key VITE_GEMINI_API_KEY required");
    const model = "gemini-2.5-flash";
    const prompt = `Crie um diagrama Mermaid.js (graph LR ou TD) sobre: ${topic}. RETORNE APENAS O CÓDIGO MERMAID.`;

    const response = await ai.models.generateContent({ model, contents: prompt });

    if (!response.text) throw new Error("Error");
    
    return {
        id: Date.now().toString(),
        title: topic,
        mermaidContent: cleanMermaid(response.text),
        createdAt: new Date().toISOString()
    };
};

export const generateStudyPlan = async (profile: string, weaknesses: string[]): Promise<StudyPlan> => {
    if (!apiKey) throw new Error("API Key VITE_GEMINI_API_KEY required");
    const model = "gemini-2.5-flash";
    const prompt = `
        Crie um plano de estudo de 7 dias para a banca ${profile}. Foco: ${weaknesses.join(", ")}.
        JSON: { "goal": "Objetivo", "weeklySchedule": [ { "day": "Dia 1", "focus": "Tema", "description": "Detalhes", "durationMinutes": 90 } ] }
    `;

    const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: 'application/json' } });

    if (!response.text) throw new Error("Error");
    return { ...JSON.parse(cleanJson(response.text)), id: Date.now().toString() };
};
