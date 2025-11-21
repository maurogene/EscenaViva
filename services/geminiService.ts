import { GoogleGenAI, Type } from "@google/genai";
import { Script, ScriptLine, AnalysisResult, ActingFeedback, Character } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseScriptWithGemini = async (rawText: string): Promise<Script> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Analyze the following text which is a movie or theatre script. 
    1. Extract the lines with their types.
    2. Identify all characters. For each character, infer their gender based on the name or context ('male', 'female', or 'neutral').
    
    Return a JSON object with:
    - title (infer or 'Untitled')
    - author (if found)
    - characters: Array of objects { name, gender }
    - lines: Array of objects { id, character, text, type, emotion }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        { text: prompt },
        { text: rawText }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            characters: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        gender: { type: Type.STRING, enum: ['male', 'female', 'neutral'] }
                    }
                } 
            },
            lines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  character: { type: Type.STRING },
                  text: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["dialogue", "action", "parenthetical"] },
                  emotion: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    let scriptData: any = {};
    try {
        scriptData = JSON.parse(response.text || "{}");
    } catch (e) {
        console.warn("JSON Parse failed, using empty object");
    }

    // --- ROBUST CHARACTER EXTRACTION LOGIC ---

    // 1. Create a Map to store unique characters found in the script
    // Key: Character Name (uppercase/trimmed), Value: Character Object
    const characterMap = new Map<string, Character>();

    // 2. Helper to standardize names (e.g., "Romeo " -> "ROMEO")
    const normalizeName = (name: string) => name ? name.trim().toUpperCase() : "";
    const displayFormat = (name: string) => name ? name.trim() : "";

    // 3. First, populate from AI's explicit character list (for gender info)
    if (scriptData.characters && Array.isArray(scriptData.characters)) {
        scriptData.characters.forEach((c: any) => {
            if (c.name) {
                const key = normalizeName(c.name);
                characterMap.set(key, {
                    name: displayFormat(c.name),
                    gender: c.gender || 'neutral'
                });
            }
        });
    }

    // 4. Second, iterate ALL lines to ensure no one is missed
    const validLines: any[] = [];
    if (scriptData.lines && Array.isArray(scriptData.lines)) {
         scriptData.lines.forEach((l: any, idx: number) => {
            // Basic validation
            if (!l || typeof l !== 'object' || !l.text) return;

            // Add ID if missing
            l.id = l.id || `line-${idx}-${Date.now()}`;

            // If it's a dialogue line, ensure the character exists
            if (l.character) {
                const key = normalizeName(l.character);
                // If we haven't seen this character yet, add them (default to neutral if AI didn't specify gender earlier)
                if (key.length > 0 && !characterMap.has(key)) {
                    characterMap.set(key, {
                        name: displayFormat(l.character),
                        gender: 'neutral' 
                    });
                }
                
                // Ensure the line uses the consistent display name
                if (characterMap.has(key)) {
                    l.character = characterMap.get(key)?.name;
                }
            }
            validLines.push(l);
         });
    }

    const finalCharacters = Array.from(characterMap.values());

    console.log("Extracted Characters:", finalCharacters); // Debugging

    return {
        id: `script-${Date.now()}`,
        lastPracticed: new Date().toISOString(),
        title: scriptData.title || "Untitled Script",
        author: scriptData.author || "Unknown",
        characters: finalCharacters,
        lines: validLines
    } as Script;

  } catch (error) {
    console.error("Error parsing script with Gemini:", error);
    throw new Error("Failed to parse script.");
  }
};

export const analyzePerformance = async (originalLine: string, spokenText: string): Promise<AnalysisResult> => {
  const model = "gemini-2.5-flash";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `
        Compare the original script line with the actor's spoken text.
        Original: "${originalLine}"
        Spoken: "${spokenText}"
        
        Provide:
        1. Accuracy (0-100 integer).
        2. A concise, constructive feedback tip (max 15 words) like a director would give.
        3. The detected emotional tone of the spoken text.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                accuracy: { type: Type.INTEGER },
                feedback: { type: Type.STRING },
                tone: { type: Type.STRING }
            }
        }
      }
    });

    return JSON.parse(response.text || '{"accuracy": 0, "feedback": "Error analyzing", "tone": "neutral"}');
  } catch (error) {
    console.error("Error analyzing performance:", error);
    return { accuracy: 0, feedback: "Could not analyze audio input.", tone: "unknown" };
  }
};

export const analyzeAudioPerformance = async (originalLine: string, audioBase64: string, language: string = 'es-ES', directorNote?: string): Promise<ActingFeedback> => {
  const model = "gemini-2.5-flash"; // Using Flash for speed with multimodal

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            text: `Act as a world-class Acting Coach. Listen to the audio performance of this line: "${originalLine}".
            The language of the performance is: ${language}.
            
            ${directorNote ? `IMPORTANT: The director explicitly gave this note: "${directorNote}". Evaluate strictly if the actor followed this specific instruction.` : ''}

            Evaluate the performance based on the audio prosody, volume, and clarity.
            
            Return JSON with:
            - accuracy: 0-100 (did they say the words?)
            - energy: 1-10 (1 is low/mumbling, 10 is shouting/high energy)
            - clarity: 1-10 (diction and articulation)
            - tone: The vocal tone (e.g. Sarcastic, Warm, Harsh).
            - emotionDetected: The primary emotion heard in the voice (e.g. Angry, Sad, Hopeful).
            - feedback: A specific, constructive acting note based on the AUDIO (max 20 words). MUST BE IN THE LANGUAGE: ${language}.
            ${directorNote ? `- directorNoteAdherence: 0-10 (how well they followed the specific director note).` : ''}
            ${directorNote ? `- directorNoteFeedback: specific comment on the director note. MUST BE IN THE LANGUAGE: ${language}.` : ''}
            `
          },
          {
            inlineData: {
              mimeType: "audio/webm;codecs=opus", // or audio/mp3 depending on recorder, webm is standard for browser
              data: audioBase64
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            accuracy: { type: Type.INTEGER },
            energy: { type: Type.INTEGER },
            clarity: { type: Type.INTEGER },
            tone: { type: Type.STRING },
            emotionDetected: { type: Type.STRING },
            feedback: { type: Type.STRING },
            directorNoteAdherence: { type: Type.INTEGER },
            directorNoteFeedback: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error in audio analysis:", error);
    return {
      accuracy: 0,
      energy: 0,
      clarity: 0,
      tone: "neutral",
      emotionDetected: "Error",
      feedback: "No se pudo analizar el audio. Intenta de nuevo."
    };
  }
};

export const getChatResponse = async (context: string, userQuery: string) => {
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
        model,
        contents: `Context: ${context}\nUser: ${userQuery}`,
        config: { systemInstruction: "You are an expert acting coach and theatre director named 'Maestro'. Be concise, encouraging, but demanding." }
    });
    return response.text;
}