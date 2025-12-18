const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { base64Data, mimeType, expectedId } = req.body;

        if (!base64Data || !mimeType || !expectedId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: `Verify if this is a legitimate Proof of Payment document. Look for a reference number containing '${expectedId}' or an amount of R120.00. Return valid JSON.` }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        verified: { type: "boolean" },
                        reason: { type: "string" }
                    }
                }
            }
        });

        const result = JSON.parse(response.text || "{}");
        return res.status(200).json(result);
    } catch (error) {
        console.error("Verification failed", error);
        return res.status(500).json({ verified: false, reason: 'Server error' });
    }
};
