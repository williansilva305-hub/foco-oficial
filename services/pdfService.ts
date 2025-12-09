import * as pdfjsLib from 'pdfjs-dist';

// Configuração para o ambiente do Vercel/Vite, usando o CDN público e correto do pdfjs.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const extractTextFromPDF = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `\n--- Página ${i} ---\n${pageText}`;
      
      if (onProgress) {
        onProgress(Math.round((i / numPages) * 100));
      }
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Falha ao ler o arquivo PDF. Verifique se o arquivo não está corrompido.');
  }
};
