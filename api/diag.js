import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        // We use a lower-level fetch because ListModels isn't always exposed cleanly in all SDK versions
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();

        const models = data.models || [];
        const basicList = models.map(m => ({
            name: m.name,
            displayName: m.displayName,
            supportedMethods: m.supportedGenerativeAISequenceMethods || m.supportedMethods
        }));

        return res.status(200).json({
            count: basicList.length,
            models: basicList,
            raw: data
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
