import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const extractTextFromPDF = async (file: File, onProgress?: (p: number) => void): Promise<string> => {
  try {
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = (await page.getTextContent()).items.map((item: any) => item.str).join(' ');
      fullText += `\n--- Pág ${i} ---\n` + text;
      if (onProgress) onProgress(Math.round((i / pdf.numPages) * 100));
    }
    return fullText;
  } catch (e) { console.error(e); return "Erro ao ler PDF."; }
};
