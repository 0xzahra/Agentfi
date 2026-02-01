import { GoogleGenAI, Modality, Type, FunctionDeclaration } from "@google/genai";
import { ImageSize } from "../types";

const apiKey = process.env.API_KEY || ''; // Injected by environment

// Helper to get a fresh client
const getAI = () => new GoogleGenAI({ apiKey });

// 1. Thinking Brain (Gemini 3 Pro) - For complex queries
export const generateThinkingResponse = async (prompt: string, personalityContext: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: personalityContext,
        thinkingConfig: { thinkingBudget: 32768 }, // Max thinking
      },
    });
    return response.text;
  } catch (error) {
    console.error("Thinking Brain Error:", error);
    return "NEURAL LINK FAILURE. RETRYING...";
  }
};

// 2. Fast Response (Gemini 2.5 Flash Lite) - For quick UI interactions
export const generateFastResponse = async (prompt: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: {
        maxOutputTokens: 100, // Keep it short
      }
    });
    return response.text;
  } catch (error) {
    console.error("Fast Response Error:", error);
    return "ACK.";
  }
};

// 3. Search Grounding (Gemini 3 Flash + Search Tool)
export const generateSearchResponse = async (query: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return {
        text: response.text,
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Search Error:", error);
    throw error;
  }
};

// 4. Maps Grounding (Gemini 2.5 Flash + Maps Tool)
export const generateMapsResponse = async (query: string, userLocation?: { lat: number, lng: number }) => {
  const ai = getAI();
  try {
    const config: any = {
      tools: [{ googleMaps: {} }],
    };
    
    if (userLocation) {
        config.toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: userLocation.lat,
                    longitude: userLocation.lng
                }
            }
        }
    }

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest", // 2.5 Flash alias
      contents: query,
      config: config
    });
    
    return {
        text: response.text,
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Maps Error:", error);
    throw error;
  }
};

// 5. Image Generation (Gemini 3 Pro Image)
export const generateImage = async (prompt: string, size: ImageSize) => {
  const ai = getAI();
  try {
    // Note: Use generateContent for nano banana models as per instructions
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

// 6. Image Editing (Gemini 2.5 Flash Image)
export const editImage = async (base64Image: string, prompt: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png", 
              data: base64Image
            }
          },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    // If no image returned, maybe text explanation?
    return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
};

// 7. TTS (Gemini 2.5 Flash TTS)
export const speakText = async (text: string) => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return;

        // Decode and play (simplified browser implementation)
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);

    } catch (error) {
        console.error("TTS Error:", error);
    }
}
