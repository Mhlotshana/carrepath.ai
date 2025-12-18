import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
        console.error("[EXTRACT] GEMINI_API_KEY not configured!");
        return res.status(500).json({
            error: 'API key not configured',
            details: 'Please add GEMINI_API_KEY to Vercel environment variables'
        });
    }

    try {
        const { base64Data, mimeType } = req.body;

        if (!base64Data || !mimeType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log(`[EXTRACT] Processing ${mimeType} document...`);

        // Enhanced prompt for better extraction
        const extractionPrompt = `You are analyzing a South African matric certificate or academic result document.

TASK: Extract the following information with maximum accuracy:
1. Student's full name (look for "Name:", "Student Name:", or similar)
2. ID number (13 digits, look for "ID Number:", "Identity Number:", or similar)
3. ALL subjects with their percentage marks

RULES:
- Subject names must be complete (e.g., "English Home Language", not just "English")
- Marks must be numbers between 0-100
- Include ALL subjects listed
- If Life Orientation is present, include it
- Common subjects: Mathematics, Mathematical Literacy, Physical Sciences, Life Sciences, English Home Language, English First Additional Language, Afrikaans, Accounting, Business Studies, etc.

IMPORTANT:
- Extract at least 6 subjects (matric students have 7+ subjects)
- If marks are shown as symbols/levels (e.g., "80%", "7"), convert to percentage
- If uncertain about a mark, skip that subject rather than guessing

Return valid JSON with the exact structure specified.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp', // Latest model for better accuracy
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    },
                    {
                        text: extractionPrompt
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        idNumber: { type: Type.STRING },
                        subjects: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    mark: { type: Type.NUMBER },
                                    level: { type: Type.NUMBER }
                                },
                                required: ['name', 'mark']
                            }
                        }
                    },
                    required: ['subjects']
                },
                temperature: 0.1, // Lower temperature for more deterministic extraction
            }
        });

        const text = response.text;
        if (!text) {
            console.error("[EXTRACT] No response from AI");
            throw new Error("No data returned from AI");
        }

        const result = JSON.parse(text);

        // Validate extraction
        if (!result.subjects || result.subjects.length < 3) {
            console.warn(`[EXTRACT] Insufficient subjects extracted: ${result.subjects?.length || 0}`);
            return res.status(400).json({
                error: 'Insufficient data extracted',
                details: `Only found ${result.subjects?.length || 0} subjects. Matric certificates should have 6+. Please try a clearer image or use manual entry.`,
                partialData: result
            });
        }

        console.log(`[EXTRACT] Success: Extracted ${result.subjects.length} subjects for ${result.name || 'student'}`);
        return res.status(200).json(result);

    } catch (error) {
        console.error("[EXTRACT] Error details:", error.message, error.stack);
        return res.status(500).json({
            error: 'Failed to extract data',
            details: error.message,
            suggestion: 'Try using a clearer image, better lighting, or manual entry.'
        });
    }
}
