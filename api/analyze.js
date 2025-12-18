import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    apiVersion: "v1beta"
});

export default async function handler(req, res) {
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
        const { subjects, aps } = req.body;

        if (!subjects || !aps) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // For production, return a simplified mock
        // In a real implementation, you'd call the full AI analysis here
        const mockResult = {
            summary: {
                title: `Career Analysis for APS ${aps}`,
                overview: "Comprehensive analysis based on your matric results.",
                strengths: ["Competitive APS score", "Good subject selection"],
                limitations: []
            },
            courses: [
                {
                    id: "1",
                    institution: "University Example",
                    name: "Example Course",
                    type: "Degree",
                    duration: "3 years",
                    minAps: 25,
                    faculty: "General",
                    requirements: "See institution website",
                    applicationDeadline: "30 September",
                    applicationLink: "https://example.com",
                    modules: ["Module 1", "Module 2"],
                    careerOutcomes: ["Career Option 1"]
                }
            ],
            bursaries: [],
            careers: [],
            actionPlan: []
        };

        return res.status(200).json(mockResult);
    } catch (error) {
        console.error("Analysis error:", error);
        return res.status(500).json({ error: 'Failed to analyze profile' });
    }
}
