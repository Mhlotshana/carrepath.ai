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
        const { subjects, aps } = req.body;

        if (!subjects || !aps) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // This is a simplified version - full analysis would be very large
        // For production, consider moving the full AI logic here
        const mockResult = {
            summary: {
                title: `Career Analysis for APS ${aps}`,
                overview: "Comprehensive analysis based on your matric results.",
                strengths: ["Competitive APS score"],
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
                    requirements: "See institution",
                    applicationDeadline: "30 September",
                    applicationLink: "https://example.com",
                    modules: ["Module 1"],
                    careerOutcomes: ["Career 1"]
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
};
