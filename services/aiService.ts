import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Simulation, QuestionStyle, Flashcard, MindMap, StudyPlan } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: apiKey });

// Limpeza de JSON
const cleanJson = (text: string) => text.replace(/```json/g, '').replace(/```/g, '').trim();
const cleanMermaid = (text: string) => text.replace(/```mermaid/g, '').replace(/```/g, '').trim();

export const analyzeBankProfile = async (text: string): Promise<AnalysisResult> => {
  if (!apiKey) console.warn("API Key faltando");
  const model = "gemini-2.0-flash"; 

  const prompt = `
    Analise este texto de concurso: "${text.substring(0, 50000)}"
    Retorne JSON estrito:
    {
      "profile": {
        "name": "Banca", "styleDescription": "Estilo", "literalityRate": 0, "jurisprudenceRate": 0, "trickeryRate": 0, "difficultyLevel": 0, "keywords": []
      },
      "topicsStats": [{ "name": "T", "relevance": 0, "probability": "Alta", "frequency": 0, "trend": "Estável", "probabilityNextExam": 0, "importanceLevel": "Alta" }],
      "heatmap": [{ "topic": "T", "frequency": "Alta", "probability": 0, "color": "#f00", "lastAppearance": "2024", "trend": "Crescente" }],
      "topThemes": [], "abandonedThemes": [], "recommendations": [], "predictionReport": "Previsão", "topics": []
    }
  `;

  try {
    const res = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: 'application/json' } });
    const data = JSON.parse(cleanJson(res.text || '{}'));
    data.topics = data.topicsStats ? data.topicsStats.map((t: any) => ({ name: t.name, relevance: t.relevance, probability: t.probability })) : [];
    data.topThemes = data.topicsStats ? data.topicsStats.slice(0, 5) : [];
    return data;
  } catch (e) { console.error(e); throw e; }
};

export const generateSimulation = async (profile: string, topics: string[], style: QuestionStyle, count: number = 5): Promise<Simulation> => {
  const prompt = `Crie simulado ${count} questões (${style}) banca ${profile}, tópicos ${topics}. JSON: {"title": "Simulado", "questions": [{"id": 1, "statement": "...", "options": ["A"], "correctIndex": 0, "explanation": "...", "topic": "..."}]}`;
  const res = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt, config: { responseMimeType: 'application/json' } });
  return { ...JSON.parse(cleanJson(res.text || '{}')), id: Date.now().toString(), createdAt: new Date().toISOString(), style };
};

export const generateFlashcards = async (topics: string[], count: number = 5): Promise<Flashcard[]> => {
  const prompt = `Crie ${count} flashcards sobre ${topics}. JSON Array: [{"front": "P", "back": "R", "topic": "T"}]`;
  const res = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt, config: { responseMimeType: 'application/json' } });
  return JSON.parse(cleanJson(res.text || '[]')).map((c: any, i: number) => ({ ...c, id: ''+i, status: 'new', nextReview: new Date().toISOString() }));
};

export const generateMindMap = async (topic: string): Promise<MindMap> => {
  const prompt = `Diagrama Mermaid graph TD sobre ${topic}. APENAS CÓDIGO.`;
  const res = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt });
  return { id: Date.now().toString(), title: topic, mermaidContent: cleanMermaid(res.text || ''), createdAt: new Date().toISOString() };
};

export const generateStudyPlan = async (profile: string, weaks: string[]): Promise<StudyPlan> => {
  const prompt = `Plano 7 dias banca ${profile}, foco ${weaks}. JSON: {"goal": "...", "weeklySchedule": [{"day": "...", "focus": "...", "description": "...", "durationMinutes": 90}]}`;
  const res = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt, config: { responseMimeType: 'application/json' } });
  return { ...JSON.parse(cleanJson(res.text || '{}')), id: Date.now().toString() };
};
