
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

let ai: GoogleGenAI | null = null;

const TEXT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'imagen-3.0-generate-002';

export const initializeAi = (apiKey: string) => {
    if (!apiKey) {
        console.error("Initialization failed: API key is empty.");
        return;
    }
    ai = new GoogleGenAI({ apiKey });
};

export const isApiConfigured = (): boolean => {
    return ai !== null;
};

const ensureApiInitialized = () => {
    if (!isApiConfigured()) {
        const errorMsg = "API not initialized. Please set the API key first.";
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
    return ai!;
}

export const generateText = async (systemPrompt: string): Promise<string | null> => {
    try {
        const generativeAi = ensureApiInitialized();
        const response: GenerateContentResponse = await generativeAi.models.generateContent({
            model: TEXT_MODEL,
            contents: systemPrompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return null;
    }
};

export const generateTextWithImage = async (promptText: string, base64Image: string, mimeType: string): Promise<string | null> => {
    try {
        const generativeAi = ensureApiInitialized();
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Image,
            },
        };
        const textPart = { text: promptText };

        const response: GenerateContentResponse = await generativeAi.models.generateContent({
            model: TEXT_MODEL,
            contents: { parts: [textPart, imagePart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini Vision API:", error);
        return null;
    }
};


export interface ImageGenerationResult {
    images: string[];
    filteredCount: number;
}

export const generateImages = async (prompt: string, count: number): Promise<ImageGenerationResult> => {
    try {
        const generativeAi = ensureApiInitialized();
        const response = await generativeAi.models.generateImages({
            model: IMAGE_MODEL,
            prompt: prompt,
            config: {
              numberOfImages: count,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });
        
        const successfulImages: string[] = [];
        let filteredCount = 0;

        if (response.generatedImages) {
            for (const img of response.generatedImages) {
                if (img.image?.imageBytes) {
                    successfulImages.push(img.image.imageBytes);
                } else {
                    filteredCount++;
                }
            }
        }
        
        if (successfulImages.length === 0 && filteredCount > 0) {
            throw new Error('PROMPT_BLOCKED');
        }

        return { images: successfulImages, filteredCount: filteredCount };

    } catch (error: any) {
        console.error("Error calling Imagen API:", error);
        
        if (error.message === 'PROMPT_BLOCKED') {
            throw error;
        }

        if (error.toString().includes('429') || error.toString().includes('resource has been exhausted')) {
             throw new Error('QUOTA_EXCEEDED');
        }

        throw new Error('API_ERROR');
    }
};